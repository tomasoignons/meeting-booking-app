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

# Expose port (default Nuxt port)
EXPOSE 3000

# Start Nuxt in production
CMD ["node", ".output/server/index.mjs"]