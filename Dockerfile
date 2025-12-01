# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all project files
COPY . .

# Expose the port Vite runs on
EXPOSE 8080

# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


