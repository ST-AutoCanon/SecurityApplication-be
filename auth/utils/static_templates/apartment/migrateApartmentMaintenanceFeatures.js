
import firstDB from "../config/dborgap.js";

const validateSchema = (schema) => {
  if (!schema || !/^[a-zA-Z0-9_]+$/.test(schema)) {
    throw new Error(`Invalid schema: ${schema}`);
  }
  return `"${schema}"`;
};

const migrateSchema = async (client, schema) => {
  const s = validateSchema(schema);

  console.log(`Migrating ${schema}...`);

  // BHK area ranges
  await client.query(`
    ALTER TABLE ${s}.apartment_maintenance_bhk_rates
      ADD COLUMN IF NOT EXISTS min_area NUMERIC(12,2),
      ADD COLUMN IF NOT EXISTS max_area NUMERIC(12,2)
  `);

  // New floor-range table. Existing floor-charge table is retained.
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${s}.apartment_maintenance_floor_ranges (
      id SERIAL PRIMARY KEY,
      floor_from INTEGER NOT NULL,
      floor_to INTEGER NOT NULL,
      charge_type VARCHAR(20) NOT NULL DEFAULT 'FIXED',
      amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      applicable_units VARCHAR(100) NOT NULL DEFAULT 'ALL',
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT apartment_floor_ranges_valid_range
        CHECK (floor_to >= floor_from),
      CONSTRAINT apartment_floor_ranges_valid_type
        CHECK (charge_type IN ('FIXED', 'PERCENTAGE'))
    )
  `);

  // Special charge scheduling
  await client.query(`
    ALTER TABLE ${s}.apartment_maintenance_special_charges
      ADD COLUMN IF NOT EXISTS billing_type VARCHAR(20)
        NOT NULL DEFAULT 'RECURRING',
      ADD COLUMN IF NOT EXISTS frequency VARCHAR(30)
        NOT NULL DEFAULT 'MONTHLY',
      ADD COLUMN IF NOT EXISTS interval_months INTEGER
        NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS payable_months TEXT,
      ADD COLUMN IF NOT EXISTS applicable_units VARCHAR(100)
        NOT NULL DEFAULT 'ALL',
      ADD COLUMN IF NOT EXISTS effective_to DATE
  `);

  // Late-fee slabs
  await client.query(`
    ALTER TABLE ${s}.apartment_maintenance_late_rules
      ADD COLUMN IF NOT EXISTS delay_from_days INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS delay_to_days INTEGER,
      ADD COLUMN IF NOT EXISTS due_day INTEGER NOT NULL DEFAULT 10,
      ADD COLUMN IF NOT EXISTS grace_days INTEGER NOT NULL DEFAULT 0
  `);

  // Indexes
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_maintenance_floor_ranges_active
    ON ${s}.apartment_maintenance_floor_ranges (is_active)
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_maintenance_special_active
    ON ${s}.apartment_maintenance_special_charges (is_active)
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_maintenance_late_active
    ON ${s}.apartment_maintenance_late_rules (is_active)
  `);

  console.log(`Completed ${schema}`);
};

const run = async () => {
  const client = await firstDB.connect();

  try {
    const schemas = await client.query(`
      SELECT DISTINCT table_schema AS schema_name
      FROM information_schema.tables
      WHERE table_name = 'apartment_flats'
        AND table_schema NOT IN (
          'public',
          'information_schema'
        )
        AND table_schema NOT LIKE 'pg_%'
      ORDER BY table_schema
    `);

    if (!schemas.rows.length) {
      console.log("No apartment organisation schemas found.");
      return;
    }

    for (const row of schemas.rows) {
      const schema = row.schema_name;

      await client.query("BEGIN");

      try {
        // Verify that the existing maintenance tables are present.
        const requiredTables = [
          "apartment_maintenance_bhk_rates",
          "apartment_maintenance_special_charges",
          "apartment_maintenance_late_rules"
        ];

        for (const tableName of requiredTables) {
          const exists = await client.query(
            `
              SELECT 1
              FROM information_schema.tables
              WHERE table_schema = $1
                AND table_name = $2
            `,
            [schema, tableName]
          );

          if (!exists.rowCount) {
            throw new Error(
              `${schema}.${tableName} does not exist. Create the original maintenance tables first.`
            );
          }
        }

        await migrateSchema(client, schema);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("Apartment maintenance migration completed.");
  } catch (error) {
    console.error("Apartment maintenance migration failed:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await firstDB.end();
  }
};

run();
