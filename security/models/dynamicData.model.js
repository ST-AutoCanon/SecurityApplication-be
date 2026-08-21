// ============================================================
// VECTOR HELPERS
// ============================================================

const toVector = (value) => {
  if (!Array.isArray(value)) {
    return value;
  }

  return `[${value.join(",")}]`;
};

const fromVector = (vector) => {
  if (!vector) {
    return vector;
  }

  if (typeof vector === "string") {
    return vector
      .replace("[", "")
      .replace("]", "")
      .split(",")
      .map(Number);
  }

  return vector;
};




// ============================================================
// INSERT DYNAMIC RECORD
//
// face_descriptor is stored separately in face_details.
//
// If there are no dynamic fields, PostgreSQL will use
// DEFAULT VALUES. This allows records that only have
// face descriptors.
// ============================================================

export const insertDynamicRecord = async (
  db,
  schema,
  table,
  data = {},
) => {
  // ----------------------------------------------------------
  // Remove face_descriptor
  // It is stored in face_details, not the dynamic table.
  // ----------------------------------------------------------

  const dynamicData = {
    ...data,
  };

  delete dynamicData.face_descriptor;

  const keys = Object.keys(dynamicData);

  // ----------------------------------------------------------
  // CASE 1: No dynamic fields
  // ----------------------------------------------------------

  if (keys.length === 0) {
    const query = `
      INSERT INTO "${schema}"."${table}"
      DEFAULT VALUES
      RETURNING *;
    `;

    const result = await db.query(query);

    return result.rows[0];
  }

  // ----------------------------------------------------------
  // CASE 2: Dynamic fields exist
  // ----------------------------------------------------------

  const values = Object.values(dynamicData);

  const columns = keys
    .map((key) => `"${key}"`)
    .join(", ");

  const placeholders = keys
    .map((_, index) => `$${index + 1}`)
    .join(", ");

  const query = `
    INSERT INTO "${schema}"."${table}"
      (${columns})
    VALUES
      (${placeholders})
    RETURNING *;
  `;

  const result = await db.query(
    query,
    values,
  );

  return result.rows[0];
};


// ============================================================
// GET ALL RECORDS
//
// Face descriptors are retrieved from face_details.
// ============================================================

export const getAllRecords = async (
  db,
  schema,
  table,
) => {
  const query = `
    SELECT *
    FROM "${schema}"."${table}"
    ORDER BY id DESC;
  `;

  const result = await db.query(query);

  const records = result.rows;

  if (records.length === 0) {
    return [];
  }

  // Get all face vectors for these records
  const recordIds = records.map(
    (record) => record.id,
  );

  const faceQuery = `
    SELECT
      record_id,
      id,
      face_descriptor
    FROM "${schema}".face_details
    WHERE table_name = $1
      AND record_id = ANY($2::int[])
    ORDER BY record_id, id;
  `;

  const faceResult = await db.query(
    faceQuery,
    [
      table,
      recordIds,
    ],
  );

  // Group face vectors by record
  const faceMap = {};

  for (const row of faceResult.rows) {
    if (!faceMap[row.record_id]) {
      faceMap[row.record_id] = [];
    }

    faceMap[row.record_id].push(
      fromVector(row.face_descriptor),
    );
  }

  // Attach face descriptors to records
  return records.map((record) => ({
    ...record,
    face_descriptor:
      faceMap[record.id] || [],
  }));
};

// ============================================================
// GET RECORD BY ID
// ============================================================

