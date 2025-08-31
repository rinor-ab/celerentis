FROM node:18-alpine

WORKDIR /app

# Install dependencies for build
RUN apk add --no-cache libc6-compat

# Copy package files
COPY apps/web/package*.json ./

# Install dependencies with legacy peer deps and force flag
RUN npm install --legacy-peer-deps --force

# Copy application code
COPY apps/web/ .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
