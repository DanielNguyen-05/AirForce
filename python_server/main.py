import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 

import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

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


# --- 5. Endpoint kiểm tra ---
@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': '✅ API đang hoạt động!'}), 200

if __name__ == '__main__':
    app.run(debug=True)