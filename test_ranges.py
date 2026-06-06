import urllib.request
import json
import time

symbols = ['USD_TRY', 'BIST100', 'Gold']
ranges = ['1W', '1M', '3M']

for symbol in symbols:
    print(f"\n=== {symbol} ===")
    for range_val in ranges:
        try:
            url = f'http://127.0.0.1:5000/predict?symbol={symbol}&range={range_val}'
            r = urllib.request.urlopen(url, timeout=90)
            data = json.loads(r.read().decode())
            price = data.get('predicted_price', 'N/A')
            prob = data.get('xgb_up_probability', 'N/A')
            print(f"  {range_val}: Price={price}, Prob={prob}")
            time.sleep(1)  # Rate limiting
        except Exception as e:
            print(f"  {range_val}: ERROR - {str(e)[:50]}")
