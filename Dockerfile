# =========================================
# Stage 1: Build React frontend (Vite) with pnpm
# =========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm (via corepack) – recommended for Node 22
RUN corepack enable

# Copy manifest + lock first (better layer caching)
COPY package.json pnpm-lock.yaml ./

# Install all deps for build using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the source
COPY . .

# Build Vite app -> dist/
RUN pnpm run build


# =========================================
# Stage 2: Runtime - pm2 + ffmpeg + built React
# =========================================
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache ffmpeg
RUN corepack enable

# Copy manifest + lock and install only prod deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy built frontend from builder stage (dist -> frontend)
COPY --from=builder /app/dist ./frontend

# PM2 config
COPY ecosystem.config.cjs ./ecosystem.config.cjs

# HLS directory where ffmpeg will write (shared with nginx via volume)
RUN mkdir -p /app/frontend/hls && chmod 755 /app/frontend/hls

# Default environment variables
ENV VIDEO_DEVICE=/dev/video2 \
    PULSE_SOURCE=alsa_input.usb-MACROSILICON_USB_Video-02.iec958-stereo \
    VIDEO_WIDTH=1280 \
    VIDEO_HEIGHT=720 \
    FRAMERATE=25 \
    VIDEO_BITRATE=1500k \
    AUDIO_BITRATE=96k \
    HLS_DIR=/app/frontend/hls \
    REDIS_URL=redis://redis:6379/0

# We don't expose HTTP here; nginx serves the files.
# EXPOSE 3000

# Use pm2-runtime from local node_modules
CMD ["npx", "pm2-runtime", "ecosystem.config.cjs"]
