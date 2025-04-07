# Build stage
FROM node:19-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the app and build
COPY . .
RUN npm run build

RUN REACT_APP_API_URL=https://amcart-backend.c-418bb73.kyma.ondemand.com/api REACT_APP_ENV=production npm run build

# Production stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy the built app from the build stage
COPY --from=build /app/build .

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]