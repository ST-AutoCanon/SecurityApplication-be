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

export const getOrganisationSchema = async (client, organisationId) => {
  // console.log(
  //   "organisationId received:",
  //   organisationId,
  //   typeof organisationId,
  // );

  const result = await client.query(
    `
    SELECT schema_name
    FROM auth.organisations
    WHERE id = $1
    LIMIT 1
    `,
    [organisationId],
  );
  // console.log("result in modal:", result);
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

  // console.log("result in gettable model:", result);
  return result.rows;
};

export const getTableData = async (client, schemaName, tableName) => {
  const result = await client.query(`
    SELECT *,
           '${schemaName}' AS organisation_schema
    FROM "${schemaName}"."${tableName}"
  `);

  // result.rows.forEach((row) => {
  //   if (row.punch_time) {
  //     console.log("punch_time:", row.punch_time);
  //     console.log("typeof:", typeof row.punch_time);
  //     console.log("instanceof Date:", row.punch_time instanceof Date);
  //     console.log("toString():", row.punch_time.toString());
  //     console.log("toISOString():", row.punch_time.toISOString());
  //   }
  // });

  const filteredRows = result.rows.map(
    ({ organisation_schema, face_descriptor, ...rest }) => {
      if (rest.profile_photo) {
        rest.profile_photo = `${process.env.BASE_URL}/${rest.profile_photo}`;
      }
      // if (rest.punch_time instanceof Date) {
      //   rest.punch_time = rest.punch_time.toLocaleString("sv-SE", {
      //     timeZone: "Asia/Kolkata",
      //   });
      // }
      if (rest.punch_time instanceof Date) {
        rest.punch_time = rest.punch_time.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
      }

      return rest;
    },
  );

  return filteredRows;
};

export const getSecurityUsers = async (client, organisationId) => {
  const result = await client.query(
    `
    SELECT
      id,
      first_name,
      last_name,
      email,
      phone,
      role,
      is_active,
      created_at
    FROM auth.users
    WHERE organisation_id = $1
      AND role = 'security'
    ORDER BY created_at DESC
    `,
    [organisationId],
  );

  return result.rows;
};

export const getSecurityUserById = async (client, organisationId, userId) => {
  const result = await client.query(
    `
    SELECT
      id,
      first_name,
      last_name,
      email,
      phone,
      role,
      is_active
    FROM auth.users
    WHERE id = $1
      AND organisation_id = $2
      AND role = 'security'
    LIMIT 1
    `,
    [userId, organisationId],
  );

  return result.rows[0];
};

export const updateSecurityUser = async (
  client,
  organisationId,
  userId,
  security,
) => {
  const result = await client.query(
    `
    UPDATE auth.users
    SET
      first_name = $1,
      last_name = $2,
      email = $3,
      phone = $4,
      is_active = $5,
      updated_at = NOW()
    WHERE id = $6
      AND organisation_id = $7
      AND role = 'security'
    RETURNING
      id,
      first_name,
      last_name,
      email,
      phone,
      role,
      is_active
    `,
    [
      security.first_name,
      security.last_name,
      security.email,
      security.phone,
      security.is_active,
      userId,
      organisationId,
    ],
  );

  return result.rows[0];
};

export const deleteSecurityUser = async (client, organisationId, userId) => {
  const result = await client.query(
    `
    DELETE FROM auth.users
    WHERE id = $1
      AND organisation_id = $2
      AND role = 'security'
    RETURNING id
    `,
    [userId, organisationId],
  );

  return result.rows[0];
};

export const deactivateSecurityUser = async (
  client,
  organisationId,
  userId,
) => {
  const result = await client.query(
    `
    UPDATE auth.users
    SET
      is_active = false,
      updated_at = NOW()
    WHERE id = $1
      AND organisation_id = $2
      AND role = 'security'
    RETURNING
      id,
      first_name,
      last_name,
      email,
      is_active
    `,
    [userId, organisationId],
  );

  return result.rows[0];
};

export const activateSecurityUser = async (client, organisationId, userId) => {
  const result = await client.query(
    `
    UPDATE auth.users
    SET
      is_active = true,
      updated_at = NOW()
    WHERE id = $1
      AND organisation_id = $2
      AND role = 'security'
    RETURNING
      id,
      first_name,
      last_name,
      email,
      is_active
    `,
    [userId, organisationId],
  );

  return result.rows[0];
};



// buinsess data



export const updateBusinessData = async (
  client,
  schemaName,
  tableName,
  id,
  data,
) => {
  const keys = Object.keys(data);

  const setClause = keys
    .map((key, index) => `"${key}" = $${index + 1}`)
    .join(", ");

  const values = [...keys.map((key) => data[key]), id];

  const query = `
    UPDATE "${schemaName}"."${tableName}"
    SET ${setClause}
    WHERE id = $${values.length}
    RETURNING *;
  `;

  const result = await client.query(query, values);

  return result.rows[0] ?? null;
};


export const getBusinessDataById = async (
  client,
  schemaName,
  tableName,
  id,
) => {
  const result = await client.query(
    `
      SELECT *
      FROM "${schemaName}"."${tableName}"
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  if (!result.rows.length) {
    return null;
  }

  const row = result.rows[0];

  if (row.profile_photo) {
    row.profile_photo = `${process.env.BASE_URL}/${row.profile_photo}`;
  }

  delete row.face_descriptor;

  return row;
};

export const deactivateBusinessData = async (
  client,
  schemaName,
  tableName,
  id,
) => {
  const result = await client.query(
    `
        UPDATE "${schemaName}"."${tableName}"
        SET status='Inactive',
            updated_at=NOW()
        WHERE id=$1
        RETURNING *;
    `,
    [id],
  );

  return result.rows[0];
};

export const activateBusinessData = async (
  client,
  schemaName,
  tableName,
  id,
) => {
  const result = await client.query(
    `
        UPDATE "${schemaName}"."${tableName}"
        SET status='Active',
            updated_at=NOW()
        WHERE id=$1
        RETURNING *;
    `,
    [id],
  );

  return result.rows[0];
};

export const deleteBusinessData = async (client, schemaName, tableName, id) => {
  await client.query(
    `
        DELETE FROM "${schemaName}"."${tableName}"
        WHERE id=$1
    `,
    [id],
  );

  return true;
};
