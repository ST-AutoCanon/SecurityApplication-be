export const createSystemTables = async (db, schema) => {
  // Punch Logs
  await db.query(`
    CREATE TABLE IF NOT EXISTS "${schema}".punch_logs (
      id BIGSERIAL PRIMARY KEY,
      table_name TEXT NOT NULL,
      user_id BIGINT NOT NULL,
      full_name TEXT,
      distance DOUBLE PRECISION,
      punch_type VARCHAR(10) NOT NULL,
      punch_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Face Details
  await db.query(`
    CREATE TABLE IF NOT EXISTS "${schema}".face_details (
      id BIGSERIAL PRIMARY KEY,
      table_name TEXT NOT NULL,
      record_id BIGINT NOT NULL,
      face_descriptor VECTOR(512) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Normal index for table_name + record_id
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_face_details_table_record
    ON "${schema}".face_details (table_name, record_id);
  `);

  // HNSW vector index
  await db.query(`
    CREATE INDEX IF NOT EXISTS face_details_face_descriptor_hnsw_idx
    ON "${schema}".face_details
    USING hnsw (face_descriptor vector_cosine_ops);
  `);
};
