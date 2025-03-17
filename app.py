# app.py
from flask import Flask, render_template, request, jsonify
import onnxruntime as ort
import numpy as np
import json
import os

app = Flask(__name__)

# Load the ONNX model
ort_session = ort.InferenceSession("iris_classifier.onnx")

# Load scaler parameters
with open("scaler_params.json", "r") as f:
    scaler_params = json.load(f)
    
# Load example data
with open("example_data.json", "r") as f:
    example_data = json.load(f)

# Map numeric labels to class names
class_mapping = {0: "setosa", 1: "versicolor", 2: "virginica"}

def scale_features(features):
    """Apply StandardScaler transformation using saved parameters"""
    mean = np.array(scaler_params["mean"])
    scale = np.array(scaler_params["scale"])
    return (features - mean) / scale

def predict(features):
    """Make prediction using the ONNX model"""
    # Scale the input features
    scaled_features = scale_features(features)
    
    # Prepare input for ONNX runtime
    ort_inputs = {ort_session.get_inputs()[0].name: scaled_features.astype(np.float32)}
    
    # Run inference
    ort_outputs = ort_session.run(None, ort_inputs)
    
    # Get predicted class
    predicted_class = np.argmax(ort_outputs[0], axis=1)[0]
    
    # Get probability scores
    scores = ort_outputs[0][0]
    softmax_scores = np.exp(scores) / np.sum(np.exp(scores))
    
    return {
        "class_id": int(predicted_class),
        "class_name": class_mapping[predicted_class],
        "probabilities": {class_mapping[i]: float(score) for i, score in enumerate(softmax_scores)}
    }

@app.route('/')
def home():
    return render_template('index.html', examples=example_data)

@app.route('/predict', methods=['POST'])
def make_prediction():
    data = request.get_json()
    features = np.array([data['features']], dtype=np.float32)
    
    try:
        result = predict(features)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)