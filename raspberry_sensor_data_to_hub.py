import cv2
import urllib.request
import numpy as np
import serial
import torch
import json
import datetime
import requests
import threading
from azure.iot.device import IoTHubDeviceClient, Message
from openalpr import Alpr

# Load connection string for Azure IoT Hub
def load_connection_string(filename="primary_connection_string.txt"):
    with open(filename, 'r') as file:
        return file.read().strip()

CONNECTION_STRING = load_connection_string()
client = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING)

# Camera feed from your phone (IP Webcam)
ip_camera_url = "http://192.168.55.28:8080/video"
cap = cv2.VideoCapture(ip_camera_url)

if not cap.isOpened():
    print("Error: Could not open video stream.")
    exit()

# Connect to Arduino for speed data
ser = serial.Serial("/dev/serial0", 115200, timeout=1)

# Load YOLO model for car detection
model = torch.hub.load("ultralytics/yolov5", "yolov5s", pretrained=True)

# Initialize OpenALPR for license plate recognition
alpr = Alpr("eu", "/etc/openalpr/openalpr.conf", "/usr/share/openalpr/runtime_data")

# Function to detect cars and recognize license plates
def detect_cars_and_license(frame):
    results = model(frame)
    car_count = 0
    plate_number = "N/A"

    for result in results.xyxy[0]:
        x1, y1, x2, y2, conf, cls = result.numpy()
        if int(cls) == 2:  # Class 2 = Car
            car_count += 1
            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)

            # Crop car region for license plate recognition
            car_crop = frame[int(y1):int(y2), int(x1):int(x2)]
            alpr_results = alpr.recognize_array(cv2.imencode(".jpg", car_crop)[1].tobytes())

            if alpr_results["plates"]:
                plate_number = alpr_results["plates"][0]["characters"]
                cv2.putText(frame, plate_number, (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)

    return car_count, plate_number

# Function to read car speed from Arduino
def get_car_speed():
    if ser.in_waiting > 0:
        speed_data = ser.readline().decode("utf-8").strip()
        try:
            return float(speed_data.split(" ")[1])
        except ValueError:
            pass
    return 0

# Function to format and send data to Azure IoT Hub
def send_telemetry_to_iothub(traffic_data):
    message = Message(json.dumps(traffic_data))
    message.content_encoding = "utf-8"
    message.content_type = "application/json"
    client.send_message(message)
    print(f"Sent to IoT Hub: {json.dumps(traffic_data)}")

# Main loop to process video stream
while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: Failed to grab frame.")
        continue

    # Detect cars and license plates
    car_count, license_plate = detect_cars_and_license(frame)

    # Get car speed from Arduino
    speed = get_car_speed()

    # Create JSON telemetry data
    traffic_data = {
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "vehicle_count": car_count,
        "license_plate": license_plate,
        "average_speed": speed
    }

    # Send data to Azure IoT Hub
    send_telemetry_to_iothub(traffic_data)

    # Display processed frame
    cv2.imshow("Car & License Plate Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
alpr.unload()
