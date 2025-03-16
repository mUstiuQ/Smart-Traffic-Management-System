import numpy as np

class TrafficEnv:
    def __init__(self, num_intersections, optimal_route):
        self.num_intersections = num_intersections
        self.optimal_route = optimal_route  # List of intersections
        self.light_states = ['Red'] * num_intersections  # Initial light states: All red
        
        # Define the observation space and action space
        self.observation_space = np.array([0] * num_intersections)  # Example observation space
        self.action_space = np.array([0, 1])  # Example action space: 0 for Red, 1 for Green
        
    def reset(self):
        self.light_states = ['Red'] * self.num_intersections
        return self.get_observation()
    
    def step(self, action):
        self.update_traffic_lights(action)
        reward = self.calculate_reward()
        done = True  # Each step is a complete episode
        return self.get_observation(), reward, done, {}
    
    def update_traffic_lights(self, action):
        for i in range(self.num_intersections):
            self.light_states[i] = 'Green' if i == action else 'Red'
    
    def calculate_reward(self):
        # Example reward calculation: negative of the total vehicle count at red lights
        reward = -sum(1 for state in self.light_states if state == 'Red')
        return reward
    
    def get_observation(self):
        return np.array([1 if state == 'Green' else 0 for state in self.light_states])
    
    def get_traffic_light_status(self):
        return self.light_states