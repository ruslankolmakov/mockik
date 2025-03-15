FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies (using npm install instead of npm ci)
RUN npm install --production

# Bundle app source
COPY . .

# Create mappings directory if it doesn't exist
RUN mkdir -p mappings

EXPOSE 3000

# Use non-root user for better security
USER node

# Use the PORT environment variable or default to 3000
ENV PORT=3000

CMD ["node", "server.js"] 