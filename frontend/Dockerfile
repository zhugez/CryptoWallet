# Use Node.js base image
FROM node:18-alpine

# Install required system packages
RUN apk add --no-cache \
    xdg-utils \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install -D vite

# Copy rest of the application
COPY . .

# Set NODE_ENV and expose port
ENV NODE_ENV=development
EXPOSE 3000

# Configure Chrome flags for container environment
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Configure Vite
ENV VITE_HOST=0.0.0.0
ENV VITE_PORT=3000

# Start development server with proper network settings
CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0 --port 3000 --strict-port"]