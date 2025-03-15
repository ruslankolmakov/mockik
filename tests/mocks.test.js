const fs = require('fs');
const path = require('path');

describe('Mock Definitions', () => {
  const mappingsDir = path.join(__dirname, '..', 'mappings');
  
  test('mappings directory exists', () => {
    expect(fs.existsSync(mappingsDir)).toBe(true);
  });
  
  test('mock files are valid JSON with correct structure', () => {
    const files = fs.readdirSync(mappingsDir);
    expect(files.length).toBeGreaterThan(0);
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const filePath = path.join(mappingsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Should be valid JSON
        let mockDefinition;
        expect(() => {
          mockDefinition = JSON.parse(content);
        }).not.toThrow();
        
        // Should have required structure
        expect(mockDefinition).toHaveProperty('request');
        expect(mockDefinition).toHaveProperty('response');
        expect(mockDefinition.request).toHaveProperty('method');
        expect(mockDefinition.request).toHaveProperty('url');
        expect(mockDefinition.response).toHaveProperty('status');
        
        // Method should be a valid HTTP method
        const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
        expect(validMethods).toContain(mockDefinition.request.method);
        
        // URL should start with a slash
        expect(mockDefinition.request.url.startsWith('/')).toBe(true);
        
        // Status should be a valid HTTP status code
        expect(mockDefinition.response.status).toBeGreaterThanOrEqual(100);
        expect(mockDefinition.response.status).toBeLessThan(600);
      }
    });
  });
  
  test('users.json mock is valid', () => {
    const usersPath = path.join(mappingsDir, 'users.json');
    expect(fs.existsSync(usersPath)).toBe(true);
    
    const content = fs.readFileSync(usersPath, 'utf8');
    const mockDefinition = JSON.parse(content);
    
    expect(mockDefinition.request.method).toBe('GET');
    expect(mockDefinition.request.url).toBe('/api/users');
    expect(mockDefinition.response.status).toBe(200);
    expect(mockDefinition.response.headers['Content-Type']).toBe('application/json');
    expect(mockDefinition.response.body).toHaveProperty('users');
    expect(Array.isArray(mockDefinition.response.body.users)).toBe(true);
  });
  
  test('products.json mock is valid', () => {
    const productsPath = path.join(mappingsDir, 'products.json');
    expect(fs.existsSync(productsPath)).toBe(true);
    
    const content = fs.readFileSync(productsPath, 'utf8');
    const mockDefinition = JSON.parse(content);
    
    expect(mockDefinition.request.method).toBe('GET');
    expect(mockDefinition.request.url).toBe('/api/products');
    expect(mockDefinition.response.status).toBe(200);
    expect(mockDefinition.response.headers['Content-Type']).toBe('application/json');
    expect(mockDefinition.response.headers['Cache-Control']).toBe('max-age=3600');
    expect(mockDefinition.response.body).toHaveProperty('products');
    expect(Array.isArray(mockDefinition.response.body.products)).toBe(true);
  });
}); 