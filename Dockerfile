# ---------------------------------------------------------
# Stage 1: Build the React app
# ---------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN pnpm run build


# ---------------------------------------------------------
# Stage 2: Nginx + FFmpeg Streaming Server
# ---------------------------------------------------------
FROM nginx:alpine

# Install ffmpeg
RUN apk add --no-cache ffmpeg bash

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy optimized Nginx config (uses all CPU cores automatically)
COPY nginx.conf /etc/nginx/nginx.conf

# Copy React build
COPY --from=build /app/dist /usr/share/nginx/html

# HLS output directory
RUN mkdir -p /usr/share/nginx/html/hls

ENV HLS_DIR=/usr/share/nginx/html/hls

# Video/audio ENV (can be overridden in docker-compose)
ENV VIDEO_DEVICE=/dev/video2
ENV PULSE_SOURCE=default
ENV VIDEO_WIDTH=1920
ENV VIDEO_HEIGHT=1080
ENV FRAMERATE=30
ENV VIDEO_BITRATE=4000k
ENV AUDIO_BITRATE=128k

# FFmpeg CPU threads — very important
# "0" = auto max CPU usage
ENV FFMPEG_THREADS=0

WORKDIR /app

# Entrypoint to start nginx + ffmpeg
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]
