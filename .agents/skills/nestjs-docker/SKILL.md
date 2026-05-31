---
name: nestjs-docker-configuration
description: Load this skill when the user needs to configure, debug, containerize, or optimize a NestJS application using Docker, Dockerfile, and multi-environment Docker Compose workflows.
---

# NestJS Docker Configuration & Containerization

## Core Objective
This skill ensures the NestJS application is containerized following production-grade best practices, utilizing multi-stage builds for minimal image size, and setting up a flexible, multi-environment (`development`, `override`, `production`) orchestration using Docker Compose.

---

## Evaluation Checklist / Step-by-Step Execution Loop

1. **Analyze Project Structure & Dependencies:**
   * Verify the presence of `package.json`, `@nestjs/cli`, and package managers (`npm`, `yarn`, or `pnpm`).
   * Check if the application uses native modules or requires specific OS-level dependencies during compilation.
   * Identify required backing services (e.g., PostgreSQL, MongoDB, Redis) from environmental variables or module imports.

2. **Validate & Optimize Dockerfile:**
   * Enforce a **multi-stage build** pipeline to isolate development tools from the final production runtime.
   * **Stage 1 (Development/Build):** Install full dependencies, copy source code, and execute `npm run build` or `yarn build`.
   * **Stage 2 (Production Runtime):** Use a lightweight base image (e.g., `node:alpine`), copy *only* compiled `dist/` files, `package.json`, and install production-only dependencies (`npm prune --production`).
   * Ensure the application does not run as the root user by incorporating `USER node`.

3. **Validate & Sync Docker Compose Configurations:**
   * **`docker-compose.yml` (Base):** Define the baseline configuration, core services, volumes, shared networks, and common environment variable keys.
   * **`docker-compose.override.yml` (Local Development):** Map local source volumes for live-reloading (`npm run start:dev`), expose debugging ports (e.g., `9229`), and inject local environment secrets.
   * **`docker-compose.prod.yml` (Production):** Strip local host mounts, enforce restart policies (`unless-stopped`), lock down security profiles, and link to production-grade network configurations.

4. **Verify Networking and Volume Bindings:**
   * Ensure internal NestJS application ports (default: `3000`) match the internal target ports mapped in the Compose files.
   * Check that named volumes are configured for database persistence so data is not lost on container restarts.

---

## Constraints & Output Rules

* **Minimal Layer Footprint:** Every Dockerfile generated must leverage layer caching effectively by copying `package.json` and lockfiles *before* copying the rest of the application source code.
* **Security Constraints:** **NEVER** hardcode sensitive production secrets, API keys, or database credentials directly into the Dockerfile or Docker Compose templates; always reference them via variable substitution (e.g., `${DATABASE_PASSWORD}`).
* **Process Signal Handling:** Ensure the application correctly handles lifecycle signals (`SIGTERM`, `SIGINT`) by utilizing standard entrypoints (e.g., executing `node dist/main` instead of wrapping it in un-optimized shell scripts).
* **Isolation Enforcements:** The final production container stage must strictly contain zero development `devDependencies` and must explicitly use a non-root user execution context.