// import {
//   masterAuthDB,
// } from "../../db/dbRouter.js";
import masterAuthDB from "../../config/masterAuthDB.js";
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
/*
|--------------------------------------------------------------------------
| CREATE IMPORTANT INFORMATION
|--------------------------------------------------------------------------
*/

export const createImportantInformation = async (
  client,
  schemaName,
  organisationId,
  title,
  description,
  priority,
  createdBy,
  expiresAt
) => {
  console.log(
    "Creating important information in:",
    schemaName
  );

  const query = `
    INSERT INTO "${schemaName}".important_information (
      organisation_id,
      title,
      description,
      priority,
      created_by,
      expires_at
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      organisation_id,
      title,
      description,
      priority,
      created_by,
      created_at,
      expires_at,
      is_active
  `;

  const values = [
    organisationId,
    title,
    description,
    priority,
    createdBy,
    expiresAt,
  ];

  console.log(
    "Important information values:",
    values
  );

  const result = await client.query(
    query,
    values
  );

  console.log(
    "Inserted important information:",
    result.rows[0]
  );

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| GET ADMIN IMPORTANT INFORMATION
|--------------------------------------------------------------------------
*/

// export const getAdminImportantInformation = async (
//   client,
//   schemaName,
//   organisationId
// ) => {
//   console.log(
//     "Fetching important information from:",
//     schemaName
//   );

//   const query = `
//     SELECT
//       id,
//       organisation_id,
//       title,
//       description,
//       priority,
//       created_by,
//       created_at,
//       expires_at,
//       is_active
//     FROM "${schemaName}".important_information
//     WHERE organisation_id = $1
//     ORDER BY created_at DESC
//   `;

//   const result = await client.query(
//     query,
//     [organisationId]
//   );

//   console.log(
//     "Important information found:",
//     result.rows.length
//   );

//   return result.rows;
// };

export const getAdminImportantInformation = async (
  client,
  schemaName,
  organisationId
) => {
  console.log(
    "Fetching active important information from:",
    schemaName
  );

  const query = `
    SELECT
      id,
      organisation_id,
      title,
      description,
      priority,
      created_by,
      created_at,
      expires_at,
      is_active
    FROM "${schemaName}".important_information
    WHERE organisation_id = $1
      AND is_active = TRUE
    ORDER BY created_at DESC
  `;

  const result = await client.query(
    query,
    [organisationId]
  );

  console.log(
    "Active important information found:",
    result.rows.length
  );

  return result.rows;
};


/*
|--------------------------------------------------------------------------
| GET USER IMPORTANT INFORMATION
|--------------------------------------------------------------------------
*/

export const getUserImportantInformation = async (
  client,
  schemaName,
  organisationId
) => {
  console.log(
    "Fetching user important information from:",
    schemaName
  );

  const query = `
    SELECT
      id,
      organisation_id,
      title,
      description,
      priority,
      created_at,
      expires_at,
      is_active
    FROM "${schemaName}".important_information
    WHERE organisation_id = $1
      AND is_active = TRUE
      AND (
        expires_at IS NULL
        OR expires_at >= CURRENT_DATE
      )
    ORDER BY created_at DESC
  `;

  const result = await client.query(
    query,
    [organisationId]
  );

  console.log(
    "User important information found:",
    result.rows.length
  );

  return result.rows;
};


/*
|--------------------------------------------------------------------------
| UPDATE IMPORTANT INFORMATION
|--------------------------------------------------------------------------
*/

export const updateImportantInformation = async (
  client,
  schemaName,
  organisationId,
  informationId,
  title,
  description,
  priority,
  expiresAt
) => {
  console.log(
    "Updating important information in:",
    schemaName
  );

  const query = `
    UPDATE "${schemaName}".important_information
    SET
      title = $1,
      description = $2,
      priority = $3,
      expires_at = $4
    WHERE id = $5
      AND organisation_id = $6
    RETURNING
      id,
      organisation_id,
      title,
      description,
      priority,
      created_by,
      created_at,
      expires_at,
      is_active
  `;

  const values = [
    title,
    description,
    priority,
    expiresAt,
    informationId,
    organisationId,
  ];

  const result = await client.query(
    query,
    values
  );

  return result.rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| DELETE IMPORTANT INFORMATION
|--------------------------------------------------------------------------
*/

export const deleteImportantInformation = async (
  client,
  schemaName,
  organisationId,
  informationId
) => {
  console.log(
    "Deleting important information from:",
    schemaName
  );

  const query = `
    UPDATE "${schemaName}".important_information
    SET is_active = FALSE
    WHERE id = $1
      AND organisation_id = $2
    RETURNING id
  `;

  const result = await client.query(
    query,
    [
      informationId,
      organisationId,
    ]
  );

  return result.rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| TOGGLE IMPORTANT INFORMATION
|--------------------------------------------------------------------------
*/

export const toggleImportantInformation = async (
  client,
  schemaName,
  organisationId,
  informationId
) => {
  console.log(
    "Toggling important information:",
    schemaName
  );

  const query = `
    UPDATE "${schemaName}".important_information
    SET is_active = NOT is_active
    WHERE id = $1
      AND organisation_id = $2
    RETURNING
      id,
      title,
      description,
      priority,
      is_active,
      updated_at
  `;

  const result = await client.query(
    query,
    [
      informationId,
      organisationId,
    ]
  );

  return result.rows[0] || null;
};

