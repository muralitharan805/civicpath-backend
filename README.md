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

## 🐳 Docker Containerization & Execution Guide

CivicPath Backend is fully containerized using an enterprise-grade **Mandatory 6-File Docker Compose Topology** and a multi-stage **Dockerfile** with non-root security (`USER node`), GDAL support, and automated Prisma migrations.

### 📦 Build & Push Image to Registry

To compile the multi-stage production runner image and push it to Docker Hub:

```bash
# Build the production runner stage locally
docker build -t seyalicraft/civicpath-backend:latest .

# Push image to registry
docker push seyalicraft/civicpath-backend:latest
```

---

### 🚀 Execution Modes

#### Mode A: Standalone Development Environment (Local Code + Local Infra)
Spins up NestJS in watch mode (`pnpm run start:dev`) alongside dedicated PostgreSQL (pgvector + PostGIS), Redis, and RedisInsight containers.

```bash
docker compose -f docker-compose.shared.yml -f docker-compose.yml -f docker-compose.override.yml up -d
```

#### Mode B: Shared Infrastructure (Cost-Saver Development)
Runs the NestJS application container and connects it to existing running infrastructure containers via external Docker networks (`pgvector_network`, `redis_default`).

```bash
docker compose -f docker-compose.yml -f docker-compose.existing-infra.yml up -d
```

#### Mode C: Pre-Built Registry Deployment (VPS Deployment without Compilation)
Pulls pre-built image from Docker Hub and executes without running local builds on resource-constrained servers.

```bash
docker compose -f docker-compose.yml -f docker-compose.existing-infra.yml -f docker-compose.repo.yml up -d --pull always
```

#### Mode D: Production Standalone Environment
Builds and deploys the production container (`target: runner`) with resource limits, auto-restart policies, and json-file logging.

```bash
docker compose -f docker-compose.shared.yml -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

---

## 🚀 Automated CI/CD GitHub Actions SSH Deployment

CivicPath Backend includes an automated GitHub Actions pipeline ([.github/workflows/deploy.yml](file://./.github/workflows/deploy.yml)) that triggers zero-downtime deployment to your remote VPS server on push to `main` or `master` branches.

### 🔑 Required GitHub Repository Secrets

Configure the following secrets in your GitHub Repository under **Settings > Secrets and variables > Actions > New repository secret**:

| Secret Name | Description | Example Value |
| :--- | :--- | :--- |
| `SERVER_HOST` | VPS Server Public IP or Domain Name | `192.0.2.1` or `vps.seyalicraft.com` |
| `SERVER_USERNAME` | SSH User Account Name | `ubuntu` or `root` |
| `SERVER_PORT` | Remote SSH Service Port | `22` or `2222` |
| `SERVER_SSH_KEY` | Raw Private SSH Key string (`id_ed25519` / `id_rsa`) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `PROJECT_PATH` | Absolute path on VPS where repo is cloned | `/home/ubuntu/civicpath-backend` |

---

## License

This project is [MIT licensed](LICENSE).
