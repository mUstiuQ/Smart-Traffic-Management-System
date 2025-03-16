import numpy as np
import json
from sklearn.ensemble import RandomForestRegressor
from heapq import heappop, heappush
from datetime import datetime
import sys
sys.stdout.reconfigure(encoding='utf-8')

road_graph = {
    'Intersection A': {'Intersection B': 5, 'Intersection C': 10, 'Intersection D': 8},
    'Intersection B': {'Intersection A': 5, 'Intersection C': 4, 'Intersection D': 7},
    'Intersection C': {'Intersection A': 10, 'Intersection B': 4, 'Intersection D': 6},
    'Intersection D': {'Intersection A': 8, 'Intersection B': 7, 'Intersection C': 6}
}

traffic_data_dict = {
    'Intersection A': {'traffic_volume': 50, 'average_speed': 40, 'vehicle_count': 35, 'light_status': 'red', 'rain': 700},
    'Intersection B': {'traffic_volume': 40, 'average_speed': 30, 'vehicle_count': 20, 'light_status': 'green', 'rain': 200},
    'Intersection C': {'traffic_volume': 30, 'average_speed': 35, 'vehicle_count': 25, 'light_status': 'red', 'rain': 300},
    'Intersection D': {'traffic_volume': 20, 'average_speed': 50, 'vehicle_count': 15, 'light_status': 'green', 'rain': 100}
}

air_quality_data = [
    {'timestamp': 'Intersection A', 'co': 5, 'no2': 7, 'pm25': 12, 'temperature': 22, 'humidity': 50},
    {'timestamp': 'Intersection B', 'co': 4, 'no2': 6, 'pm25': 10, 'temperature': 23, 'humidity': 55},
    {'timestamp': 'Intersection C', 'co': 3, 'no2': 5, 'pm25': 8, 'temperature': 24, 'humidity': 60},
    {'timestamp': 'Intersection D', 'co': 2, 'no2': 4, 'pm25': 6, 'temperature': 25, 'humidity': 65}
]

# Load air quality data from the JSON file
with open('sensor_data.json', 'r') as file:
    air_quality_data = json.load(file)

# Calculate average air quality levels for penalty calculation
average_co = np.mean([entry['co'] for entry in air_quality_data])
average_no2 = np.mean([entry.get('no2', 0) for entry in air_quality_data])
average_pm25 = np.mean([entry.get('pm25', 0) for entry in air_quality_data])
average_temperature = np.mean([entry['temperature'] for entry in air_quality_data])
average_humidity = np.mean([entry['humidity'] for entry in air_quality_data])

# Define a function for air quality penalty, considering temperature and humidity with a weight of 0.01
def calculate_air_quality_penalty(co, no2, pm25, temperature, humidity):
    penalty = (co * 0.15) + (no2 * 0.07) + (pm25 * 0.03)
    penalty += (temperature * 0.01)
    penalty += (humidity * 0.01)
    return penalty

# Load traffic data from the JSON file
with open('intersection_data.json', 'r') as file:
    traffic_data = json.load(file)

# Convert traffic data to the required format
traffic_data_dict = {
    entry['timestamp']: {
        'traffic_volume': entry['traffic_volume'],
        'average_speed': entry['average_speed'],
        'vehicle_count': entry['vehicle_count'],
        'light_status': entry['light_status'],
        'rain': entry['rain']
    }
    for entry in traffic_data
}

# Road network graph with distances
#   'Intersection A': {'Intersection B': 5, 'Intersection C': 10, 'Intersection D': 8},
 #   'Intersection B': {'Intersection A': 5, 'Intersection C': 4, 'Intersection D': 7},
  #  'Intersection C': {'Intersection A': 10, 'Intersection B': 4, 'Intersection D': 6},
   # 'Intersection D': {'Intersection A': 8, 'Intersection B': 7, 'Intersection C': 6}
#}

# Function to generate training data for RandomForest (using traffic and air quality data)
def find_closest_timestamp(target, air_quality_data):
    target_time = datetime.strptime(target, "%Y-%m-%d %H:%M:%S")
    closest_entry = min(
        air_quality_data,
        key=lambda x: abs(datetime.strptime(x['timestamp'], "%Y-%m-%d %H:%M:%S") - target_time)
    )
    return closest_entry

# Generate training data for RandomForest
def generate_training_data(traffic_data, air_quality_data):
    X = []
    y = []
    
    for timestamp, entry in traffic_data.items():
        # Find the closest timestamp from `air_quality_data`
        air_data_entry = find_closest_timestamp(timestamp, air_quality_data)
        if air_data_entry:
            # Build the feature vector
            features = [
                entry['traffic_volume'],
                entry['average_speed'],
                entry['vehicle_count'],
                1 if entry['light_status'] == 'red' else 0,
                entry['rain'],
                air_data_entry['co'],
                air_data_entry['no2'],
                air_data_entry['pm25'],
                air_data_entry['temperature'],
                air_data_entry['humidity']
            ]
            # Add a dummy target value (you can modify it later with a real target)
            target = 1
            
            X.append(features)
            y.append(target)
    
    return np.array(X), np.array(y)

