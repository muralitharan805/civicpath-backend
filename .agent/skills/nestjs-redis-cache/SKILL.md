---
name: nestjs-redis-cache
description: Load this skill when the user requires implementation, optimization, pattern configuration, or troubleshooting of Redis caching strategies, connection states, and rate limiting inside a NestJS application.
---

# NestJS Redis Caching, Serialization, and State Management

## Core Objective
To implement, monitor, and optimize highly resilient Redis caching architectures within a NestJS application, ensuring proper cache-aside logic, precise TTL enforcement, memory safety, and structural data serialization.

## Evaluation Checklist / Step-by-Step Execution Loop

1. **Connection Lifecycle & Integration Audit**
   * Inspect the NestJS custom client module configuration (e.g., via `ioredis` or `@nestjs/cache-manager`) to ensure connection variables match dynamic `ConfigService` values.
   * Verify that the Redis client establishes proper error listeners (`client.on('error', ...)`), reconnection backoff strategies, and graceful shutdowns alongside NestJS application termination hooks.
   * Confirm connection pooling or scaling variables (e.g., cluster topologies, password protection, and TLS configuration for production environments) are verified at application startup.

2. **Caching Strategy & Cache-Aside Invalidation Check**
   * Audit methods targeting high-read endpoints to confirm a strict Cache-Aside implementation: check the Redis key -> return data immediately on cache hit -> query database on cache miss -> populate the cache slot with a business-appropriate TTL.
   * Inspect all state-mutating actions (`create`, `update`, `delete`, or bulk operations) to guarantee they include explicit and reliable invalidation of affected cache namespaces or invalidation tags, avoiding stale state reads.
   * Evaluate multi-tenant or multi-entity isolation by ensuring all dynamic Redis keys use strict, descriptive, and delimited structural prefixing patterns (e.g., `tenant:app:user:123:profile`).

3. **Data Serialization, Pipeline, and Memory Efficiency Verification**
   * Ensure object structures are thoroughly serialized using strict, predictable schemas or fast JSON parsing primitives (`JSON.stringify` and `JSON.parse`) before writing to or reading from Redis strings.
   * For batch operations or high-throughput analytics counters, audit that Redis transactions (`MULTI`/`EXEC`) or optimization pipelines (`pipeline`) are applied to minimize round-trip networking overhead.
   * Verify that no unbounded keys or massive result sets are cached without a hard structural TTL boundary, protecting instances against total Redis Out-Of-Memory (OOM) failures.

4. **Resiliency, Fallbacks, and Rate Limiting Architecture**
   * Check that all cache client wrapper executions are isolated inside try/catch wrappers or fallbacks so that if the Redis infrastructure goes offline, the core NestJS API transparently falls back directly to the primary database rather than returning hard application crashes.
   * If Redis is acting as an application rate limiter (e.g., with `@nestjs/throttler`), review the throttler storage configuration to make sure it actively leverages the cluster-safe Redis distribution engine instead of falling back to default in-memory state tracking.

## Constraints & Output Rules

* **Zero Placeholder Code Policy:** Code blocks emitted under this skill must contain no stubbed code patterns, incomplete logic boundaries, or trailing annotations like `// TODO: handle redis failure here`. All files must be structurally syntactically complete.
* **Strict Type Safety Execution:** All values fetched from Redis must undergo explicit runtime or type-safe casting before passing back into NestJS service layers. Avoid the use of implicit type bypasses or wildcards such as `any` or `unknown`.
* **Dynamic Settings Requirement:** Hardcoded connection configurations, secret parameters, database index assignments, and time duration values are strictly forbidden. All variable boundaries must use `ConfigService` mapping.
* **Strict Separation of Isolation Layers:** Caching, key building, and storage invalidation operations must live within dedicated Interceptors, decorators, custom service instances, or robust business repositories. Caching execution paths must not be embedded directly into raw controller endpoints.