import time
from azure.iot.device import IoTHubDeviceClient, Message

# Replace this with your actual connection string
CONNECTION_STRING = "HostName=SmartTrafficManagement.azure-devices.net;DeviceId=traffic_light;SharedAccessKey=tI3D73JkDvkeXpfyC6oKNsEc/6XbvfjlvV6sg9fpqqg="

# Define traffic light states and their durations
TRAFFIC_LIGHT_CYCLE = [
    {"state": "Red", "duration": 5},    # Red for 5 seconds
    {"state": "Green", "duration": 5},  # Green for 5 seconds
    {"state": "Yellow", "duration": 2}  # Yellow for 2 seconds
]

# Function to simulate the traffic light
def simulate_traffic_light():
    # Create an IoT Hub client
    client = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING)
    
    print("Starting traffic light simulation... Press Ctrl+C to exit.")
    try:
        while True:
            for signal in TRAFFIC_LIGHT_CYCLE:
                # Create a message with the current state
                message = Message(signal["state"])
                message.content_type = "application/json"
                message.content_encoding = "utf-8"
                
                # Send the message to the IoT Hub
                print(f"Sending traffic light state: {signal['state']}")
                client.send_message(message)
                
                # Wait for the specified duration before the next state
                time.sleep(signal["duration"])
    except KeyboardInterrupt:
        print("Simulation stopped.")
    finally:
        # Clean up
        client.disconnect()

# Run the simulation
simulate_traffic_light()
