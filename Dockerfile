# Home Assistant Add-on Dockerfile
# Uses multi-stage build for efficient image size

ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:3.18

# Build stage - Frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY artifacts/frontend/package*.json ./
RUN npm ci
COPY artifacts/frontend/ ./
RUN npm run build

# Build stage - Backend
FROM node:22-alpine AS backend-build
WORKDIR /app/backend
COPY artifacts/backend/package*.json ./
RUN npm ci
COPY artifacts/backend/ ./
RUN npm run build
RUN npm ci --omit=dev

# Final image based on Home Assistant base image
FROM $BUILD_FROM

# Install Node.js runtime
RUN apk add --no-cache nodejs npm

# Copy built application
WORKDIR /app
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY --from=backend-build /app/backend/package.json ./

# Copy built frontend to public directory (served by backend)
COPY --from=frontend-build /app/frontend/dist ./public

# Copy run script
COPY run.sh /run.sh
RUN chmod a+x /run.sh

# Set environment
ENV NODE_ENV=production
ENV PORT=8099

CMD [ "/run.sh" ]
