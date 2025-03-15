const fs = require('fs');
const path = require('path');

describe('Docker Configuration', () => {
  test('Dockerfile exists and is valid', () => {
    const dockerfilePath = path.join(__dirname, '..', 'Dockerfile');
    expect(fs.existsSync(dockerfilePath)).toBe(true);
    
    const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
    expect(dockerfileContent).toContain('FROM node');
    expect(dockerfileContent).toContain('WORKDIR /app');
    expect(dockerfileContent).toContain('COPY package*.json ./');
    expect(dockerfileContent).toContain('RUN npm install');
    expect(dockerfileContent).toContain('COPY . .');
    expect(dockerfileContent).toContain('EXPOSE');
    expect(dockerfileContent).toContain('CMD ["node", "server.js"]');
  });

  test('docker-compose.yml exists and is valid', () => {
    const dockerComposePath = path.join(__dirname, '..', 'docker-compose.yml');
    expect(fs.existsSync(dockerComposePath)).toBe(true);
    
    const dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf8');
    expect(dockerComposeContent).toContain('services:');
    expect(dockerComposeContent).toContain('app:');
    expect(dockerComposeContent).toContain('nginx:');
    expect(dockerComposeContent).toContain('ports:');
    expect(dockerComposeContent).toContain('volumes:');
  });

  test('nginx.conf exists and is valid', () => {
    const nginxConfPath = path.join(__dirname, '..', 'nginx.conf');
    expect(fs.existsSync(nginxConfPath)).toBe(true);
    
    const nginxConfContent = fs.readFileSync(nginxConfPath, 'utf8');
    expect(nginxConfContent).toContain('upstream nodejs_app');
    expect(nginxConfContent).toContain('server {');
    expect(nginxConfContent).toContain('listen 443 ssl');
    expect(nginxConfContent).toContain('ssl_certificate');
    expect(nginxConfContent).toContain('proxy_pass');
  });
}); 