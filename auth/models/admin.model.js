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
      AND table_name NOT IN ('assign_gates','campaigns','forms','campaign_blocks','form_responses')
    `,
    [schemaName],
  );

  return result.rows;
};

// export const getTableData = async (client, schemaName, tableName) => {
//   const result = await client.query(`
//     SELECT *,
//            '${schemaName}' AS organisation_schema
//     FROM "${schemaName}"."${tableName}"
//   `);

//   const filteredRows = result.rows.map(
//     ({ organisation_schema, face_descriptor, ...rest }) => {
//       if (rest.profile_photo) {
//         rest.profile_photo = `${process.env.BASE_URL}/${rest.profile_photo}`;
//       }

//       if (rest.punch_time instanceof Date) {
//         rest.punch_time = rest.punch_time.toLocaleString("en-IN", {
//           timeZone: "Asia/Kolkata",
//           year: "numeric",
//           month: "2-digit",
//           day: "2-digit",
//           hour: "2-digit",
//           minute: "2-digit",
//           second: "2-digit",
//           hour12: true,
//         });
//       }

//       return rest;
//     },
//   );

//   return filteredRows;
// };



const formatIndianDateTime = (date) => {
  if (!(date instanceof Date)) {
    return date;
  }

  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const get = (type) => {
    return parts.find((part) => part.type === type)?.value;
  };

  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}:${get("second")} ${get("dayPeriod")}`;
};

export const getTableData = async (client, schemaName, tableName) => {
  const result = await client.query(`
    SELECT *,
           '${schemaName}' AS organisation_schema
    FROM "${schemaName}"."${tableName}"
  `);

  const filteredRows = result.rows.map(
    ({ organisation_schema, face_descriptor, ...rest }) => {
      // Format profile photo URL
      if (rest.profile_photo) {
        rest.profile_photo = `${process.env.BASE_URL}/${rest.profile_photo}`;
      }

      // Format punch_time as DD/MM/YYYY HH:MM:SS AM/PM
      if (rest.punch_time instanceof Date) {
        rest.punch_time = formatIndianDateTime(rest.punch_time);
      }

      // Format created_at
      if (rest.created_at instanceof Date) {
        rest.created_at = formatIndianDateTime(rest.created_at);
      }

      // Format updated_at
      if (rest.updated_at instanceof Date) {
        rest.updated_at = formatIndianDateTime(rest.updated_at);
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
  const { created_at, updated_at, ...updateData } = data;

  const keys = Object.keys(updateData);

  if (keys.length === 0) {
    return null;
  }

  const setClause = keys
    .map((key, index) => `"${key}" = $${index + 1}`)
    .join(", ");

  const values = keys.map((key) => updateData[key]);

  values.push(id);

  const query = `
    UPDATE "${schemaName}"."${tableName}"
    SET
      ${setClause},
      updated_at = CURRENT_TIMESTAMP
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

  // delete row.face_descriptor;

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

// user

export const createUser = async (client, organisationId, user) => {
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
      $6,
      true,
      $7,
      NOW() + INTERVAL '24 hours'
    )
    RETURNING
      id,
      first_name,
      last_name,
      email,
      phone,
      role,
      is_active,
      invitation_token,
      invitation_expires_at;
    `,
    [
      organisationId,
      user.first_name,
      user.last_name,
      user.email,
      user.phone,
      user.role,
      token,
    ],
  );

  return result.rows[0];
};

export const deleteUserById = async (client, organisationId, userId) => {
  const result = await client.query(
    `
    DELETE FROM auth.users
    WHERE id = $1
      AND organisation_id = $2
    RETURNING id;
    `,
    [userId, organisationId],
  );

  return result.rows[0];
};

export const updateUserStatus = async (
  client,
  organisationId,
  userId,
  isActive,
) => {
  const result = await client.query(
    `
    UPDATE auth.users
    SET
      is_active = $1,
      updated_at = NOW()
    WHERE id = $2
      AND organisation_id = $3
    RETURNING
      id,
      first_name,
      last_name,
      email,
      phone,
      role,
      is_active;
    `,
    [isActive, userId, organisationId],
  );

  return result.rows[0] || null;
};