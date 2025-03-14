import subprocess
import sys
import os

def run_script(script_name, script_dir, *args):
    """Run a script with the given arguments."""
    try:
        # Change the working directory to the script's directory
        os.chdir(script_dir)
        result = subprocess.run([sys.executable, script_name] + list(args), check=True)
        print(f"Successfully executed {script_name}")
    except subprocess.CalledProcessError as e:
        print(f"Error executing {script_name}: {e}")
        sys.exit(1)
    finally:
        # Change back to the original working directory
        os.chdir(original_cwd)

if __name__ == "__main__":
    original_cwd = os.getcwd()  # Save the original working directory
    try:
        # Step 1: Run Air_Quality_Sensor_Simulation.py
        run_script("Air_Quality_Sensor_Simulation.py", "SimulatedDevices/Air_Quality_Sensor_Simulation")

        # Step 2: Run json_to_mongo.py with SensorReadings collection
        run_script("json_to_mongo.py", "JSON_to_MongoDB", "SensorReadings")

        # Step 3: Run ai_routing.py
        run_script("ai_routing.py", "AI_routing_algorithm")

        # Step 4: Run json_to_mongo.py with OptimalRouteResults collection
        run_script("json_to_mongo.py", "JSON_to_MongoDB", "OptimalRouteResults")
    except KeyboardInterrupt:
        print("Execution stopped by user.")
        sys.exit(0)