const fromVector = (vector) => {
  if (!vector) return vector;

  if (Array.isArray(vector)) {
    return vector;
  }

  if (typeof vector === "string") {
    return vector
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((v) => Number(v.trim()));
  }

  return vector;
};

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
// export const getFaceDescriptorsFromTable = async (db, schema, table) => {
//   const colRes = await db.query(
//     `
//     SELECT column_name
//     FROM information_schema.columns
//     WHERE table_schema = $1
//       AND table_name = $2;
//     `,
//     [schema, table],
//   );

//   const columns = colRes.rows.map((r) => r.column_name);

//   const selectFields = ["id", "face_descriptor"];

//   if (columns.includes("full_name")) {
//     selectFields.push("full_name");
//   }

//   if (columns.includes("photo")) {
//     selectFields.push("photo");
//   } else if (columns.includes("profile_photo")) {
//     selectFields.push("profile_photo");
//   }

//   const query = `
//     SELECT ${selectFields.join(", ")}
//     FROM "${schema}"."${table}"
//     WHERE face_descriptor IS NOT NULL;
//   `;

//   const result = await db.query(query);

//   return result.rows;
// };

export const getFaceDescriptorsFromTable = async (db, schema, table) => {
  const colRes = await db.query(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = $1
      AND table_name = $2;
    `,
    [schema, table],
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

  return result.rows.map((row) => ({
    ...row,
    face_descriptor: fromVector(row.face_descriptor),
  }));
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

  console.time("SQL");
  const result = await db.query(query, [userId]);

console.timeEnd("SQL");
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
    data.punch_type,
  ];

  const result = await db.query(query, values);

  return result.rows[0];
};



// export const searchNearestFace = async (db, schema, descriptor) => {
//   if (!Array.isArray(descriptor)) {
//     throw new Error("Descriptor must be an array");
//   }

//   const query = `
//     SELECT
//       fd.table_name,
//       fd.record_id,
//       fd.face_descriptor <-> $1::vector AS distance
//     FROM "${schema}".face_details fd
//     WHERE fd.face_descriptor IS NOT NULL
//     ORDER BY fd.face_descriptor <-> $1::vector
//     LIMIT 1;
//   `;

//   const vector = `[${descriptor.join(",")}]`;

//   const result = await db.query(query, [vector]);

//   return result.rows[0] || null;
// };


export const searchNearestFace = async (db, schema, descriptor) => {
  if (!Array.isArray(descriptor)) {
    throw new Error("Descriptor must be an array");
  }

  const query = `
    SELECT
      fd.table_name,
      fd.record_id,
      fd.face_descriptor <-> $1::vector AS distance
    FROM "${schema}".face_details fd
    WHERE fd.face_descriptor IS NOT NULL
    ORDER BY fd.face_descriptor <-> $1::vector
    LIMIT 1;
  `;

  const vector = `[${descriptor.join(",")}]`;

  console.log("POOL:", {
    total: db.totalCount,
    idle: db.idleCount,
    waiting: db.waitingCount,
  });

  console.time("DB QUERY ONLY");

  const result = await db.query(query, [vector]);

  console.timeEnd("DB QUERY ONLY");

  return result.rows[0] || null;
};

export const getUserByFaceRecord = async (db, schema, tableName, recordId) => {
  const query = `
    SELECT *
    FROM "${schema}"."${tableName}"
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await db.query(query, [recordId]);

  return result.rows[0] || null;
};

/**
 * GET USER BY TABLE & ID
 */
export const getUserById = async (db, schema, tableName, userId) => {
  const query = `
    SELECT *
    FROM "${schema}"."${tableName}"
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await db.query(query, [userId]);

  return result.rows[0] || null;
};