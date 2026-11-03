// /**
//  * GET ALL FORMS
//  */
// export const getAllForms = async (db, schema) => {
//   const query = `
//     SELECT
//       forms.id,
//       forms.title,
//       forms.description,
//       forms.fields_json,
//       forms.layout_columns,
//       forms.created_by,
//       forms.created_at,
//       forms.updated_at,
//       COALESCE(
//         ARRAY_AGG(fa.member_id) FILTER (WHERE fa.member_id IS NOT NULL),
//         '{}'
//       ) AS assigned_member_ids
//     FROM "${schema}".forms
//     LEFT JOIN "${schema}".form_assignments fa ON fa.form_id = forms.id
//     GROUP BY forms.id
//     ORDER BY forms.updated_at DESC;
//   `;

//   const result = await db.query(query);
//   return result.rows;
// };

// /**
//  * GET FORM BY ID
//  */
// export const getFormById = async (db, schema, formId) => {
//   const query = `
//     SELECT
//       forms.id,
//       forms.title,
//       forms.description,
//       forms.fields_json,
//       forms.layout_columns,
//       forms.created_by,
//       forms.created_at,
//       forms.updated_at,
//       COALESCE(
//         ARRAY_AGG(fa.member_id) FILTER (WHERE fa.member_id IS NOT NULL),
//         '{}'
//       ) AS assigned_member_ids
//     FROM "${schema}".forms
//     LEFT JOIN "${schema}".form_assignments fa ON fa.form_id = forms.id
//     WHERE forms.id = $1
//     GROUP BY forms.id;
//   `;

//   const result = await db.query(query, [formId]);
//   return result.rows[0] || null;
// };

// export const getFormsAssignedToUser = async (
//   db,
//   schema,
//   securityUserId,
//   email,
// ) => {
//   const query = `
//     SELECT
//       forms.id,
//       forms.title,
//       forms.description,
//       forms.fields_json,
//       forms.layout_columns,
//       forms.created_at,
//       forms.updated_at
//     FROM "${schema}".forms
//     INNER JOIN "${schema}".form_assignments fa
//       ON fa.form_id = forms.id
//     INNER JOIN "${schema}".apartment_member am
//       ON am.id = fa.member_id
//     WHERE (
//       am.security_user_id = $1
//       OR ($2::text IS NOT NULL AND LOWER(am.email) = LOWER($2::text))
//     )
//     ORDER BY fa.assigned_at DESC, forms.updated_at DESC;
//   `;

//   const result = await db.query(query, [securityUserId, email || null]);
//   return result.rows;
// };

// /**
//  * CREATE FORM
//  */
// export const createForm = async (db, schema, data) => {
//   const query = `
//     INSERT INTO "${schema}".forms
//     (
//       title,
//       description,
//       fields_json,
//       layout_columns,
//       created_by
//     )
//     VALUES ($1, $2, $3, $4, $5)
//     RETURNING *;
//   `;

//   const values = [
//     data.title,
//     data.description || null,
//     JSON.stringify(data.fields_json || []),
//     data.layout_columns || 2,
//     data.created_by || null,
//   ];

//   const result = await db.query(query, values);
//   return result.rows[0];
// };

// /**
//  * UPDATE FORM
//  */
// export const updateForm = async (db, schema, formId, data) => {
//   const query = `
//     UPDATE "${schema}".forms
//     SET
//       title = $1,
//       description = $2,
//       fields_json = $3,
//       layout_columns = $4,
//       updated_at = CURRENT_TIMESTAMP
//     WHERE id = $5
//     RETURNING *;
//   `;

//   const values = [
//     data.title,
//     data.description || null,
//     JSON.stringify(data.fields_json || []),
//     data.layout_columns || 2,
//     formId,
//   ];

//   const result = await db.query(query, values);
//   return result.rows[0] || null;
// };

// export const replaceFormAssignments = async (
//   db,
//   schema,
//   formId,
//   memberIds,
//   assignedBy,
// ) => {
//   await db.query(
//     `DELETE FROM "${schema}".form_assignments WHERE form_id = $1`,
//     [formId],
//   );

//   if (memberIds.length === 0) return;

