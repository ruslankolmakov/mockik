#!/bin/bash

# Kill any existing node processes
pkill -f "node server.js" || true

# Start the server on port 3002
echo "Starting Mockik server on port 3002..."
PORT=3002 node server.js &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 3

# Update the curl tests to use port 3002
sed -i '' 's/BASE_URL="http:\/\/localhost:[0-9]*"/BASE_URL="http:\/\/localhost:3002"/' curl-tests.sh

# Run the curl tests
echo "Running curl tests..."
./curl-tests.sh

# Kill the server
echo "Stopping server..."
kill $SERVER_PID

echo "Done!" 