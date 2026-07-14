/**
 * GET TABLES THAT HAVE FACE DESCRIPTOR
 */
export const getTablesWithFaceDescriptor = async (db, schema) => {
  const query = `
    SELECT DISTINCT table_name
    FROM information_schema.columns
    WHERE table_schema = $1
      AND column_name = 'face_descriptor';
  `;

  const result = await db.query(query, [schema]);

  return result.rows.map((r) => r.table_name);
};

/**
 * GET FACES FROM TABLE
 */
export const getFaceDescriptorsFromTable = async (db, schema, table) => {
  const colRes = await db.query(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = $1
      AND table_name = $2;
    `,
    [schema, table]
  );

  const columns = colRes.rows.map((r) => r.column_name);

  const selectFields = ["id", "face_descriptor"];

  if (columns.includes("full_name")) {
    selectFields.push("full_name");
  }

  if (columns.includes("photo")) {
    selectFields.push("photo");
  } else if (columns.includes("profile_photo")) {
    selectFields.push("profile_photo");
  }

  const query = `
    SELECT ${selectFields.join(", ")}
    FROM "${schema}"."${table}"
    WHERE face_descriptor IS NOT NULL;
  `;

  const result = await db.query(query);

  return result.rows;
};

/**
 * GET LAST PUNCH OF TODAY
 */
export const getLastPunch = async (db, schema, userId) => {
  const query = `
    SELECT punch_type
    FROM "${schema}".punch_logs
    WHERE user_id = $1
      AND DATE(punch_time) = CURRENT_DATE
    ORDER BY punch_time DESC
    LIMIT 1;
  `;

  const result = await db.query(query, [userId]);

  return result.rows[0] || null;
};

/**
 * INSERT PUNCH LOG
 */
export const insertPunchLog = async (db, schema, data) => {
  
  const query = `
INSERT INTO "${schema}".punch_logs
(
  table_name,
  user_id,
  full_name,
  distance,
  punch_type
)
VALUES ($1,$2,$3,$4,$5)
    RETURNING *;
  `;

  const values = [
    data.table_name,
    data.user_id,
    data.full_name,
    data.distance,
    data.punch_type

  ];

  const result = await db.query(query, values);

  return result.rows[0];
};
