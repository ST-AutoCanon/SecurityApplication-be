/*
|--------------------------------------------------------------------------
| CREATE ANNOUNCEMENT
|--------------------------------------------------------------------------
*/

export const createAnnouncement = async (
  client,
  schemaName,
  organisationId,
  title,
  message,
  priority,
  createdBy,
  starts_at,
  expiresAt
) => {
  console.log(
    "Creating announcement in:",
    schemaName
  );

  const query = `
    INSERT INTO "${schemaName}".announcements (
      organisation_id,
      title,
      message,
      priority,
      created_by,
      starts_at,
      expires_at
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7
    )
    RETURNING
      id,
      organisation_id,
      title,
      message,
      priority,
      created_by,
      created_at,
      starts_at,
      expires_at,
      is_active
  `;

  const values = [
    organisationId,
    title,
    message,
    priority,
    createdBy,
    starts_at || null,
    expiresAt || null,
  ];

  console.log(
    "Announcement values:",
    values
  );

  const result = await client.query(
    query,
    values
  );

  console.log(
    "Inserted announcement:",
    result.rows[0]
  );

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| GET ANNOUNCEMENTS
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| GET ANNOUNCEMENTS
|--------------------------------------------------------------------------
*/

export const getAnnouncements = async (
  client,
  schemaName,
  organisationId
) => {
  console.log(
    "Fetching ADMIN announcements from:",
    schemaName
  );

  const query = `
    SELECT
      id,
      organisation_id,
      title,
      message,
      priority,
      created_by,
      created_at,
      starts_at,
      expires_at,
      is_active
    FROM "${schemaName}".announcements
    WHERE organisation_id = $1
      AND is_active = TRUE
    ORDER BY created_at DESC
  `;

  const result = await client.query(
    query,
    [organisationId]
  );

  console.log(
    "Admin announcements fetched:",
    result.rows.length
  );

  console.log(
    "Announcement data:",
    result.rows
  );

  return result.rows;
};
// export const getAnnouncements = async (
//   client,
//   schemaName,
//   organisationId
// ) => {
//   console.log(
//     "Fetching announcements from:",
//     schemaName
//   );

//   const query = `
//     SELECT
//       id,
//       organisation_id,
//       title,
//       message,
//       priority,
//       created_by,
//       created_at,
//       starts_at,
//       expires_at,
//       is_active
//     FROM "${schemaName}".announcements
//     WHERE organisation_id = $1
//       AND is_active = TRUE

//       /*
//       |--------------------------------------------------------------------------
//       | START DATE
//       |--------------------------------------------------------------------------
//       | Announcement should NOT be visible before starts_at.
//       |
//       | If starts_at is NULL:
//       |   It is considered immediately active.
//       |
//       | If starts_at is today or earlier:
//       |   It is visible.
//       |
//       | If starts_at is in the future:
//       |   It is hidden.
//       |--------------------------------------------------------------------------
//       */
//       AND (
//         starts_at IS NULL
//         OR starts_at <= CURRENT_DATE
//       )

//       /*
//       |--------------------------------------------------------------------------
//       | EXPIRY DATE
//       |--------------------------------------------------------------------------
//       | Announcement remains visible on the expiry date.
//       |
//       | Example:
//       | starts_at  = 2026-10-06
//       | expires_at = 2026-10-10
//       |
//       | Visible:
//       | 6th, 7th, 8th, 9th, 10th
//       |
//       | Hidden from:
//       | 11th October
//       |--------------------------------------------------------------------------
//       */
//       AND (
//         expires_at IS NULL
//         OR expires_at >= CURRENT_DATE
//       )

//     ORDER BY created_at DESC
//   `;

//   const result = await client.query(
//     query,
//     [organisationId]
//   );

//   console.log(
//     "Announcements fetched:",
//     result.rows.length
//   );

//   console.log(
//     "Announcement data:",
//     result.rows
//   );

//   return result.rows;
// };
// export const getAnnouncements = async (
//   client,
//   schemaName,
//   organisationId,
//   isAdmin = false
// ) => {
//   console.log(
//     "Fetching announcements:",
//     schemaName
//   );

//   console.log(
//     "Admin request:",
//     isAdmin
//   );

//   let query;

//   if (isAdmin) {
//     /*
//     |--------------------------------------------------------------------------
//     | ADMIN
//     |--------------------------------------------------------------------------
//     | Show all active announcements.
//     |
//     | Future announcements are INCLUDED.
//     | Expired announcements are also retained if still active.
//     |--------------------------------------------------------------------------
//     */

//     query = `
//       SELECT
//         id,
//         organisation_id,
//         title,
//         message,
//         priority,
//         created_by,
//         created_at,
//         starts_at,
//         expires_at,
//         is_active
//       FROM "${schemaName}".announcements
//       WHERE organisation_id = $1
//         AND is_active = TRUE
//       ORDER BY created_at DESC
//     `;
//   } else {
//     /*
//     |--------------------------------------------------------------------------
//     | USER
//     |--------------------------------------------------------------------------
//     | Show only currently valid announcements.
//     |--------------------------------------------------------------------------
//     */

//     query = `
//       SELECT
//         id,
//         organisation_id,
//         title,
//         message,
//         priority,
//         created_by,
//         created_at,
//         starts_at,
//         expires_at,
//         is_active
//       FROM "${schemaName}".announcements
//       WHERE organisation_id = $1
//         AND is_active = TRUE

//         AND (
//           starts_at IS NULL
//           OR starts_at <= CURRENT_DATE
//         )

//         AND (
//           expires_at IS NULL
//           OR expires_at >= CURRENT_DATE
//         )

//       ORDER BY created_at DESC
//     `;
//   }

//   const result = await client.query(
//     query,
//     [organisationId]
//   );

//   console.log(
//     "Announcements fetched:",
//     result.rows
//   );

//   return result.rows;
// };

/*
|--------------------------------------------------------------------------
| DELETE ANNOUNCEMENT
|--------------------------------------------------------------------------
*/

export const deleteAnnouncement = async (
  client,
  schemaName,
  organisationId,
  announcementId
) => {
  console.log(
    "Deleting announcement from:",
    schemaName
  );

  const query = `
    UPDATE "${schemaName}".announcements
    SET is_active = FALSE
    WHERE id = $1
      AND organisation_id = $2
    RETURNING
      id,
      is_active
  `;

  const result = await client.query(
    query,
    [
      announcementId,
      organisationId,
    ]
  );

  return result.rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| UPDATE ANNOUNCEMENT
|--------------------------------------------------------------------------
*/

export const updateAnnouncement = async (
  client,
  schemaName,
  organisationId,
  id,
  title,
  message,
  priority,
  starts_at,
  expiresAt
) => {
  console.log(
    "Updating announcement:",
    id
  );

  const query = `
    UPDATE "${schemaName}".announcements
    SET
      title = $1,
      message = $2,
      priority = $3,
      starts_at = $4,
      expires_at = $5
    WHERE id = $6
      AND organisation_id = $7
      AND is_active = TRUE
    RETURNING
      id,
      organisation_id,
      title,
      message,
      priority,
      created_by,
      created_at,
      starts_at,
      expires_at,
      is_active
  `;

  const values = [
    title,
    message,
    priority,
    starts_at || null,
    expiresAt || null,
    id,
    organisationId,
  ];

  console.log(
    "Updated announcement values:",
    values
  );

  const result = await client.query(
    query,
    values
  );

  console.log(
    "Updated announcement:",
    result.rows[0]
  );

  return result.rows[0] || null;
};