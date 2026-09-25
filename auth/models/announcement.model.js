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
      expires_at
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      organisation_id,
      title,
      message,
      priority,
      created_by,
      created_at,
      expires_at,
      is_active
  `;

  const values = [
    organisationId,
    title,
    message,
    priority,
    createdBy,
    expiresAt,
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

export const getAnnouncements = async (
  client,
  schemaName,
  organisationId
) => {
  console.log(
    "Fetching announcements from:",
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
      expires_at,
      is_active
    FROM "${schemaName}".announcements
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
    "Announcements fetched:",
    result.rows.length
  );

  return result.rows;
};

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
    RETURNING id
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
export const updateAnnouncement = async (
  client,
  schemaName,
  organisationId,
  id,
  title,
  message,
  priority,
  expiresAt
) => {
  const query = `
    UPDATE "${schemaName}".announcements
    SET
      title = $1,
      message = $2,
      priority = $3,
      expires_at = $4
    WHERE id = $5
      AND organisation_id = $6
      AND is_active = TRUE
    RETURNING
      id,
      organisation_id,
      title,
      message,
      priority,
      created_by,
      created_at,
      expires_at,
      is_active
  `;

  const values = [
    title,
    message,
    priority,
    expiresAt || null,
    id,
    organisationId,
  ];

  const result = await client.query(query, values);

  return result.rows[0] || null;
};
