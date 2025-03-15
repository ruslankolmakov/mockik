# Mockik - Simple Mock Server

Mockik is a lightweight mock server for defining API mocks. It allows you to quickly set up mock responses for your frontend development or testing needs.

## Features

- 🔄 Simple and intuitive JSON-based mock definition format
- 📁 Load mock definitions from JSON files
- 🔌 Dynamic mock registration via API
- 🔒 HTTPS support via Nginx in Docker
- 🐳 Docker and Docker Compose support
- ✅ Comprehensive test suite

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Docker and Docker Compose (optional, for containerized deployment)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/mockik.git
   cd mockik
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   Or use the provided shell script:
   ```bash
   ./start.sh dev     # Start in development mode
   ./start.sh docker  # Start using Docker Compose
   ./start.sh test    # Run tests
   ./start.sh coverage # Run tests with coverage
   ```

The server will start on port 3000.

### Using Pre-built Docker Images

Mockik is available as a pre-built Docker image from GitHub Container Registry:

```bash
# Pull the latest version
docker pull ghcr.io/ruslankolmakov/mockik:latest

# Or pull a specific version
docker pull ghcr.io/ruslankolmakov/mockik:v0.0.3
```

Run the container:

```bash
# Run on default port 3000
docker run -p 3000:3000 ghcr.io/ruslankolmakov/mockik:latest

# Or specify a custom port
docker run -p 8080:3000 -e PORT=3000 ghcr.io/ruslankolmakov/mockik:latest
```

Mount your own mock definitions:

```bash
docker run -p 3000:3000 -v $(pwd)/my-mocks:/usr/src/app/mappings ghcr.io/ruslankolmakov/mockik:latest
```

Available tags:
- `latest`: The most recent build from the main branch
- `v0.0.3`, `v0.0.2`, etc.: Specific versions
- `0.0`: Major.minor version

## Using the Mock Server

### Mock Definition Format

Mockik uses a simple JSON format for defining mocks. Each mock definition consists of two main parts:

1. **Request**: Defines the criteria for matching incoming requests
2. **Response**: Defines the response that should be returned when a request matches

Here's the basic structure:

```json
{
  "request": {
    "method": "GET|POST|PUT|DELETE|etc.",
    "url": "/your/api/path"
  },
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json",
      "Custom-Header": "custom-value"
    },
    "body": {
      "any": "valid json",
      "can": "be used here"
    }
  }
}
```

#### Request Properties

- `method` (required): The HTTP method to match (GET, POST, PUT, DELETE, etc.)
- `url` (required): The exact URL path to match (e.g., "/api/users")

#### Response Properties

- `status` (optional): HTTP status code (defaults to 200 if not specified)
- `headers` (optional): HTTP headers to include in the response
- `body` (optional): The response body (can be any valid JSON)

### Creating Mock Definitions

You can create mock definitions in two ways:

#### 1. Using JSON Files

Create a `mappings` directory in the project root and add JSON files with your mock definitions:

```json
{
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
}
```

#### 2. Using the API

You can dynamically register mocks by sending a POST request to `/__new/`:

```bash
curl -X POST http://localhost:3000/__new/ \
  -H "Content-Type: application/json" \
  -d '{
    "request": {
      "method": "GET",
      "url": "/api/products"
    },
    "response": {
      "status": 200,
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "products": [
          {"id": 1, "name": "Product 1", "price": 99.99},
          {"id": 2, "name": "Product 2", "price": 149.99}
        ]
      }
    }
  }'
```

### Testing Your Mocks

Once your mocks are registered, you can test them by making requests to the defined endpoints:

```bash
curl http://localhost:3000/api/users
```

## Docker Deployment

The project includes Docker and Docker Compose configuration for easy deployment with SSL support via Nginx.

### Using Pre-built Images

The easiest way to deploy Mockik is to use the pre-built images from GitHub Container Registry:

```bash
# In your docker-compose.yml
services:
  mockik:
    image: ghcr.io/ruslankolmakov/mockik:latest
    ports:
      - "3000:3000"
    volumes:
      - ./mappings:/usr/src/app/mappings
```

### Building Locally with Docker Compose

If you prefer to build the image locally:

```bash
docker-compose up --build
```

Or use the provided shell script:
```bash
./start.sh docker
```

This will:
1. Build and start the Node.js application
2. Start Nginx as a reverse proxy with SSL termination
3. Expose the service on ports 80 (HTTP) and 443 (HTTPS)

## Testing

The project includes a comprehensive test suite using Jest and Supertest. To run the tests:

```bash
npm test
```

Or use the provided shell script:
```bash
./start.sh test
```

The tests cover:
- Server functionality (API endpoints, mock registration, response handling)
- Docker configuration validation
- Mock definition validation

To run tests with coverage report:

```bash
npm run test:coverage
```

Or use the provided shell script:
```bash
./start.sh coverage
```

### Curl Tests

For manual testing and demonstration purposes, a curl-based test script is included:

```bash
# Make the script executable (if needed)
chmod +x curl-tests.sh

# Run the tests (make sure your server is running on port 3002)
./curl-tests.sh
```

Alternatively, you can use the provided run-tests.sh script which will:
1. Start the server on port 3002
2. Run the curl tests
3. Stop the server when done

```bash
# Make the script executable (if needed)
chmod +x run-tests.sh

# Run the server and tests in one command
./run-tests.sh
```

This script runs a series of curl commands to test:
- Registering mock endpoints
- Testing GET and POST requests
- Custom status codes
- Custom headers
- Error handling

It's a great way to understand how Mockik works and verify its functionality from the command line.

## Advanced Configuration

### SSL Certificates

The Docker setup uses SSL certificates from the `keys` directory. You can replace these with your own certificates:

- `keys/certificate.pem`: Your SSL certificate
- `keys/private-key.pem`: Your private key

### Custom Port

To change the port, modify the `port` variable in `server.js` or set the `PORT` environment variable.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License - see the LICENSE file for details. 