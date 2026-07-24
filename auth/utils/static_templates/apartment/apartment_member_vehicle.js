export const createApartmentMemberVehicleTable = async (db, schema) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS "${schema}".apartment_member_vehicle (
      id SERIAL PRIMARY KEY,

      member_id INTEGER NOT NULL
        REFERENCES "${schema}".apartment_member(id)
        ON DELETE CASCADE,

      vehicle_type VARCHAR(50),
      vehicle_number VARCHAR(50) NOT NULL,
      vehicle_brand VARCHAR(100),
      parking_slot VARCHAR(50),

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
