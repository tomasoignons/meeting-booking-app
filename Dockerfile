# 1. Build stage
FROM node:20-alpine AS builder

WORKDIR /app

ENV TZ=Europe/Zurich
RUN apk add --no-cache tzdata

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Build the Nuxt app
RUN npm run build

# 2. Production stage
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built app from builder
COPY --from=builder /app/.output ./.output
COPY public ./public

RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf && \
    echo "nameserver 8.8.4.4" >> /etc/resolv.conf

# Copy .env file (NOT RECOMMENDED for production) (according to copilot, I don't care)
COPY .env .env

# Expose port (default Nuxt port)
EXPOSE 3000

# Start Nuxt in production
CMD ["node", ".output/server/index.mjs"]