//   await db.query(
//     `
//       INSERT INTO "${schema}".form_assignments
//         (form_id, member_id, assigned_by)
//       SELECT $1, member_id, $3
//       FROM UNNEST($2::int[]) AS member_id
//       ON CONFLICT (form_id, member_id) DO NOTHING;
//     `,
//     [formId, memberIds, assignedBy || null],
//   );
// };

// /**
//  * DELETE FORM
//  */
// export const deleteForm = async (db, schema, formId) => {
//   const query = `
//     DELETE FROM "${schema}".forms
//     WHERE id = $1
//     RETURNING id;
//   `;

//   const result = await db.query(query, [formId]);
//   return result.rows[0] || null;
// };

// export const insertFormResponse = async (db, schema, formId, values) => {
//   const query = `
//     INSERT INTO "${schema}".form_responses
//     (form_id, response_json)
//     VALUES ($1, $2)
//     RETURNING id;
//   `;
//   const result = await db.query(query, [formId, JSON.stringify(values || {})]);
//   return result.rows[0];
// };

// export const getFormResponses = async (db, schema, formId) => {
//   const query = `
//     SELECT
//       id,
//       form_id,
//       response_json
//     FROM "${schema}".form_responses
//     WHERE form_id = $1
//     ORDER BY id DESC;
//   `;

//   const result = await db.query(query, [formId]);
//   return result.rows;
// };
// /**
//  * GET ACTIVE MEMBERS (for assignment UI)
//  */
// export const getActiveMembers = async (db, schema) => {
//   const query = `
//     SELECT
//       id,
//       first_name,
//       last_name,
//       email,
//       mobile_number,
//       block_tower,
//       floor_number,
//       flat_number,
//       member_code,
//       member_type
//     FROM "${schema}".apartment_member
//     ORDER BY first_name, last_name;
//   `;
//   const result = await db.query(query);
//   return result.rows;
// };

/**
 * GET ALL FORMS
 */
export const getAllForms = async (db, schema) => {
  const query = `
    SELECT
      forms.id,
      forms.title,
      forms.description,
      forms.fields_json,
      forms.layout_columns,
      forms.created_by,
      forms.created_at,
      forms.updated_at,
      COALESCE(
        ARRAY_AGG(fa.member_id) FILTER (WHERE fa.member_id IS NOT NULL),
        '{}'
      ) AS assigned_member_ids
    FROM "${schema}".forms
    LEFT JOIN "${schema}".form_assignments fa ON fa.form_id = forms.id
    GROUP BY forms.id
    ORDER BY forms.updated_at DESC;
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
      forms.id,
      forms.title,
      forms.description,
      forms.fields_json,
      forms.layout_columns,
      forms.created_by,
      forms.created_at,
      forms.updated_at,
      COALESCE(
        ARRAY_AGG(fa.member_id) FILTER (WHERE fa.member_id IS NOT NULL),
        '{}'
      ) AS assigned_member_ids
    FROM "${schema}".forms
    LEFT JOIN "${schema}".form_assignments fa ON fa.form_id = forms.id
    WHERE forms.id = $1
    GROUP BY forms.id;
  `;
  const result = await db.query(query, [formId]);
  return result.rows[0] || null;
};

