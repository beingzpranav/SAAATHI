FROM node:20-alpine AS builder

WORKDIR /app

# Copy root manifests and package manifests
COPY package*.json ./
COPY tsconfig*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm ci

# Copy sources
COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

# Build shared and web
RUN npm run build --workspace=@saathi/shared
RUN npm run build --workspace=@saathi/web

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 3000

# Nginx port 3000 config
RUN sed -i 's/80/3000/g' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
