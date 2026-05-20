---
name: nestjs-prisma-orm
description: Load this skill when the user requires creating, configuring, optimizing, or troubleshooting data models, queries, and migrations using Prisma ORM inside a NestJS application.
---

# NestJS Prisma ORM Data Engineering and Query Optimization

## Core Objective
To architect, implement, and maintain a highly efficient, type-safe database access layer using Prisma ORM within a NestJS framework, ensuring optimal relational modeling, strict schema validation, and high-performance database queries.

## Evaluation Checklist / Step-by-Step Execution Loop

1. **Schema Validation & Relational Modeling Architecture**
   * Inspect the `schema.prisma` file to ensure database constraints match requested business logic (e.g., `@unique`, `@default(uuid())`, or custom precision decimals).
   * Verify that composite IDs or composite unique indexes (`@@id`, `@@unique`) are implemented correctly for multi-column identifiers.
   * Review relation names and explicit reference mappings (`@relation(fields: [...], references: [...])`) to avoid implicit naming collision or broken foreign key constraints.
   * Ensure performance-critical search fields are backed by explicit database indexes using the `@index` attribute.

2. **NestJS Integration & Service Lifecycle Management**
   * Confirm that the custom `PrismaService` extends `PrismaClient` and correctly implements the `OnModuleInit` lifecycle hook to handle connection boot-up.
   * Ensure that the global application configuration handles the soft-shutdown hooks or database disconnection properly when the NestJS application terminates.
   * Verify that the database connection string (`DATABASE_URL`) is parsed securely via NestJS `ConfigService` or verified at boot time.

3. **Query Optimization & Efficiency Checks**
   * Audit all database interactions for the $N+1$ query problem; enforce the use of `include` or nested `select` blocks to fetch related records in a single query batch.
   * Check that high-volume listing endpoints enforce database-level pagination, evaluating whether to use offset-based (`skip`, `take`) or cursor-based pagination depending on scale requirements.
   * Validate that write operations utilize Prisma's transaction API (`$transaction`) when executing multiple updates or batch operations that must adhere to strict ACID compliance.
   * Ensure raw queries (`$queryRaw` or `$executeRaw`) are only recommended when native Prisma methods fail to optimize the query plan, checking that inputs are properly parameterized to eliminate SQL injection risks.

4. **Robust Database Exception Handling**
   * Wrap data-access service blocks in try/catch structures that filter and handle explicit error codes thrown by the Prisma Client engine (e.g., catching `P2002` for unique constraint violations).
   * Map Prisma engine error codes directly to native NestJS HTTP Exceptions (`ConflictException`, `NotFoundException`, `InternalServerErrorException`) to prevent raw database system messages from leaking to the API surface.

5. **Use migration when create and update models**

## Constraints & Output Rules

* **Zero Placeholders:** Do not emit boilerplate skeletons with `// TODO:`, `// implement queries here`, or partial class definitions. Every service, module, or DTO file must be fully written and operational out of the box.
* **Strict Type Safety Execution:** Leverage Prisma's auto-generated types (e.g., `Prisma.UserCreateInput`, `UserSelect`) across all service boundaries. Method signatures must explicitly define return signatures (e.g., `Promise<User[]>`) rather than defaulting to `any` or implicit type inference.
* **Strict Separation of Concerns:** Database selection, filtration, and raw query transformations must reside within a NestJS Service layer or dedicated Repository pattern wrapper. Do not run Prisma queries directly inside NestJS Controllers.
* **Database Agnostic Best Practices:** Write code adhering to structural patterns compatible with the target database provider configured in the schema (e.g., using `JsonNull` handling when working with PostgreSQL `jsonb` attributes).