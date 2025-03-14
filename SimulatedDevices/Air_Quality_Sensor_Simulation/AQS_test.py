import requests
import time
import json
import os
from azure.iot.device import IoTHubDeviceClient, Message

# Load connection string for Azure IoT Hub
def load_connection_string(filename="primary_connection_string.txt"):
    with open(filename, 'r') as file:
        for line in file:
            if line.startswith("CONNECTION_STRING="):
                return line.split("=", 1)[1].strip()

CONNECTION_STRING = load_connection_string()
client = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING, websockets=True)  # Use MQTT with websockets

# WAQI API configuration for Timisoara
STATION_ID = "timisoara"  # Using 'timisoara' station for this example
API_URL = f"http://api.waqi.info/feed/{STATION_ID}/?token=demo"  # demo token for free access

# Local file to store telemetry data
DATA_FILE = "telemetry_data.json"

# Function to get air quality data from WAQI API
def get_air_quality_data():
    response = requests.get(API_URL)
    
    if response.status_code == 200:
        data = response.json()
        
        if data['status'] == 'ok' and 'data' in data:
            components = data['data']['iaqi']
            co_level = components.get("co", {}).get("v", 0)
            no2_level = components.get("no2", {}).get("v", 0)
            pm25 = components.get("pm25", {}).get("v", 0)
            
            telemetry_data = {
                "sensorType": "AirQualitySensor",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()),
                "data": {
                    "co": co_level,
                    "no2": no2_level,
                    "pm25": pm25
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
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'w') as file:
            json.dump([], file)  # Initialize with an empty list
    
    with open(DATA_FILE, 'r+') as file:
        # Load existing data
        data = json.load(file)
        
        # Append new telemetry data
        data.append(telemetry_data)
        
        # Write updated data back to the file
        file.seek(0)
        json.dump(data, file, indent=4)
    print(f"Saved data locally: {json.dumps(telemetry_data)}")

# Function to send telemetry data from local storage to Azure IoT Hub
def send_telemetry_to_iothub():
    with open(DATA_FILE, 'r+') as file:
        # Load all telemetry data
        data = json.load(file)
        
        if data:
            for telemetry_data in data:
                message = Message(json.dumps(telemetry_data))
                message.content_encoding = "utf-8"
                message.content_type = "application/json"
                
                client.send_message(message)
                print(f"Sent data: {json.dumps(telemetry_data)}")
            
            # Clear the file after sending
            file.seek(0)
            file.truncate()
            json.dump([], file)
        else:
            print("No data to send.")

# Main loop for data acquisition and storage
def acquire_data_loop():
    while True:
        telemetry_data = get_air_quality_data()
        
        if telemetry_data:
            save_telemetry_data_locally(telemetry_data)
        
        time.sleep(8)  # Adjust frequency as needed

# Transmission loop for sending data to Azure IoT Hub
def transmit_data_loop():
    while True:
        send_telemetry_to_iothub()
        time.sleep(60)  # Send every 60 seconds, adjust as needed

# Run the data acquisition and transmission loops
if __name__ == "__main__":
    from threading import Thread
    
    # Start data acquisition in a separate thread
    acquire_thread = Thread(target=acquire_data_loop)
    acquire_thread.start()
    
    # Start data transmission in a separate thread
    transmit_thread = Thread(target=transmit_data_loop)
    transmit_thread.start()
