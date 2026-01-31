#!/usr/bin/with-contenv bashio
# Home Assistant Add-on startup script

# Read add-on options
APPDAEMON_APPS_PATH=$(bashio::config 'appdaemon_apps_path')

# Export environment variables for the Node.js app
export SUPERVISOR_TOKEN="${SUPERVISOR_TOKEN}"
export APPDAEMON_APPS_PATH="${APPDAEMON_APPS_PATH}"
export ADDON_MODE="true"
export NODE_ENV="production"

# Log startup
bashio::log.info "Starting AppDaemon Blueprint Configurator..."
bashio::log.info "AppDaemon apps path: ${APPDAEMON_APPS_PATH}"

# Change to app directory
cd /app

# Start the Node.js server in the background
bashio::log.info "Starting Node.js server on port 3000..."
npm run start &
NODE_PID=$!

# Give Node.js a moment to start
sleep 2

# Start Nginx in the foreground (it handles ingress on port 8099)
bashio::log.info "Starting Nginx reverse proxy on port 8099..."
exec nginx -g "daemon off;"
