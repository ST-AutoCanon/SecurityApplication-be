export const getRecentVisitors = async (
  client,
  schemaName,
  search = "",
  purpose = "",
  period = "daily",
  userId = null
) => {
  // ============================================================
  // 1. DATE FILTER
  // ============================================================

  let dateCondition = "";

  switch (period) {
    case "weekly":
      dateCondition = `
        punch_time >= DATE_TRUNC('week', CURRENT_DATE)
        AND punch_time < CURRENT_DATE + INTERVAL '1 day'
      `;
      break;

    case "monthly":
      dateCondition = `
        punch_time >= DATE_TRUNC('month', CURRENT_DATE)
        AND punch_time < CURRENT_DATE + INTERVAL '1 day'
      `;
      break;

    case "daily":
    default:
      dateCondition = `
        punch_time >= CURRENT_DATE
        AND punch_time < CURRENT_DATE + INTERVAL '1 day'
      `;
      break;
  }

  // ============================================================
  // 2. NORMALIZE PURPOSE
  // ============================================================

  const normalizedPurpose = String(purpose || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  // ============================================================
  // 3. QUERY
  // ============================================================

  const query = `
    WITH filtered_logs AS (

      SELECT
        user_id,
        full_name,
        table_name,
        punch_type,
        punch_time

      FROM "${schemaName}".punch_logs

      WHERE
        ${dateCondition}

        AND punch_time IS NOT NULL
        AND user_id IS NOT NULL

        -- ======================================================
        -- USER FILTER
        --
        -- If userId is supplied, only that user's records are
        -- returned.
        --
        -- If userId is NULL, all users are returned.
        -- This keeps the same model usable by admin dashboard.
        -- ======================================================

        AND (
          $3::integer IS NULL
          OR user_id = $3::integer
        )

        -- ======================================================
        -- SEARCH
        -- ======================================================

        AND (
          $1 = ''
          OR LOWER(full_name) LIKE LOWER('%' || $1 || '%')
          OR LOWER(table_name) LIKE LOWER('%' || $1 || '%')
        )

        -- ======================================================
        -- PURPOSE
        -- ======================================================

        AND (
          $2 = ''
          OR REGEXP_REPLACE(
               REGEXP_REPLACE(
                 LOWER(TRIM(table_name)),
                 '[^a-z0-9]+',
                 '_',
                 'g'
               ),
               '^_+|_+$',
               '',
               'g'
             ) = $2
        )
    ),

    visits AS (

      SELECT
        i.user_id,
        i.full_name,
        i.table_name,

        DATE(i.punch_time) AS visit_date,

        i.punch_time AS time_in,

        (
          SELECT MIN(o.punch_time)

          FROM "${schemaName}".punch_logs o

          WHERE
            o.user_id = i.user_id

            -- Same category
            AND REGEXP_REPLACE(
                  REGEXP_REPLACE(
                    LOWER(TRIM(o.table_name)),
                    '[^a-z0-9]+',
                    '_',
                    'g'
                  ),
                  '^_+|_+$',
                  '',
                  'g'
                )
                =
                REGEXP_REPLACE(
                  REGEXP_REPLACE(
                    LOWER(TRIM(i.table_name)),
                    '[^a-z0-9]+',
                    '_',
                    'g'
                  ),
                  '^_+|_+$',
                  '',
                  'g'
                )

            AND UPPER(TRIM(o.punch_type)) = 'OUT'

            AND o.punch_time > i.punch_time

            -- Do not use an OUT after another IN
            AND NOT EXISTS (

              SELECT 1

              FROM "${schemaName}".punch_logs next_in

              WHERE
                next_in.user_id = i.user_id

                AND REGEXP_REPLACE(
                      REGEXP_REPLACE(
                        LOWER(TRIM(next_in.table_name)),
                        '[^a-z0-9]+',
                        '_',
                        'g'
                      ),
                      '^_+|_+$',
                      '',
                      'g'
                    )
                    =
                    REGEXP_REPLACE(
                      REGEXP_REPLACE(
                        LOWER(TRIM(i.table_name)),
                        '[^a-z0-9]+',
                        '_',
                        'g'
                      ),
                      '^_+|_+$',
                      '',
                      'g'
                    )

                AND UPPER(TRIM(next_in.punch_type)) = 'IN'

                AND next_in.punch_time > i.punch_time

                AND next_in.punch_time < o.punch_time
            )
        ) AS time_out

      FROM filtered_logs i

      WHERE
        UPPER(TRIM(i.punch_type)) = 'IN'
    )

    SELECT
      user_id,
      full_name,
      table_name,
      visit_date,
      time_in,
      time_out

    FROM visits

    ORDER BY
      visit_date DESC,
      time_in DESC;
  `;

  // ============================================================
  // DEBUG
  // ============================================================

  console.log("========================================");
  console.log("RECENT VISITORS");
  console.log("Schema:", schemaName);
  console.log("Period:", period);
  console.log("Search:", search);
  console.log("Original Purpose:", purpose);
  console.log("Normalized Purpose:", normalizedPurpose);
  console.log("User ID:", userId);
  console.log("========================================");

  // ============================================================
  // EXECUTE
  // ============================================================

  const result = await client.query(query, [
    String(search || "").trim(),
    normalizedPurpose,
    userId ? Number(userId) : null,
  ]);

  console.log("Recent Visitors Result:", result.rows);
  console.log("Recent Visitors Count:", result.rows.length);

  return result.rows;
};

export const getOrganisationSchema = async (
  client,
  organisationId
) => {
  const result = await client.query(
    `
      SELECT schema_name
      FROM auth.organisations
      WHERE id = $1
      LIMIT 1
    `,
    [organisationId]
  );

  return result.rows[0] || null;
};


export const getUserFlatDetails = async (
  client,
  schemaName,
  userId
) => {
  const result = await client.query(
    `
      SELECT
        id,
        security_user_id,
        apartment_name,
        block_tower,
        floor_number,
        flat_number,
        ownership_type,
        member_type,
        family_member_count
      FROM "${schemaName}"."apartment_member"
      WHERE security_user_id = $1
        AND status = true
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
};


export const getFlatMemberCount = async (
  client,
  schemaName,
  blockTower,
  floorNumber,
  flatNumber
) => {
  const result = await client.query(
    `
      SELECT COUNT(*)::int AS count
      FROM "${schemaName}"."apartment_member"
      WHERE block_tower = $1
        AND floor_number = $2
        AND flat_number = $3
        AND status = true
        AND member_type = 'RESIDENT'
    `,
    [
      blockTower,
      floorNumber,
      flatNumber,
    ]
  );

  return result.rows[0]?.count || 0;
};


export const getFlatVehicleCount = async (
  client,
  schemaName,
  memberId
) => {
  const result = await client.query(
    `
      SELECT COUNT(*)::int AS count
      FROM "${schemaName}"."apartment_member_vehicle"
      WHERE member_id = $1
    `,
    [memberId]
  );

  return result.rows[0]?.count || 0;
};


export const getPendingRequestCount = async (
  client,
  schemaName,
  userId
) => {
  const result = await client.query(
    `
      SELECT COUNT(*)::int AS count
      FROM "${schemaName}"."quick_request_responses"
      WHERE requested_by = $1
        AND LOWER(status) = 'pending'
    `,
    [userId]
  );

  return result.rows[0]?.count || 0;
};


export const getUserDashboardSummary = async (
  client,
  schemaName,
  userId
) => {
  /*
   * ----------------------------------------------------------
   * Logged-in resident
   * ----------------------------------------------------------
   */

  const flat =
    await getUserFlatDetails(
      client,
      schemaName,
      userId
    );

  if (!flat) {
    return null;
  }

  /*
   * ----------------------------------------------------------
   * Members
   * ----------------------------------------------------------
   */

  const memberCount =
    await getFlatMemberCount(
      client,
      schemaName,
      flat.block_tower,
      flat.floor_number,
      flat.flat_number
    );

  /*
   * ----------------------------------------------------------
   * Vehicles
   * ----------------------------------------------------------
   */

  const vehicleCount =
    await getFlatVehicleCount(
      client,
      schemaName,
      flat.id
    );

  /*
   * ----------------------------------------------------------
   * Pending requests
   * ----------------------------------------------------------
   */

  const pendingRequestCount =
    await getPendingRequestCount(
      client,
      schemaName,
      userId
    );

  /*
   * ----------------------------------------------------------
   * Response
   * ----------------------------------------------------------
   */

  return {
    flat: {
      apartmentName:
        flat.apartment_name,

      blockTower:
        flat.block_tower,

      floorNumber:
        flat.floor_number,

      flatNumber:
        flat.flat_number,

      ownershipType:
        flat.ownership_type,
    },

    vehicles:
      vehicleCount,

    members:
      memberCount,

    pendingRequests:
      pendingRequestCount,
  };
};

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

  const result = await client.query(
    query,
    values
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| ADMIN - GET ANNOUNCEMENTS
|--------------------------------------------------------------------------
*/

export const getAnnouncements = async (
  client,
  schemaName,
  organisationId
) => {
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

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| USER - GET ANNOUNCEMENTS
|--------------------------------------------------------------------------
|
| Users see announcements published for their organisation.
|
*/

export const getUserAnnouncements = async (
  client,
  schemaName,
  organisationId
) => {
  console.log(
    "Fetching user announcements from:",
    schemaName
  );

  const query = `
    SELECT
      id,
      title,
      message,
      priority,
      created_at,
      expires_at
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
    "User announcements:",
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