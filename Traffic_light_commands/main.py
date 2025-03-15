import numpy as np
from traffic_env import TrafficEnv
import json
from azure.iot.hub import IoTHubRegistryManager

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

def main():
    # Load the optimal route from the JSON file
    with open("../AI_routing_algorithm/optimal_route_results.json", 'r') as file:
        optimal_route_data = json.load(file)
        optimal_route = optimal_route_data["optimal_route"]

    # Determine the traffic light state based on the optimal route
    traffic_light_states = ['Red'] * len(optimal_route)
    if optimal_route:
        first_intersection = optimal_route[0]
        for i in range(len(optimal_route)):
            intersection_name = f"Intersection {chr(ord('A') + i)}"
            if intersection_name == first_intersection:
                traffic_light_states[i] = 'Green'

    # Show the updated traffic light states
    print("Updated Traffic Light States:")
    for i, state in enumerate(traffic_light_states):
        print(f"Intersection {chr(ord('A') + i)}: {state}")

    # Send the updated traffic light states to the device
    message = json.dumps({
        "traffic_light_states": traffic_light_states
    })
    send_message_to_device(message)

if __name__ == "__main__":
    main()