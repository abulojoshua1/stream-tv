#!/bin/sh
set -e

# Ensure HLS dir exists
mkdir -p "$HLS_DIR"

echo "[entrypoint] HLS_DIR = $HLS_DIR"

# Start ffmpeg via PM2 using your ecosystem file
# FFMPEG-HLS-STREAM is the app name from ecosystem.config.js
pm2 start /app/ecosystem.config.js --only FFMPEG-HLS-STREAM

# Optional: show pm2 status in logs
pm2 list

# Start nginx in foreground (PID 1)
exec nginx -g "daemon off;"
