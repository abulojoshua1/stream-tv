# Stage 1: Build the React app
FROM node:20-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and package-lock.json files (or pnpm-lock.yaml if using pnpm)
COPY package.json ./

# If you're using pnpm, uncomment the line below
COPY pnpm-lock.yaml ./

# Install the dependencies using pnpm
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN pnpm run build

# Stage 2: Serve the React app with Nginx
FROM nginx:alpine

# Install ffmpeg, nodejs, npm so we can run pm2 + ffmpeg
RUN apk add --no-cache ffmpeg nodejs npm

# Install pm2 globally
RUN npm install -g pm2

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/

# Copy only the build output to the Nginx HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Create HLS directory inside nginx html
RUN mkdir -p /usr/share/nginx/html/hls

# Point HLS_DIR env var to nginx html hls dir
ENV HLS_DIR=/usr/share/nginx/html/hls

# Copy PM2 ecosystem for ffmpeg
WORKDIR /app
COPY ecosystem.config.cjs ./ecosystem.config.cjs

# Entrypoint to run pm2 (ffmpeg) + nginx
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 80 to the outside world
EXPOSE 80

# Command to run Nginx
CMD ["/entrypoint.sh"]