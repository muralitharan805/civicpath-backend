---
name: nestjs-redis-integration
description: This skill should be loaded when the user wants to integrate Redis with NestJS for caching, session storage, rate limiting, or pub/sub messaging architectures using ioredis or cache-manager.
---

# NestJS Redis Integration & Architectural Setup

## Core Objective
This skill provides a structured, enterprise-grade framework for connecting NestJS applications to a Redis instance. It focuses on setting up a custom, globally accessible Redis module, implementing type-safe configurations, managing connection health, and executing common design patterns like caching, queueing (BullMQ), and Pub/Sub.

## Evaluation Checklist / Step-by-Step Execution Loop

1. **Architecture & Dependency Assessment**
   * Identify the integration goal: Global Caching (`@nestjs/cache-manager`), direct client access (`ioredis`), distributed locks, or background queues (`@nestjs/bullmq`).
   * Verify the choice of underlying driver package (prefer `ioredis` for raw client access due to performance and cluster features).
   * Ensure environment variables are structured to support Redis connection details (`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`).

2. **Module & Provider Structure**
   * Design a dynamic, configurable `RedisModule` utilizing `ConfigService` for environmental injection.
   * Register a custom provider (e.g., `REDIS_CLIENT`) that creates a singleton instance of the Redis client.
   * Implement lifecycle hooks (`onModuleInit` and `onApplicationShutdown`) to cleanly open and close Redis connections.

3. **Pattern Implementation & Exception Handling**
   * Provide explicit TypeScript abstractions (e.g., custom services or interceptors) for data interaction.
   * Implement connection failure strategies, including explicit retry limits and backoff logic to prevent NestJS thread blocking if Redis drops.
   * Ensure cache invalidation strategies (TTL management, cache-busting keys) are clearly structured in interceptors or decorators.

4. **Health Check Integration**
   * Integrate Redis connectivity verification inside NestJS Terminus (`@nestjs/terminus`) indicators if a health-check system exists in the project.

## Constraints & Output Rules

* **No Hardcoded Configurations:** All connection settings must pass through NestJS `@nestjs/config` services or typed configuration classes.
* **Strict Typing:** All data access layers, payload responses, and service wrappers must utilize strict TypeScript types (`Record<string, any>`, specific interfaces, or generics) instead of `any`.
* **Standard File Structure:** Assume a clean, modular NestJS architecture for all provided code snippets:
  ```text
  src/
  ├── config/
  │   └── redis.config.ts
  └── providers/
      └── redis/
          ├── redis.constants.ts
          ├── redis.module.ts
          ├── redis.provider.ts
          └── redis.service.ts