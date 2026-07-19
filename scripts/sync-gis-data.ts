import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { execFileSync } from 'child_process';

const prisma = new PrismaClient();

interface FieldConfig {
  source: string;
  cast: string;
  required?: boolean;
}

interface MappingConfig {
  stagingTable: string;
  prodTable: string;
  fields: Record<string, FieldConfig>;
}

// Editable mapping configurations.
// If shapefile column names change, update the 'source' values here.
const CONFIGS: Record<string, MappingConfig> = {
  assembly: {
    stagingTable: 'staging_assembly_constituencies',
    prodTable: 'assembly_constituencies',
    fields: {
      objectid: { source: 'objectid', cast: 'DECIMAL(9,0)' },
      st_code: { source: 'st_code', cast: 'DECIMAL(10,0)' },
      st_name: { source: 'st_name', cast: 'VARCHAR(254)', required: true },
      dt_code: { source: 'dt_code', cast: 'DECIMAL(10,0)' },
      dist_name: { source: 'dist_name', cast: 'VARCHAR(254)' },
      ac_no: { source: 'ac_no', cast: 'DECIMAL(10,0)', required: true },
      ac_name: { source: 'ac_name', cast: 'VARCHAR(254)', required: true },
      pc_no: { source: 'pc_no', cast: 'DECIMAL(10,0)' },
      pc_name: { source: 'pc_name', cast: 'VARCHAR(254)', required: true },
      pc_id: { source: 'pc_id', cast: 'DECIMAL(10,0)' },
      status: { source: 'status', cast: 'VARCHAR(254)' },
      shape_leng: { source: 'shape_leng', cast: 'DECIMAL(18,11)' },
      shape_area: { source: 'shape_area', cast: 'DECIMAL(18,11)' },
    },
  },
  parliament: {
    stagingTable: 'staging_parliment_constituencies',
    prodTable: 'parliment_constituencies',
    fields: {
      st_name: { source: 'st_name', cast: 'VARCHAR(254)', required: true },
      pc_name: { source: 'pc_name', cast: 'VARCHAR(254)', required: true },
      st_code: { source: 'st_code', cast: 'VARCHAR(3)' },
      pc_code: { source: 'pc_code', cast: 'DECIMAL(4,0)' },
      res: { source: 'res', cast: 'VARCHAR(4)' },
    },
  },
};

/**
 * Runs ogr2ogr using shell execution.
 */
function runOgr2Ogr(shapefilePath: string, targetTable: string): void {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const dbname = process.env.DB_DATABASE || 'civicpath';
  const user = process.env.DB_USERNAME || 'vector_admin';
  
  // Throw error if DB_PASSWORD is not set
  const password = process.env.DB_PASSWORD;
  if (!password) {
    throw new Error('DB_PASSWORD not set in environment');
  }

  // PG connection string passed literally without double quotes since it's not run in a shell.
  const pgConnString = `PG:host=${host} port=${port} dbname=${dbname} user=${user} password=${password}`;

  console.log(`\nImporting shapefile: ${shapefilePath} to staging schema table: staging.${targetTable}...`);
  
  // Arguments array passed directly to execFileSync to avoid shell injection risk.
  const args = [
    '-f', 'PostgreSQL',
    pgConnString,
    shapefilePath,
    '-nln', targetTable,
    '-nlt', 'MULTIPOLYGON',
    '-lco', 'GEOMETRY_NAME=geom',
    '-lco', 'FID=ogc_fid',
    '-lco', 'SCHEMA=staging',
    '-overwrite'
  ];

  try {
    execFileSync('ogr2ogr', args, { stdio: 'inherit' });
    console.log(`✔ Staging table staging.${targetTable} successfully populated.`);
  } catch (error) {
    console.error(`✖ Failed to run ogr2ogr for table staging.${targetTable}:`, error);
    throw error;
  }
}

/**
 * Dynamically maps, transforms, and syncs data from staging to production.
 */
