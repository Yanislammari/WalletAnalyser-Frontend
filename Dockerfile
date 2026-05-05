FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_BACKEND_BASE_URL
ARG VITE_GOOGLE_OAUTH_CLIENT_ID
ARG VITE_APPINSIGHTS_CONNECTION_STRING
ARG VITE_LOGODEV_API_KEY

ENV VITE_BACKEND_BASE_URL=$VITE_BACKEND_BASE_URL
ENV VITE_GOOGLE_OAUTH_CLIENT_ID=$VITE_GOOGLE_OAUTH_CLIENT_ID
ENV VITE_APPINSIGHTS_CONNECTION_STRING=$VITE_APPINSIGHTS_CONNECTION_STRING
ENV VITE_LOGODEV_API_KEY=$VITE_LOGODEV_API_KEY

COPY package.json package-lock.json ./
RUN npm ci --production=false

COPY . .

RUN npm run build

FROM nginx:1.27-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
