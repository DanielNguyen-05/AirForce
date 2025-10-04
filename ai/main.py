# main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model

app = FastAPI()

model = load_model("lstm_global_model_3.keras")

df = pd.read_csv("./data/mean_dataset.csv")
df = df.head(7)
features = ['pm25', 'pm10', 'no2', 'co', 'so2', 'o3', 'x', 'y', 'z']
X = df[features].values

X = X.reshape((1, X.shape[0], X.shape[1]))
print(X)
y_pred = model.predict(X)

print("Predicted AQI sequence:", y_pred.flatten())