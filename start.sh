#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display usage
function show_usage {
  echo -e "${YELLOW}Usage:${NC} ./start.sh [option]"
  echo ""
  echo "Options:"
  echo "  dev       - Start the server in development mode"
  echo "  docker    - Start the server using Docker Compose"
  echo "  test      - Run tests"
  echo "  coverage  - Run tests with coverage report"
  echo ""
  echo "Example: ./start.sh dev"
}

# Check if an argument was provided
if [ $# -eq 0 ]; then
  show_usage
  exit 1
fi

# Process the argument
case "$1" in
  dev)
    echo -e "${GREEN}Starting server in development mode...${NC}"
    npm start
    ;;
  docker)
    echo -e "${GREEN}Starting server using Docker Compose...${NC}"
    docker-compose up --build
    ;;
  test)
    echo -e "${GREEN}Running tests...${NC}"
    npm test
    ;;
  coverage)
    echo -e "${GREEN}Running tests with coverage report...${NC}"
    npm run test:coverage
    ;;
  *)
    echo -e "${YELLOW}Invalid option: $1${NC}"
    show_usage
    exit 1
    ;;
esac 