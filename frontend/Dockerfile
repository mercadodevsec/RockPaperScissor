# Use Node.js 20 on Alpine Linux for a small, efficient base image
FROM node:20-alpine

# Install build dependencies for sqlite3
RUN apk add --no-cache python3 make g++

# Set /app as the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker's caching mechanism
COPY package*.json ./

# Install all project dependencies from package.json
RUN npm install

# Copy the rest of the application source code
COPY . .

# Document that the container listens on port 5173
EXPOSE 5173

# Start the Vite dev server bound to all network interfaces on port 5173 (vite defaults to 5173)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]