# Stage 1: Build the React app
FROM node:20-alpine AS build

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN pnpm run build

# Stage 2: Serve the React app with Nginx + run ffmpeg
FROM nginx:alpine

# Install ffmpeg only
RUN apk add --no-cache ffmpeg

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Copy built React app
COPY --from=build /app/dist /usr/share/nginx/html

# HLS output directory
RUN mkdir -p /usr/share/nginx/html/hls

# Hardcode HLS_DIR like you wanted
ENV HLS_DIR=/usr/share/nginx/html/hls

# Optional: other envs if you like (or just hardcode in script)
ENV VIDEO_DEVICE=/dev/video2
ENV PULSE_SOURCE=alsa_input.usb-MACROSILICON_USB_Video-02.iec958-stereo
ENV VIDEO_WIDTH=1920
ENV VIDEO_HEIGHT=1080
ENV FRAMERATE=40
ENV VIDEO_BITRATE=6000k
ENV AUDIO_BITRATE=128k

WORKDIR /app

# Entrypoint to start nginx + ffmpeg (no PM2)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]
