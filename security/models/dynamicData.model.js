export const insertDynamicRecord = async (db, schema, table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);

  const columns = keys.map((k) => `"${k}"`).join(", ");
  const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

  const query = `
    INSERT INTO "${schema}"."${table}" (${columns})
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
  return result.rows;
};

export const getRecordById = async (db, schema, table, id) => {
  const query = `
    SELECT *
    FROM "${schema}"."${table}"
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await db.query(query, [id]);
  return result.rows[0];
};

export const updateDynamicRecord = async (db, schema, table, id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);

  const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(", ");

  const query = `
    UPDATE "${schema}"."${table}"
    SET ${setClause}
    WHERE id = $${keys.length + 1}
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

export const getTemplateFields = async (db, organisationId, templateId) => {
  const query = `
    SELECT
      ft.field_key,
      ft.field_label,
      dtf.is_required,
      ft.field_type_id
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