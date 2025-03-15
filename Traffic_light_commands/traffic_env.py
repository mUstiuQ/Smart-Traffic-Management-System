import numpy as np

class TrafficEnv:
    def __init__(self, num_intersections, optimal_route):
        self.num_intersections = num_intersections
        self.optimal_route = optimal_route  # List of intersections
        self.light_states = ['Red'] * num_intersections  # Initial light states: All red
        
    def update_traffic_lights(self):
        """
        Update the traffic light states based on the optimal route.
        The first intersection in the optimal route gets the Green light.
        """
        # Set the green light for the first intersection in the optimal route
        if self.optimal_route:
            first_intersection = self.optimal_route[0]
            for i in range(self.num_intersections):
                intersection_name = f"Intersection {chr(ord('A') + i)}"
                if intersection_name == first_intersection:
                    self.light_states[i] = 'Green'
                else:
                    self.light_states[i] = 'Red'  # Set others to Red
        
    def get_traffic_light_status(self):
        return self.light_states
