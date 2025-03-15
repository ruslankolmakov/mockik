// simple ssl server using express

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store for mock definitions
const mockDefinitions = new Map();

// Helper function to check if headers match
const headersMatch = (requestHeaders, mockHeaders) => {
    if (!mockHeaders) return true;
    
    for (const [key, value] of Object.entries(mockHeaders)) {
        const headerValue = requestHeaders[key.toLowerCase()];
        if (!headerValue || headerValue !== value) {
            return false;
        }
    }
    
    return true;
};

// Helper function to generate a key for the mock definition
const generateMockKey = (mock) => {
    let key = `${mock.request.method}_${mock.request.url}`;
    
    // If headers are defined, include them in the key
    if (mock.request.headers) {
        key += `_${JSON.stringify(mock.request.headers)}`;
    }
    
    return key;
};

// Load mock mappings from files in the 'mappings' directory
const mappingsFolder = path.join(__dirname, 'mappings');
if (fs.existsSync(mappingsFolder)) {
    fs.readdirSync(mappingsFolder).forEach(file => {
        if (file.endsWith('.json')) {
            try {
                const content = fs.readFileSync(path.join(mappingsFolder, file));
                const mapping = JSON.parse(content);
                const key = generateMockKey(mapping);
                mockDefinitions.set(key, mapping);
                console.log(`Loaded mock from file: ${file}`);
            } catch (err) {
                console.error(`Failed to load mock file ${file}: ${err}`);
            }
        }
    });
}

// Endpoint to register new mock definitions
app.post('/__new/', (req, res) => {
    const mock = req.body;
    const key = generateMockKey(mock);
    mockDefinitions.set(key, mock);
    res.status(201).json({ status: 'Mock created' });
});

// Dynamic request handling based on mock definitions
app.all('*', (req, res) => {
    // Find a matching mock definition
    let matchingMock = null;
    
    // First try to find an exact match with headers
    for (const [key, mock] of mockDefinitions.entries()) {
        const methodMatches = mock.request.method === req.method;
        const urlMatches = mock.request.url === req.path;
        
        if (methodMatches && urlMatches) {
            // If the mock has headers defined, check if they match
            if (mock.request.headers) {
                if (headersMatch(req.headers, mock.request.headers)) {
                    matchingMock = mock;
                    break;
                }
            } else {
                // If no headers defined in the mock, it's a match
                matchingMock = mock;
                break;
            }
        }
    }
    
    if (!matchingMock) {
        return res.status(404).json({
            error: 'No matching mock definition found',
            request: { 
                method: req.method, 
                path: req.path,
                headers: req.headers
            }
        });
    }

    // Apply response from mock definition
    const response = matchingMock.response;
    res.status(response.status || 200)
        .set(response.headers || {})
        .send(response.body);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Only start the server if this file is run directly
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, '0.0.0.0', () => {
        console.log(`Mock server running on port ${port}`);
    });
}

// Export for testing
module.exports = { app, mockDefinitions, headersMatch };