# ==============================================================================
# Multi-Stage Dockerfile for NestJS Application
# Enforces strict reliance on pnpm for dependency management
# ==============================================================================

# --- Stage 1: Base Image ---
FROM node:20-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# --- Stage 2: Dependencies ---
# Installs all dependencies (including devDependencies) for development & building
FROM base AS dependencies

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# --- Stage 3: Build ---
# Compiles the TypeScript NestJS codebase to a production-ready JS bundle
FROM dependencies AS build

COPY . .
RUN pnpm run build

# --- Stage 4: Production Runner ---
# Lightweight, secure runtime stage containing only production dependencies and assets
FROM base AS runner

ENV NODE_ENV=production

# Install ONLY production dependencies to optimize image size
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Copy the pre-built JavaScript bundle from the build stage
COPY --from=build /app/dist ./dist

# Expose NestJS default application port
EXPOSE 3000

# Start the application in production mode
CMD ["node", "dist/main"]
