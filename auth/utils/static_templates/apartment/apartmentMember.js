export const createApartmentMemberTable = async (db, schema) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS "${schema}".apartment_member (
      id SERIAL PRIMARY KEY,

      -- Link to security user (if applicable)
      security_user_id INTEGER,

      -- Member Information
      member_code VARCHAR(50) UNIQUE,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100),
      gender VARCHAR(20),
      date_of_birth DATE,

      mobile_number VARCHAR(20) NOT NULL,
      alternate_mobile_number VARCHAR(20),

      email VARCHAR(255),
      profile_photo TEXT,
      aadhaar_number VARCHAR(20),
      occupation VARCHAR(100),

      -- Apartment Information
      apartment_name VARCHAR(255),
      block_tower VARCHAR(100),
      floor_number VARCHAR(20),
      flat_number VARCHAR(50),

      ownership_type VARCHAR(20), -- OWNER / TENANT
      move_in_date DATE,

      family_member_count INTEGER DEFAULT 0,

      -- Emergency Contact
      emergency_contact_name VARCHAR(100),
      emergency_contact_relationship VARCHAR(50),
      emergency_contact_mobile VARCHAR(20),

      -- Member Type
      member_type VARCHAR(30) DEFAULT 'RESIDENT',

      status BOOLEAN DEFAULT TRUE,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
