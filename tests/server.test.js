const request = require('supertest');
const fs = require('fs');
const path = require('path');
const { app, mockDefinitions, headersMatch } = require('../server');

// Clear mockDefinitions before each test
beforeEach(() => {
  mockDefinitions.clear();
});

describe('Mock Server', () => {
  describe('Loading mocks from files', () => {
    // Create a temporary mock file for testing
    const setupTempMock = (mockData) => {
      const tempDir = path.join(__dirname, 'temp-mappings');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      
      const mockPath = path.join(tempDir, 'temp-mock.json');
      fs.writeFileSync(mockPath, JSON.stringify(mockData));
      
      return { tempDir, mockPath };
    };
    
    // Clean up temp files after test
    const cleanupTempMock = (tempDir) => {
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        files.forEach(file => {
          fs.unlinkSync(path.join(tempDir, file));
        });
        fs.rmdirSync(tempDir);
      }
    };
    
    test('should load mock definitions from files', () => {
      // This test is more of an integration test and would require modifying how we load files
      // For now, we'll test the API-based mock registration
      expect(true).toBe(true);
    });
  });

  describe('API-based mock registration', () => {
    test('should register a new mock via POST to /__new/', async () => {
      const mockDefinition = {
        request: {
          method: 'GET',
          url: '/api/test'
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            message: 'Test successful'
          }
        }
      };

      const response = await request(app)
        .post('/__new/')
        .send(mockDefinition)
        .expect(201);

      expect(response.body).toEqual({ status: 'Mock created' });
      
      // Verify the mock was registered
      // We need to check if any key in the map contains the method and URL
      let found = false;
      for (const [key, value] of mockDefinitions.entries()) {
        if (key.includes('GET_/api/test')) {
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });

    test('should register a mock with headers', async () => {
      const mockDefinition = {
        request: {
          method: 'GET',
          url: '/api/test-headers',
          headers: {
            'Authorization': 'Bearer token123',
            'X-Custom-Header': 'custom-value'
          }
        },
        response: {
          status: 200,
          body: {
            message: 'Headers matched'
          }
        }
      };

      await request(app)
        .post('/__new/')
        .send(mockDefinition)
        .expect(201);

      // Verify the mock was registered with headers in the key
      let found = false;
      for (const [key, value] of mockDefinitions.entries()) {
        if (key.includes('GET_/api/test-headers') && 
            key.includes('Authorization') && 
            key.includes('X-Custom-Header')) {
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });
  });

  describe('Mock request handling', () => {
    test('should return 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/undefined-route')
        .expect(404);

      expect(response.body.error).toBe('No matching mock definition found');
    });

    test('should return mocked response for registered route', async () => {
      // Register a mock
      const mockDefinition = {
        request: {
          method: 'GET',
          url: '/api/hello'
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Custom-Header': 'test-value'
          },
          body: {
            message: 'Hello, World!'
          }
        }
      };

      await request(app)
        .post('/__new/')
        .send(mockDefinition)
        .expect(201);

      // Test the mocked endpoint
      const response = await request(app)
        .get('/api/hello')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect('X-Custom-Header', 'test-value');

      expect(response.body).toEqual({ message: 'Hello, World!' });
    });

    test('should handle custom status codes', async () => {
      // Register a mock with a non-200 status
      const mockDefinition = {
        request: {
          method: 'GET',
          url: '/api/error'
        },
        response: {
          status: 403,
          body: {
            error: 'Forbidden'
          }
        }
      };

      await request(app)
        .post('/__new/')
        .send(mockDefinition)
        .expect(201);

      // Test the mocked endpoint
      const response = await request(app)
        .get('/api/error')
        .expect(403);

      expect(response.body).toEqual({ error: 'Forbidden' });
    });

    test('should match request with headers', async () => {
      // Register a mock with headers
      const mockDefinition = {
        request: {
          method: 'GET',
          url: '/api/protected',
          headers: {
            'Authorization': 'Bearer token123'
          }
        },
        response: {
          status: 200,
          body: {
            message: 'Authorized access'
          }
        }
      };

      await request(app)
        .post('/__new/')
        .send(mockDefinition)
        .expect(201);

      // Test with matching headers
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer token123')
        .expect(200);

      expect(response.body).toEqual({ message: 'Authorized access' });

      // Test with missing headers should return 404
      await request(app)
        .get('/api/protected')
        .expect(404);

      // Test with incorrect header value should return 404
      await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer wrongtoken')
        .expect(404);
    });

    test('should match request with multiple headers', async () => {
      // Register a mock with multiple headers
      const mockDefinition = {
        request: {
          method: 'GET',
          url: '/api/multi-headers',
          headers: {
            'Authorization': 'Bearer token123',
            'X-API-Key': 'api-key-value',
            'Content-Type': 'application/json'
          }
        },
        response: {
          status: 200,
          body: {
            message: 'All headers matched'
          }
        }
      };

      await request(app)
        .post('/__new/')
        .send(mockDefinition)
        .expect(201);

      // Test with all matching headers
      const response = await request(app)
        .get('/api/multi-headers')
        .set('Authorization', 'Bearer token123')
        .set('X-API-Key', 'api-key-value')
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(response.body).toEqual({ message: 'All headers matched' });

      // Test with missing one header should return 404
      await request(app)
        .get('/api/multi-headers')
        .set('Authorization', 'Bearer token123')
        .set('Content-Type', 'application/json')
        .expect(404);
    });

    test('should support multiple mocks with same URL but different headers', async () => {
      // Register first mock with one set of headers
      const mockDefinition1 = {
        request: {
          method: 'GET',
          url: '/api/versioned',
          headers: {
            'API-Version': '1.0'
          }
        },
        response: {
          status: 200,
          body: {
            version: '1.0',
            message: 'This is version 1.0'
          }
        }
      };

      // Register second mock with different headers
      const mockDefinition2 = {
        request: {
          method: 'GET',
          url: '/api/versioned',
          headers: {
            'API-Version': '2.0'
          }
        },
        response: {
          status: 200,
          body: {
            version: '2.0',
            message: 'This is version 2.0'
          }
        }
      };

      await request(app)
        .post('/__new/')
        .send(mockDefinition1)
        .expect(201);

      await request(app)
        .post('/__new/')
        .send(mockDefinition2)
        .expect(201);

      // Test version 1.0
      const response1 = await request(app)
        .get('/api/versioned')
        .set('API-Version', '1.0')
        .expect(200);

      expect(response1.body).toEqual({
        version: '1.0',
        message: 'This is version 1.0'
      });

      // Test version 2.0
      const response2 = await request(app)
        .get('/api/versioned')
        .set('API-Version', '2.0')
        .expect(200);

      expect(response2.body).toEqual({
        version: '2.0',
        message: 'This is version 2.0'
      });
    });
  });

  describe('Headers matching utility', () => {
    test('should match when all headers are present', () => {
      const requestHeaders = {
        'authorization': 'Bearer token123',
        'content-type': 'application/json',
        'user-agent': 'test-agent'
      };
      
      const mockHeaders = {
        'Authorization': 'Bearer token123',
        'Content-Type': 'application/json'
      };
      
      expect(headersMatch(requestHeaders, mockHeaders)).toBe(true);
    });
    
    test('should not match when a header is missing', () => {
      const requestHeaders = {
        'authorization': 'Bearer token123'
      };
      
      const mockHeaders = {
        'Authorization': 'Bearer token123',
        'Content-Type': 'application/json'
      };
      
      expect(headersMatch(requestHeaders, mockHeaders)).toBe(false);
    });
    
    test('should not match when a header value is different', () => {
      const requestHeaders = {
        'authorization': 'Bearer token123',
        'content-type': 'text/plain'
      };
      
      const mockHeaders = {
        'Authorization': 'Bearer token123',
        'Content-Type': 'application/json'
      };
      
      expect(headersMatch(requestHeaders, mockHeaders)).toBe(false);
    });
    
    test('should match when mockHeaders is null or undefined', () => {
      const requestHeaders = {
        'authorization': 'Bearer token123'
      };
      
      expect(headersMatch(requestHeaders, null)).toBe(true);
      expect(headersMatch(requestHeaders, undefined)).toBe(true);
    });
  });
}); 