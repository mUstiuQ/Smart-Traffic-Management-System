import streamlit as st
import numpy as np
from traffic_env import TrafficEnv
import json

# Streamlit UI
st.title("Traffic Light Control Simulation")

# Input: JSON format of the optimal route and total weight
optimal_route_input = st.text_area("Enter the Optimal Route JSON (e.g., {\"optimal_route\": [\"Intersection A\", \"Intersection D\"], \"total_weight\": 8.0})", 
                                   "{\"optimal_route\": [\"Intersection A\", \"Intersection D\"], \"total_weight\": 8.0}")

# Parse the input to get the optimal route and total weight
try:
    optimal_route_data = json.loads(optimal_route_input)
    optimal_route = optimal_route_data["optimal_route"]
    total_weight = optimal_route_data["total_weight"]
except json.JSONDecodeError:
    st.error("Invalid JSON format. Please correct the format.")
    optimal_route = []
    total_weight = None

# Input: Vehicle counts at each intersection (ensure the number of counts matches the number of intersections)
vehicle_counts_input = st.text_input("Enter vehicle counts at each intersection (comma separated, e.g., 10, 5, 3, 8):", "10, 5, 3, 8")
vehicle_counts = np.array([int(x.strip()) for x in vehicle_counts_input.split(',')])

# Ensure vehicle counts match the number of intersections
if len(vehicle_counts) != len(optimal_route):
    st.error(f"Number of vehicle counts does not match the number of intersections in the optimal route. Expected {len(optimal_route)} counts.")
else:
    # Number of intersections
    num_intersections = len(vehicle_counts)

    # Initialize the TrafficEnv with the given parameters
    env = TrafficEnv(num_intersections=num_intersections, optimal_route=optimal_route, vehicle_counts=vehicle_counts)

    # Update the traffic light states based on the optimal route and vehicle counts
    env.update_traffic_lights()

    # Show the updated traffic light states
    st.write("Updated Traffic Light States:")
    for i, intersection in enumerate(env.get_traffic_light_status()):
        st.write(f"Intersection {chr(ord('A') + i)}: {intersection}")

    # Show the vehicle counts at each intersection
    st.write("Vehicle Counts at Each Intersection:")
    for i, count in enumerate(vehicle_counts):
        st.write(f"Intersection {chr(ord('A') + i)}: {count} vehicles")
