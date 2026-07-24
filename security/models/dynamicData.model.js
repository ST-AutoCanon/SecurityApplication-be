const toVector = (value) => {
  if (!Array.isArray(value)) return value;

  return `[${value.join(",")}]`;
};



const fromVector = (vector) => {
  if (!vector) return vector;

  if (typeof vector === "string") {
    return vector.replace("[", "").replace("]", "").split(",").map(Number);
  }

  return vector;
};

export const insertDynamicRecord = async (db, schema, table, data) => {
  const keys = Object.keys(data);

  const values = Object.values(data).map((value, index) => {
    if (keys[index] === "face_descriptor") {
      return toVector(value);
    }

    return value;
  });

  const columns = keys.map((k) => `"${k}"`).join(", ");

  const placeholders = keys
    .map((key, index) => {
      if (key === "face_descriptor") {
        return `$${index + 1}::vector`;
      }

      return `$${index + 1}`;
    })
    .join(", ");

  const query = `
    INSERT INTO "${schema}"."${table}"
    (${columns})
    VALUES (${placeholders})
    RETURNING *;
  `;

  const result = await db.query(query, values);

  return result.rows[0];
};

export const getAllRecords = async (db, schema, table) => {
  const query = `
 SELECT *
 FROM "${schema}"."${table}"
 ORDER BY id DESC;
 `;

  const result = await db.query(query);

  return result.rows.map((row) => {
    if (row.face_descriptor) {
      row.face_descriptor = fromVector(row.face_descriptor);
    }

    return row;
  });
};

export const getRecordById = async (db, schema, table, id) => {
  const query = `
 SELECT *
 FROM "${schema}"."${table}"
 WHERE id=$1
 LIMIT 1;
 `;

  const result = await db.query(query, [id]);

  const row = result.rows[0];

  if (row?.face_descriptor) {
    row.face_descriptor = fromVector(row.face_descriptor);
  }

  return row;
};

export const updateDynamicRecord = async (db, schema, table, id, data) => {
  const keys = Object.keys(data);

  const values = Object.values(data).map((value, index) => {
    if (keys[index] === "face_descriptor") {
      return toVector(value);
    }

    return value;
  });

  const setClause = keys
    .map((key, index) => {
      if (key === "face_descriptor") {
        return `"${key}"=$${index + 1}::vector`;
      }

      return `"${key}"=$${index + 1}`;
    })
    .join(", ");

  const query = `
    UPDATE "${schema}"."${table}"
    SET ${setClause}
    WHERE id=$${keys.length + 1}
    RETURNING *;
  `;

  const result = await db.query(query, [...values, id]);

  return result.rows[0];
};

export const deleteDynamicRecord = async (db, schema, table, id) => {
  const query = `
    DELETE FROM "${schema}"."${table}"
    WHERE id = $1
    RETURNING *;
  `;

  const result = await db.query(query, [id]);
  return result.rows[0];
};

// export const getTemplateFields = async (db, organisationId, templateId) => {
//   const query = `
//     SELECT
//       ft.field_key,
//       ft.field_label,
//       dtf.is_required,
//       ft.field_type_id
//     FROM auth.dynamic_tables dt
//     JOIN auth.dynamic_table_fields dtf
//       ON dt.id = dtf.dynamic_table_id
//     JOIN auth.field_templates ft
//       ON ft.id = dtf.field_template_id
//     WHERE dt.organisation_id = $1
//       AND dt.template_id = $2
//     ORDER BY dtf.display_order;
//   `;

//   const result = await db.query(query, [organisationId, templateId]);

//   return result.rows;
// };

export const getTemplateFields = async (db, organisationId, templateId) => {
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

  const result = await db.query(query, [organisationId, templateId]);

  return result.rows;
};

export const getTemplate = async (db, organisationId, templateId) => {
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

  const result = await db.query(query, [organisationId, templateId]);

  return result.rows[0];
};

export const getModules = async (db, organisationId) => {
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

  const result = await db.query(query, [organisationId]);

  return result.rows;
};

export const getTemplateDetails = async (db, organisationId, templateId) => {
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

  const result = await db.query(query, [organisationId, templateId]);

  return result.rows[0];
};

export const insertFaceDetails = async (
  db,
  schema,
  tableName,
  recordId,
  faceDescriptor,
) => {
  const query = `
    INSERT INTO "${schema}".face_details (
      table_name,
      record_id,
      face_descriptor
    )
    VALUES ($1, $2, $3::vector)
    RETURNING *;
  `;

  const result = await db.query(query, [
    tableName,
    recordId,
    toVector(faceDescriptor),
  ]);

  return result.rows[0];
};

export const updateFaceDetails = async (
  db,
  schema,
  tableName,
  recordId,
  faceDescriptor,
) => {
  const query = `
    UPDATE "${schema}".face_details
    SET
      face_descriptor = $3::vector,
      updated_at = NOW()
    WHERE
      table_name = $1
      AND record_id = $2
    RETURNING *;
  `;

  const result = await db.query(query, [
    tableName,
    recordId,
    toVector(faceDescriptor),
  ]);

  return result.rows[0];
};

export const deleteFaceDetails = async (db, schema, tableName, recordId) => {
  const query = `
    DELETE FROM "${schema}".face_details
    WHERE
      table_name = $1
      AND record_id = $2
    RETURNING *;
  `;

  const result = await db.query(query, [tableName, recordId]);

  return result.rows[0];
};

// export const getFaceDetails = async (db, schema) => {
//   const query = `
//     SELECT
//       table_name,
//       record_id,
//       face_descriptor
//     FROM "${schema}".face_details;
//   `;

//   const result = await db.query(query);
//   return result.rows;
// };

export const getFaceDetails = async (db, schema) => {
  const query = `
    SELECT
      table_name,
      record_id,
      face_descriptor
    FROM "${schema}".face_details;
  `;

  const result = await db.query(query);

  return result.rows.map((row) => ({
    ...row,
    face_descriptor: fromVector(row.face_descriptor),
  }));
};
