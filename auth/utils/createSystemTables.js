export const createSystemTables = async (db, schema) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS "${schema}".punch_logs (
      id BIGSERIAL PRIMARY KEY,
      table_name TEXT NOT NULL,
      user_id BIGINT NOT NULL,
      full_name TEXT,
      distance DOUBLE PRECISION,
      punch_type VARCHAR(10) NOT NULL,
      punch_time TIMESTAMP DEFAULT NOW()
    );
  `);
};
