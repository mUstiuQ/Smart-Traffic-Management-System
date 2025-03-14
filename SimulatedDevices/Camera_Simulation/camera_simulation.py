import cv2
import json
import threading
import random
import time
from datetime import datetime

# Initialize shared data structure with a dictionary
camera_data = {
    "camera_id": "Cam1",
    "location": "Intersection A",
    "vehicle_count": 0,
    "timestamp": None
}
data_lock = threading.Lock()  # Lock for thread-safe access to shared data

# Function to get the current timestamp in the desired format
def get_current_timestamp():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Simulate vehicle counting (replace with actual vehicle detection logic)
def count_vehicles(frame):
    # Placeholder: return a random count or process frame to count vehicles
    return random.randint(0, 20)  # Random count for demonstration

# Function to process frames from a camera
def process_camera(camera_data, video_source):
    cap = cv2.VideoCapture(video_source)
    if not cap.isOpened():
        print(f"Error opening video source: {video_source}")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            break  # Exit loop if no frame is captured

        # Process frame to count vehicles
        vehicle_count = count_vehicles(frame)

        # Update camera data safely
        with data_lock:
            camera_data["vehicle_count"] = vehicle_count
            camera_data["timestamp"] = get_current_timestamp()

        # Simulate a delay for processing each frame
        time.sleep(1)

    cap.release()

# Function to save data to JSON file
def save_to_json(camera_data, filename):
    with open(filename, 'w') as f:
        json.dump(camera_data, f, indent=4)

# Main function
def main():
    # Start the camera processing thread
    camera_thread = threading.Thread(target=process_camera, args=(camera_data, "video.mp4"))
    camera_thread.start()

    # Wait for the camera thread to finish
    camera_thread.join()

    # Save the final data to a JSON file
    save_to_json(camera_data, "camera_data.json")
    print("Camera data saved to camera_data.json")

if __name__ == "__main__":
    main()
