export const createApartmentMemberFamilyTable = async (db, schema) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS "${schema}".apartment_member_family (
      id SERIAL PRIMARY KEY,

      member_id INTEGER NOT NULL
        REFERENCES "${schema}".apartment_member(id)
        ON DELETE CASCADE,

      name VARCHAR(100) NOT NULL,
      relationship VARCHAR(50),
      age INTEGER,
      mobile_number VARCHAR(20),

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
