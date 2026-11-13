

export const createApartmentMaintenanceTables = async (db, schema) => {
  if (!db || typeof db.query !== "function") {
    throw new Error("A valid database connection is required");
  }

  if (!schema || !/^[a-zA-Z0-9_]+$/.test(schema)) {
    throw new Error(`Invalid organisation schema: ${schema}`);
  }

  const s = `"${schema}"`;

  // Flats
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${s}.apartment_flats (
      id SERIAL PRIMARY KEY,
      apartment_name VARCHAR(255) NOT NULL DEFAULT '',
      block_tower VARCHAR(100) NOT NULL DEFAULT '',
      floor_number VARCHAR(20),
      flat_number VARCHAR(50) NOT NULL,
      bhk_type VARCHAR(50),
      area_sqft NUMERIC(10,2),
      ownership_type VARCHAR(20) DEFAULT 'OWNER',
      occupancy_status VARCHAR(20) NOT NULL DEFAULT 'Occupied',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (apartment_name, block_tower, floor_number, flat_number)
    )
  `);
// Ensure BHK area columns exist for existing organisations
// await db.query(`
//     ALTER TABLE "${schema}".apartment_maintenance_bhk_rates
//     ADD COLUMN IF NOT EXISTS min_area NUMERIC(12,2),
//     ADD COLUMN IF NOT EXISTS max_area NUMERIC(12,2);
// `);
  await db.query(`
    ALTER TABLE ${s}.apartment_flats
    ADD COLUMN IF NOT EXISTS ownership_type VARCHAR(20) DEFAULT 'OWNER',
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS bhk_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS area_sqft NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS occupancy_status VARCHAR(20) DEFAULT 'Occupied'
  `);

  // Base charges
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${s}.apartment_maintenance_settings (
      id SERIAL PRIMARY KEY,
      calculation_method VARCHAR(30) NOT NULL
        CHECK (calculation_method IN (
          'PER_SQFT','PER_BHK','FLAT_AMOUNT','FLOOR_WISE'
        )),
      base_rate NUMERIC(12,2) NOT NULL DEFAULT 0,
      applicable_for VARCHAR(20) NOT NULL DEFAULT 'ALL',
      effective_from DATE NOT NULL,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fixed_monthly_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      rate_per_sqft NUMERIC(12,2) NOT NULL DEFAULT 0
    )
  `);
await db.query(`
  ALTER TABLE ${s}.apartment_maintenance_settings
    ADD COLUMN IF NOT EXISTS base_rate NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS calculation_method VARCHAR(30),
    ADD COLUMN IF NOT EXISTS applicable_for VARCHAR(20) NOT NULL DEFAULT 'ALL',
    ADD COLUMN IF NOT EXISTS effective_from DATE,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS fixed_monthly_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS rate_per_sqft NUMERIC(12,2) NOT NULL DEFAULT 0
`);
  // BHK rates
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${s}.apartment_maintenance_bhk_rates (
      id SERIAL PRIMARY KEY,
      bhk_type VARCHAR(50) NOT NULL UNIQUE,
      amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      min_area NUMERIC(10,2),
      max_area NUMERIC(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    ALTER TABLE ${s}.apartment_maintenance_bhk_rates
      ADD COLUMN IF NOT EXISTS min_area NUMERIC(10,2),
      ADD COLUMN IF NOT EXISTS max_area NUMERIC(10,2)
  `);

  // Floor charges
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${s}.apartment_maintenance_floor_charges (
      id SERIAL PRIMARY KEY,
      floor_number VARCHAR(50) NOT NULL DEFAULT '',
      floor_from VARCHAR(50),
      floor_to VARCHAR(50),
      charge_type VARCHAR(20) NOT NULL DEFAULT 'FIXED',
      amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      monthly_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      applicable_units VARCHAR(30) DEFAULT 'all',
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    ALTER TABLE "${schema}".apartment_maintenance_floor_charges
    ADD COLUMN IF NOT EXISTS floor_from VARCHAR(100),
    ADD COLUMN IF NOT EXISTS floor_to VARCHAR(100),
    ADD COLUMN IF NOT EXISTS monthly_amount NUMERIC(12,2),
    ADD COLUMN IF NOT EXISTS applicable_units VARCHAR(30) DEFAULT 'all'
`);
  await db.query(`
  ALTER TABLE "${schema}".apartment_maintenance_floor_charges
  ADD COLUMN IF NOT EXISTS floor_from VARCHAR(100),
  ADD COLUMN IF NOT EXISTS floor_to VARCHAR(100),
  ADD COLUMN IF NOT EXISTS monthly_amount NUMERIC(12,2)
`);
  await db.query(`
    ALTER TABLE ${s}.apartment_maintenance_floor_charges
      ADD COLUMN IF NOT EXISTS floor_from VARCHAR(50),
      ADD COLUMN IF NOT EXISTS floor_to VARCHAR(50),
      ADD COLUMN IF NOT EXISTS monthly_amount NUMERIC(12,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS applicable_units VARCHAR(30) DEFAULT 'all'
  `);

  // Special charges
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${s}.apartment_maintenance_special_charges (
      id SERIAL PRIMARY KEY,
      charge_name VARCHAR(150) NOT NULL,
      charge_type VARCHAR(20) NOT NULL DEFAULT 'FIXED',
      amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      applicable_for VARCHAR(20) NOT NULL DEFAULT 'ALL',
      effective_from DATE,
      effective_to DATE,
      frequency VARCHAR(30) DEFAULT 'monthly',
      interval_months INTEGER DEFAULT 1,
      payable_months VARCHAR(100),
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
  ALTER TABLE "${schema}".apartment_maintenance_special_charges
  ADD COLUMN IF NOT EXISTS charge_mode VARCHAR(20) DEFAULT 'RECURRING',
  ADD COLUMN IF NOT EXISTS effective_to DATE,
  ADD COLUMN IF NOT EXISTS frequency VARCHAR(30) DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS interval_months INTEGER,
  ADD COLUMN IF NOT EXISTS payable_months VARCHAR(100)
`);
await db.query(`
  ALTER TABLE "${schema}".apartment_maintenance_special_charges
  ADD COLUMN IF NOT EXISTS effective_to DATE
`);
  await db.query(`
    ALTER TABLE "${schema}".apartment_maintenance_special_charges
    ADD COLUMN IF NOT EXISTS charge_mode VARCHAR(20) DEFAULT 'RECURRING'
`);
  await db.query(`
    ALTER TABLE ${s}.apartment_maintenance_special_charges
      ADD COLUMN IF NOT EXISTS effective_to DATE,
      ADD COLUMN IF NOT EXISTS frequency VARCHAR(30) DEFAULT 'monthly',
      ADD COLUMN IF NOT EXISTS interval_months INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS payable_months VARCHAR(100)
  `);

  // Late payment rules
  
  // ---------------- LATE PAYMENT RULES ----------------

  await db.query(`
    CREATE TABLE IF NOT EXISTS ${s}.apartment_maintenance_late_rules (
      id SERIAL PRIMARY KEY,

      due_day INTEGER NOT NULL DEFAULT 10,
      grace_days INTEGER NOT NULL DEFAULT 0,

      late_fee_type VARCHAR(20) NOT NULL DEFAULT 'FIXED',
      late_fee_value NUMERIC(12,2) NOT NULL DEFAULT 0,

      delay_from_days INTEGER NOT NULL DEFAULT 1,
      delay_to_days INTEGER NOT NULL DEFAULT 999,

      effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
      effective_to DATE,

      is_active BOOLEAN NOT NULL DEFAULT TRUE,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CHECK (due_day BETWEEN 1 AND 28),
      CHECK (grace_days >= 0),
      CHECK (delay_from_days >= 1),
      CHECK (delay_to_days >= delay_from_days),
      CHECK (late_fee_type IN ('FIXED', 'PERCENTAGE')),
      CHECK (
        effective_to IS NULL
        OR effective_to >= effective_from
      )
    )
  `);


// Ensure all required late-payment columns exist
await query(
  client,
  schema,
  `
    ALTER TABLE {{schema}}.apartment_maintenance_late_rules
      ADD COLUMN IF NOT EXISTS due_day INTEGER NOT NULL DEFAULT 10,
      ADD COLUMN IF NOT EXISTS grace_days INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS late_fee_type VARCHAR(20) NOT NULL DEFAULT 'FIXED',
      ADD COLUMN IF NOT EXISTS late_fee_value NUMERIC(12,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS delay_from_days INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS delay_to_days INTEGER NOT NULL DEFAULT 999,
      ADD COLUMN IF NOT EXISTS effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
      ADD COLUMN IF NOT EXISTS effective_to DATE,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `
);

  // Migrate existing organisation tables
  await db.query(`
    ALTER TABLE ${s}.apartment_maintenance_late_rules
      ADD COLUMN IF NOT EXISTS due_day INTEGER NOT NULL DEFAULT 10,
      ADD COLUMN IF NOT EXISTS grace_days INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS late_fee_type VARCHAR(20) NOT NULL DEFAULT 'FIXED',
      ADD COLUMN IF NOT EXISTS late_fee_value NUMERIC(12,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS delay_from_days INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS delay_to_days INTEGER NOT NULL DEFAULT 999,
      ADD COLUMN IF NOT EXISTS effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
      ADD COLUMN IF NOT EXISTS effective_to DATE,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_maintenance_late_rules_active
    ON ${s}.apartment_maintenance_late_rules
    (is_active, effective_from, effective_to)
  `);

  // Bills
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${s}.apartment_maintenance_bills (
      id BIGSERIAL PRIMARY KEY,
      flat_id INTEGER NOT NULL REFERENCES ${s}.apartment_flats(id)
        ON DELETE RESTRICT,
      bill_month DATE NOT NULL,
      base_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      floor_charge NUMERIC(12,2) NOT NULL DEFAULT 0,
      special_charges NUMERIC(12,2) NOT NULL DEFAULT 0,
      late_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      due_date DATE,
      status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
      paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      paid_at TIMESTAMP,
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (flat_id, bill_month)
    )
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_maintenance_bills_month
    ON ${s}.apartment_maintenance_bills (bill_month)
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_maintenance_bills_status
    ON ${s}.apartment_maintenance_bills (status)
  `);

  await db.query(`
  ALTER TABLE ${s}.apartment_maintenance_late_rules
  ADD COLUMN IF NOT EXISTS delay_from_days INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS delay_to_days INTEGER NOT NULL DEFAULT 999
`);

await db.query(`
  SELECT setval(
    pg_get_serial_sequence(
      '${schema}.apartment_maintenance_settings',
      'id'
    ),
    COALESCE(
      (
        SELECT MAX(id)
        FROM ${s}.apartment_maintenance_settings
      ),
      0
    ) + 1,
    false
  )
`);

await db.query(`
  ALTER TABLE "${schema}".apartment_maintenance_late_rules
  ADD COLUMN IF NOT EXISTS delay_from_days INTEGER
`);

await db.query(`
  ALTER TABLE "${schema}".apartment_maintenance_late_rules
  ADD COLUMN IF NOT EXISTS delay_to_days INTEGER
`);
  console.log(
    `[Apartment Maintenance] Tables and migrations completed for ${schema}`
  );
};