export const getFormsAssignedToUser = async (
  db,
  schema,
  securityUserId,
  email,
) => {
  const query = `
    SELECT
      forms.id,
      forms.title,
      forms.description,
      forms.fields_json,
      forms.layout_columns,
      forms.created_at,
      forms.updated_at
    FROM "${schema}".forms
    INNER JOIN "${schema}".form_assignments fa
      ON fa.form_id = forms.id
    INNER JOIN "${schema}".apartment_member am
      ON am.id = fa.member_id
    WHERE (
      am.security_user_id = $1
      OR ($2::text IS NOT NULL AND LOWER(am.email) = LOWER($2::text))
    )
    ORDER BY fa.assigned_at DESC, forms.updated_at DESC;
  `;
  const result = await db.query(query, [securityUserId, email || null]);
  return result.rows;
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
      layout_columns,
      created_by
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [
    data.title,
    data.description || null,
    JSON.stringify(data.fields_json || []),
    data.layout_columns || 2,
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
      layout_columns = $4,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *;
  `;
  const values = [
    data.title,
    data.description || null,
    JSON.stringify(data.fields_json || []),
    data.layout_columns || 2,
    formId,
  ];
  const result = await db.query(query, values);
  return result.rows[0] || null;
};

export const replaceFormAssignments = async (
  db,
  schema,
  formId,
  memberIds,
  assignedBy,
) => {
  await db.query(
    `DELETE FROM "${schema}".form_assignments WHERE form_id = $1`,
    [formId],
  );

  if (memberIds.length === 0) return;

  await db.query(
    `
      INSERT INTO "${schema}".form_assignments
        (form_id, member_id, assigned_by)
      SELECT $1, member_id, $3
      FROM UNNEST($2::int[]) AS member_id
      ON CONFLICT (form_id, member_id) DO NOTHING;
    `,
    [formId, memberIds, assignedBy || null],
  );
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

/**
 * Resolve apartment_member.id from security_user_id or email
 */
export const getMemberIdByUser = async (db, schema, securityUserId, email) => {
  const query = `
    SELECT id
    FROM "${schema}".apartment_member
    WHERE security_user_id = $1
       OR ($2::text IS NOT NULL AND LOWER(email) = LOWER($2::text))
    LIMIT 1;
  `;
  const result = await db.query(query, [securityUserId, email || null]);
  return result.rows[0]?.id ?? null;
};

/**
 * Get existing response for this member + form (draft or final)
 */
export const getResponseByMember = async (db, schema, formId, memberId) => {
  const query = `
    SELECT id, response_json, is_draft, submitted_at, created_at
    FROM "${schema}".form_responses
    WHERE form_id = $1 AND submitted_by = $2
    ORDER BY id DESC
    LIMIT 1;
  `;
  const result = await db.query(query, [formId, memberId]);
  return result.rows[0] || null;
};

/**
 * Insert or update response.
 * isDraft = true  → save/overwrite draft
 * isDraft = false → final submit (blocked if already final)
 */
export const upsertFormResponse = async (
  db,
  schema,
  formId,
  values,
  submittedBy,
  isDraft = false,
) => {
  const existing = await getResponseByMember(db, schema, formId, submittedBy);

  if (existing && existing.is_draft === false) {
    const err = new Error("You have already submitted this form");
    err.code = "ALREADY_SUBMITTED";
    throw err;
  }

  if (existing) {
    const query = `
      UPDATE "${schema}".form_responses
      SET
        response_json = $1,
        is_draft = $2,
        submitted_at = CASE WHEN $2 = false THEN CURRENT_TIMESTAMP ELSE submitted_at END
      WHERE id = $3
      RETURNING id, is_draft, response_json;
    `;
    const result = await db.query(query, [
      JSON.stringify(values || {}),
      isDraft,
      existing.id,
    ]);
    return result.rows[0];
  }

  const query = `
    INSERT INTO "${schema}".form_responses
      (form_id, response_json, submitted_by, is_draft)
    VALUES ($1, $2, $3, $4)
    RETURNING id, is_draft, response_json;
  `;
  const result = await db.query(query, [
    formId,
    JSON.stringify(values || {}),
    submittedBy,
    isDraft,
  ]);
  return result.rows[0];
};

/** Anonymous / public submit (no member, always final) */
export const insertFormResponse = async (db, schema, formId, values) => {
  const query = `
    INSERT INTO "${schema}".form_responses
      (form_id, response_json, is_draft)
    VALUES ($1, $2, false)
    RETURNING id;
  `;
  const result = await db.query(query, [formId, JSON.stringify(values || {})]);
  return result.rows[0];
};

/** Admin: only final (non-draft) responses */
export const getFormResponses = async (db, schema, formId) => {
  const query = `
    SELECT
      id,
      form_id,
      response_json,
      submitted_by,
      submitted_at,
      is_draft
    FROM "${schema}".form_responses
    WHERE form_id = $1
      AND (is_draft IS NULL OR is_draft = false)
    ORDER BY id DESC;
  `;
  const result = await db.query(query, [formId]);
  return result.rows;
};

/**
 * GET ACTIVE MEMBERS (for assignment UI)
 */
export const getActiveMembers = async (db, schema) => {
  const query = `
    SELECT
      id,
      first_name,
      last_name,
      email,
      mobile_number,
      block_tower,
      floor_number,
      flat_number,
      member_code,
      member_type
    FROM "${schema}".apartment_member
    ORDER BY first_name, last_name;
  `;
  const result = await db.query(query);
  return result.rows;
};