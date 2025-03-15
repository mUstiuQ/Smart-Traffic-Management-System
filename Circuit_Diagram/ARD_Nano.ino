#include <DHT.h>
#include <Adafruit_Sensor.h>
// -------------------------
// Configuration and Pin Setup
// -------------------------
#define DHTPIN A2      // DHT sensor data line on A2 (can use as digital pin)
#define DHTTYPE DHT11  // Change to DHT22 if you're using that sensor

DHT dht(DHTPIN, DHTTYPE);

// CO sensor (analog) on A0
const int coSensorPin = A0;

// Rain sensor
const int rainAnalogPin = A1;  // Analog output from rain sensor
const int rainDigitalPin = 3;  // Digital output from rain sensor

// HC-SR04 for speed measurement
// Sensor 1 (placed first)
const int trigPin1 = 5;
const int echoPin1 = 4;

// Sensor 2 (placed second)
const int trigPin2 = 6;
const int echoPin2 = 7;

// Speed measurement parameters
// (Set sensorDistance to the measured distance in meters between the two HC-SR04 sensors)
const float sensorDistance = 0.2;   // e.g., 0.2 meters = 20 cm
const int detectionThreshold = 10;    // Object detected if distance is below 10 cm

// Variables for speed measurement timing
unsigned long sensor1Time = 0;
unsigned long sensor2Time = 0;

// -------------------------
// Function to measure distance using an HC-SR04
// -------------------------
long measureDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Read the pulse duration from the echo pin (timeout after 30000µs)
  long duration = pulseIn(echoPin, HIGH, 30000);
  // Convert time (µs) to distance in centimeters:
  // speed of sound ~0.034 cm/µs; divided by 2 for round trip.
  long distance = duration * 0.034 / 2;
  return distance;
}

// -------------------------
// Setup
// -------------------------
void setup() {
  Serial.begin(115200);
  
  // Initialize DHT sensor
  dht.begin();
  
  // Set rain sensor digital pin as input
  pinMode(rainDigitalPin, INPUT);
  
  // Set HC-SR04 pins
  pinMode(trigPin1, OUTPUT);
  pinMode(echoPin1, INPUT);
  pinMode(trigPin2, OUTPUT);
  pinMode(echoPin2, INPUT);
}

// -------------------------
// Main Loop
// -------------------------
void loop() {
  // --- CO Sensor ---
  int coLevel = analogRead(coSensorPin);
  
  // --- Temperature & Humidity ---
  float temperature = dht.readTemperature(); // in °C
  float humidity = dht.readHumidity();         // in %
  
  // --- Rain Sensor ---
  int rainValue = analogRead(rainAnalogPin);
  int rainDigital = digitalRead(rainDigitalPin);
  
  // --- Speed Measurement using two HC-SR04 sensors ---
  long distance1 = measureDistance(trigPin1, echoPin1);
  long distance2 = measureDistance(trigPin2, echoPin2);
  
  // Check if sensor 1 detects an object (distance below threshold)
  if (distance1 > 0 && distance1 < detectionThreshold && sensor1Time == 0) {
    sensor1Time = millis();
  }
  
  // Check if sensor 2 detects the object (after sensor 1)
  if (sensor1Time != 0 && distance2 > 0 && distance2 < detectionThreshold && sensor2Time == 0) {
    sensor2Time = millis();
  }
  
  // Calculate speed (m/s) if both times were recorded
  float speed = 0.0;
  if (sensor1Time != 0 && sensor2Time != 0) {
    float timeDiff = (sensor2Time - sensor1Time) / 1000.0;  // Convert ms to seconds
    if (timeDiff > 0) {
      speed = sensorDistance / timeDiff;
    }
    // Reset for the next detection cycle
    sensor1Time = 0;
    sensor2Time = 0;
  }
  
  // --- Send Data to Raspberry Pi via Serial ---
  // Format: "CO: <value> | Temp: <value> C | Hum: <value> % | Speed: <value> m/s | Rain (A): <value> | Rain (D): <value>"
  Serial.print("CO: ");
  Serial.print(coLevel);
  Serial.print(" | Temp: ");
  Serial.print(temperature);
  Serial.print(" C | Hum: ");
  Serial.print(humidity);
  Serial.print(" % | Speed: ");
  Serial.print(speed);
  Serial.print(" m/s | Rain (Analog): ");
  Serial.print(rainValue);
  Serial.print(" | Rain (Digital): ");
  Serial.println(rainDigital);
  
  delay(500); // Adjust delay as needed
}