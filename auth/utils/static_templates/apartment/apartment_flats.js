
export const createApartmentFlatsTable = async (db, schema) => {
  if (!db || typeof db.query !== "function") {
    throw new Error("A valid database connection is required");
  }

  if (!schema || !/^[a-zA-Z0-9_]+$/.test(schema)) {
    throw new Error(`Invalid organisation schema: ${schema}`);
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS "${schema}".apartment_flats (
      id SERIAL PRIMARY KEY,
      apartment_name VARCHAR(255) NOT NULL DEFAULT '',
      block_tower VARCHAR(100) NOT NULL DEFAULT '',
      floor_number VARCHAR(20),
      flat_number VARCHAR(50) NOT NULL,
      bhk_type VARCHAR(20),
      area_sqft NUMERIC(10, 2),
      ownership_type VARCHAR(20) DEFAULT 'OWNER',
      occupancy_status VARCHAR(20) NOT NULL DEFAULT 'Occupied'
        CHECK (occupancy_status IN ('Occupied', 'Vacant')),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT unique_apartment_flat
        UNIQUE (apartment_name, block_tower, flat_number),

      CONSTRAINT valid_flat_area
        CHECK (area_sqft IS NULL OR area_sqft > 0)
    )
  `);

  // Safe migrations for existing organisations
  await db.query(`
    ALTER TABLE "${schema}".apartment_flats
    ADD COLUMN IF NOT EXISTS ownership_type VARCHAR(20) DEFAULT 'OWNER'
  `);

  await db.query(`
    ALTER TABLE "${schema}".apartment_flats
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE
  `);

  console.log(
    `[Apartment Flats] Table and migrations completed for ${schema}`
  );
};
