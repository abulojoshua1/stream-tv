#!/bin/sh
set -e

mkdir -p "$HLS_DIR"
echo "[entrypoint] HLS_DIR=$HLS_DIR"

# Start PM2 in docker-friendly foreground mode
pm2-runtime /app/ecosystem.config.cjs --only FFMPEG-HLS-STREAM &

# Start nginx in foreground (PID 1)
exec nginx -g "daemon off;"
