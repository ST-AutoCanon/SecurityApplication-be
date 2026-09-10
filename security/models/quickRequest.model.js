// quickRequest/models/quickRequest.model.js

// ============================================================
// GET ALL REQUEST TYPES
// ============================================================

export const getAllQuickRequests = async (db, schema) => {
  const query = `
    SELECT
      id,
      org_id,
      request_name,
      description,
      status,
      icon,
      question,
      question_type,
      required,
      options,
      display_order,
      created_by,
      created_at,
      updated_at
    FROM "${schema}".quick_request_types
    ORDER BY request_name ASC, display_order ASC, id ASC;
  `;

  const result = await db.query(query);
  return result.rows;
};

// ============================================================
// GET REQUEST BY ID
// ============================================================

export const getQuickRequestById = async (db, schema, requestId) => {
  const query = `
    SELECT
      id,
      org_id,
      request_name,
      description,
      status,
      question,
      question_type,
      required,
      options,
      display_order,
      created_by,
      created_at,
      updated_at
    FROM "${schema}".quick_request_types
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await db.query(query, [requestId]);

  if (!result.rows.length) {
    return null;
  }

  return result.rows[0];
};

// ============================================================
// GET ALL QUESTIONS FOR A REQUEST
// ============================================================

export const getQuestionsByRequestName = async (
  db,
  schema,
  requestName
) => {
  const query = `
    SELECT
      id,
      org_id,
      request_name,
      description,
      status,
      question,
      question_type,
      required,
      options,
      display_order,
      created_by,
      created_at,
      updated_at
    FROM "${schema}".quick_request_types
    WHERE request_name = $1
    ORDER BY display_order ASC, id ASC;
  `;

  const result = await db.query(query, [requestName]);

  return result.rows;
};

// ============================================================
// CREATE REQUEST TYPE
// ============================================================

export const createQuickRequest = async (
  db,
  schema,
  data
) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const {
      orgId,
      requestName,
      description,
      status = "Active",
      icon = "other",
      questions = [],
      createdBy = null,
    } = data;

    // --------------------------------------------------------
    // Check duplicate request name
    // --------------------------------------------------------

    const duplicateQuery = `
      SELECT id
      FROM "${schema}".quick_request_types
      WHERE org_id = $1
        AND LOWER(request_name) = LOWER($2)
      LIMIT 1;
    `;

    const duplicateResult = await client.query(
      duplicateQuery,
      [orgId, requestName]
    );

    if (duplicateResult.rows.length) {
      throw new Error("A request type with this name already exists");
    }

    // --------------------------------------------------------
    // At least one question
    // --------------------------------------------------------

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("At least one question is required");
    }

    let firstInserted = null;

    // --------------------------------------------------------
    // Insert questions
    // --------------------------------------------------------

    for (let index = 0; index < questions.length; index++) {
      const item = questions[index];

      const query = `
        INSERT INTO "${schema}".quick_request_types
        (
          org_id,
          request_name,
          description,
          status,
          icon,
          question,
          question_type,
          required,
          options,
          display_order,
          created_by
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11
        )
        RETURNING
          id,
          org_id,
          request_name,
          description,
          status,
          question,
          question_type,
          required,
          options,
          display_order,
          created_by,
          created_at,
          updated_at;
      `;

      const values = [
        orgId,
        requestName,
        description || null,
        status,
        icon,
        item.question || "",
        item.type || "text",
        Boolean(item.required),
        JSON.stringify(item.options || []),
        index,
        createdBy,
      ];

      const result = await client.query(query, values);

      if (!firstInserted) {
        firstInserted = result.rows[0];
      }
    }

    await client.query("COMMIT");

    return firstInserted;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// ============================================================
// UPDATE REQUEST TYPE
// ============================================================

export const updateQuickRequest = async (
  db,
  schema,
  requestId,
  data
) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // --------------------------------------------------------
    // Find current request
    // --------------------------------------------------------

    const findQuery = `
      SELECT *
      FROM "${schema}".quick_request_types
      WHERE id = $1
      LIMIT 1;
    `;

    const findResult = await client.query(
      findQuery,
      [requestId]
    );

    if (!findResult.rows.length) {
      throw new Error("Request type not found");
    }

    const currentRequest = findResult.rows[0];

    const oldRequestName = currentRequest.request_name;

    const {
      requestName = oldRequestName,
      description = currentRequest.description,
      
      status = currentRequest.status,
      icon = currentRequest.icon || "other",   // ADD
      questions = [],
    } = data;

    // --------------------------------------------------------
    // Check duplicate name
    // --------------------------------------------------------

    const duplicateQuery = `
      SELECT id
      FROM "${schema}".quick_request_types
      WHERE org_id = $1
        AND LOWER(request_name) = LOWER($2)
        AND request_name <> $3
      LIMIT 1;
    `;

    const duplicateResult = await client.query(
      duplicateQuery,
      [
        currentRequest.org_id,
        requestName,
        oldRequestName,
      ]
    );

    if (duplicateResult.rows.length) {
      throw new Error("A request type with this name already exists");
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("At least one question is required");
    }

    // --------------------------------------------------------
    // Get existing rows
    // --------------------------------------------------------

    const existingQuery = `
      SELECT id
      FROM "${schema}".quick_request_types
      WHERE request_name = $1
      ORDER BY display_order ASC, id ASC;
    `;

    const existingResult = await client.query(
      existingQuery,
      [oldRequestName]
    );

    const existingRows = existingResult.rows;

    // --------------------------------------------------------
    // Keep first ID stable
    // --------------------------------------------------------

    const firstRowId = existingRows[0]?.id || requestId;

    // --------------------------------------------------------
    // Update first question
    // --------------------------------------------------------

    const firstQuestion = questions[0];

    const updateFirstQuery = `
      UPDATE "${schema}".quick_request_types
      SET
        request_name = $1,
        description = $2,
        status = $3,
        icon = $4,
        question = $5,
        question_type = $6,
        required = $7,
        options = $8,
        display_order = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *;
    `;

    await client.query(
      updateFirstQuery,
      [
        requestName,
        description || null,
        status,
        icon,
        firstQuestion.question || "",
        firstQuestion.type || "text",
        Boolean(firstQuestion.required),
        JSON.stringify(firstQuestion.options || []),
        firstRowId,
      ]
    );

    // --------------------------------------------------------
    // Delete extra question rows
    // --------------------------------------------------------

    await client.query(
      `
        DELETE FROM "${schema}".quick_request_types
        WHERE request_name = $1
          AND id <> $2;
      `,
      [
        oldRequestName,
        firstRowId,
      ]
    );

    // --------------------------------------------------------
    // Insert remaining questions
    // --------------------------------------------------------

    for (let index = 1; index < questions.length; index++) {
      const item = questions[index];

      await client.query(
        `
          INSERT INTO "${schema}".quick_request_types
          (
            org_id,
            request_name,
            description,
            status,
            icon,
            question,
            question_type,
            required,
            options,
            display_order,
            created_by
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11
          );
        `,
        [
          currentRequest.org_id,
          requestName,
          description || null,
          status,
          icon,
          item.question || "",
          item.type || "text",
          Boolean(item.required),
          JSON.stringify(item.options || []),
          index,
          currentRequest.created_by,
        ]
      );
    }

    await client.query("COMMIT");

    return {
      id: firstRowId,
      requestName,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// ============================================================
// DELETE REQUEST TYPE
// ============================================================

export const deleteQuickRequest = async (
  db,
  schema,
  requestId
) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const findQuery = `
      SELECT request_name, org_id
      FROM "${schema}".quick_request_types
      WHERE id = $1
      LIMIT 1;
    `;

    const findResult = await client.query(
      findQuery,
      [requestId]
    );

    if (!findResult.rows.length) {
      throw new Error("Request type not found");
    }

    const {
      request_name: requestName,
      org_id: orgId,
    } = findResult.rows[0];

    // --------------------------------------------------------
    // Check responses
    // --------------------------------------------------------

    const responseCheck = await client.query(
      `
        SELECT COUNT(*)::int AS count
        FROM "${schema}".quick_request_responses
        WHERE request_type_id = $1
          AND org_id = $2;
      `,
      [requestId, orgId]
    );

    if (responseCheck.rows[0].count > 0) {
      throw new Error(
        "This request type has responses and cannot be deleted. Mark it Inactive instead."
      );
    }

    // --------------------------------------------------------
    // Delete all questions
    // --------------------------------------------------------

    await client.query(
      `
        DELETE FROM "${schema}".quick_request_types
        WHERE request_name = $1
          AND org_id = $2;
      `,
      [requestName, orgId]
    );

    await client.query("COMMIT");

    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// ============================================================
// UPDATE REQUEST STATUS
// ============================================================

export const updateQuickRequestStatus = async (
  db,
  schema,
  requestId,
  status
) => {
  const findQuery = `
    SELECT request_name, org_id
    FROM "${schema}".quick_request_types
    WHERE id = $1
    LIMIT 1;
  `;

  const findResult = await db.query(
    findQuery,
    [requestId]
  );

  if (!findResult.rows.length) {
    return null;
  }

  const {
    request_name: requestName,
    org_id: orgId,
  } = findResult.rows[0];

  const query = `
    UPDATE "${schema}".quick_request_types
    SET
      status = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE request_name = $2
      AND org_id = $3
    RETURNING id, request_name, status;
  `;

  const result = await db.query(
    query,
    [
      status,
      requestName,
      orgId,
    ]
  );

  return result.rows[0];
};

// ============================================================
// CREATE RESPONSE
// ============================================================

export const createQuickRequestResponse = async (
  db,
  schema,
  data
) => {
  const {
    requestTypeId,
    orgId,
    requestedBy,
    answers = {},
  } = data;

  const query = `
    INSERT INTO "${schema}".quick_request_responses
    (
      request_type_id,
      org_id,
      requested_by,
      status,
      answers
    )
    VALUES
    (
      $1,
      $2,
      $3,
      'Pending',
      $4
    )
    RETURNING
      id,
      request_type_id,
      org_id,
      requested_by,
      status,
      answers,
      submitted_at,
      reviewed_by,
      reviewed_at,
      rejection_reason;
  `;

  const result = await db.query(
    query,
    [
      requestTypeId,
      orgId,
      requestedBy,
      JSON.stringify(answers || {}),
    ]
  );

  return result.rows[0];
};

// ============================================================
// GET ALL RESPONSES
// ============================================================

export const getAllQuickRequestResponses = async (
  db,
  schema
) => {
  const query = `
    SELECT
      r.id,
      r.request_type_id,
      r.org_id,
      r.requested_by,
      r.status,
      r.answers,
      r.submitted_at,
      r.reviewed_by,
      r.reviewed_at,
      r.rejection_reason,
      r.approval_comment,
      q.request_name,
      q.icon
    FROM "${schema}".quick_request_responses r
    LEFT JOIN "${schema}".quick_request_types q
      ON q.id = r.request_type_id
    ORDER BY r.submitted_at DESC;
  `;

  const result = await db.query(query);

  return result.rows;
};

// ============================================================
// GET RESPONSE BY ID
// ============================================================

export const getQuickRequestResponseById = async (
  db,
  schema,
  responseId
) => {
  const query = `
    SELECT
      r.id,
      r.request_type_id,
      r.org_id,
      r.requested_by,
      r.status,
      r.answers,
      r.submitted_at,
      r.reviewed_by,
      r.reviewed_at,
      r.rejection_reason,
      r.approval_comment,
      q.request_name
    FROM "${schema}".quick_request_responses r
    LEFT JOIN "${schema}".quick_request_types q
      ON q.id = r.request_type_id
    WHERE r.id = $1
    LIMIT 1;
  `;

  const result = await db.query(
    query,
    [responseId]
  );

  return result.rows[0] || null;
};
// models/quickRequest.model.js

export const getMyQuickRequestResponses = async (db, schema, userId) => {
  const query = `
    SELECT
      r.id,
      r.request_type_id,
      r.org_id,
      r.requested_by,
      r.status,
      r.answers,
      r.submitted_at,
      r.reviewed_by,
      r.reviewed_at,
      r.rejection_reason,
      r.approval_comment,
      q.request_name,
      q.icon
    FROM "${schema}".quick_request_responses r
    LEFT JOIN "${schema}".quick_request_types q
      ON q.id = r.request_type_id
    WHERE r.requested_by = $1
    ORDER BY r.submitted_at DESC;
  `;

  const result = await db.query(query, [userId]);
  return result.rows;
};
// ============================================================
// UPDATE RESPONSE STATUS
// ============================================================

export const updateQuickRequestResponseStatus = async (
  db,
  schema,
  responseId,
  status,
  reviewedBy,
  rejectionReason = null,
  approvalComment = null          // ← add
) => {
  const query = `
    UPDATE "${schema}".quick_request_responses
    SET
      status = $1,
      reviewed_by = $2,
      reviewed_at = CURRENT_TIMESTAMP,
      rejection_reason = $3,
      approval_comment = $4
    WHERE id = $5
    RETURNING
      id,
      request_type_id,
      org_id,
      requested_by,
      status,
      answers,
      submitted_at,
      reviewed_by,
      reviewed_at,
      rejection_reason,
      approval_comment;
  `;

  const result = await db.query(query, [
    status,
    reviewedBy,
    rejectionReason,
    approvalComment,
    responseId,
  ]);

  return result.rows[0] || null;
};