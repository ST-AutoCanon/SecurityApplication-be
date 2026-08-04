/**
 * GET ALL FORMS
 */
export const getAllForms = async (db, schema) => {
  const query = `
    SELECT
      id,
      title,
      description,
      fields_json,
      created_by,
      created_at,
      updated_at
    FROM "${schema}".forms
    ORDER BY updated_at DESC;
  `;

  const result = await db.query(query);
  return result.rows;
};

/**
 * GET FORM BY ID
 */
export const getFormById = async (db, schema, formId) => {
  const query = `
    SELECT
      id,
      title,
      description,
      fields_json,
      created_by,
      created_at,
      updated_at
    FROM "${schema}".forms
    WHERE id = $1;
  `;

  const result = await db.query(query, [formId]);
  return result.rows[0] || null;
};

/**
 * CREATE FORM
 */
export const createForm = async (db, schema, data) => {
  const query = `
    INSERT INTO "${schema}".forms
    (
      title,
      description,
      fields_json,
      created_by
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [
    data.title,
    data.description || null,
    JSON.stringify(data.fields_json || []),
    data.created_by || null,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

/**
 * UPDATE FORM
 */
export const updateForm = async (db, schema, formId, data) => {
  const query = `
    UPDATE "${schema}".forms
    SET
      title = $1,
      description = $2,
      fields_json = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *;
  `;

  const values = [
    data.title,
    data.description || null,
    JSON.stringify(data.fields_json || []),
    formId,
  ];

  const result = await db.query(query, values);
  return result.rows[0] || null;
};

/**
 * DELETE FORM
 */
export const deleteForm = async (db, schema, formId) => {
  const query = `
    DELETE FROM "${schema}".forms
    WHERE id = $1
    RETURNING id;
  `;

  const result = await db.query(query, [formId]);
  return result.rows[0] || null;
};

export const insertFormResponse = async (db, schema, formId, values) => {
  const query = `
    INSERT INTO "${schema}".form_responses
    (form_id, response_json)
    VALUES ($1, $2)
    RETURNING id;
  `;
  const result = await db.query(query, [formId, JSON.stringify(values || {})]);
  return result.rows[0];
};

export const getFormResponses = async (db, schema, formId) => {
  const query = `
    SELECT
      id,
      form_id,
      response_json
    FROM "${schema}".form_responses
    WHERE form_id = $1
    ORDER BY id DESC;
  `;

  const result = await db.query(query, [formId]);
  return result.rows;
};