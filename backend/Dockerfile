#backend/Dockerfile
# Use Node.js base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for the backend
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install

# Copy the rest of the backend code
COPY backend/ .

# Expose the port for the Express app
EXPOSE 3001

# Set the default command to start the backend app
CMD ["npm", "start"]
