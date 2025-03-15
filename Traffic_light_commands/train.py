from traffic_env import TrafficEnv
from q_learning_agent import QLearningAgent
import numpy as np

# Define optimal route and total weight
optimal_route = ["Intersection A", "Intersection D"]  # Example route
total_weight = 8.0

# Initialize environment
env = TrafficEnv(num_intersections=4, optimal_route=optimal_route, total_weight=total_weight)
agent = QLearningAgent(num_states=env.observation_space.shape[0], num_actions=env.action_space.n)

# Training loop
num_episodes = 1000
for episode in range(num_episodes):
    state = env.reset()
    state = np.argmax(state)  # Convert observation to state index
    done = False
    
    while not done:
        action = agent.choose_action(state)
        next_state, reward, done, _ = env.step(action)
        next_state = np.argmax(next_state)  # Convert next state to index
        agent.learn(state, action, reward, next_state)
        state = next_state  # Move to the next state
    
    if episode % 100 == 0:
        print(f"Episode {episode}, Q-table updated.")

# Save the Q-table for future use
np.save("q_table.npy", agent.q_table)
