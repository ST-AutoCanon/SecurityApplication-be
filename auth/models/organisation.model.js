// models/organisation.model.js
import crypto from "crypto";
import masterAuthDB from "../../config/masterAuthDB.js";

/* Get Last Org ID */
export const getLastOrgId = async (client) => {
  const result = await client.query(`
    SELECT id
    FROM auth.organisations
    ORDER BY id DESC
    LIMIT 1
  `);

  return result.rows[0]?.id || 0;
};

export const createOrganisation = async (
  client,
  {
    org_name,
    schema_name,
    org_code,
    org_type,
    email = null,
    phone = null,
    address = null,
    aadhaar_number = null,
    pan_number = null,
    passport_number = null,
    photo_path = null,
    registration_start_date = null,
    registration_end_date = null,
    status = null,
  },
) => {
  const result = await client.query(
    `
    INSERT INTO auth.organisations (
      org_name,
      schema_name,
      org_type,
      email,
      phone,
      address,
      aadhaar_number,
      pan_number,
      passport_number,
      photo_path,
      registration_start_date,
      registration_end_date,
      status
    )
    VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11, $12, $13
    )
    RETURNING *;
    `,
    [
      org_name,
      schema_name,
      org_type,
      email,
      phone,
      address,
      aadhaar_number,
      pan_number,
      passport_number,
      photo_path,
      registration_start_date,
      registration_end_date,
      status,
    ],
  );

  return result.rows[0];
};
/* Create Schema */
export const createOrgSchema = async (client, schemaName) => {
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS ${schemaName}
  `);
};

export const getUserByEmail = async (client, email) => {
  const result = await client.query(
    `
    SELECT *
    FROM auth.users
    WHERE email = $1
    LIMIT 1
    `,
    [email],
  );

  return result.rows[0];
};


// export const createOrgAdmin = async (client, organisationId, admin) => {
//   const { first_name, last_name, email, phone } = admin;

//   const password =
//     "$2b$10$7WNEDjohk7W5RUwCozXkKuYYKOkJsIi1MCcBCybQlAWXcEYHRceQ2";

//   await client.query(
//     `
//     INSERT INTO auth.users
//     (
//       organisation_id,
//       first_name,
//       last_name,
//       email,
//       phone,
//       password,
//       role,
//       is_active
//     )
//     VALUES
//     (
//       $1,
//       $2,
//       $3,
//       $4,
//       $5,
//       $6,
//       'admin',
//       true
//     )
//     `,
//     [organisationId, first_name, last_name, email, phone, password],
//   );
// };


export const createOrgAdmin = async (client, organisationId, admin) => {
  const { first_name, last_name, email, phone } = admin;

  const token = crypto.randomBytes(32).toString("hex");

  const result = await client.query(
    `
    INSERT INTO auth.users
    (
      organisation_id,
      first_name,
      last_name,
      email,
      phone,
      password,
      role,
      is_active,
      invitation_token,
      invitation_expires_at
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      $5,
      '',
      'admin',
      true,
      $6,
      NOW() + INTERVAL '24 hours'
    )
    RETURNING
      id,
      first_name,
      last_name,
      email,
      phone,
      role,
      invitation_token;
    `,
    [organisationId, first_name, last_name, email, phone, token],
  );

  return result.rows[0];
};

export const createOrgSecurityUsers = async (
  client,
  organisationId,
  securityUsers = [],
) => {
  const users = [];

  for (const security of securityUsers) {
    const token = crypto.randomBytes(32).toString("hex");

    const result = await client.query(
      `
      INSERT INTO auth.users
      (
        organisation_id,
        first_name,
        last_name,
        email,
        phone,
        password,
        role,
        is_active,
        invitation_token,
        invitation_expires_at
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        '',
        'security',
        true,
        $6,
        NOW() + INTERVAL '24 hours'
      )
      RETURNING
        id,
        first_name,
        email,
        invitation_token;
      `,
      [
        organisationId,
        security.first_name,
        security.last_name,
        security.email,
        security.phone,
        token,
      ],
    );

    users.push(result.rows[0]);
  }

  return users;
};




/* Get All Organisations */
export const getOrganisations = async () => {
  const result = await masterAuthDB.query(`
    SELECT *
    FROM auth.organisations
    ORDER BY id DESC
  `);

  return result.rows;
};

/* Get Org By Code */
export const getOrganisationBySchema = async (client, schemaName) => {
  const result = await client.query(
    `
    SELECT *
    FROM auth.organisations
    WHERE schema_name = $1
    LIMIT 1
    `,
    [schemaName],
  );

  return result.rows[0];
};

/* Get Org By ID + Admin */
export const getOrganisationById = async (client, id) => {
  const orgResult = await client.query(
    `
    SELECT *
    FROM auth.organisations
    WHERE id = $1
    `,
    [id],
  );

  const organisation = orgResult.rows[0];

  if (!organisation) {
    return null;
  }

  const adminResult = await client.query(
    `
  SELECT
    first_name,
    last_name,
    email,
    phone
  FROM auth.users
  WHERE organisation_id = $1
    AND role = 'admin'
  LIMIT 1
  `,
    [id],
  );

  const admin = adminResult.rows[0] || null;

  return {
    ...organisation,
    admin,
  };
};


export const getOrganisationForDelete = async (client, id) => {
  const result = await client.query(
    `
    SELECT *
    FROM auth.organisations
    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
};


export const deleteOrganisationUsers = async (client, organisationId) => {
  await client.query(
    `
    DELETE FROM auth.users
    WHERE organisation_id = $1
    `,
    [organisationId],
  );
};
/* Delete Organisation */


/* Delete Organisation */
export const deleteOrganisationById = async (client, id) => {
  const result = await client.query(
    `
    DELETE FROM auth.organisations
    WHERE id = $1
    RETURNING *
    `,
    [id],
  );

  return result.rows[0] || null;
};

export const updateOrganisation = async (
  client,
  id,
  {
    org_name,
    email,
    phone,
    address,
    aadhaar_number,
    pan_number,
    passport_number,
    photo_path,
    registration_start_date,
    registration_end_date,
    status,
    admin,
  },
) => {
  const orgResult = await client.query(
    `
    UPDATE auth.organisations
    SET
      org_name = COALESCE($1, org_name),
      email = COALESCE($2, email),
      phone = COALESCE($3, phone),
      address = COALESCE($4, address),
      aadhaar_number = COALESCE($5, aadhaar_number),
      pan_number = COALESCE($6, pan_number),
      passport_number = COALESCE($7, passport_number),
      photo_path = COALESCE($8, photo_path),
      registration_start_date = COALESCE($9, registration_start_date),
      registration_end_date = COALESCE($10, registration_end_date),
      status = COALESCE($11, status),
      updated_at = NOW()
    WHERE id = $12
    RETURNING *;
    `,
    [
      org_name,
      email,
      phone,
      address,
      aadhaar_number,
      pan_number,
      passport_number,
      photo_path,
      registration_start_date,
      registration_end_date,
      status,
      id,
    ],
  );

  const organisation = orgResult.rows[0];

  
  if (!organisation) {
    return null;
  }

  if (admin) {
    await client.query(
      `
    UPDATE auth.users
    SET
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      email = COALESCE($3, email),
      phone = COALESCE($4, phone),
      updated_at = NOW()
    WHERE organisation_id = $5
      AND role = 'admin'
    `,
      [
        admin?.first_name ?? null,
        admin?.last_name ?? null,
        admin?.email ?? null,
        admin?.phone ?? null,
        organisation.id,
      ],
    );
  }

  return organisation;
};
/* Get Org Codes */
export const getAllOrganisations = async () => {
  const result = await masterAuthDB.query(`
    SELECT
      id,
      org_name,
      schema_name
    FROM auth.organisations
    ORDER BY id DESC
  `);

  return result.rows;
};

export const getUserByOrgAndEmail = async (client, organisationId, email) => {
  const result = await client.query(
    `
    SELECT id
    FROM auth.users
    WHERE organisation_id = $1
      AND email = $2
    LIMIT 1
    `,
    [organisationId, email],
  );

  return result.rows[0] || null;
};