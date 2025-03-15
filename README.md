# Mockik - Simple Mock Server

Mockik is a lightweight mock server that follows the WireMock format for defining API mocks. It allows you to quickly set up mock responses for your frontend development or testing needs.

## Features

- 🔄 WireMock-compatible API format
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

The server will start on port 3000.

## Using the Mock Server

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

You can dynamically register mocks by sending a POST request to `/__admin/mappings`:

```bash
curl -X POST http://localhost:3000/__admin/mappings \
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

### Starting with Docker Compose

```bash
docker-compose up --build
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

The tests cover:
- Server functionality (API endpoints, mock registration, response handling)
- Docker configuration validation
- Mock definition validation

To run tests with coverage report:

```bash
npm test -- --coverage
```

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