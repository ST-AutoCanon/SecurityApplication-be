
// ============================================================
// VECTOR HELPER
// ============================================================

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

// ============================================================
// GET ALL REGISTERED FACE VECTORS
//
// Face vectors are stored ONLY in:
//     <schema>.face_details
//
// One record can have multiple face vectors.
// Example:
//
// service_provider / record_id 2
//      vector 1
//      vector 2
//      vector 3
//      vector 4
//      vector 5
// ============================================================

export const getAllRegisteredFaces = async (
  db,
  schema,
) => {
  const query = `
    SELECT
      id,
      table_name,
      record_id,
      face_descriptor
    FROM "${schema}".face_details
    WHERE face_descriptor IS NOT NULL
    ORDER BY id;
  `;

  const result = await db.query(query);

  return result.rows.map((row) => ({
    id: row.id,
    table_name: row.table_name,
    record_id: row.record_id,
    face_descriptor: fromVector(
      row.face_descriptor,
    ),
  }));
};

// ============================================================
// GET LAST PUNCH OF TODAY
// ============================================================

export const getLastPunch = async (
  db,
  schema,
  userId,
) => {
  const query = `
    SELECT
      punch_type
    FROM "${schema}".punch_logs
    WHERE user_id = $1
      AND DATE(punch_time) = CURRENT_DATE
    ORDER BY punch_time DESC
    LIMIT 1;
  `;

  console.time("GET LAST PUNCH");

  const result = await db.query(
    query,
    [userId],
  );

  console.timeEnd("GET LAST PUNCH");

  return result.rows[0] || null;
};

// ============================================================
// INSERT PUNCH LOG
// ============================================================

// export const insertPunchLog = async (
//   db,
//   schema,
//   data,
// ) => {
//   const query = `
//     INSERT INTO "${schema}".punch_logs
//     (
//       table_name,
//       user_id,
//       full_name,
//       distance,
//       punch_type
//     )
//     VALUES ($1, $2, $3, $4, $5)
//     RETURNING *;
//   `;

//   const values = [
//     data.table_name,
//     data.user_id,
//     data.full_name,
//     data.distance,
//     data.punch_type,
//   ];

//   const result = await db.query(
//     query,
//     values,
//   );

//   return result.rows[0];
// };

// ============================================================
// INSERT PUNCH LOG
// ============================================================

export const insertPunchLog = async (db, schema, data) => {
  const query = `
    INSERT INTO "${schema}".punch_logs
    (
      table_name,
      user_id,
      full_name,
      distance,
      punch_type,
      apartment_number,
      vehicle_number,
      gate_name
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    data.table_name,
    data.user_id,
    data.full_name,
    data.distance,
    data.punch_type,
    data.apartment_number,
    data.vehicle_number,
    data.gate_name,
  ];

  const result = await db.query(query, values);

  return result.rows[0];
};

// ============================================================
// SEARCH NEAREST FACE
//
// IMPORTANT:
// Face recognition searches ONLY face_details.
//
// It does NOT search:
//     service_provider.face_descriptor
//
// face_details contains:
//     table_name
//     record_id
//     face_descriptor
//
// The closest vector is returned.
// ============================================================

export const searchNearestFace = async (
  db,
  schema,
  descriptor,
) => {
  // ----------------------------------------------------------
  // Validate descriptor
  // ----------------------------------------------------------

  if (!Array.isArray(descriptor)) {
    throw new Error(
      "Descriptor must be an array",
    );
  }

  if (descriptor.length !== 512) {
    throw new Error(
      `Descriptor must contain 512 dimensions. Received ${descriptor.length}.`,
    );
  }

  // ----------------------------------------------------------
  // Validate numeric values
  // ----------------------------------------------------------

  const invalidValue = descriptor.some(
    (value) =>
      typeof value !== "number" ||
      !Number.isFinite(value),
  );

  if (invalidValue) {
    throw new Error(
      "Descriptor contains invalid values",
    );
  }

  // ----------------------------------------------------------
  // Convert array to pgvector format
  // ----------------------------------------------------------

  const vector = `[${descriptor.join(",")}]`;

  // ----------------------------------------------------------
  // Search nearest vector
  // ----------------------------------------------------------

  const query = `
    SELECT
      fd.table_name,
      fd.record_id,
      fd.face_descriptor <-> $1::vector AS distance
    FROM "${schema}".face_details fd
    WHERE fd.face_descriptor IS NOT NULL
    ORDER BY
      fd.face_descriptor <-> $1::vector
    LIMIT 1;
  `;

  console.log("POOL:", {
    total: db.totalCount,
    idle: db.idleCount,
    waiting: db.waitingCount,
  });

  console.time("DB FACE SEARCH");

  const result = await db.query(
    query,
    [vector],
  );

  console.timeEnd("DB FACE SEARCH");

  const match =
    result.rows[0] || null;

  console.log(
    "Nearest Face Match:",
    match,
  );

  return match;
};

// ============================================================
// GET USER BY FACE RECORD
//
// After face_details gives us:
//
// table_name = service_provider
// record_id  = 2
//
// This function fetches:
//
// service_provider WHERE id = 2
// ============================================================

export const getUserByFaceRecord = async (
  db,
  schema,
  tableName,
  recordId,
) => {
  const query = `
    SELECT *
    FROM "${schema}"."${tableName}"
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await db.query(
    query,
    [recordId],
  );

  return result.rows[0] || null;
};

// ============================================================
// GET USER BY TABLE & ID
// ============================================================

export const getUserById = async (
  db,
  schema,
  tableName,
  userId,
) => {
  const query = `
    SELECT *
    FROM "${schema}"."${tableName}"
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await db.query(
    query,
    [userId],
  );

  return result.rows[0] || null;
};