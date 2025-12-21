# Use a lightweight base image
FROM alpine

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy package files first (for efficient caching)
COPY package*.json ./

# Install dependencies (e.g., express and others)
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose application port
EXPOSE 3000

# Start the application
CMD ["node", "src/app.js"]
