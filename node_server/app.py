import os
from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import pickle
from tensorflow.keras.models import load_model

app = Flask(__name__)

# --- NẠP MODEL VÀ SCALER (CÁCH AN TOÀN VÀ CHÍNH XÁC) ---

# Lấy đường dẫn tuyệt đối của thư mục chứa tệp app.py này (tức là /app/server)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Đi ngược lên một cấp để lấy đường dẫn thư mục gốc của dự án (tức là /app)
project_root = os.path.dirname(current_dir)

# Bây giờ, tạo đường dẫn chính xác đến các tệp model và scaler từ thư mục gốc
model_path = os.path.join(project_root, 'ai', 'lstm_global_model.h5')
scaler_path = os.path.join(project_root, 'ai', 'scaler.pkl')

print(f"Đang tải model từ: {model_path}")
print(f"Đang tải scaler từ: {scaler_path}")

try:
    model = load_model(model_path)
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
    print("Model và scaler đã được nạp thành công!")
except Exception as e:
    print(f"Lỗi khi nạp model hoặc scaler: {e}")
    model = None
    scaler = None

# --- ĐỊNH NGHĨA API ENDPOINT ---
@app.route('/predict', methods=['POST'])
def predict():
    if not model or not scaler:
        return jsonify({'error': 'Model hoặc scaler chưa được nạp.'}), 500

    # Lấy dữ liệu JSON từ yêu cầu
    data = request.get_json()
    if not data or 'input' not in data:
        return jsonify({'error': 'Dữ liệu không hợp lệ. Cần có trường "input".'}), 400

    try:
        # Chuyển đổi input thành định dạng phù hợp để dự đoán
        # Ví dụ: input là một danh sách các số
        input_data = np.array(data['input'])

        # Tiền xử lý dữ liệu (ví dụ: reshape và scale)
        # Lưu ý: bạn cần điều chỉnh bước này cho phù hợp với cách bạn đã huấn luyện model
        # Ví dụ cho mô hình LSTM thường yêu cầu input có dạng [samples, timesteps, features]
        reshaped_data = input_data.reshape(1, input_data.shape[0], 1) # Ví dụ
        scaled_data = scaler.transform(reshaped_data.reshape(-1, 1)).reshape(reshaped_data.shape)

        # Thực hiện dự đoán
        prediction_scaled = model.predict(scaled_data)

        # Hậu xử lý (ví dụ: inverse_transform để đưa về giá trị gốc)
        prediction = scaler.inverse_transform(prediction_scaled)

        # Chuyển đổi kết quả thành danh sách để trả về dưới dạng JSON
        output = prediction.tolist()

        return jsonify({'prediction': output})

    except Exception as e:
        return jsonify({'error': f'Đã xảy ra lỗi trong quá trình dự đoán: {str(e)}'}), 500

# # Chạy server
# if __name__ == '__main__':
#     # Chạy trên tất cả các địa chỉ IP có sẵn và cổng 5000
#     app.run(host='0.0.0.0', port=5000, debug=True)