# Train the RandomForest model
X_train, y_train = generate_training_data(traffic_data_dict, air_quality_data)
model = RandomForestRegressor(n_estimators=100)
print("X_train shape:", np.array(X_train).shape)
print("y_train shape:", np.array(y_train).shape)
print("X_train:", X_train)
print("y_train:", y_train)
print("X_train:", X_train)
print("y_train:", y_train)

if isinstance(X_train, list):
    X_train = np.array(X_train)
if isinstance(y_train, list):
    y_train = np.array(y_train)

print("X_train shape:", X_train.shape)
print("y_train shape:", y_train.shape)

# Stop execution if the data is empty
if X_train.size == 0 or y_train.size == 0:
    raise ValueError("Error: X_train or y_train is empty")

# Transform X_train to 2D if necessary
if len(X_train.shape) == 1:
    print("Reshape X_train to 2D")
    X_train = X_train.reshape(-1, 1)

print("New shape of X_train:", X_train.shape)
model.fit(X_train, y_train)
print("Final shape of X_train:", X_train.shape)
print("Final shape of y_train:", y_train.shape)

# Calculate route weights using the trained RandomForest model
def calculate_route_weights(graph, traffic_data, air_quality_data, model):
    route_weights = {}
    
    for start, neighbors in graph.items():
        for end, distance in neighbors.items():
            # Find the corresponding traffic and air quality data entry for this timestamp
            traffic_entry = traffic_data.get(start)
            if not traffic_entry:
                print(f"Missing traffic data for {start}. Skipping this route.")
                continue
            
            # Extract traffic and air quality data
            air_data_entry = next((ad for ad in air_quality_data if ad['timestamp'] == start), None)
            if not air_data_entry:
                print(f"Missing air quality data for {start}. Skipping this route.")
                continue
            
            # Feature vector for the model (traffic data + air quality data)
            features = [
                traffic_entry['traffic_volume'],
                traffic_entry['average_speed'],
                traffic_entry['vehicle_count'],
                1 if traffic_entry['light_status'] == 'red' else 0,  # Red light factor
                traffic_entry['rain'],
                air_data_entry['co'],
                air_data_entry['no2'],
                air_data_entry['pm25'],
                air_data_entry['temperature'],
                air_data_entry['humidity']
            ]
            
            # Predict route weight using RandomForest model
            weight = model.predict(np.array(features).reshape(1, -1))[0]
            if not np.isfinite(weight):
                print(f"Invalid weight between {start} and {end}: {weight}. Setting default value.")
                weight = 9999  # Large value to signal a penalty
            route_weights[(start, end)] = weight
    
    return route_weights

# Dijkstra’s algorithm for finding the optimal route
def find_optimal_route(start, end, graph, route_weights):
    priority_queue = [(0, start)]  # (cumulative weight, intersection)
    shortest_paths = {node: float('inf') for node in graph}
    shortest_paths[start] = 0
    previous_nodes = {}
    
    while priority_queue:
        current_weight, current_intersection = heappop(priority_queue)
        print(f"Analyzing current intersection: {current_intersection} with weight: {current_weight}")
        
        if current_intersection == end:
            break
        
        for neighbor in graph[current_intersection]:
            weight = route_weights.get((current_intersection, neighbor), float('inf'))
            if weight == float('inf'):
                print(f"Missing route weight from {current_intersection} to {neighbor}. Skipping.")
                continue

            new_weight = current_weight + weight
            
            if new_weight < shortest_paths[neighbor]:
                shortest_paths[neighbor] = new_weight
                previous_nodes[neighbor] = current_intersection
                heappush(priority_queue, (new_weight, neighbor))
    
    print(f"Analyzing current intersection: {current_intersection}")
    print(f"Current weight: {current_weight}")
    print(f"Neighbors: {graph[current_intersection]}")

    # Retrieve the path
    route = []
    current = end
    while current in previous_nodes:
        route.insert(0, current)
        current = previous_nodes[current]
    route.insert(0, start)
    
    if len(route) < 2:
        print("Optimal route is too short. Check your data and weights.")
    return route, shortest_paths[end]

# Main execution
start_intersection = 'Intersection A'
end_intersection = 'Intersection D'

# Calculate route weights using the trained RandomForest model
route_weights = calculate_route_weights(
    road_graph, 
    traffic_data_dict, 
    air_quality_data, 
    model
)

optimal_route, total_weight = find_optimal_route(start_intersection, end_intersection, road_graph, route_weights)
print("Route Weights:", route_weights)

# Save results
results = {
    "optimal_route": optimal_route,
    "total_weight": total_weight
}
with open('optimal_route_results.json', 'w') as f:
    json.dump(results, f, indent=4)
print("THE RESULTS WERE SAVED in 'optimal_route_results.json'")
print("Optimal Route:", optimal_route)
print("Total Weight (Cost or Time):", total_weight)

with open('optimal_route_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f)
