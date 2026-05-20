---
name: nestjs-postgres-database
description: Load this skill when the user requires configuring, managing, optimizing, or troubleshooting native PostgreSQL database engines, schemas, indexing, migrations, or connections within a NestJS application.
---

# NestJS PostgreSQL Database Engineering and Performance Optimization

## Core Objective
To architect, tune, and maintain highly performant, scalable, and resilient PostgreSQL databases integrated within NestJS backend applications, ensuring optimized connection states, reliable migration patterns, and efficient query execution plans.

## Evaluation Checklist / Step-by-Step Execution Loop

1. **Connection Pooling & Infrastructure Tuning**
   * Inspect database connection parameters to verify the setup of optimal connection pool limits (e.g., minimum/maximum connection boundaries) adjusted for the application's runtime scale.
   * Ensure the configuration of appropriate keep-alive mechanisms, connection timeouts, and connection retry backoffs within the database module initialization.
   * Verify that production environment configurations explicitly handle Secure Sockets Layer (SSL) settings and connection pooling architectures cleanly via the NestJS `ConfigService`.

2. **Schema Architecture & Native Data Types Validation**
   * Audit table structures to confirm they exploit native PostgreSQL data optimizations, prioritizing high-efficiency types such as `UUID` for primary identifiers, `JSONB` for unstructured documents, and precise numeric mappings over float declarations.
   * Ensure that the schema design adheres to strict relational normalization standards while selectively evaluating strategic denormalization paths only where high-performance reads require it.
   * Validate that all critical foreign key relationships explicitly define operational cascading policies (e.g., `ON DELETE RESTRICT` or `ON DELETE CASCADE`) to enforce total data integrity.

3. **Query Optimization, Execution Plans & Indexing Architecture**
   * Review data access queries for optimal index usage, confirming that high-traffic search vectors, filtering predicates, and sort paths are backed by corresponding B-Tree, Hash, GIN, or GiST indexes.
   * Examine structural queries to prevent sequential table scans on multi-row tables; leverage PostgreSQL execution logs or analyze metrics (`EXPLAIN ANALYZE`) to optimize query bottlenecks.
   * Verify that structural batch mutations or multi-step operations execute within an isolated database transaction block to guarantee absolute ACID compliance.

4. **Migration Strategy & State Management**
   * Review relational migration files to confirm they maintain a strict deterministic execution order, preserving safe structural state changes without risking data loss on live production schemas.
   * Verify that migrations implement safe schema alterations (e.g., executing structural column modifications with minimal downtime and avoiding blocking table locks).
   * Confirm the existence of robust data seeding strategies or rollback steps to manage testing environments and safe local development replication.

## Constraints & Output Rules

* **Zero Placeholder Code Policy:** Emitted code structures, configurations, or data definitions must contain no structural gaps, omitted attributes, or placeholder syntax boundaries like `// TODO: define indexes here`. All output must be ready for immediate environment execution.
* **Database Agnostic Bypasses Forbidden:** Code boundaries or queries must prioritize native PostgreSQL features and optimizations over generic relational abstraction layers when tuning performance bottlenecks.
* **Dynamic Property Isolation:** Hardcoding physical database credentials, environment target strings, port counts, or pool caps directly within files is strictly prohibited. All parameters must be retrieved through NestJS runtime configuration injectors.
* **Separation of Architectural Layers:** Structural database handling logic, connection pools, and query execution utilities must live strictly within dedicated data layers or module schemas. Database configurations must not leak directly into incoming routing controllers.