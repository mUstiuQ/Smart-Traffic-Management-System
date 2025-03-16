import numpy as np
import json
from azure.iot.hub import IoTHubRegistryManager
from traffic_env import TrafficEnv

# Function to load the connection string from a file
def load_connection_string(filename="primary_connection_string.txt"):
    with open(filename, 'r') as file:
        for line in file:
            if line.startswith("CONNECTION_STRING="):
                return line.split("=", 1)[1].strip()

# Load the connection string
CONNECTION_STRING = load_connection_string()
DEVICE_ID = "RaspberryPi5"  # The device ID you registered in Azure IoT Hub

def send_message_to_device(message):
    try:
        # Create an IoT Hub registry manager
        registry_manager = IoTHubRegistryManager(CONNECTION_STRING)

        # Send the message to the device
        registry_manager.send_c2d_message(DEVICE_ID, message)

        print(f"Message sent to device {DEVICE_ID}: {message}")

    except Exception as e:
        print(f"Error sending message: {e}")

# Load the optimal route from the JSON file
with open("../AI_routing_algorithm/optimal_route_results.json", 'r') as file:
    optimal_route_data = json.load(file)
    optimal_route = optimal_route_data["optimal_route"]

# Initialize the TrafficEnv environment
env = TrafficEnv(num_intersections=len(optimal_route), optimal_route=optimal_route)

# Reset the environment to get the initial state
initial_state = env.reset()

# Update traffic light states based on the optimal route
intersection_status = []  # List of dictionaries
for i, intersection in enumerate(optimal_route):
    intersection_name = f"Intersection {chr(ord('A') + i)}"
    intersection_status.append({"name": intersection_name, "state": 'Green'})
    print(f"{intersection_name}: Green")
    # Reset previous intersection to Red if not the first one
    if i > 0:
        previous_intersection_name = f"Intersection {chr(ord('A') + i - 1)}"
        intersection_status.append({"name": previous_intersection_name, "state": 'Red'})
        print(f"{previous_intersection_name}: Red")

# Send the updated traffic light states to the device
message = json.dumps({
    "intersection_status": intersection_status  # List of dictionaries
})
send_message_to_device(message)