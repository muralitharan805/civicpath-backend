# CivicPath Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

CivicPath Backend is a high-performance, scalable geospatial backend service built using **NestJS**, **TypeScript**, **PostgreSQL**, **PostGIS**, and **Prisma ORM**. It enables mapping and querying geographic boundaries for parliamentary and assembly constituencies, as well as executing advanced spatial containment and proximity queries.

---

## Key Features

- 🗺️ **GIS Boundary Queries**: Fetch assembly and parliamentary constituencies based on coordinate containment (`ST_Contains`).
- 📍 **Proximity Searches**: Query constituencies and districts near a specific latitude/longitude using fast spatial indexing (`<->` operator).
- ⚡ **Caching Layer**: Integrated Redis caching for frequent coordinate queries.
- 🔄 **Staging-to-Production Sync Pipeline**: Safe ETL pipeline to import shapefiles via `ogr2ogr` into an isolated database schema, preventing migration overrides and database drift.

---

## Project Setup

### 1. Install Dependencies
Make sure you are using **pnpm** as the package manager:
```bash
pnpm install
```

### 2. Environment Configuration
Copy the `.env.example` file to `.env` and fill in your database and Redis credentials:
```bash
cp .env.example .env
```

---

## Database Setup & Migrations

This project utilizes **Prisma ORM** with **PostgreSQL (PostGIS)**.

### Database Schema Separation (Multi-Schema Setup)

This project uses PostgreSQL multi-schema capabilities via Prisma's `multiSchema` preview feature:
- **`public`**: Contains general public tables and schemas (e.g., standard spatial reference system tables).
- **`core`**: Contains all primary spatial constituency and GIS data tables (`assembly_constituencies`, `districts`, `parliment_constituencies`).

#### How to use Multi-Schema Queries:

1. **Standard Prisma Client Queries:**
   Prisma compiles them using schema metadata mapping from `schema.prisma` automatically:
   ```typescript
   this.prisma.assembly_constituencies.count() // Automatically targets core.assembly_constituencies
   ```

2. **Raw Spatial SQL Queries (`$queryRaw`):**
   Raw queries bypass standard Prisma Client metadata compilation. Therefore, you **MUST** prefix raw queries with their respective schema namespace:
   ```typescript
   this.prisma.$queryRaw`SELECT * FROM core.assembly_constituencies WHERE ...`
   ```

### 1. Initializing Migrations (Baselining)
If your database already has the existing tables (`assembly_constituencies` and `parliment_constituencies`):

To mark the initial migration (`20260520161407_init`) as already applied without executing its SQL and risking data loss, run:
```bash
pnpm prisma migrate resolve --applied "20260520161407_init"
```

### 2. Standard Migrations
When deploying migrations in production or staging environments:
```bash
pnpm prisma:deploy
```
*(Alternatively: `pnpm prisma migrate deploy`)*

For development, when you make changes to `prisma/schema.prisma` and want to generate and apply a new migration:
```bash
pnpm prisma:migrate
```
*(Alternatively: `pnpm prisma migrate dev`)*

### 3. Generate Prisma Client
To regenerate the Prisma Client TypeScript types:
```bash
pnpm prisma:generate
```
*(Alternatively: `pnpm prisma generate`)*

---

## GIS Import & Sync Pipeline

We use a staging-to-production ETL workflow to import shapefiles. When importing, `ogr2ogr` writes to a dedicated `staging` database schema. This keeps staging tables isolated, meaning that running `npx prisma db pull` (which inspects the `public` schema) will not pollute your `schema.prisma`. After mapping the fields to production tables under the `public` schema, staging tables are automatically dropped.

### How to Run the Sync Command

You can run the entire pipeline (import and sync) using:
```bash
pnpm db:sync --assembly <assembly-shapefile-path> --parliament <parliament-shapefile-path>
```

**Example:**
```bash
pnpm db:sync --assembly assembly-constituencies/India_AC.shp --parliament parliamentary-constituencies/india_pc_2019.shp
```

*Note: If you have already imported the data into staging tables manually, simply running `pnpm db:sync` without arguments will map the fields to production and drop the staging tables.*

---

## Prisma Lifecycle Cheat Sheet

### Scenario 1: Baselining (Existing DB with Tables and Data)
If you connect to an existing database containing tables that aren't tracked by Prisma:
1. Pull the schema:
   ```bash
   pnpm prisma db pull
   ```
2. Create a draft migration without applying it to the database:
   ```bash
   pnpm prisma migrate dev --name init --create-only
   ```
3. Mark the draft migration folder name as applied:
   ```bash
   pnpm prisma migrate resolve --applied "<migration_folder_name>"
   ```

### Scenario 2: Modifying or Adding Tables/Columns (Development Flow)
When you need to modify database structures without altering the DB directly:
1. Edit the models in your `prisma/schema.prisma` file.
2. Run the development migration tool:
   ```bash
   pnpm prisma migrate dev --name <describe_your_change>
   ```
3. Commit the generated migration folder under `prisma/migrations` to Git.

### Scenario 3: Local Prototyping (No Migrations Created)
If you want to quickly sync your schema with your local database without creating migration history:
```bash
pnpm prisma db push
```
*Caution: This bypasses migration history and may cause data loss if you drop columns/tables.*

### Scenario 4: Database Seeding
To populate the database with default or dummy records:
1. Configure `seed.ts` logic under the `prisma` directory.
2. Run the seed script:
   ```bash
   pnpm prisma db seed
   ```

---

## Compile and Run the Project

```bash
# development mode
pnpm run start

# watch mode (development with reload)
pnpm run start:dev

# production mode
pnpm run start:prod
```

---

## Run Tests

```bash
# unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# test coverage
pnpm run test:cov
```

---

## License

This project is [MIT licensed](LICENSE).
