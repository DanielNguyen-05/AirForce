import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 

import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np

model = load_model('ai/lstm_global_model.keras')

def predict_aqi(input_data):
    input_array = np.array(input_data)
    reshaped_data = input_array.reshape(1, input_array.shape[0], 1)
    prediction = model.predict(reshaped_data)
    return prediction.flatten().tolist()

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data or 'input' not in data:
        return jsonify({'error': 'Invalid input'}), 400

    input_data = data['input']
    prediction = predict_aqi(input_data)
    return jsonify({'prediction': prediction})
    
if __name__ == '__main__':
    app.run(debug=True)


