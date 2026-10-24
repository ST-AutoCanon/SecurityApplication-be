export const createImportantInformationTable = async (db, schema) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS "${schema}".important_information (
      id SERIAL PRIMARY KEY,
      organisation_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'published',
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      priority VARCHAR(50) DEFAULT 'Important',
      expires_at DATE,
      is_active BOOLEAN DEFAULT TRUE
    );
  `);
};