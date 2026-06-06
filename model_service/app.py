import os
import yfinance as yf
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model

app = Flask(__name__)

SYMBOL_MAP = {
    "BIST100": "^XU100", "BIST30": "^XU030", "Gold": "GC=F",
    "Silver": "SI=F", "Brent": "BZ=F", "USD_TRY": "USDTRY=X",
    "EUR_USD": "EURUSD=X", "EUR_TRY": "EURTRY=X"
}

loaded_models = {}

def get_model_paths(symbol):
    return f"{symbol}_model.keras", f"{symbol}_xgboost.joblib"

def force_to_float(val):
    """Her türlü Pandas/Numpy yapısını saf float'a çeviren tek fonksiyon."""
    try:
        # pandas DataFrame veya Series -> numpy array'e çevirip düzleştir
        if isinstance(val, (pd.Series, pd.DataFrame)):
            arr = np.asarray(val).ravel()
            return float(arr[0])

        # numpy array veya benzeri (list, tuple, scalar)
        arr = np.asarray(val).ravel()
        return float(arr[0])
    except Exception:
        # Hata olursa güvenli bir varsayılan döndür
        return 0.0

@app.route('/predict', methods=['GET'])
def predict():
    raw_symbol = request.args.get('symbol', '')
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

    try:
        ticker = SYMBOL_MAP[symbol]
        df = yf.download(ticker, period="10d", progress=False)
        df = df.dropna()
        if df.empty: 
            return jsonify({"error": "Veri boş"}), 400
            
        # Son kapanış değerini güvenli şekilde al
        try:
            real_price = float(np.asarray(df['Close']).ravel()[-1])
        except Exception:
            # Fallback: ilk elemanı almaya çalış
            real_price = float(df['Close'].values[-1])
        
        # Giriş verisi: (1, 6)
        input_data = np.zeros((1, 6), dtype=np.float32)
        input_data[0, 0] = real_price
        
        # Tahminler
        lstm_res = loaded_models[symbol]["lstm"].predict(input_data, verbose=0)
        xgb_res = loaded_models[symbol]["xgboost"].predict(input_data)
        
        # Kesin dönüşüm
        val_lstm = force_to_float(lstm_res)
        val_xgb = force_to_float(xgb_res)
        
        prediction = (val_lstm + val_xgb) / 2
        
        return jsonify({
            "symbol": symbol,
            "real_price": round(real_price, 2),
            "predicted_price": round(prediction, 2)
        })
        
    except Exception as e:
        print(f"KRİTİK HATA: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)