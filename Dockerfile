# Bước 1: Chọn một môi trường Python có sẵn
# Sử dụng 'slim' để giữ cho image nhẹ hơn
FROM python:3.9-slim

# Bước 2: Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# Bước 3: Sao chép tệp requirements trước để tận dụng cache của Docker
COPY requirements.txt requirements.txt

# Bước 4: Cài đặt các thư viện
RUN pip install --no-cache-dir -r requirements.txt

# Bước 5: Sao chép toàn bộ mã nguồn của bạn vào container
# Dấu '.' đầu tiên là thư mục gốc dự án của bạn
# Dấu '.' thứ hai là thư mục /app bên trong container
COPY . .

# Bước 6: Cloud Run sẽ cung cấp biến môi trường PORT, thường là 8080.
# Lệnh này sẽ khởi động server Gunicorn, lắng nghe trên tất cả các địa chỉ IP
# và sử dụng đối tượng 'app' từ tệp 'server/app.py' của bạn.
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "server.app:app"]