import crypto from "crypto";

export const getOrganisationById = async (client, organisationId) => {
  const result = await client.query(
    `
    SELECT *
    FROM auth.organisations
    WHERE id = $1
    LIMIT 1
    `,
    [organisationId],
  );

  return result.rows[0];
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

  return result.rows[0];
};

export const createSecurityUser = async (client, organisationId, security) => {
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
      last_name,
      email,
      phone,
      role,
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

  return result.rows[0];
};

// admin.model.js

// export const getOrganisationSchemas = async (client) => {
//   const result = await client.query(`
//     SELECT schema_name
//     FROM information_schema.schemata
//     WHERE schema_name LIKE 'org_%'
//     ORDER BY schema_name;
//   `);

//   return result.rows;
// };

export const getOrganisationSchema = async (client, organisationId) => {
  console.log(
    "organisationId received:",
    organisationId,
    typeof organisationId,
  );
  
  const result = await client.query(
    `
    SELECT schema_name
    FROM auth.organisations
    WHERE id = $1
    LIMIT 1
    `,
    [organisationId],
  );
  console.log("result in modal:", result);
  return result.rows[0];
};


export const getDeliveryPersons = async (client, schemaName) => {
  const result = await client.query(`
    SELECT
      *,
      '${schemaName}' AS organisation_schema
    FROM "${schemaName}".delivery_person
  `);

  return result.rows;
};



// export const getTables = async (client, schemaName) => {
//   const result = await client.query(
//     `
//     SELECT table_name
//     FROM information_schema.tables
//     WHERE table_schema = $1
//       AND table_type = 'BASE TABLE'
//     `,
//     [schemaName],
//   );

//   return result.rows;
// };

export const getTables = async (client, schemaName) => {
  const result = await client.query(
    `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = $1
      AND table_type = 'BASE TABLE'
      AND table_schema NOT IN ('public', 'information_schema', 'pg_catalog')
    `,
    [schemaName],
  );

  console.log('result in gettable model:', result);
  return result.rows;
};


export const getTableData = async (client, schemaName, tableName) => {
  const result = await client.query(`
    SELECT *,
           '${schemaName}' AS organisation_schema
    FROM "${schemaName}"."${tableName}"
  `);

  console.log("result in get tale dta modal:", result);
  return result.rows;
};