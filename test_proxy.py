import urllib.request
import json

print("Testing Node.js proxy at port 3000 with different ranges:\n")
for rng in ['1W', '1M', '3M']:
    try:
        url = f'http://127.0.0.1:3000/api/prediction?symbol=USD_TRY&range={rng}'
        r = urllib.request.urlopen(url, timeout=90)
        d = json.loads(r.read().decode())
        price = d["predicted_price"]
        prob = d.get("xgb_up_probability", 0)
        print(f'{rng}: Price={price:6.2f}, Prob={prob:.4f}')
    except Exception as e:
        print(f'{rng}: ERROR - {str(e)[:50]}')
