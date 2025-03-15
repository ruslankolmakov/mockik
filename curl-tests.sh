#!/bin/bash

# Mockik Curl Tests
# This script tests the functionality of the Mockik server using curl commands

# Set the base URL
BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ $2${NC}"
  else
    echo -e "${RED}✗ $2${NC}"
    echo -e "${RED}  Error: $3${NC}"
  fi
}

echo -e "${YELLOW}Starting Mockik curl tests...${NC}"
echo -e "${YELLOW}==========================${NC}"

# Test 1: Register a new mock for GET /api/users
echo -e "\n${YELLOW}Test 1: Register a new mock for GET /api/users${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/__new/" \
  -H "Content-Type: application/json" \
  -d '{
    "request": {
      "method": "GET",
      "url": "/api/users"
    },
    "response": {
      "status": 200,
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "users": [
          {"id": 1, "name": "John Doe"},
          {"id": 2, "name": "Jane Smith"}
        ]
      }
    }
  }')

STATUS_CODE=$(echo "$RESPONSE" | grep -o '"status":"Mock created"')
if [[ "$STATUS_CODE" == '"status":"Mock created"' ]]; then
  print_result 0 "Successfully registered mock for GET /api/users"
else
  print_result 1 "Failed to register mock for GET /api/users" "$RESPONSE"
fi

# Test 2: Test the registered mock for GET /api/users
echo -e "\n${YELLOW}Test 2: Test the registered mock for GET /api/users${NC}"
RESPONSE=$(curl -s "$BASE_URL/api/users")
EXPECTED='"users":[{"id":1,"name":"John Doe"},{"id":2,"name":"Jane Smith"}]'

if [[ "$RESPONSE" == *"$EXPECTED"* ]]; then
  print_result 0 "Successfully retrieved mock response for GET /api/users"
else
  print_result 1 "Failed to retrieve mock response for GET /api/users" "$RESPONSE"
fi

# Test 3: Register a mock with custom status code
echo -e "\n${YELLOW}Test 3: Register a mock with custom status code${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/__new/" \
  -H "Content-Type: application/json" \
  -d '{
    "request": {
      "method": "GET",
      "url": "/api/not-found"
    },
    "response": {
      "status": 404,
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "error": "Resource not found",
        "code": "NOT_FOUND"
      }
    }
  }')

STATUS_CODE=$(echo "$RESPONSE" | grep -o '"status":"Mock created"')
if [[ "$STATUS_CODE" == '"status":"Mock created"' ]]; then
  print_result 0 "Successfully registered mock with custom status code"
else
  print_result 1 "Failed to register mock with custom status code" "$RESPONSE"
fi

# Test 4: Test the mock with custom status code
echo -e "\n${YELLOW}Test 4: Test the mock with custom status code${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/not-found")
RESPONSE=$(curl -s "$BASE_URL/api/not-found")
EXPECTED='"error":"Resource not found"'

if [[ "$HTTP_CODE" == "404" && "$RESPONSE" == *"$EXPECTED"* ]]; then
  print_result 0 "Successfully received 404 status code and error message"
else
  print_result 1 "Failed to receive correct status code or error message" "HTTP Code: $HTTP_CODE, Response: $RESPONSE"
fi

# Test 5: Register a mock with custom headers
echo -e "\n${YELLOW}Test 5: Register a mock with custom headers${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/__new/" \
  -H "Content-Type: application/json" \
  -d '{
    "request": {
      "method": "GET",
      "url": "/api/custom-headers"
    },
    "response": {
      "status": 200,
      "headers": {
        "Content-Type": "application/json",
        "X-Custom-Header": "custom-value",
        "X-Rate-Limit": "100"
      },
      "body": {
        "message": "Response with custom headers"
      }
    }
  }')

STATUS_CODE=$(echo "$RESPONSE" | grep -o '"status":"Mock created"')
if [[ "$STATUS_CODE" == '"status":"Mock created"' ]]; then
  print_result 0 "Successfully registered mock with custom headers"
else
  print_result 1 "Failed to register mock with custom headers" "$RESPONSE"
fi

# Test 6: Test the mock with custom headers
echo -e "\n${YELLOW}Test 6: Test the mock with custom headers${NC}"
HEADERS=$(curl -s -I "$BASE_URL/api/custom-headers")
RESPONSE=$(curl -s "$BASE_URL/api/custom-headers")
EXPECTED='"message":"Response with custom headers"'

if [[ "$HEADERS" == *"X-Custom-Header: custom-value"* && "$HEADERS" == *"X-Rate-Limit: 100"* && "$RESPONSE" == *"$EXPECTED"* ]]; then
  print_result 0 "Successfully received response with custom headers"
else
  print_result 1 "Failed to receive response with correct custom headers" "Headers: $HEADERS, Response: $RESPONSE"
fi

# Test 7: Test non-existent endpoint
echo -e "\n${YELLOW}Test 7: Test non-existent endpoint${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/non-existent")
RESPONSE=$(curl -s "$BASE_URL/api/non-existent")
EXPECTED='"error":"No matching mock definition found"'

if [[ "$HTTP_CODE" == "404" && "$RESPONSE" == *"$EXPECTED"* ]]; then
  print_result 0 "Successfully received 404 for non-existent endpoint"
else
  print_result 1 "Failed to receive 404 for non-existent endpoint" "HTTP Code: $HTTP_CODE, Response: $RESPONSE"
fi

# Test 8: Register a POST endpoint
echo -e "\n${YELLOW}Test 8: Register a POST endpoint${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/__new/" \
  -H "Content-Type: application/json" \
  -d '{
    "request": {
      "method": "POST",
      "url": "/api/submit"
    },
    "response": {
      "status": 201,
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "message": "Data submitted successfully",
        "id": "12345"
      }
    }
  }')

STATUS_CODE=$(echo "$RESPONSE" | grep -o '"status":"Mock created"')
if [[ "$STATUS_CODE" == '"status":"Mock created"' ]]; then
  print_result 0 "Successfully registered POST endpoint"
else
  print_result 1 "Failed to register POST endpoint" "$RESPONSE"
fi

# Test 9: Test the POST endpoint
echo -e "\n${YELLOW}Test 9: Test the POST endpoint${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/submit" -H "Content-Type: application/json" -d '{"name":"Test User"}')
RESPONSE=$(curl -s -X POST "$BASE_URL/api/submit" -H "Content-Type: application/json" -d '{"name":"Test User"}')
EXPECTED='"message":"Data submitted successfully"'

if [[ "$HTTP_CODE" == "201" && "$RESPONSE" == *"$EXPECTED"* ]]; then
  print_result 0 "Successfully tested POST endpoint"
else
  print_result 1 "Failed to test POST endpoint" "HTTP Code: $HTTP_CODE, Response: $RESPONSE"
fi

echo -e "\n${YELLOW}Tests completed!${NC}" 