import pandas as pd
import numpy as np
import json
from sklearn.ensemble import RandomForestRegressor
from heapq import heappop, heappush

# Load air quality data from JSON file
with open('air_quality_PROC.json', 'r') as file:
    air_quality_data = json.load(file)

# Calculate average air quality levels for penalty calculation
average_co = np.mean([entry['data']['co'] for entry in air_quality_data])
average_no2 = np.mean([entry['data'].get('no2', 0) for entry in air_quality_data])
average_pm25 = np.mean([entry['data'].get('pm25', 0) for entry in air_quality_data])

# Define a function for air quality penalty
def calculate_air_quality_penalty(co, no2, pm25):
    return (co * 0.15) + (no2 * 0.07) + (pm25 * 0.03)  # Adjusted weightings

# Load traffic data from JSON file
with open('intersection_data.json', 'r') as file:
    traffic_data = json.load(file)

# Convert traffic data to the required format
traffic_data_dict = [
    {
        'timestamp': entry['timestamp'],
        'traffic_volume': entry['traffic_volume'],
        'average_speed': entry['average_speed'],
        'vehicle_count': entry['vehicle_count'],
        'light_status': entry['light_status'],
        'rain': entry['rain']
    }
    for entry in traffic_data
]

# Road network graph with distances
road_graph = {
    'Intersection A': {'Intersection B': 5, 'Intersection C': 10, 'Intersection D': 8},
    'Intersection B': {'Intersection A': 5, 'Intersection C': 4, 'Intersection D': 7},
    'Intersection C': {'Intersection A': 10, 'Intersection B': 4, 'Intersection D': 6},
    'Intersection D': {'Intersection A': 8, 'Intersection B': 7, 'Intersection C': 6}
}

# Calculate route weights using a RandomForest model
def calculate_route_weights(graph, traffic_data, co, no2, pm25):
    route_weights = {}
    air_quality_penalty = calculate_air_quality_penalty(co, no2, pm25)
    model = RandomForestRegressor(n_estimators=100)
    
    # Training data (hypothetical, replace with real-world data if available)
    X_train = np.array([[20, 50, 1, 20], [30, 40, 0, 35], [40, 45, 0.5, 25]])  # [traffic_volume, speed, red_light_factor, vehicle_count]
    y_train = np.array([5, 10, 15])  # Distance
    model.fit(X_train, y_train)
    
    for start, neighbors in graph.items():
        for end, distance in neighbors.items():
            traffic_entry = next((t for t in traffic_data if t['timestamp']), None)
            if not traffic_entry:
                continue
            
            traffic_volume = traffic_entry['traffic_volume']
            avg_speed = traffic_entry['average_speed']
            vehicle_count = traffic_entry['vehicle_count']
            light_status = traffic_entry['light_status']
            rain = traffic_entry['rain']
            
            red_light_factor = 1 if light_status == 'red' else 0
            
            # Predict weight using ML model
            weight = model.predict([[traffic_volume, avg_speed, red_light_factor + air_quality_penalty, vehicle_count]])[0]
            route_weights[(start, end)] = weight
    
    return route_weights

# Dijkstra’s algorithm for finding optimal route
def find_optimal_route(start, end, graph, route_weights):
    priority_queue = [(0, start)]  # (cumulative weight, intersection)
    shortest_paths = {node: float('inf') for node in graph}
    shortest_paths[start] = 0
    previous_nodes = {}
    
    while priority_queue:
        current_weight, current_intersection = heappop(priority_queue)
        
        if current_intersection == end:
            break
        
        for neighbor in graph[current_intersection]:
            weight = route_weights.get((current_intersection, neighbor), float('inf'))
            new_weight = current_weight + weight
            
            if new_weight < shortest_paths[neighbor]:
                shortest_paths[neighbor] = new_weight
                previous_nodes[neighbor] = current_intersection
                heappush(priority_queue, (new_weight, neighbor))
    
    # Retrieve path
    route = []
    current = end
    while current in previous_nodes:
        route.insert(0, current)
        current = previous_nodes[current]
    route.insert(0, start)
    
    return route, shortest_paths[end]

# Main execution
start_intersection = 'Intersection A'
end_intersection = 'Intersection D'

route_weights = calculate_route_weights(road_graph, traffic_data_dict, average_co, average_no2, average_pm25)
optimal_route, total_weight = find_optimal_route(start_intersection, end_intersection, road_graph, route_weights)

# Save results
results = {
    "optimal_route": optimal_route,
    "total_weight": total_weight
}
print("Optimal Route:", optimal_route)
print("Total Weight (Cost or Time):", total_weight)

with open('optimal_route_results.json', 'w') as f:
    json.dump(results, f)