async function syncTable(name: string, config: MappingConfig): Promise<void> {
  const { stagingTable, prodTable, fields } = config;
  console.log(`\nStarting sync from staging.${stagingTable} to core.${prodTable}...`);

  // 1. Fetch available columns from the staging schema table
  const columnsResult = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns 
     WHERE table_schema = 'staging' AND table_name = $1`,
    stagingTable.toLowerCase()
  );

  if (!columnsResult || columnsResult.length === 0) {
    throw new Error(`Staging table staging.${stagingTable} not found in database. Please run import first.`);
  }

  const stagingCols = new Set(columnsResult.map((c) => c.column_name.toLowerCase()));

  // 2. Auto-detect geometry column in staging
  const geomResult = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns 
     WHERE table_schema = 'staging' AND table_name = $1 AND (udt_name = 'geometry' OR data_type = 'USER-DEFINED')`,
    stagingTable.toLowerCase()
  );
  const geomCol = geomResult[0]?.column_name || 'geom';

  if (!stagingCols.has(geomCol.toLowerCase())) {
    throw new Error(`Geometry column '${geomCol}' not found in staging table staging.${stagingTable}.`);
  }

  // 3. Build standard fields selection and casts
  const selectColumns: string[] = [];
  const targetColumns: string[] = [];

  for (const [prodCol, fieldConfig] of Object.entries(fields)) {
    targetColumns.push(prodCol);

    const sourceCol = fieldConfig.source;
    if (stagingCols.has(sourceCol.toLowerCase())) {
      selectColumns.push(`CAST("${sourceCol}" AS ${fieldConfig.cast})`);
    } else {
      if (fieldConfig.required) {
        throw new Error(`✖ Missing required column '${sourceCol}' in staging table staging.${stagingTable}. Sync aborted.`);
      }
      console.warn(`⚠ Field mapping mismatch: Column '${sourceCol}' not found in staging.${stagingTable}. Mapping to NULL.`);
      selectColumns.push(`NULL::${fieldConfig.cast}`);
    }
  }

  // Add Geometry column logic: standardizes coordinates to WGS84 (SRID 4326) and MultiPolygon, wrapped with ST_MakeValid
  targetColumns.push('geom');
  const geomSelect = `
    CASE 
      WHEN ST_SRID("${geomCol}") = 0 THEN ST_Multi(ST_MakeValid(ST_SetSRID("${geomCol}", 4326)))
      WHEN ST_SRID("${geomCol}") = 4326 THEN ST_Multi(ST_MakeValid("${geomCol}"))
      ELSE ST_Multi(ST_MakeValid(ST_Transform("${geomCol}", 4326)))
    END
  `;
  selectColumns.push(geomSelect);

  // 4. Truncate production table and load mapped data from staging schema
  try {
    await prisma.$transaction([
      prisma.$executeRawUnsafe(`TRUNCATE TABLE core."${prodTable}" RESTART IDENTITY CASCADE;`),
      prisma.$executeRawUnsafe(`
        INSERT INTO core."${prodTable}" (${targetColumns.map((c) => `"${c}"`).join(', ')})
        SELECT ${selectColumns.join(', ')}
        FROM staging."${stagingTable}";
      `),
    ]);

    // Get count of records synced
    const countResult = await prisma.$queryRawUnsafe<{ count: string }[]>(
      `SELECT COUNT(*)::text as count FROM core."${prodTable}"`
    );
    const count = countResult[0]?.count || '0';

    console.log(`✔ Successfully synced ${count} rows to core.${prodTable}. Staging table preserved.`);

    // 5. Insert audit log record
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS core.import_log (
        id SERIAL PRIMARY KEY,
        dataset_name TEXT,
        staging_table TEXT,
        prod_table TEXT,
        row_count INTEGER,
        imported_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await prisma.$executeRawUnsafe(
      `INSERT INTO core.import_log (dataset_name, staging_table, prod_table, row_count)
       VALUES ($1, $2, $3, $4::integer)`,
      name,
      stagingTable,
      prodTable,
      parseInt(count, 10)
    );
    console.log(`✔ Audit log written to core.import_log for dataset: ${name}.`);

  } catch (error) {
    console.error(`✖ Transaction failed during sync for core.${prodTable}:`, error);
    throw error;
  }
}

async function main(): Promise<void> {
  // Check if DB_PASSWORD is set in environment
  if (!process.env.DB_PASSWORD) {
    throw new Error('DB_PASSWORD not set in environment');
  }

  // Ensure schemas exist in PostgreSQL
  console.log('Ensuring PostgreSQL schemas exist...');
  await prisma.$executeRawUnsafe('CREATE SCHEMA IF NOT EXISTS staging;');
  await prisma.$executeRawUnsafe('CREATE SCHEMA IF NOT EXISTS core;');

  // Parse command line arguments
  const args = process.argv.slice(2);
  let assemblyShp: string | null = null;
  let parliamentShp: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--assembly' && args[i + 1]) {
      assemblyShp = args[i + 1];
      i++;
    } else if (args[i] === '--parliament' && args[i + 1]) {
      parliamentShp = args[i + 1];
      i++;
    }
  }

  try {
    // Phase 1: Import shapefiles to staging schema via ogr2ogr if paths are provided
    if (assemblyShp) {
      runOgr2Ogr(assemblyShp, CONFIGS.assembly.stagingTable);
    }
    if (parliamentShp) {
      runOgr2Ogr(parliamentShp, CONFIGS.parliament.stagingTable);
    }

    // Phase 2: Run sync pipelines
    await syncTable('assembly', CONFIGS.assembly);
    await syncTable('parliament', CONFIGS.parliament);

    console.log('\n🎉 GIS synchronization pipeline completed successfully.');
  } catch (error) {
    console.error('\n✖ Sync pipeline failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
