export const createVendorsServiceProvidersTable = async (db, schema) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS "${schema}".vendors_service_providers (
      id SERIAL PRIMARY KEY,
      organisation_id INTEGER NOT NULL,
      category VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      services TEXT,
      rating NUMERIC(3,1) DEFAULT 0.0,
      review_count INTEGER DEFAULT 0,
      phone VARCHAR(20),
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      recommendation TEXT,
      icon VARCHAR(100)
    );
  `);
};