import requests
import time
import json
import os
import threading
from azure.iot.device import IoTHubDeviceClient, Message

# Load connection string for Azure IoT Hub
def load_connection_string(filename="primary_connection_string.txt"):
    with open(filename, 'r') as file:
        for line in file:
            if line.startswith("CONNECTION_STRING="):
                return line.split("=", 1)[1].strip()

CONNECTION_STRING = load_connection_string()
client = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING)

# WAQI API configuration for Timisoara
STATION_ID = "timisoara"
API_URL = f"http://api.waqi.info/feed/{STATION_ID}/?token=demo"  # demo token

# Local file to store telemetry data
DATA_FILE = "air_quality_sensor_data.json"

# Lock to ensure thread-safe access to the local JSON file
data_lock = threading.Lock()

# Function to get air quality data from WAQI API
def get_air_quality_data():
    response = requests.get(API_URL)
    if response.status_code == 200:
        data = response.json()
        if data['status'] == 'ok' and 'data' in data:
            components = data['data']['iaqi']
            telemetry_data = {
                "sensorType": "AirQualitySensor",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()),
                "data": {
                    "co": components.get("co", {}).get("v", 0),
                    "no2": components.get("no2", {}).get("v", 0),
                    "pm25": components.get("pm25", {}).get("v", 0)
                }
            }
            return telemetry_data
        else:
            print("Error: Invalid data or station is down.")
            return None
    else:
        print(f"Failed to connect to WAQI API. HTTP Status Code: {response.status_code}")
        return None

# Function to save telemetry data locally to a JSON file
def save_telemetry_data_locally(telemetry_data):
    with data_lock:  # Ensure that only one thread can access the file at a time
        if not os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'w') as file:
                json.dump([], file)  # Initialize with an empty list

        with open(DATA_FILE, 'r+') as file:
            data = json.load(file)
            data.append(telemetry_data)
            file.seek(0)
            json.dump(data, file, indent=4)
    print(f"Saved data locally: {json.dumps(telemetry_data)}")

# Function to fetch and save data continuously
def data_fetcher():
    while True:
        telemetry_data = get_air_quality_data()
        if telemetry_data:
            save_telemetry_data_locally(telemetry_data)
        time.sleep(8)  # Fetch every 8 seconds

# Function to send telemetry data to Azure IoT Hub
def send_telemetry_to_iothub(telemetry_data):
    message = Message(json.dumps(telemetry_data))
    message.content_encoding = "utf-8"
    message.content_type = "application/json"
    client.send_message(message)
    print(f"Sent data to IoT Hub: {json.dumps(telemetry_data)}")

# Function to send data from local JSON to Azure IoT Hub
def data_sender():
    while True:
        with data_lock:  # Ensure thread-safe access to the file
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'r+') as file:
                    data = json.load(file)
                    if data:
                        telemetry_data = data.pop(0)  # Remove the first entry
                        file.seek(0)
                        json.dump(data, file, indent=4)
                        file.truncate()  # Remove leftover data
                        send_telemetry_to_iothub(telemetry_data)
        time.sleep(10)  # Send every 10 seconds

# Starting the threads
fetch_thread = threading.Thread(target=data_fetcher)
send_thread = threading.Thread(target=data_sender)

fetch_thread.start()
send_thread.start()

fetch_thread.join()
send_thread.join()
