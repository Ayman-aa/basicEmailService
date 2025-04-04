#!/bin/bash

# Configuration
INTERVAL=0  # Time between tests in seconds
MAX_RUNS=250   # Number of times to run (0 for infinite)
NOTIFY=false # Set to true to enable notification on failure
LOG_FILE="./email_api_monitor.log"
API_URL="http://localhost:3000/api/email/send"

# Initialize counter
run_count=0

# Create or clear log file
> "$LOG_FILE"

echo "Starting email API monitoring..."
echo "Testing endpoint: $API_URL"
echo "Interval: $INTERVAL seconds"
echo "Press Ctrl+C to stop"
echo "----------------------------------------"

# Function to run the test
run_test() {
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] Running test #$1..."
  
  # Generate a unique identifier for this test
  test_id=$(date +%s)
  
  # Make the API request and capture response
  response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"to\":\"test@example.com\",\"subject\":\"API Test $test_id\",\"body\":\"Testing the email API\",\"mockMode\":true}")
  
  # Extract status code from response
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # Check if status code indicates success (2xx)
  if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
    echo "[$timestamp] ✅ API is UP (Status: $status_code)"
    echo "[$timestamp] Response: $body"
    echo "[$timestamp] ✅ Test #$1 PASSED (Status: $status_code)" >> "$LOG_FILE"
    return 0
  else
    echo "[$timestamp] ❌ API is DOWN (Status: $status_code)"
    echo "[$timestamp] Response: $body"
    echo "[$timestamp] ❌ Test #$1 FAILED (Status: $status_code)" >> "$LOG_FILE"
    
    # Send notification if enabled
    if [ "$NOTIFY" = true ]; then
      # You can add notification commands here (e.g., email, Slack webhook)
      echo "Would send notification here"
    fi
    
    return 1
  fi
}

# Main loop
while true; do
  # Increment counter
  run_count=$((run_count + 1))
  
  # Run the test
  run_test $run_count
  
  # Check if we've reached the maximum number of runs
  if [ $MAX_RUNS -gt 0 ] && [ $run_count -ge $MAX_RUNS ]; then
    echo "Reached maximum number of runs ($MAX_RUNS). Exiting."
    break
  fi
  
  # Wait for the specified interval
  echo "Waiting $INTERVAL seconds until next test..."
  echo "----------------------------------------"
  sleep $INTERVAL
done

echo "Monitoring complete. Results logged to $LOG_FILE"