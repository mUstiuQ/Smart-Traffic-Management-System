import subprocess
import sys

def run_script(script_name, *args):
    """Run a script with the given arguments."""
    try:
        result = subprocess.run([sys.executable, script_name] + list(args), check=True)
        print(f"Successfully executed {script_name}")
    except subprocess.CalledProcessError as e:
        print(f"Error executing {script_name}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        while True:
            # Step 1: Run Air_Quality_Sensor_Simulation.py
            run_script("Air_Quality_Sensor_Simulation.py")

            # Step 2: Run json_to_mongo.py with SensorReadings collection
            run_script("json_to_mongo.py", "SensorReadings")

            # Step 3: Run ai_routing.py
            run_script("ai_routing.py")

            # Step 4: Run json_to_mongo.py with OptimalRouteResults collection
            run_script("json_to_mongo.py", "OptimalRouteResults")
    except KeyboardInterrupt:
        print("Execution stopped by user.")
        sys.exit(0)