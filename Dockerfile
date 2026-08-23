# ==============================================================================
# Multi-Stage Dockerfile for CivicPath Backend (NestJS + Prisma + GIS)
# Enforces strict reliance on pnpm, non-root execution (USER node), and healthchecks
# ==============================================================================

# --- Stage 1: Base Image ---
FROM node:22-alpine AS base

# Allow native build scripts for pnpm 11 non-interactive container builds
ENV PNPM_ALLOW_BUILDS=all

# Install pnpm globally via corepack / npm
RUN npm install -g pnpm@11.1.3

WORKDIR /app

# --- Stage 2: Dependencies ---
# Installs all dependencies (including devDependencies) for compilation & dev runtime
FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts

# --- Stage 3: Build ---
# Generates Prisma Client and compiles TypeScript codebase to JS bundle
FROM dependencies AS build

COPY . .
RUN pnpm prisma:generate
RUN pnpm run build

# --- Stage 4: Production Runner ---
# Lightweight, secure runtime stage containing only production dependencies and assets
FROM base AS runner

ENV NODE_ENV=production

# Install GDAL (ogr2ogr) for GIS data synchronization
RUN apk add --no-cache gdal gdal-tools gdal-driver-pg

WORKDIR /app

# Copy package manifest, pnpm config & Prisma schema
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
COPY prisma ./prisma
COPY scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh

# Install ONLY production dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --ignore-scripts

# Generate Prisma Client for production runtime
RUN npx prisma generate

# Copy compiled JS bundle from build stage
COPY --from=build /app/dist ./dist

# Set ownership to unprivileged node user
RUN chmod +x ./scripts/docker-entrypoint.sh && chown -R node:node /app

# Switch to low-privilege user
USER node

# Default runtime port fallback
ENV PORT=3000

# Expose NestJS application port
EXPOSE ${PORT}

# Native healthcheck directive
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT}/api/v1 || exit 1

# Configure automated migration entrypoint wrapper
ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]

# Default execution command
CMD ["node", "dist/src/main"]
