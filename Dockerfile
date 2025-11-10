# Stage 1: Build the application
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application. This will use the NestJS CLI to compile TypeScript to JavaScript.
RUN npm run build

# Stage 2: Setup Production Environment
FROM node:20-alpine AS production

# Some native Node.js modules may require this on Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the built application from the 'build' stage
COPY --from=build /usr/src/app/dist ./dist

# Expose the port the app runs on (default for NestJS is 3000)
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]