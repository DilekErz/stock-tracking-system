import urllib.request
import json

symbols = ['BIST100', 'Gold', 'SP500']
ranges = ['1M', '3M', '1Y']

for sym in symbols:
    print(f'\n{sym}:')
    for rng in ranges:
        try:
            url = f'http://127.0.0.1:3000/api/prediction?symbol={sym}&range={rng}'
            r = urllib.request.urlopen(url, timeout=90)
            d = json.loads(r.read().decode())
            price = d["predicted_price"]
            print(f'  {rng}: {price:8.2f}')
        except Exception as e:
            print(f'  {rng}: ERROR')
