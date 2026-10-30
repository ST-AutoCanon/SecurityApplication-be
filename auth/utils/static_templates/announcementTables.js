// export const createAnnouncementsTable = async (db, schema) => {
//   await db.query(`
//     CREATE TABLE IF NOT EXISTS "${schema}".announcements (
//       id SERIAL PRIMARY KEY,
//       organisation_id INTEGER NOT NULL,
//       title VARCHAR(255) NOT NULL,
//       message TEXT NOT NULL,
//       priority VARCHAR(50) DEFAULT 'Notice',
//       created_by INTEGER,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       expires_at DATE,
//       is_active BOOLEAN DEFAULT TRUE,
//       starts_at DATE
//     );
//   `);
// };

export const createAnnouncementsTable = async (db, schema) => {
  // Only allow valid PostgreSQL schema identifiers.
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
    throw new Error(`Invalid schema name: ${schema}`);
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS "${schema}".announcements (
      id SERIAL PRIMARY KEY,
      organisation_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      priority VARCHAR(50) DEFAULT 'Notice',
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at DATE,
      is_active BOOLEAN DEFAULT TRUE,
      starts_at DATE
    );
  `);

  console.log(
    `Announcements table verified/created: ${schema}.announcements`
  );
};
