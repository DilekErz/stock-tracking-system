import os
import json
import yfinance as yf
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler

app = Flask(__name__)

SYMBOL_MAP = {
    "BIST100": "XU100.IS", "BIST30": "XU030.IS",
    "SP500": "^GSPC", "NASDAQ100": "^NDX", "DJI": "^DJI", "DOW": "^DJI",
    "DAX": "^GDAXI", "CAC40": "^FCHI", "FTSE100": "^FTSE",
    "NIKKEI225": "^N225", "HSI": "^HSI",
    "Gold": "GC=F", "Silver": "SI=F", "Brent": "BZ=F",
    "NaturalGas": "NG=F", "Copper": "HG=F",
    "USD_TRY": "USDTRY=X", "EUR_TRY": "EURTRY=X", "GBP_TRY": "GBPTRY=X",
    "EUR_USD": "EURUSD=X",
    # Yahoo'da JPYTRY=X için geçmiş veri yok, ters paritesi (TRYJPY=X) üzerinden hesaplanıyor
    "JPY_TRY": ("TRYJPY=X", True),
    "US10YT": "^TNX",
    # Yahoo'da HKDTRY=X paritesi yok; HKD/TRY = HKDUSD=X * USDTRY=X çaprazından hesaplanıyor
    "HKD_TRY": {"type": "cross", "mult": ["HKDUSD=X", "USDTRY=X"]},
    # Türkiye 10Y tahvili için canlı Yahoo kaynağı yok; public/Global.csv'den okunuyor
    "TR10YT": {"type": "csv", "metric": "TR10YT"},
}

FEATURES = ['Open', 'High', 'Low', 'Vol.', 'RSI', 'MACD']
WINDOW = 5

# Regresyon modellerinin (egitim/train_regresyon_all.py) urettigi test metrikleri.
# "Tahmini Deger" (price_band) hesaplamasinda guvenilirlik skoru icin kullanilir.
MODEL_METRIKLERI = {}
_metrik_yolu = os.path.join(os.path.dirname(__file__), "model_metrikleri.json")
if os.path.exists(_metrik_yolu):
    with open(_metrik_yolu, encoding="utf-8") as f:
        MODEL_METRIKLERI = json.load(f)

loaded_models = {}

def get_model_paths(symbol):
    return f"{symbol}_model.keras", f"{symbol}_xgboost.joblib"

def force_to_float(val):
    """Her türlü Pandas/Numpy yapısını saf float'a çeviren tek fonksiyon."""
    try:
        arr = np.asarray(val).ravel()
        return float(arr[0])
    except Exception:
        return 0.0

