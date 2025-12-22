# Build the Vite React app
FROM node:22-alpine AS build
ARG VITE_BACKEND_URL=http://localhost:8000
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev || npm install
COPY . .
RUN npm run build

# Serve the built assets with nginx
FROM nginx:1.26-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
