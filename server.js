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

// Load mock mappings from files in the 'mappings' directory
const mappingsFolder = path.join(__dirname, 'mappings');
if (fs.existsSync(mappingsFolder)) {
    fs.readdirSync(mappingsFolder).forEach(file => {
        if (file.endsWith('.json')) {
            try {
                const content = fs.readFileSync(path.join(mappingsFolder, file));
                const mapping = JSON.parse(content);
                const key = `${mapping.request.method}_${mapping.request.url}`;
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
    const key = `${mock.request.method}_${mock.request.url}`;
    mockDefinitions.set(key, mock);
    res.status(201).json({ status: 'Mock created' });
});

// Dynamic request handling based on mock definitions
app.all('*', (req, res) => {
    const key = `${req.method}_${req.path}`;
    const mock = mockDefinitions.get(key);

    if (!mock) {
        return res.status(404).json({
            error: 'No matching mock definition found',
            request: { method: req.method, path: req.path }
        });
    }

    // Apply response from mock definition
    const response = mock.response;
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
module.exports = { app, mockDefinitions };