def add_indicators(df):
    """Eğitimdeki ile aynı RSI(14)/MACD hesaplaması, Open serisi üzerinden."""
    delta = df['Open'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    df['MACD'] = df['Open'].ewm(span=12).mean() - df['Open'].ewm(span=26).mean()
    return df.dropna()

CSV_YOLU = os.path.join(os.path.dirname(__file__), "..", "public", "Global.csv")

def _download_yf(ticker, invert=False):
    """Tek bir Yahoo ticker'ini indirir; invert=True ise ters pariteden çevirir."""
    df = yf.download(ticker, period="6mo", progress=False)
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    if invert:
        o, h, l, c = df['Open'], df['High'], df['Low'], df['Close']
        df['Open'], df['High'], df['Low'], df['Close'] = 1.0 / o, 1.0 / l, 1.0 / h, 1.0 / c
    return df.rename(columns={'Volume': 'Vol.'})

def _download_cross(t1, t2):
    """Yahoo'da doğrudan paritesi olmayan semboller için iki ticker'ın çarpımı.
    Örn. HKD/TRY = HKDUSD=X (t1) * USDTRY=X (t2)."""
    a, b = _download_yf(t1), _download_yf(t2)
    idx = a.index.intersection(b.index)
    df = pd.DataFrame(index=idx)
    for col in ['Open', 'High', 'Low', 'Close']:
        df[col] = a.loc[idx, col] * b.loc[idx, col]
    df['Vol.'] = 0.0
    return df

def _load_csv(metric):
    """Canlı kaynağı olmayan semboller (TR10YT) için Global.csv'den OHLV serisi okur."""
    df = pd.read_csv(CSV_YOLU)
    sub = df[df['Metric'] == metric].copy()
    if sub.empty:
        return None
    sub['Date'] = pd.to_datetime(sub['Date'])
    sub = sub.sort_values('Date').set_index('Date')
    sub = sub[['Open', 'High', 'Low', 'Vol.']].astype(float)
    sub['Close'] = sub['Open']  # CSV'de Close kolonu yok; anchor fiyat olarak Open kullanılır
    return sub

def fetch_df(symbol):
    """Sembolü kaynağına göre (Yahoo / çapraz kur / CSV) yükleyip OHLV+Close döndürür."""
    info = SYMBOL_MAP[symbol]
    if isinstance(info, dict):
        if info["type"] == "cross":
            return _download_cross(*info["mult"])
        if info["type"] == "csv":
            return _load_csv(info["metric"])
    ticker, invert = info if isinstance(info, tuple) else (info, False)
    return _download_yf(ticker, invert)

@app.route('/predict', methods=['GET'])
def predict():
    raw_symbol = request.args.get('symbol', '')
    symbol = raw_symbol.replace(" ", "_")

    model_type = request.args.get('model', 'lstm')
    if model_type not in ('lstm', 'hybrid'):
        return jsonify({"error": f"Geçersiz model: {model_type}"}), 400

    if symbol not in SYMBOL_MAP:
        return jsonify({"error": f"Desteklenmeyen sembol: {symbol}"}), 400

    if symbol not in loaded_models:
        keras_path, xgb_path = get_model_paths(symbol)
        if not os.path.exists(keras_path):
            return jsonify({"error": "Model dosyası bulunamadı"}), 404
        try:
            entry = {"lstm": load_model(keras_path, compile=False), "xgboost": None, "lstm_reg": None}
            if os.path.exists(xgb_path):
                entry["xgboost"] = joblib.load(xgb_path)

            reg_path = f"{symbol}_model_reg.keras"
            if os.path.exists(reg_path):
                entry["lstm_reg"] = load_model(reg_path, compile=False)

            loaded_models[symbol] = entry
        except Exception as e:
            return jsonify({"error": f"Model yükleme hatası: {str(e)}"}), 500

    if model_type == "hybrid" and loaded_models[symbol]["xgboost"] is None:
        return jsonify({"error": "Bu sembol için XGBoost modeli bulunamadı"}), 404

    try:
        df = fetch_df(symbol)
        if df is None:
            return jsonify({"error": "Veri kaynağı bulunamadı"}), 404

        df = df.dropna(subset=['Open', 'High', 'Low', 'Vol.'])
        if df.empty:
            return jsonify({"error": "Veri boş"}), 400

        real_price = float(np.asarray(df['Close']).ravel()[-1])

        df = add_indicators(df)
        if len(df) < WINDOW:
            return jsonify({"error": "Tahmin için yeterli veri yok"}), 400

        # Eğitimdeki gibi MinMaxScaler ile ölçekle (eğitimdeki scaler kaydedilmediği
        # için son verilerle yeniden fit ediliyor) ve son 5 günlük pencereyi al
        X = df[FEATURES].values.astype(np.float64)
        scaler = MinMaxScaler()
        X_scaled = scaler.fit_transform(X)

        X_window = X_scaled[-WINDOW:].reshape(1, WINDOW, len(FEATURES)).astype(np.float32)

        prob_lstm = force_to_float(loaded_models[symbol]["lstm"].predict(X_window, verbose=0))

        result = {
            "symbol": symbol,
            "real_price": round(real_price, 2),
            "model": model_type
        }

        if model_type == "hybrid":
            # XGBoost eğitimdeki gibi ham (ölçeksiz) son günün özellikleriyle çalışıyor
            X_last_raw = X[-1:]
            prob_xgb = force_to_float(loaded_models[symbol]["xgboost"].predict_proba(X_last_raw)[:, 1])
            prob_up = (prob_lstm + prob_xgb) / 2
            result["lstm_probability"] = round(prob_lstm * 100, 2)
            result["xgb_probability"] = round(prob_xgb * 100, 2)
        else:
            prob_up = prob_lstm

        result["direction"] = "Yükseliş" if prob_up >= 0.5 else "Düşüş"
        result["probability"] = round(prob_up * 100, 2)

        # ---- Tahmini Deger (regresyon) ----
        # Modelin tahmin ettigi yuzdelik degisim, canli "real_price" uzerine
        # uygulanarak yarinki fiyat tahmini uretilir.
        if loaded_models[symbol]["lstm_reg"] is not None:
            pred_change_pct = force_to_float(loaded_models[symbol]["lstm_reg"].predict(X_window, verbose=0))
            predicted_price = real_price * (1 + pred_change_pct / 100)
            model_mae = MODEL_METRIKLERI.get(symbol, {}).get("mae_lstm", 0)
            band = real_price * model_mae / 100

            result["predicted_price"] = round(predicted_price, 2)
            result["predicted_change_pct"] = round(pred_change_pct, 3)
            result["model_mae"] = model_mae

            # Olası aralığı tahmin edilen yönle tutarlı hale getir: yükseliş
            # bekleniyorsa alt sınır güncel fiyat (altına inmez), düşüşte ise
            # üst sınır güncel fiyat olur. Böylece "yükseliş" deyip aynı anda
            # güncel fiyatın altını göstermiş olmayız.
            if prob_up >= 0.5:  # Yükseliş
                band_low = real_price
                band_high = max(predicted_price + band, real_price)
            else:               # Düşüş
                band_high = real_price
                band_low = min(predicted_price - band, real_price)

            result["price_band_low"] = round(band_low, 2)
            result["price_band_high"] = round(band_high, 2)

        return jsonify(result)

    except Exception as e:
        print(f"KRİTİK HATA: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
