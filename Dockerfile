# Build Stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production-only dependencies to minimize size and vulnerabilities
RUN npm ci --only=production

# Production Stage
FROM node:20-alpine

# Set to production environment
ENV NODE_ENV=production
ENV PORT=8080

# Set working directory
WORKDIR /app

# Copy the strictly necessary production dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# Copy the application source code
COPY src ./src

# Expose the designated port for Cloud Run
EXPOSE 8080

# Configure the CMD runner to boot up the server cleanly
CMD ["npm", "start"]
