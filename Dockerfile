FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Set host and port for Nuxt
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Expose the port
EXPOSE 3000

# Start Nuxt in development mode
CMD ["npm", "run", "dev"] 