import time
import random
import json  # Import json module to format data
from azure.iot.device import IoTHubDeviceClient, Message

CONNECTION_STRING = "Your_SpeedSensor_Connection_String"
client = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING)

def simulate_speed():
    while True:
        speed = random.randint(30, 80)  # Speed in km/h
        telemetry_data = {
            "sensorType": "SpeedSensor",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()),  # Add a timestamp
            "data": {
                "speed": speed
            }
        }
        
        # Convert the telemetry data to JSON format
        message = Message(json.dumps(telemetry_data))
        message.content_encoding = "utf-8"
        message.content_type = "application/json"
        client.send_message(message)
        
        print(f"Speed Sensor - Sent data: {json.dumps(telemetry_data)}")
        time.sleep(30)  # Sends data every 30 seconds

simulate_speed()
