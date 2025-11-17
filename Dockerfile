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

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/

# Copy only the build output to the Nginx HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]