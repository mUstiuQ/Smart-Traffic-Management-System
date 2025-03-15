import numpy as np

class TrafficEnv:
    def __init__(self, num_intersections, optimal_route, vehicle_counts):
        self.num_intersections = num_intersections
        self.optimal_route = optimal_route  # List of intersections
        self.vehicle_counts = vehicle_counts  # Vehicle counts at each intersection
        self.light_states = ['Red'] * num_intersections  # Initial light states: All red
        
    def update_traffic_lights(self):
        """
        Update the traffic light states based on the optimal route and vehicle counts.
        The intersection with the most vehicles in the optimal route gets the Green light.
        """
        # Find the intersection with the highest vehicle count on the optimal route
        max_vehicle_count = -1
        intersection_to_set_green = None
        
        # Iterate over the optimal route to find the intersection with the highest vehicle count
        for intersection in self.optimal_route:
            # Get the index of the intersection in the traffic lights list
            index = ord(intersection.split(' ')[-1]) - ord('A')  # A -> 0, B -> 1, etc.
            if self.vehicle_counts[index] > max_vehicle_count:
                max_vehicle_count = self.vehicle_counts[index]
                intersection_to_set_green = intersection
        
        # Set the green light for the intersection with the most vehicles
        for i in range(self.num_intersections):
            intersection_name = f"Intersection {chr(ord('A') + i)}"
            if intersection_name == intersection_to_set_green:
                self.light_states[i] = 'Green'
            else:
                self.light_states[i] = 'Red'  # Set others to Red (or Yellow if preferred)
        
    def get_traffic_light_status(self):
        return self.light_states

    def get_vehicle_counts(self):
        return self.vehicle_counts
