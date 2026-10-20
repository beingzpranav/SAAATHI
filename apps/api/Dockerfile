FROM node:20-alpine AS builder

WORKDIR /app

# Copy root manifests and package manifests
COPY package*.json ./
COPY tsconfig*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy sources
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/

# Build shared and api
RUN npm run build --workspace=@saathi/shared
RUN npm run build --workspace=@saathi/api

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install wget for container healthcheck
RUN apk add --no-cache wget

# Copy package manifests for production install
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/

RUN npm ci

# Copy compiled files
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

USER node

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push --skip-generate && node apps/api/dist/server.js"]
