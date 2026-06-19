# ================================================
# ECOGENIE - Dockerfile
# Multi-stage build for production deployment
# ================================================

# Stage 1: Build stage (if using build tools in the future)
FROM node:20-alpine AS builder
WORKDIR /app
# For future use with Next.js build
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build

# Stage 2: Production stage - Serve static files with nginx
FROM nginx:1.25-alpine AS production

# Set metadata
LABEL maintainer="EcoGenie Team <team@ecogenie.app>"
LABEL description="EcoGenie - Your Personal Carbon Reduction Assistant"
LABEL version="1.0.0"

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Copy static files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

# Create custom nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Gzip compression \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml; \
    gzip_min_length 1000; \
    \
    # Cache static assets \
    location ~* \.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # SPA fallback \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    add_header Referrer-Policy "strict-origin-when-cross-origin" always; \
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always; \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
