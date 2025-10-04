# test.py
import requests
import json

# Các giá trị đầu vào ban đầu (date sẽ bị loại bỏ khi tạo input_data)
date = "2023-01-01"
lat = 21.0285
lon = 105.8542
pm25 = 50.0
pm10 = 80.0
no2 = 30.0
co = 0.8
so2 = 10.0
o3 = 40.0

# ⚠️ Sửa đổi QUAN TRỌNG: Chỉ gửi các giá trị số, theo đúng thứ tự (bỏ qua 'date')
input_data = [lat, lon, pm25, pm10, no2, co, so2, o3] 
# Hiện tại có 8 đặc trưng

try:
    resp = requests.post('http://localhost:5000/predict', 
                         json={"input": input_data})
    
    # Kiểm tra mã trạng thái HTTP
    if resp.status_code == 200:
        print("Dự đoán thành công:")
        print(json.dumps(resp.json(), indent=4))
    else:
        try:
            print(f"Lỗi API (HTTP {resp.status_code}):")
            print(json.dumps(resp.json(), indent=4))
        except json.JSONDecodeError:
            print(f"Lỗi API (HTTP {resp.status_code}): Phản hồi không phải là JSON.")
            print("Nội dung phản hồi (Response Text):")
            print(resp.text)
            
except requests.exceptions.ConnectionError:
    print("Lỗi kết nối: Đảm bảo main.py đang chạy trên http://localhost:5000.")