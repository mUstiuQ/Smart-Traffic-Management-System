import numpy as np

class QLearningAgent:
    def __init__(self, observation_space, action_space, alpha=0.1, gamma=0.99, epsilon=0.1):
        self.observation_space = observation_space
        self.action_space = action_space
        self.alpha = alpha  # Learning rate
        self.gamma = gamma  # Discount factor
        self.epsilon = epsilon  # Exploration rate
        
        # Initialize Q-table: Flatten the multi-dimensional space
        # Use np.prod() to get the total number of states and actions
        state_size = np.prod(observation_space.shape)  # Number of possible states (flattened)
        action_size = np.prod(action_space.shape)  # Number of possible actions (flattened)
        
        self.q_table = np.zeros([state_size, action_size])  # Flattened Q-table
    
    def choose_action(self, state):
        # Exploration vs Exploitation
        if np.random.rand() < self.epsilon:
            action = np.random.randint(self.action_space.shape[0])  # Random action (explore)
        else:
            action = np.argmax(self.q_table[state])  # Best-known action (exploit)
        return action
    
    def learn(self, state, action, reward, next_state):
        # Update the Q-table using the Q-learning formula
        best_next_action = np.argmax(self.q_table[next_state])
        td_target = reward + self.gamma * self.q_table[next_state][best_next_action]
        td_error = td_target - self.q_table[state][action]
        self.q_table[state][action] += self.alpha * td_error
