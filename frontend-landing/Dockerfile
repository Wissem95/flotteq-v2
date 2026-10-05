# Stage 1: Builder
FROM node:20.11.0-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE
ARG VITE_PUBLIC_URL=https://flotteq.fr
ARG VITE_UMAMI_HOST_URL
ARG VITE_UMAMI_WEBSITE_ID

COPY package*.json ./

RUN npm ci

COPY . .

ENV VITE_API_BASE=$VITE_API_BASE \
    VITE_PUBLIC_URL=$VITE_PUBLIC_URL \
    VITE_UMAMI_HOST_URL=$VITE_UMAMI_HOST_URL \
    VITE_UMAMI_WEBSITE_ID=$VITE_UMAMI_WEBSITE_ID

RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
