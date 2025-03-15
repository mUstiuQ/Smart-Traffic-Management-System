import numpy as np
import json
from sklearn.ensemble import RandomForestRegressor
from heapq import heappop, heappush

# Load air quality data from JSON file
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

# Load traffic data from JSON file
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
road_graph = {
    'Intersection A': {'Intersection B': 5, 'Intersection C': 10, 'Intersection D': 8},
    'Intersection B': {'Intersection A': 5, 'Intersection C': 4, 'Intersection D': 7},
    'Intersection C': {'Intersection A': 10, 'Intersection B': 4, 'Intersection D': 6},
    'Intersection D': {'Intersection A': 8, 'Intersection B': 7, 'Intersection C': 6}
}

# Function to generate training data for RandomForest (using traffic and air quality data)
def generate_training_data(traffic_data, air_quality_data):
    X = []
    y = []
    
    for timestamp, entry in traffic_data.items():
        # Find the corresponding air quality data entry for this timestamp
        air_data_entry = next((ad for ad in air_quality_data if ad['timestamp'] == timestamp), None)
        if air_data_entry:
            # Feature vector (traffic data + air quality penalties)
            features = [
                entry['traffic_volume'],
                entry['average_speed'],
                entry['vehicle_count'],
                1 if entry['light_status'] == 'red' else 0,  # Red light factor
                entry['rain'],
                air_data_entry['co'],
                air_data_entry['no2'],
                air_data_entry['pm25'],
                air_data_entry['temperature'],
                air_data_entry['humidity']
            ]
            
            # Target variable (route weight, travel time, or distance; we'll assume it's distance here)
            target = road_graph.get(timestamp, 0)  # Replace this with actual target data
            
            X.append(features)
            y.append(target)
    
    return np.array(X), np.array(y)

# Train RandomForest model
X_train, y_train = generate_training_data(traffic_data_dict, air_quality_data)
model = RandomForestRegressor(n_estimators=100)
model.fit(X_train, y_train)

# Calculate route weights using trained RandomForest model
def calculate_route_weights(graph, traffic_data, air_quality_data, model):
    route_weights = {}
    
    for start, neighbors in graph.items():
        for end, distance in neighbors.items():
            # Find the corresponding traffic and air quality data entry for this timestamp
            traffic_entry = traffic_data.get(start)
            if not traffic_entry:
                continue
            
            # Extract traffic and air quality data
            air_data_entry = next((ad for ad in air_quality_data if ad['timestamp'] == start), None)
            if not air_data_entry:
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

# Calculate route weights using the trained RandomForest model
route_weights = calculate_route_weights(
    road_graph, 
    traffic_data_dict, 
    air_quality_data, 
    model
)

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