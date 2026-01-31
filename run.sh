#!/usr/bin/with-contenv bashio
# Home Assistant Add-on startup script

# Read add-on options
APPDAEMON_APPS_PATH=$(bashio::config 'appdaemon_apps_path')

# Export environment variables for the Node.js app
export SUPERVISOR_TOKEN="${SUPERVISOR_TOKEN}"
export APPDAEMON_APPS_PATH="${APPDAEMON_APPS_PATH}"
export ADDON_MODE="true"
export NODE_ENV="production"
export PORT="8099"

# Log startup
bashio::log.info "Starting AppDaemon Blueprint Configurator..."
bashio::log.info "AppDaemon apps path: ${APPDAEMON_APPS_PATH}"

# Change to app directory
cd /app

# Start the Node.js server (handles both API and static files)
bashio::log.info "Starting server on port ${PORT}..."
exec node dist/index.js
