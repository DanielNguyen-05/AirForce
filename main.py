import os
# Đặt biến môi trường để giảm thiểu log TensorFlow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 

import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

# Tải mô hình
model = None
try:
    from tensorflow.keras.models import load_model
    # Cố gắng tải mô hình, sử dụng safe_mode=False
    model = load_model('ai/lstm_global_model.keras', safe_mode=False)
    print("Mô hình LSTM đã được tải thành công.")
except Exception as e:
    print(f"LỖI TẢI MÔ HÌNH: Không thể tải mô hình. Chi tiết: {e}")
    model = None

def predict_aqi(input_data):
    if model is None:
        raise RuntimeError("Mô hình không sẵn sàng.")
        
    try:
        input_array = np.array(input_data, dtype=np.float32)
    except ValueError:
        raise ValueError("Dữ liệu đầu vào phải là một danh sách các giá trị số.")
        
    # Định hình lại dữ liệu: (1 mẫu, 1 bước thời gian, 8 đặc trưng) - Giả định
    # Nếu mô hình bạn cần 7 bước thời gian, hãy đổi lại thành (1, 7, 8) hoặc (1, 8, 1)
    reshaped_data = input_array.reshape(1, 1, input_array.shape[0])
    
    prediction = model.predict(reshaped_data)
    return prediction.flatten().tolist()

# Khởi tạo ứng dụng Flask
app = Flask(__name__)

# Cấu hình CORS đơn giản, Gunicorn thường sẽ giải quyết vấn đề Host
CORS(app) 

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Dịch vụ dự đoán không sẵn sàng (Mô hình chưa tải).'}), 503
        
    try:
        data = request.get_json()
        
        # Đảm bảo bạn đã sửa test.py để chỉ gửi 8 giá trị số!
        if not data or 'input' not in data or not isinstance(data['input'], list) or len(data['input']) != 8:
            return jsonify({'error': 'Đầu vào không hợp lệ. Cần có 8 giá trị số.'}), 400

        prediction = predict_aqi(data['input'])
        return jsonify({'prediction': prediction})
        
    except Exception as e:
        return jsonify({'error': f'Lỗi trong quá trình dự đoán: {str(e)}'}), 500
    
if __name__ == '__main__':
    # Bỏ qua dòng app.run() khi dùng Gunicorn, nhưng giữ lại cho kiểm thử
    app.run(debug=True, host='0.0.0.0', port=5000)