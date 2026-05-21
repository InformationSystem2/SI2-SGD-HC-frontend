# Stage 1: Build the Angular application
FROM node:22-alpine AS builder
WORKDIR /app

# Cache and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the project for production
RUN npm run build -- --configuration=production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the Nginx configuration template (Railway injects $PORT)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy the built application from the builder stage
COPY --from=builder /app/dist/sgd-hc-front/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
