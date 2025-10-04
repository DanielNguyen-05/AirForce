import pandas as pd
import requests

df = pd.read_csv("mean_dataset.csv")

features = ['pm25', 'pm10', 'no2', 'co', 'so2', 'o3', 'x', 'y', 'z']
data = df[features].head(7)


url = "http://127.0.0.1:5000/predict"

for i, row in data.iterrows():
    payload = {"input": row.tolist()}  # chuyển từng dòng thành list số
    response = requests.post(url, json=payload)

    if response.status_code == 200:
        print(f"✅ Row {i+1} prediction:", response.json()["prediction"])
    else:
        print(f"❌ Row {i+1} error:", response.text)