export const getRecordById = async (
  db,
  schema,
  table,
  id,
) => {
  const query = `
    SELECT *
    FROM "${schema}"."${table}"
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await db.query(
    query,
    [id],
  );

  const record = result.rows[0];

  if (!record) {
    return null;
  }

  // Get face vectors
  const faceQuery = `
    SELECT
      id,
      face_descriptor
    FROM "${schema}".face_details
    WHERE table_name = $1
      AND record_id = $2
    ORDER BY id;
  `;

  const faceResult = await db.query(
    faceQuery,
    [
      table,
      id,
    ],
  );
  console.log("FACE DETAILS RESULT:", faceResult.rows);
  
  return {
    ...record,
    face_descriptor:
      faceResult.rows.map((row) =>
        fromVector(row.face_descriptor),
      ),
  };
};

// ============================================================
// UPDATE DYNAMIC RECORD
//
// face_descriptor is NOT updated here.
// It is handled separately by updateFaceDetails().
// ============================================================

export const updateDynamicRecord = async (
  db,
  schema,
  table,
  id,
  data,
) => {
  // Remove face_descriptor
  const dynamicData = { ...data };

  delete dynamicData.face_descriptor;

  const keys = Object.keys(dynamicData);

  // Nothing to update in dynamic table
  if (keys.length === 0) {
    return await getRecordById(
      db,
      schema,
      table,
      id,
    );
  }

  const values = Object.values(dynamicData);

  const setClause = keys
    .map(
      (key, index) =>
        `"${key}" = $${index + 1}`,
    )
    .join(", ");

  const query = `
    UPDATE "${schema}"."${table}"
    SET ${setClause}
    WHERE id = $${keys.length + 1}
    RETURNING *;
  `;

  const result = await db.query(
    query,
    [
      ...values,
      id,
    ],
  );

  return result.rows[0];
};

// ============================================================
// DELETE DYNAMIC RECORD
// ============================================================

export const deleteDynamicRecord = async (
  db,
  schema,
  table,
  id,
) => {
  const query = `
    DELETE FROM "${schema}"."${table}"
    WHERE id = $1
    RETURNING *;
  `;

  const result = await db.query(
    query,
    [id],
  );

  return result.rows[0];
};

// ============================================================
// GET TEMPLATE FIELDS
// ============================================================

export const getTemplateFields = async (
  db,
  organisationId,
  templateId,
) => {
  const query = `
    SELECT
      ft.field_key,
      ft.field_label,
      dtf.is_required,
      ft.field_type_id,
      ft.validation,
      ft.options,
      ft.placeholder,
      ft.default_value
    FROM auth.dynamic_tables dt
    JOIN auth.dynamic_table_fields dtf
      ON dt.id = dtf.dynamic_table_id
    JOIN auth.field_templates ft
      ON ft.id = dtf.field_template_id
    WHERE dt.organisation_id = $1
      AND dt.template_id = $2
    ORDER BY dtf.display_order;
  `;

  const result = await db.query(
    query,
    [
      organisationId,
      templateId,
    ],
  );

  return result.rows;
};



// ============================================================
// GET TEMPLATE
// ============================================================

export const getTemplate = async (
  db,
  organisationId,
  templateId,
) => {
  const query = `
    SELECT
      dt.template_id AS id,
      tt.template_name,
      dt.table_name,
      dt.display_name
    FROM auth.dynamic_tables dt
    JOIN auth.table_templates tt
      ON tt.id = dt.template_id
    WHERE dt.organisation_id = $1
      AND dt.template_id = $2
    LIMIT 1;
  `;

  const result = await db.query(
    query,
    [
      organisationId,
      templateId,
    ],
  );

  return result.rows[0];
};

// ============================================================
// GET MODULES
// ============================================================

export const getModules = async (
  db,
  organisationId,
) => {
  const query = `
    SELECT
      dt.template_id,
      tt.template_name,
      dt.table_name,
      dt.display_name
    FROM auth.dynamic_tables dt
    JOIN auth.table_templates tt
      ON tt.id = dt.template_id
    WHERE dt.organisation_id = $1
    ORDER BY tt.template_name;
  `;

  const result = await db.query(
    query,
    [organisationId],
  );

  return result.rows;
};

// ============================================================
// GET TEMPLATE DETAILS
// ============================================================

export const getTemplateDetails = async (
  db,
  organisationId,
  templateId,
) => {
  const query = `
    SELECT
      dt.template_id,
      tt.template_name,
      dt.table_name,
      dt.display_name
    FROM auth.dynamic_tables dt
    JOIN auth.table_templates tt
      ON tt.id = dt.template_id
    WHERE dt.organisation_id = $1
      AND dt.template_id = $2
    LIMIT 1;
  `;

  const result = await db.query(
    query,
    [
      organisationId,
      templateId,
    ],
  );

  return result.rows[0];
};

// ============================================================
// INSERT FACE DETAILS
//
// Supports:
//
// [
//   [512 values],
//   [512 values],
//   [512 values],
//   [512 values],
//   [512 values]
// ]
//
// Each vector is stored as a separate database row.
// ============================================================

export const insertFaceDetails = async (
  db,
  schema,
  tableName,
  recordId,
  faceDescriptors,
) => {
  let vectors;

  // ----------------------------------------------------------
  // New format
  // ----------------------------------------------------------

  if (
    Array.isArray(faceDescriptors) &&
    Array.isArray(faceDescriptors[0])
  ) {
    vectors = faceDescriptors;
  } else {
    // --------------------------------------------------------
    // Backward compatibility
    // --------------------------------------------------------

    vectors = [
      faceDescriptors,
    ];
  }

  // ----------------------------------------------------------
  // Validate number of vectors
  // ----------------------------------------------------------

  if (vectors.length === 0) {
    throw new Error(
      "No face vectors provided.",
    );
  }

  if (vectors.length > 5) {
    throw new Error(
      `Maximum 5 face vectors allowed, received ${vectors.length}.`,
    );
  }

  // ----------------------------------------------------------
  // Validate every vector
  // ----------------------------------------------------------

  for (
    let i = 0;
    i < vectors.length;
    i++
  ) {
    const vector = vectors[i];

    if (!Array.isArray(vector)) {
      throw new Error(
        `Face vector ${i + 1} is invalid.`,
      );
    }

    if (vector.length !== 512) {
      throw new Error(
        `Face vector ${
          i + 1
        } expected 512 dimensions, received ${vector.length}.`,
      );
    }

    const invalidValue = vector.some(
      (value) =>
        typeof value !== "number" ||
        !Number.isFinite(value),
    );

    if (invalidValue) {
      throw new Error(
        `Face vector ${
          i + 1
        } contains invalid numeric values.`,
      );
    }
  }

  // ----------------------------------------------------------
  // Insert vectors
  // ----------------------------------------------------------

  const insertedRows = [];

  for (
    let i = 0;
    i < vectors.length;
    i++
  ) {
    const query = `
      INSERT INTO "${schema}".face_details (
        table_name,
        record_id,
        face_descriptor
      )
      VALUES (
        $1,
        $2,
        $3::vector
      )
      RETURNING *;
    `;

    const result = await db.query(
      query,
      [
        tableName,
        recordId,
        toVector(vectors[i]),
      ],
    );

    insertedRows.push(
      result.rows[0],
    );
  }

  console.log(
    `Inserted ${insertedRows.length} face vectors for record ${recordId}`,
  );

  return insertedRows;
};

// ============================================================
// UPDATE FACE DETAILS
//
// Deletes existing vectors and inserts new vectors.
// ============================================================

export const updateFaceDetails = async (
  db,
  schema,
  tableName,
  recordId,
  faceDescriptors,
) => {
  // Delete existing vectors
  await db.query(
    `
      DELETE FROM "${schema}".face_details
      WHERE table_name = $1
        AND record_id = $2;
    `,
    [
      tableName,
      recordId,
    ],
  );

  // Insert new vectors
  return await insertFaceDetails(
    db,
    schema,
    tableName,
    recordId,
    faceDescriptors,
  );
};

// ============================================================
// DELETE FACE DETAILS
// ============================================================

export const deleteFaceDetails = async (
  db,
  schema,
  tableName,
  recordId,
) => {
  const query = `
    DELETE FROM "${schema}".face_details
    WHERE table_name = $1
      AND record_id = $2
    RETURNING *;
  `;

  const result = await db.query(
    query,
    [
      tableName,
      recordId,
    ],
  );

  return result.rows;
};

// ============================================================
// GET ALL FACE DETAILS
// ============================================================

export const getFaceDetails = async (
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
    ORDER BY record_id, id;
  `;

  const result = await db.query(
    query,
  );

  return result.rows.map(
    (row) => ({
      ...row,
      face_descriptor:
        fromVector(
          row.face_descriptor,
        ),
    }),
  );
};

