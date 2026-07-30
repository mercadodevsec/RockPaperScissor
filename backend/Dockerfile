# Use Node.js 20 on Alpine Linux for a small, efficient base image
FROM node:20-alpine

# Install build tools to compile sqlite3 from source
RUN apk add --no-cache python3 make g++

# Set /app as the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker's caching mechanism
COPY package*.json ./

# Install all project dependencies from package.json
RUN npm install

# Copy the rest of the application source code
COPY . .

# Document that the container listens on port 3000
EXPOSE 3000

# Start the development server when the container runs
CMD ["npm", "run", "dev"]