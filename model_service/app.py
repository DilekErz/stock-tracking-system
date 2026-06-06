import os
import yfinance as yf
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model

app = Flask(__name__)

SYMBOL_MAP = {
    "BIST100": "XU100.IS", "BIST30": "XU030.IS", "Gold": "GC=F",
    "Silver": "SI=F", "Brent": "BZ=F", "USD_TRY": "USDTRY=X",
    "EUR_USD": "EURUSD=X", "EUR_TRY": "EURTRY=X"
}

loaded_models = {}

def get_model_paths(symbol):
    return f"{symbol}_model.keras", f"{symbol}_xgboost.joblib"

def force_to_float(val):
    """Her türlü Pandas/Numpy yapısını saf float'a çeviren tek fonksiyon."""
    try:
        if isinstance(val, (pd.Series, pd.DataFrame)):
            arr = np.asarray(val).ravel()
            return float(arr[0])

        arr = np.asarray(val).ravel()
        return float(arr[0])
    except Exception:
        return 0.0


def calculate_ema(values, period):
    values = np.asarray(values, dtype=np.float32)
    ema = np.zeros_like(values, dtype=np.float32)
    multiplier = 2.0 / (period + 1)
    ema[0] = values[0]
    for i in range(1, len(values)):
        ema[i] = (values[i] - ema[i - 1]) * multiplier + ema[i - 1]
    return ema


def calculate_rsi(values, period=14):
    values = np.asarray(values, dtype=np.float32)
    if len(values) <= period:
        return np.full_like(values, np.nan, dtype=np.float32)

    deltas = np.diff(values)
    gains = np.where(deltas > 0, deltas, 0.0)
    losses = np.where(deltas < 0, -deltas, 0.0)

    avg_gain = np.zeros_like(values, dtype=np.float32)
    avg_loss = np.zeros_like(values, dtype=np.float32)
    avg_gain[period] = gains[:period].mean()
    avg_loss[period] = losses[:period].mean()

    for i in range(period + 1, len(values)):
        avg_gain[i] = (avg_gain[i - 1] * (period - 1) + gains[i - 1]) / period
        avg_loss[i] = (avg_loss[i - 1] * (period - 1) + losses[i - 1]) / period

    rs = np.full_like(avg_gain, np.nan, dtype=np.float32)
    valid = avg_loss != 0
    rs[valid] = avg_gain[valid] / avg_loss[valid]
    rsi = 100.0 - 100.0 / (1.0 + rs)
    rsi[~valid] = 100.0
    rsi[:period] = np.nan
    return rsi


def calculate_macd(values, fast=12, slow=26):
    fast_ema = calculate_ema(values, fast)
    slow_ema = calculate_ema(values, slow)
    return fast_ema - slow_ema


def minmax_scale_window(window):
    window = np.asarray(window, dtype=np.float32)
    min_vals = np.nanmin(window, axis=0)
    max_vals = np.nanmax(window, axis=0)
    span = max_vals - min_vals
    span[span == 0] = 1.0
    return (window - min_vals) / span, min_vals, max_vals


@app.route('/predict', methods=['GET'])
def predict():
    raw_symbol = request.args.get('symbol', '')
    range_param = request.args.get('range', '1M')
    symbol = raw_symbol.replace(" ", "_")
    
    if symbol not in SYMBOL_MAP:
        return jsonify({"error": f"Desteklenmeyen sembol: {symbol}"}), 400
    
    if symbol not in loaded_models:
        keras_path, xgb_path = get_model_paths(symbol)
        if not os.path.exists(keras_path) or not os.path.exists(xgb_path):
            return jsonify({"error": "Model dosyaları bulunamadı"}), 404
        try:
            loaded_models[symbol] = {
                "lstm": load_model(keras_path),
                "xgboost": joblib.load(xgb_path)
            }
        except Exception as e:
            return jsonify({"error": f"Model yükleme hatası: {str(e)}"}), 500

    # Zaman penceresine göre veri indirme dönemini belirle
    range_map = {
        "1D": "5d",
        "1W": "30d",
        "1M": "90d",
        "3M": "180d",
        "6M": "270d",
        "1Y": "365d"
    }
    download_period = range_map.get(range_param, "90d")

    try:
        ticker = SYMBOL_MAP[symbol]
        df = yf.download(ticker, period=download_period, progress=False)
        if df.empty:
            # Fallback: daha uzun dönem dene
            df = yf.download(ticker, period="180d", progress=False)
        df = df.dropna()
        if df.empty:
            return jsonify({"error": "Veri boş"}), 400

        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        close_data = df['Close']
        if isinstance(close_data, pd.DataFrame):
            close_data = close_data.iloc[:, 0]

        close_values = np.asarray(close_data).ravel().astype(np.float32)
        if len(close_values) < 31:
            return jsonify({"error": "Yeterli tarihsel veri yok"}), 400

        open_values = np.asarray(df['Open']).ravel().astype(np.float32)
        high_values = np.asarray(df['High']).ravel().astype(np.float32)
        low_values = np.asarray(df['Low']).ravel().astype(np.float32)
        volume_values = np.asarray(df['Volume']).ravel().astype(np.float32)

        rsi_values = calculate_rsi(close_values, period=14)
        macd_values = calculate_macd(close_values, fast=12, slow=26)

        features = np.column_stack([
            open_values,
            high_values,
            low_values,
            volume_values,
            rsi_values,
            macd_values
        ])

        feature_window = features[-5:]
        if feature_window.shape != (5, 6):
            return jsonify({"error": "Özellik penceresi oluşturulamadı"}), 500

        scaled_window, min_vals, max_vals = minmax_scale_window(feature_window)
        real_price = float(close_values[-1])

        lstm_input = scaled_window.reshape(1, 5, 6)
        xgb_input = feature_window[-1:].reshape(1, 6)

        lstm_res = loaded_models[symbol]["lstm"].predict(lstm_input, verbose=0)

        xgb_model = loaded_models[symbol]["xgboost"]
        xgb_direction = None
        xgb_price = None

        if hasattr(xgb_model, "predict_proba"):
            proba = xgb_model.predict_proba(xgb_input)
            xgb_direction = float(proba[0, 1])
        else:
            xgb_price = force_to_float(xgb_model.predict(xgb_input))

        lstm_value = force_to_float(lstm_res)
        close_window = close_values[-5:]
        lstm_price = float(
            lstm_value * (close_window.max() - close_window.min()) + close_window.min()
        )

        if xgb_price is not None:
            prediction = (lstm_price + xgb_price) / 2
        else:
            prediction = lstm_price

        response = {
            "symbol": symbol,
            "real_price": round(real_price, 2),
            "predicted_price": round(prediction, 2)
        }

        if xgb_direction is not None:
            response["xgb_up_probability"] = round(xgb_direction, 4)
        if xgb_price is not None:
            response["xgb_price"] = round(xgb_price, 2)

        return jsonify(response)
    except Exception as e:
        print(f"KRİTİK HATA: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)