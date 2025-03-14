import time
import random
import json
from azure.iot.device import IoTHubDeviceClient, Message

CONNECTION_STRING = "Your_RoadConditionSensor_Connection_String"
client = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING)

def simulate_road_condition():
    while True:
        condition = random.choice(["dry", "wet", "icy"])  # Random road condition
        
        telemetry_data = {
            "sensorType": "RoadConditionSensor",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()),  # Add a timestamp
            "data": {
                "road_condition": condition
            }
        }
        
        # Convert the telemetry data to JSON format
        message = Message(json.dumps(telemetry_data))
        message.content_encoding = "utf-8"
        message.content_type = "application/json"
        client.send_message(message)
        
        print(f"Road Condition Sensor - Sent data: {json.dumps(telemetry_data)}")
        time.sleep(300)  # Sends data every 5 minutes

simulate_road_condition()
