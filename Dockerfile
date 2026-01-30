# Home Assistant Add-on Dockerfile
# Uses multi-stage build for efficient image size

ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:3.18
FROM node:20-alpine AS build-env

# Copy source and install dependencies
WORKDIR /app
COPY package.json package-lock.json ./
COPY app/ ./app/
COPY public/ ./public/
COPY vite.config.ts tsconfig.json react-router.config.ts ./

# Install all dependencies and build
RUN npm ci && npm run build

# Production dependencies only
FROM node:20-alpine AS production-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Final image based on Home Assistant base image
FROM $BUILD_FROM

# Install Node.js runtime
RUN apk add --no-cache nodejs npm

# Copy built application
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build

# Copy run script
COPY run.sh /run.sh
COPY server.js /app/server.js
RUN chmod a+x /run.sh

# Set environment
ENV NODE_ENV=production

CMD [ "/run.sh" ]
