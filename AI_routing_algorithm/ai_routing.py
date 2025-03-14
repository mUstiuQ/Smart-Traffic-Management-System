import pandas as pd
import numpy as np
import json
from sklearn.linear_model import LinearRegression

# Load air quality data from JSON file
with open('air_quality_PROC.json', 'r') as file:
    air_quality_data = json.load(file)

# Calculate average air quality levels for use in penalty calculation
average_co = np.mean([entry['data']['co'] for entry in air_quality_data])
average_no2 = np.mean([entry['data']['no2'] for entry in air_quality_data])
average_pm25 = np.mean([entry['data']['pm25'] for entry in air_quality_data])

# Sample traffic light, camera, and GPS data
traffic_lights_data = {
    'intersection_id': ['A', 'B', 'C', 'D'],
    'status': ['green', 'red', 'yellow', 'green'],
    'timestamp': ['2023-06-21 08:00:00', '2023-06-21 08:01:00', '2023-06-21 08:02:00', '2023-06-21 08:03:00']
}

cameras_data = {
    'camera_id': ['Cam1', 'Cam2', 'Cam3'],
    'location': ['Intersection A', 'Intersection B', 'Intersection C'],
    'vehicle_count': [10, 5, 15],
    'timestamp': ['2023-06-21 08:00:00', '2023-06-21 08:01:00', '2023-06-21 08:02:00']
}

gps_data = {
    'vehicle_id': ['V1', 'V2', 'V3'],
    'location': ['Intersection A', 'Intersection B', 'Intersection C'],
    'speed': [50, 60, 45],
    'timestamp': ['2023-06-21 08:00:00', '2023-06-21 08:01:00', '2023-06-21 08:02:00']
}

# Create DataFrames
df_traffic_lights = pd.DataFrame(traffic_lights_data)
df_cameras = pd.DataFrame(cameras_data)
df_gps = pd.DataFrame(gps_data)

# Merge the DataFrames based on timestamp and location columns
df_merged = pd.merge(df_traffic_lights, df_cameras, left_on='timestamp', right_on='timestamp', how='outer')
df_merged = pd.merge(df_merged, df_gps, left_on=['timestamp', 'location'], right_on=['timestamp', 'location'], how='outer')

# Fill NaN values for vehicle count and speed
df_merged['vehicle_count'] = df_merged['vehicle_count'].fillna(0)
df_merged['speed'] = df_merged['speed'].fillna(df_merged['speed'].mean())

# Filter for green lights only
green_lights = df_merged[df_merged['status'] == 'green']

# Calculate average speed per intersection and total vehicle count
average_speed = df_merged.groupby('location')['speed'].mean()
total_vehicle_count = df_merged['vehicle_count'].sum()

# Define traffic data dictionary using calculated data
traffic_data = {
    'Intersection A': {'traffic_volume': 30, 'average_speed': 50},
    'Intersection B': {'traffic_volume': 50, 'average_speed': 60},
    'Intersection C': {'traffic_volume': 40, 'average_speed': 45},
    'Intersection D': {'traffic_volume': 20, 'average_speed': 55}
}

# Road network graph with distances between intersections
graph = {
    'Intersection A': {'Intersection B': 5, 'Intersection C': 10, 'Intersection D': 8},
    'Intersection B': {'Intersection A': 5, 'Intersection C': 4, 'Intersection D': 7},
    'Intersection C': {'Intersection A': 10, 'Intersection B': 4, 'Intersection D': 6},
    'Intersection D': {'Intersection A': 8, 'Intersection B': 7, 'Intersection C': 6}
}

# Calculate air quality penalty based on pollution levels
def calculate_air_quality_penalty(co, no2, pm25):
    co_penalty = co * 0.1   # Weight for CO
    no2_penalty = no2 * 0.05 # Weight for NO2
    pm25_penalty = pm25 * 0.02 # Weight for PM2.5
    return co_penalty + no2_penalty + pm25_penalty

# Calculate route weights with AI-based model
def calculate_route_weights(graph, traffic_data, co, no2, pm25):
    route_weights = {}
    air_quality_penalty = calculate_air_quality_penalty(co, no2, pm25)
    
    for start, neighbors in graph.items():
        for end, distance in neighbors.items():
            traffic_volume = traffic_data[start]['traffic_volume']
            avg_speed = traffic_data[start]['average_speed']
            
            # AI-based model: simple linear regression (could be replaced with a pre-trained model)
            features = np.array([[traffic_volume, avg_speed, air_quality_penalty]])
            model = LinearRegression().fit(features, [distance])
            
            # Calculate weight as a function of traffic and air quality
            weight = model.predict([[traffic_volume, avg_speed, air_quality_penalty]])[0]
            route_weights[(start, end)] = weight
            
    return route_weights

# Find optimal route using calculated weights
def find_optimal_route_with_ai(start, end, graph, route_weights):
    shortest_distances = {intersection: float('inf') for intersection in graph}
    shortest_distances[start] = 0
    visited_intersections = set()
    previous_intersections = {}

    while visited_intersections != set(graph):
        current_intersection = min(
            set(graph) - visited_intersections,
            key=lambda intersection: shortest_distances[intersection]
        )
        visited_intersections.add(current_intersection)

        for neighbor in graph[current_intersection]:
            weight = route_weights[(current_intersection, neighbor)]
            new_distance = shortest_distances[current_intersection] + weight
            if new_distance < shortest_distances[neighbor]:
                shortest_distances[neighbor] = new_distance
                previous_intersections[neighbor] = current_intersection

    # Retrieve optimal route
    route = []
    current_intersection = end
    while current_intersection != start:
        route.insert(0, current_intersection)
        current_intersection = previous_intersections[current_intersection]
    route.insert(0, start)

    return route, shortest_distances[end]

# Main execution
start_intersection = 'Intersection A'
end_intersection = 'Intersection D'

# Calculate route weights using AI model
route_weights = calculate_route_weights(graph, traffic_data, average_co, average_no2, average_pm25)

# Find optimal route and total cost
optimal_route, total_weight = find_optimal_route_with_ai(start_intersection, end_intersection, graph, route_weights)

# Print and save results to JSON
results = {
    "optimal_route": optimal_route,
    "total_weight": total_weight
}

print("Optimal Route:", optimal_route)
print("Total Weight (Cost or Time):", total_weight)

# Write to output JSON file
with open('optimal_route_results.json', 'w') as f:
    json.dump(results, f)
