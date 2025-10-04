import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 

import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

from dotenv import load_dotenv
import requests
import pandas as pd
from typing import Tuple
from datetime import datetime

# --- 1. Tải mô hình ---
model = None
try:
    from tensorflow.keras.models import load_model
    model = load_model('../ai/lstm_global_model_4.keras', safe_mode=False)
    print("✅ Mô hình LSTM đã được tải thành công.")
except Exception as e:
    print(f"❌ LỖI TẢI MÔ HÌNH: {e}")
    model = None


# --- 2. Hàm dự đoán ---
def predict_aqi(input_data):
    if model is None:
        raise RuntimeError("Mô hình không sẵn sàng.")
    try:
        input_array = np.array(input_data, dtype=np.float32)
    except ValueError:
        raise ValueError("Dữ liệu đầu vào phải là danh sách giá trị số.")
    reshaped_data = input_array.reshape(1, 1, input_array.shape[0])
    prediction = model.predict(reshaped_data)
    return prediction.flatten().tolist()

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

def generate_prompt(df: pd.DataFrame, latitude: float, longitude: float, current_date: str) -> str:
    """
    df: DataFrame containing 7-day AQI forecast with columns: 'date', 'aqi', 'pollutant' (optional)
    latitude, longitude: location coordinates
    current_date: current date (dd-mm-yyyy)
    """
    forecast_data = df.to_string(index=False)
    
    prompt = (
        f"You are AirForce - an intelligent air quality advisory assistant for the AirForce application.\n\n"
        f"FORECAST INFORMATION:\n"
        f"- Location: ({latitude}, {longitude})\n"
        f"- Current Date: {current_date}\n"
        f"- 7-Day AQI Forecast:\n{forecast_data}\n\n"
        f"ADVISORY REQUIREMENTS:\n"
        f"1. Overall Assessment: Analyze the air quality trend over the next 7 days\n\n"
        f"2. Outdoor Activity Recommendations:\n"
        f"   - Days RECOMMENDED for outdoor activities (good AQI)\n"
        f"   - Days NOT RECOMMENDED for outdoor activities (poor AQI)\n"
        f"   - Best time windows during the day (early morning, late evening usually better)\n\n"
        f"3. At-Risk Groups Advisory:\n"
        f"   - Children and elderly: specific warnings and recommendations\n"
        f"   - People with respiratory/cardiovascular conditions: special advice\n"
        f"   - Pregnant women: days to limit outdoor exposure\n"
        f"   - Healthy adults: outdoor activities that can be performed safely\n\n"
        f"4. Protective Measures:\n"
        f"   - When to wear masks (specify mask types if AQI is very poor)\n"
        f"   - Suitable indoor/outdoor activities\n"
        f"   - Precautions for outdoor exercise\n\n"
        f"5. Confidence Level: Assess the accuracy of the forecast (based on AQI volatility)\n\n"
        f"NOTE: Answer in paragraphs, do not write the prompt format in answer, no longer than 10 sentences. Use friendly, easy-to-understand language with clear structure, bullet points, and appropriate emojis.\n"
    )
    return prompt

def get_air_quality_advice(df: pd.DataFrame, latitude: float, longitude: float, current_date: str) -> str:
    """
    Get air quality advisory from Gemini AI
    """
    prompt = generate_prompt(df, latitude, longitude, current_date)
    
    headers = {
        "Content-Type": "application/json"
    }
    
    data = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 2048,
        }
    }
    
    try:
        response = requests.post(GEMINI_API_URL, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            try:
                advice = response.json()["candidates"][0]["content"]["parts"][0]["text"]
                return advice
            except (KeyError, IndexError) as e:
                return f"[AirForce] Response processing error: {str(e)}"
        else:
            return f"[AirForce] API Error (Status {response.status_code}): {response.text}"
            
    except requests.exceptions.Timeout:
        return "[AirForce] ⏱️ Request timeout. Please try again."
    except Exception as e:
        return f"[AirForce] Unknown error: {str(e)}"


# --- 3. Khởi tạo Flask + CORS ---
app = Flask(__name__)

# Cho phép CORS cho frontend React (localhost:5173)
CORS(app, resources={
    r"/*": {
        "origins": "http://localhost:5173",
        "methods": ["GET", "POST", "PATCH", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

def latlon_to_xyz(lat, lon):
    lat_rad = np.radians(lat)
    lon_rad = np.radians(lon)

    x = float(np.cos(lat_rad) * np.cos(lon_rad))
    y = float(np.cos(lat_rad) * np.sin(lon_rad))
    z = float(np.sin(lat_rad))

    return x, y, z

# --- 4. Endpoint dự đoán ---
@app.route('/predict', methods=['POST'])
def predict():
    # Xử lý preflight request (OPTIONS)
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'Preflight OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response

    # Xử lý POST thật sự
    if model is None:
        return jsonify({'error': 'Dịch vụ chưa sẵn sàng (Mô hình chưa tải).'}), 503

    try:
        result = request.get_json()
        data = result.get("data", [])
        lat = result.get("lat")
        lon = result.get("lon")
        x, y, z = latlon_to_xyz(lat, lon)
        big_array = []
        for arr in data:
            components = arr.get("components", {})
            temp = [
                components.get("pm2_5", 0),
                components.get("pm10", 0),
                components.get("no2", 0),
                components.get("co", 0),
                components.get("so2", 0),
                components.get("o3", 0),
                x, y, z
            ]
            big_array.append(temp)

        dume_arr = np.array(big_array, dtype=np.float32)
        print(dume_arr)
        
        # Kiểm tra tính hợp lệ
        if dume_arr.ndim != 2 or dume_arr.shape[1] != 9:
            return jsonify({'error': f'Đầu vào không hợp lệ. Nhận được shape {dume_arr.shape}, cần (n, 9).'}), 400

        # Reshape cho LSTM: (1, timesteps, features)
        X = dume_arr.reshape((1, dume_arr.shape[0], dume_arr.shape[1]))

        # Dự đoán
        prediction = model.predict(X)
        return jsonify({'prediction': prediction.flatten().tolist()})

    except Exception as e:
        return jsonify({'error': f'Lỗi dự đoán: {str(e)}'}), 500

def convert_date(date_str: str) -> str:
    parts = date_str.split("-")
    if len(parts) != 3:
        raise ValueError("❌ Sai định dạng ngày. Cần định dạng yyyy-mm-dd.")
    yyyy, mm, dd = parts
    return f"{dd}-{mm}-{yyyy}"

@app.route('/advice', methods=['POST'])
def advice():
    try:
        result = request.get_json()
        data = result.get("data", [])
        lat = result.get("lat")
        lon = result.get("lon")
        aqi = result.get("predict")

        date = []
        for arr in data:
            date.append(convert_date(arr.get("date")))

        return jsonify({
            date,
            aqi
        })

    except Exception as e:
        return jsonify({'error': f'Lỗi dự đoán: {str(e)}'}), 500

# --- 5. Endpoint kiểm tra ---
@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': '✅ API đang hoạt động!'}), 200

if __name__ == '__main__':
    app.run(debug=True)