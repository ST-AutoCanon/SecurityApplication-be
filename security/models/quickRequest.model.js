// // // quickRequest/models/quickRequest.model.js

// // // ============================================================
// // // GET ALL REQUEST TYPES
// // // ============================================================

// // export const getAllQuickRequests = async (db, schema) => {
// //   const query = `
// //     SELECT
// //       id,
// //       org_id,
// //       request_name,
// //       description,
// //       status,
// //       icon,
// //       question,
// //       question_type,
// //       required,
// //       options,
// //       display_order,
// //       created_by,
// //       created_at,
// //       updated_at
// //     FROM "${schema}".quick_request_types
// //     ORDER BY request_name ASC, display_order ASC, id ASC;
// //   `;

// //   const result = await db.query(query);
// //   return result.rows;
// // };

// // // ============================================================
// // // GET REQUEST BY ID
// // // ============================================================

// // export const getQuickRequestById = async (db, schema, requestId) => {
// //   const query = `
// //     SELECT
// //       id,
// //       org_id,
// //       request_name,
// //       description,
// //       status,
// //       question,
// //       question_type,
// //       required,
// //       options,
// //       display_order,
// //       created_by,
// //       created_at,
// //       updated_at
// //     FROM "${schema}".quick_request_types
// //     WHERE id = $1
// //     LIMIT 1;
// //   `;

// //   const result = await db.query(query, [requestId]);

// //   if (!result.rows.length) {
// //     return null;
// //   }

// //   return result.rows[0];
// // };

// // // ============================================================
// // // GET ALL QUESTIONS FOR A REQUEST
// // // ============================================================

// // export const getQuestionsByRequestName = async (
// //   db,
// //   schema,
// //   requestName
// // ) => {
// //   const query = `
// //     SELECT
// //       id,
// //       org_id,
// //       request_name,
// //       description,
// //       status,
// //       question,
// //       question_type,
// //       required,
// //       options,
// //       display_order,
// //       created_by,
// //       created_at,
// //       updated_at
// //     FROM "${schema}".quick_request_types
// //     WHERE request_name = $1
// //     ORDER BY display_order ASC, id ASC;
// //   `;

// //   const result = await db.query(query, [requestName]);

// //   return result.rows;
// // };

// // // ============================================================
// // // CREATE REQUEST TYPE
// // // ============================================================

// // export const createQuickRequest = async (
// //   db,
// //   schema,
// //   data
// // ) => {
// //   const client = await db.connect();

// //   try {
// //     await client.query("BEGIN");

// //     const {
// //       orgId,
// //       requestName,
// //       description,
// //       status = "Active",
// //       icon = "other",
// //       questions = [],
// //       createdBy = null,
// //     } = data;

// //     // --------------------------------------------------------
// //     // Check duplicate request name
// //     // --------------------------------------------------------

// //     const duplicateQuery = `
// //       SELECT id
// //       FROM "${schema}".quick_request_types
// //       WHERE org_id = $1
// //         AND LOWER(request_name) = LOWER($2)
// //       LIMIT 1;
// //     `;

// //     const duplicateResult = await client.query(
// //       duplicateQuery,
// //       [orgId, requestName]
// //     );

// //     if (duplicateResult.rows.length) {
// //       throw new Error("A request type with this name already exists");
// //     }

// //     // --------------------------------------------------------
// //     // At least one question
// //     // --------------------------------------------------------

// //     if (!Array.isArray(questions) || questions.length === 0) {
// //       throw new Error("At least one question is required");
// //     }

// //     let firstInserted = null;

// //     // --------------------------------------------------------
// //     // Insert questions
// //     // --------------------------------------------------------

// //     for (let index = 0; index < questions.length; index++) {
// //       const item = questions[index];

// //       const query = `
// //         INSERT INTO "${schema}".quick_request_types
// //         (
// //           org_id,
// //           request_name,
// //           description,
// //           status,
// //           icon,
// //           question,
// //           question_type,
// //           required,
// //           options,
// //           display_order,
// //           created_by
// //         )
// //         VALUES
// //         (
// //           $1,
// //           $2,
// //           $3,
// //           $4,
// //           $5,
// //           $6,
// //           $7,
// //           $8,
// //           $9,
// //           $10,
// //           $11
// //         )
// //         RETURNING
// //           id,
// //           org_id,
// //           request_name,
// //           description,
// //           status,
// //           question,
// //           question_type,
// //           required,
// //           options,
// //           display_order,
// //           created_by,
// //           created_at,
// //           updated_at;
// //       `;

// //       const values = [
// //         orgId,
// //         requestName,
// //         description || null,
// //         status,
// //         icon,
// //         item.question || "",
// //         item.type || "text",
// //         Boolean(item.required),
// //         JSON.stringify(item.options || []),
// //         index,
// //         createdBy,
// //       ];

// //       const result = await client.query(query, values);

// //       if (!firstInserted) {
// //         firstInserted = result.rows[0];
// //       }
// //     }

// //     await client.query("COMMIT");

// //     return firstInserted;
// //   } catch (error) {
// //     await client.query("ROLLBACK");
// //     throw error;
// //   } finally {
// //     client.release();
// //   }
// // };

// // // ============================================================
// // // UPDATE REQUEST TYPE
// // // ============================================================

// // export const updateQuickRequest = async (
// //   db,
// //   schema,
// //   requestId,
// //   data
// // ) => {
// //   const client = await db.connect();

// //   try {
// //     await client.query("BEGIN");

// //     // --------------------------------------------------------
// //     // Find current request
// //     // --------------------------------------------------------

// //     const findQuery = `
// //       SELECT *
// //       FROM "${schema}".quick_request_types
// //       WHERE id = $1
// //       LIMIT 1;
// //     `;

// //     const findResult = await client.query(
// //       findQuery,
// //       [requestId]
// //     );

// //     if (!findResult.rows.length) {
// //       throw new Error("Request type not found");
// //     }

// //     const currentRequest = findResult.rows[0];

// //     const oldRequestName = currentRequest.request_name;

// //     const {
// //       requestName = oldRequestName,
// //       description = currentRequest.description,
      
// //       status = currentRequest.status,
// //       icon = currentRequest.icon || "other",   // ADD
// //       questions = [],
// //     } = data;

// //     // --------------------------------------------------------
// //     // Check duplicate name
// //     // --------------------------------------------------------

// //     const duplicateQuery = `
// //       SELECT id
// //       FROM "${schema}".quick_request_types
// //       WHERE org_id = $1
// //         AND LOWER(request_name) = LOWER($2)
// //         AND request_name <> $3
// //       LIMIT 1;
// //     `;

// //     const duplicateResult = await client.query(
// //       duplicateQuery,
// //       [
// //         currentRequest.org_id,
// //         requestName,
// //         oldRequestName,
// //       ]
// //     );

// //     if (duplicateResult.rows.length) {
// //       throw new Error("A request type with this name already exists");
// //     }

// //     if (!Array.isArray(questions) || questions.length === 0) {
// //       throw new Error("At least one question is required");
// //     }

// //     // --------------------------------------------------------
// //     // Get existing rows
// //     // --------------------------------------------------------

// //     const existingQuery = `
// //       SELECT id
// //       FROM "${schema}".quick_request_types
// //       WHERE request_name = $1
// //       ORDER BY display_order ASC, id ASC;
// //     `;

// //     const existingResult = await client.query(
// //       existingQuery,
// //       [oldRequestName]
// //     );

// //     const existingRows = existingResult.rows;

// //     // --------------------------------------------------------
// //     // Keep first ID stable
// //     // --------------------------------------------------------

// //     const firstRowId = existingRows[0]?.id || requestId;

// //     // --------------------------------------------------------
// //     // Update first question
// //     // --------------------------------------------------------

// //     const firstQuestion = questions[0];

// //     const updateFirstQuery = `
// //       UPDATE "${schema}".quick_request_types
// //       SET
// //         request_name = $1,
// //         description = $2,
// //         status = $3,
// //         icon = $4,
// //         question = $5,
// //         question_type = $6,
// //         required = $7,
// //         options = $8,
// //         display_order = 0,
// //         updated_at = CURRENT_TIMESTAMP
// //       WHERE id = $9
// //       RETURNING *;
// //     `;

// //     await client.query(
// //       updateFirstQuery,
// //       [
// //         requestName,
// //         description || null,
// //         status,
// //         icon,
// //         firstQuestion.question || "",
// //         firstQuestion.type || "text",
// //         Boolean(firstQuestion.required),
// //         JSON.stringify(firstQuestion.options || []),
// //         firstRowId,
// //       ]
// //     );

// //     // --------------------------------------------------------
// //     // Delete extra question rows
// //     // --------------------------------------------------------

// //     await client.query(
// //       `
// //         DELETE FROM "${schema}".quick_request_types
// //         WHERE request_name = $1
// //           AND id <> $2;
// //       `,
// //       [
// //         oldRequestName,
// //         firstRowId,
// //       ]
// //     );

// //     // --------------------------------------------------------
// //     // Insert remaining questions
// //     // --------------------------------------------------------

// //     for (let index = 1; index < questions.length; index++) {
// //       const item = questions[index];

// //       await client.query(
// //         `
// //           INSERT INTO "${schema}".quick_request_types
// //           (
// //             org_id,
// //             request_name,
// //             description,
// //             status,
// //             icon,
// //             question,
// //             question_type,
// //             required,
// //             options,
// //             display_order,
// //             created_by
// //           )
// //           VALUES
// //           (
// //             $1,
// //             $2,
// //             $3,
// //             $4,
// //             $5,
// //             $6,
// //             $7,
// //             $8,
// //             $9,
// //             $10,
// //             $11
// //           );
// //         `,
// //         [
// //           currentRequest.org_id,
// //           requestName,
// //           description || null,
// //           status,
// //           icon,
// //           item.question || "",
// //           item.type || "text",
// //           Boolean(item.required),
// //           JSON.stringify(item.options || []),
// //           index,
// //           currentRequest.created_by,
// //         ]
// //       );
// //     }

// //     await client.query("COMMIT");

// //     return {
// //       id: firstRowId,
// //       requestName,
// //     };
// //   } catch (error) {
// //     await client.query("ROLLBACK");
// //     throw error;
// //   } finally {
// //     client.release();
// //   }
// // };

// // // ============================================================
// // // DELETE REQUEST TYPE
// // // ============================================================

// // export const deleteQuickRequest = async (
// //   db,
// //   schema,
// //   requestId
// // ) => {
// //   const client = await db.connect();

// //   try {
// //     await client.query("BEGIN");

// //     const findQuery = `
// //       SELECT request_name, org_id
// //       FROM "${schema}".quick_request_types
// //       WHERE id = $1
// //       LIMIT 1;
// //     `;

// //     const findResult = await client.query(
// //       findQuery,
// //       [requestId]
// //     );

// //     if (!findResult.rows.length) {
// //       throw new Error("Request type not found");
// //     }

// //     const {
// //       request_name: requestName,
// //       org_id: orgId,
// //     } = findResult.rows[0];

// //     // --------------------------------------------------------
// //     // Check responses
// //     // --------------------------------------------------------

// //     const responseCheck = await client.query(
// //       `
// //         SELECT COUNT(*)::int AS count
// //         FROM "${schema}".quick_request_responses
// //         WHERE request_type_id = $1
// //           AND org_id = $2;
// //       `,
// //       [requestId, orgId]
// //     );

// //     if (responseCheck.rows[0].count > 0) {
// //       throw new Error(
// //         "This request type has responses and cannot be deleted. Mark it Inactive instead."
// //       );
// //     }

// //     // --------------------------------------------------------
// //     // Delete all questions
// //     // --------------------------------------------------------

// //     await client.query(
// //       `
// //         DELETE FROM "${schema}".quick_request_types
// //         WHERE request_name = $1
// //           AND org_id = $2;
// //       `,
// //       [requestName, orgId]
// //     );

// //     await client.query("COMMIT");

// //     return true;
// //   } catch (error) {
// //     await client.query("ROLLBACK");
// //     throw error;
// //   } finally {
// //     client.release();
// //   }
// // };

// // // ============================================================
// // // UPDATE REQUEST STATUS
// // // ============================================================

// // export const updateQuickRequestStatus = async (
// //   db,
// //   schema,
// //   requestId,
// //   status
// // ) => {
// //   const findQuery = `
// //     SELECT request_name, org_id
// //     FROM "${schema}".quick_request_types
// //     WHERE id = $1
// //     LIMIT 1;
// //   `;

// //   const findResult = await db.query(
// //     findQuery,
// //     [requestId]
// //   );

// //   if (!findResult.rows.length) {
// //     return null;
// //   }

// //   const {
// //     request_name: requestName,
// //     org_id: orgId,
// //   } = findResult.rows[0];

// //   const query = `
// //     UPDATE "${schema}".quick_request_types
// //     SET
// //       status = $1,
// //       updated_at = CURRENT_TIMESTAMP
// //     WHERE request_name = $2
// //       AND org_id = $3
// //     RETURNING id, request_name, status;
// //   `;

// //   const result = await db.query(
// //     query,
// //     [
// //       status,
// //       requestName,
// //       orgId,
// //     ]
// //   );

// //   return result.rows[0];
// // };

// // // ============================================================
// // // CREATE RESPONSE
// // // ============================================================

// // export const createQuickRequestResponse = async (
// //   db,
// //   schema,
// //   data
// // ) => {
// //   const {
// //     requestTypeId,
// //     orgId,
// //     requestedBy,
// //     answers = {},
// //   } = data;

// //   const query = `
// //     INSERT INTO "${schema}".quick_request_responses
// //     (
// //       request_type_id,
// //       org_id,
// //       requested_by,
// //       status,
// //       answers
// //     )
// //     VALUES
// //     (
// //       $1,
// //       $2,
// //       $3,
// //       'Pending',
// //       $4
// //     )
// //     RETURNING
// //       id,
// //       request_type_id,
// //       org_id,
// //       requested_by,
// //       status,
// //       answers,
// //       submitted_at,
// //       reviewed_by,
// //       reviewed_at,
// //       rejection_reason;
// //   `;

// //   const result = await db.query(
// //     query,
// //     [
// //       requestTypeId,
// //       orgId,
// //       requestedBy,
// //       JSON.stringify(answers || {}),
// //     ]
// //   );

// //   return result.rows[0];
// // };

// // // ============================================================
// // // GET ALL RESPONSES
// // // ============================================================

// // export const getAllQuickRequestResponses = async (
// //   db,
// //   schema
// // ) => {
// //   const query = `
// //     SELECT
// //       r.id,
// //       r.request_type_id,
// //       r.org_id,
// //       r.requested_by,
// //       r.status,
// //       r.answers,
// //       r.submitted_at,
// //       r.reviewed_by,
// //       r.reviewed_at,
// //       r.rejection_reason,
// //       r.approval_comment,
// //       q.request_name,
// //       q.icon
// //     FROM "${schema}".quick_request_responses r
// //     LEFT JOIN "${schema}".quick_request_types q
// //       ON q.id = r.request_type_id
// //     ORDER BY r.submitted_at DESC;
// //   `;

// //   const result = await db.query(query);

// //   return result.rows;
// // };

// // // ============================================================
// // // GET RESPONSE BY ID
// // // ============================================================

// // export const getQuickRequestResponseById = async (
// //   db,
// //   schema,
// //   responseId
// // ) => {
// //   const query = `
// //     SELECT
// //       r.id,
// //       r.request_type_id,
// //       r.org_id,
// //       r.requested_by,
// //       r.status,
// //       r.answers,
// //       r.submitted_at,
// //       r.reviewed_by,
// //       r.reviewed_at,
// //       r.rejection_reason,
// //       r.approval_comment,
// //       q.request_name
// //     FROM "${schema}".quick_request_responses r
// //     LEFT JOIN "${schema}".quick_request_types q
// //       ON q.id = r.request_type_id
// //     WHERE r.id = $1
// //     LIMIT 1;
// //   `;

// //   const result = await db.query(
// //     query,
// //     [responseId]
// //   );

// //   return result.rows[0] || null;
// // };
// // // models/quickRequest.model.js

// // export const getMyQuickRequestResponses = async (db, schema, userId) => {
// //   const query = `
// //     SELECT
// //       r.id,
// //       r.request_type_id,
// //       r.org_id,
// //       r.requested_by,
// //       r.status,
// //       r.answers,
// //       r.submitted_at,
// //       r.reviewed_by,
// //       r.reviewed_at,
// //       r.rejection_reason,
// //       r.approval_comment,
// //       q.request_name,
// //       q.icon
// //     FROM "${schema}".quick_request_responses r
// //     LEFT JOIN "${schema}".quick_request_types q
// //       ON q.id = r.request_type_id
// //     WHERE r.requested_by = $1
// //     ORDER BY r.submitted_at DESC;
// //   `;

// //   const result = await db.query(query, [userId]);
// //   return result.rows;
// // };
// // // ============================================================
// // // UPDATE RESPONSE STATUS
// // // ============================================================

// // export const updateQuickRequestResponseStatus = async (
// //   db,
// //   schema,
// //   responseId,
// //   status,
// //   reviewedBy,
// //   rejectionReason = null,
// //   approvalComment = null          // ← add
// // ) => {
// //   const query = `
// //     UPDATE "${schema}".quick_request_responses
// //     SET
// //       status = $1,
// //       reviewed_by = $2,
// //       reviewed_at = CURRENT_TIMESTAMP,
// //       rejection_reason = $3,
// //       approval_comment = $4
// //     WHERE id = $5
// //     RETURNING
// //       id,
// //       request_type_id,
// //       org_id,
// //       requested_by,
// //       status,
// //       answers,
// //       submitted_at,
// //       reviewed_by,
// //       reviewed_at,
// //       rejection_reason,
// //       approval_comment;
// //   `;

// //   const result = await db.query(query, [
// //     status,
// //     reviewedBy,
// //     rejectionReason,
// //     approvalComment,
// //     responseId,
// //   ]);

// //   return result.rows[0] || null;
// // };

// // ============================================================
// // GET ALL REQUEST TYPES
// // ============================================================

// export const getAllQuickRequests = async (db, schema) => {
//   const query = `
//     SELECT
//       id,
//       org_id,
//       request_name,
//       description,
//       status,
//       icon,
//       question,
//       question_type,
//       required,
//       options,
//       display_order,
//       created_by,
//       created_at,
//       updated_at
//     FROM "${schema}".quick_request_types
//     ORDER BY request_name ASC, display_order ASC, id ASC;
//   `;

//   const result = await db.query(query);
//   return result.rows;
// };

// // ============================================================
// // GET REQUEST BY ID
// // ============================================================

// export const getQuickRequestById = async (db, schema, requestId) => {
//   const query = `
//     SELECT
//       id,
//       org_id,
//       request_name,
//       description,
//       status,
//       icon,
//       question,
//       question_type,
//       required,
//       options,
//       display_order,
//       created_by,
//       created_at,
//       updated_at
//     FROM "${schema}".quick_request_types
//     WHERE id = $1
//     LIMIT 1;
//   `;

//   const result = await db.query(query, [requestId]);

//   if (!result.rows.length) {
//     return null;
//   }

//   return result.rows[0];
// };

// // ============================================================
// // GET ALL QUESTIONS FOR A REQUEST
// // ============================================================

// export const getQuestionsByRequestName = async (db, schema, requestName) => {
//   const query = `
//     SELECT
//       id,
//       org_id,
//       request_name,
//       description,
//       status,
//       icon,
//       question,
//       question_type,
//       required,
//       options,
//       display_order,
//       created_by,
//       created_at,
//       updated_at
//     FROM "${schema}".quick_request_types
//     WHERE request_name = $1
//     ORDER BY display_order ASC, id ASC;
//   `;

//   const result = await db.query(query, [requestName]);
//   return result.rows;
// };

// // ============================================================
// // CREATE REQUEST TYPE
// // ============================================================

// export const createQuickRequest = async (db, schema, data) => {
//   const client = await db.connect();

//   try {
//     await client.query("BEGIN");

//     const {
//       orgId,
//       requestName,
//       description,
//       status = "Active",
//       icon = "other",
//       questions = [],
//       createdBy = null,
//     } = data;

//     // Check duplicate request name
//     const duplicateQuery = `
//       SELECT id
//       FROM "${schema}".quick_request_types
//       WHERE org_id = $1
//         AND LOWER(request_name) = LOWER($2)
//       LIMIT 1;
//     `;

//     const duplicateResult = await client.query(duplicateQuery, [orgId, requestName]);

//     if (duplicateResult.rows.length) {
//       throw new Error("A request type with this name already exists");
//     }

//     if (!Array.isArray(questions) || questions.length === 0) {
//       throw new Error("At least one question is required");
//     }

//     let firstInserted = null;

//     for (let index = 0; index < questions.length; index++) {
//       const item = questions[index];

//       const query = `
//         INSERT INTO "${schema}".quick_request_types
//         (
//           org_id,
//           request_name,
//           description,
//           status,
//           icon,
//           question,
//           question_type,
//           required,
//           options,
//           display_order,
//           created_by
//         )
//         VALUES
//         (
//           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
//         )
//         RETURNING
//           id,
//           org_id,
//           request_name,
//           description,
//           status,
//           question,
//           question_type,
//           required,
//           options,
//           display_order,
//           created_by,
//           created_at,
//           updated_at;
//       `;

//       const values = [
//         orgId,
//         requestName,
//         description || null,
//         status,
//         icon,
//         item.question || "",
//         item.type || "text",
//         Boolean(item.required),
//         JSON.stringify(item.options || []),
//         index,
//         createdBy,
//       ];

//       const result = await client.query(query, values);

//       if (!firstInserted) {
//         firstInserted = result.rows[0];
//       }
//     }

//     await client.query("COMMIT");
//     return firstInserted;
//   } catch (error) {
//     await client.query("ROLLBACK");
//     throw error;
//   } finally {
//     client.release();
//   }
// };

// // ============================================================
// // UPDATE REQUEST TYPE
// // ============================================================

// export const updateQuickRequest = async (db, schema, requestId, data) => {
//   const client = await db.connect();

//   try {
//     await client.query("BEGIN");

//     const findQuery = `
//       SELECT *
//       FROM "${schema}".quick_request_types
//       WHERE id = $1
//       LIMIT 1;
//     `;

//     const findResult = await client.query(findQuery, [requestId]);

//     if (!findResult.rows.length) {
//       throw new Error("Request type not found");
//     }

//     const currentRequest = findResult.rows[0];
//     const oldRequestName = currentRequest.request_name;

//     const {
//       requestName = oldRequestName,
//       description = currentRequest.description,
//       status = currentRequest.status,
//       icon = currentRequest.icon || "other",
//       questions = [],
//     } = data;

//     // Check duplicate name
//     const duplicateQuery = `
//       SELECT id
//       FROM "${schema}".quick_request_types
//       WHERE org_id = $1
//         AND LOWER(request_name) = LOWER($2)
//         AND request_name <> $3
//       LIMIT 1;
//     `;

//     const duplicateResult = await client.query(duplicateQuery, [
//       currentRequest.org_id,
//       requestName,
//       oldRequestName,
//     ]);

//     if (duplicateResult.rows.length) {
//       throw new Error("A request type with this name already exists");
//     }

//     if (!Array.isArray(questions) || questions.length === 0) {
//       throw new Error("At least one question is required");
//     }

//     const existingQuery = `
//       SELECT id
//       FROM "${schema}".quick_request_types
//       WHERE request_name = $1
//       ORDER BY display_order ASC, id ASC;
//     `;

//     const existingResult = await client.query(existingQuery, [oldRequestName]);
//     const existingRows = existingResult.rows;
//     const firstRowId = existingRows[0]?.id || requestId;

//     const firstQuestion = questions[0];

//     const updateFirstQuery = `
//       UPDATE "${schema}".quick_request_types
//       SET
//         request_name = $1,
//         description = $2,
//         status = $3,
//         icon = $4,
//         question = $5,
//         question_type = $6,
//         required = $7,
//         options = $8,
//         display_order = 0,
//         updated_at = CURRENT_TIMESTAMP
//       WHERE id = $9
//       RETURNING *;
//     `;

//     await client.query(updateFirstQuery, [
//       requestName,
//       description || null,
//       status,
//       icon,
//       firstQuestion.question || "",
//       firstQuestion.type || "text",
//       Boolean(firstQuestion.required),
//       JSON.stringify(firstQuestion.options || []),
//       firstRowId,
//     ]);

//     // Delete extra question rows
//     await client.query(
//       `
//         DELETE FROM "${schema}".quick_request_types
//         WHERE request_name = $1
//           AND id <> $2;
//       `,
//       [oldRequestName, firstRowId]
//     );

//     // Insert remaining questions
//     for (let index = 1; index < questions.length; index++) {
//       const item = questions[index];

//       await client.query(
//         `
//           INSERT INTO "${schema}".quick_request_types
//           (
//             org_id,
//             request_name,
//             description,
//             status,
//             icon,
//             question,
//             question_type,
//             required,
//             options,
//             display_order,
//             created_by
//           )
//           VALUES
//           (
//             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
//           );
//         `,
//         [
//           currentRequest.org_id,
//           requestName,
//           description || null,
//           status,
//           icon,
//           item.question || "",
//           item.type || "text",
//           Boolean(item.required),
//           JSON.stringify(item.options || []),
//           index,
//           currentRequest.created_by,
//         ]
//       );
//     }

//     await client.query("COMMIT");

//     return {
//       id: firstRowId,
//       requestName,
//     };
//   } catch (error) {
//     await client.query("ROLLBACK");
//     throw error;
//   } finally {
//     client.release();
//   }
// };

// // ============================================================
// // DELETE REQUEST TYPE
// // ============================================================

// export const deleteQuickRequest = async (db, schema, requestId) => {
//   const client = await db.connect();

//   try {
//     await client.query("BEGIN");

//     const findQuery = `
//       SELECT request_name, org_id
//       FROM "${schema}".quick_request_types
//       WHERE id = $1
//       LIMIT 1;
//     `;

//     const findResult = await client.query(findQuery, [requestId]);

//     if (!findResult.rows.length) {
//       throw new Error("Request type not found");
//     }

//     const { request_name: requestName, org_id: orgId } = findResult.rows[0];

//     // Check responses
//     const responseCheck = await client.query(
//       `
//         SELECT COUNT(*)::int AS count
//         FROM "${schema}".quick_request_responses
//         WHERE request_type_id = $1
//           AND org_id = $2;
//       `,
//       [requestId, orgId]
//     );

//     if (responseCheck.rows[0].count > 0) {
//       throw new Error(
//         "This request type has responses and cannot be deleted. Mark it Inactive instead."
//       );
//     }

//     await client.query(
//       `
//         DELETE FROM "${schema}".quick_request_types
//         WHERE request_name = $1
//           AND org_id = $2;
//       `,
//       [requestName, orgId]
//     );

//     await client.query("COMMIT");
//     return true;
//   } catch (error) {
//     await client.query("ROLLBACK");
//     throw error;
//   } finally {
//     client.release();
//   }
// };

// // ============================================================
// // UPDATE REQUEST STATUS
// // ============================================================

// export const updateQuickRequestStatus = async (db, schema, requestId, status) => {
//   const findQuery = `
//     SELECT request_name, org_id
//     FROM "${schema}".quick_request_types
//     WHERE id = $1
//     LIMIT 1;
//   `;

//   const findResult = await db.query(findQuery, [requestId]);

//   if (!findResult.rows.length) {
//     return null;
//   }

//   const { request_name: requestName, org_id: orgId } = findResult.rows[0];

//   const query = `
//     UPDATE "${schema}".quick_request_types
//     SET
//       status = $1,
//       updated_at = CURRENT_TIMESTAMP
//     WHERE request_name = $2
//       AND org_id = $3
//     RETURNING id, request_name, status;
//   `;

//   const result = await db.query(query, [status, requestName, orgId]);
//   return result.rows[0];
// };

// // ============================================================
// // CREATE RESPONSE
// // ============================================================

// export const createQuickRequestResponse = async (db, schema, data) => {
//   const { requestTypeId, orgId, requestedBy, answers = {} } = data;

//   const query = `
//     INSERT INTO "${schema}".quick_request_responses
//     (
//       request_type_id,
//       org_id,
//       requested_by,
//       status,
//       answers
//     )
//     VALUES
//     (
//       $1, $2, $3, 'Pending', $4
//     )
//     RETURNING
//       id,
//       request_type_id,
//       org_id,
//       requested_by,
//       status,
//       answers,
//       submitted_at,
//       reviewed_by,
//       reviewed_at,
//       rejection_reason,
//       approval_comment,
//       announcement;
//   `;

//   const result = await db.query(query, [
//     requestTypeId,
//     orgId,
//     requestedBy,
//     JSON.stringify(answers || {}),
//   ]);

//   return result.rows[0];
// };

// // ============================================================
// // GET ALL RESPONSES
// // ============================================================

// export const getAllQuickRequestResponses = async (db, schema) => {
//   const query = `
//     SELECT
//       r.id,
//       r.request_type_id,
//       r.org_id,
//       r.requested_by,
//       r.status,
//       r.answers,
//       r.submitted_at,
//       r.reviewed_by,
//       r.reviewed_at,
//       r.rejection_reason,
//       r.approval_comment,
//       r.announcement,
//       q.request_name,
//       q.icon
//     FROM "${schema}".quick_request_responses r
//     LEFT JOIN "${schema}".quick_request_types q
//       ON q.id = r.request_type_id
//     ORDER BY r.submitted_at DESC;
//   `;

//   const result = await db.query(query);
//   return result.rows;
// };

// // ============================================================
// // GET RESPONSE BY ID
// // ============================================================

// export const getQuickRequestResponseById = async (db, schema, responseId) => {
//   const query = `
//     SELECT
//       r.id,
//       r.request_type_id,
//       r.org_id,
//       r.requested_by,
//       r.status,
//       r.answers,
//       r.submitted_at,
//       r.reviewed_by,
//       r.reviewed_at,
//       r.rejection_reason,
//       r.approval_comment,
//       r.announcement,
//       q.request_name
//     FROM "${schema}".quick_request_responses r
//     LEFT JOIN "${schema}".quick_request_types q
//       ON q.id = r.request_type_id
//     WHERE r.id = $1
//     LIMIT 1;
//   `;

//   const result = await db.query(query, [responseId]);
//   return result.rows[0] || null;
// };

// // ============================================================
// // GET MY RESPONSES
// // ============================================================

// export const getMyQuickRequestResponses = async (db, schema, userId) => {
//   const query = `
//     SELECT
//       r.id,
//       r.request_type_id,
//       r.org_id,
//       r.requested_by,
//       r.status,
//       r.answers,
//       r.submitted_at,
//       r.reviewed_by,
//       r.reviewed_at,
//       r.rejection_reason,
//       r.approval_comment,
//       r.announcement,
//       q.request_name,
//       q.icon
//     FROM "${schema}".quick_request_responses r
//     LEFT JOIN "${schema}".quick_request_types q
//       ON q.id = r.request_type_id
//     WHERE r.requested_by = $1
//     ORDER BY r.submitted_at DESC;
//   `;

//   const result = await db.query(query, [userId]);
//   return result.rows;
// };

// // ============================================================
// // UPDATE RESPONSE STATUS
// // ============================================================

// export const updateQuickRequestResponseStatus = async (
//   db,
//   schema,
//   responseId,
//   status,
//   reviewedBy,
//   rejectionReason = null,
//   approvalComment = null
// ) => {
//   const query = `
//     UPDATE "${schema}".quick_request_responses
//     SET
//       status = $1,
//       reviewed_by = $2,
//       reviewed_at = CURRENT_TIMESTAMP,
//       rejection_reason = $3,
//       approval_comment = $4
//     WHERE id = $5
//     RETURNING
//       id,
//       request_type_id,
//       org_id,
//       requested_by,
//       status,
//       answers,
//       submitted_at,
//       reviewed_by,
//       reviewed_at,
//       rejection_reason,
//       approval_comment,
//       announcement;
//   `;

//   const result = await db.query(query, [
//     status,
//     reviewedBy,
//     rejectionReason,
//     approvalComment,
//     responseId,
//   ]);

//   return result.rows[0] || null;
// };

// // ============================================================
// // SAVE ANNOUNCEMENT ON A RESPONSE
// // ============================================================

// export const saveAnnouncementOnResponse = async (
//   db,
//   schema,
//   responseId,
//   announcement
// ) => {
//   const query = `
//     UPDATE "${schema}".quick_request_responses
//     SET
//       announcement = $1
//     WHERE id = $2
//     RETURNING
//       id,
//       request_type_id,
//       org_id,
//       requested_by,
//       status,
//       answers,
//       submitted_at,
//       reviewed_by,
//       reviewed_at,
//       rejection_reason,
//       approval_comment,
//       announcement;
//   `;

//   const result = await db.query(query, [announcement, responseId]);
//   return result.rows[0] || null;
// };

// ============================================================
// GET ALL REQUESTS
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
      is_bookable,
      slots,
      max_bookings_per_slot,
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
      icon,
      is_bookable,
      slots,
      max_bookings_per_slot,
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
  return result.rows[0] || null;
};

// ============================================================
// GET ALL QUESTIONS FOR A REQUEST
// ============================================================
export const getQuestionsByRequestName = async (db, schema, requestName) => {
  const query = `
    SELECT
      id,
      org_id,
      request_name,
      description,
      status,
      icon,
      is_bookable,
      slots,
      max_bookings_per_slot,
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
export const createQuickRequest = async (db, schema, data) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const {
      orgId,
      requestName,
      description,
      status = "Active",
      icon = "other",
      is_bookable = false,
      slots = [],
      max_bookings_per_slot = 1,
      questions = [],
      createdBy = null,
    } = data;

    // Check duplicate request name
    const duplicateQuery = `
      SELECT id
      FROM "${schema}".quick_request_types
      WHERE org_id = $1
        AND LOWER(request_name) = LOWER($2)
      LIMIT 1;
    `;
    const duplicateResult = await client.query(duplicateQuery, [orgId, requestName]);
    if (duplicateResult.rows.length) {
      throw new Error("A request type with this name already exists");
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("At least one question is required");
    }

    let firstInserted = null;

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
          is_bookable,
          slots,
          max_bookings_per_slot,
          question,
          question_type,
          required,
          options,
          display_order,
          created_by
        )
        VALUES
        (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        )
        RETURNING
          id,
          org_id,
          request_name,
          description,
          status,
          icon,
          is_bookable,
          slots,
          max_bookings_per_slot,
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
        Boolean(is_bookable),
        JSON.stringify(slots || []),
        Number(max_bookings_per_slot) || 1,
        item.question || "",
        item.type || "text",
        Boolean(item.required),
        JSON.stringify(item.options || []),
        index,
        createdBy,
      ];

      const result = await client.query(query, values);
      if (!firstInserted) firstInserted = result.rows[0];
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
export const updateQuickRequest = async (db, schema, requestId, data) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const findQuery = `
      SELECT *
      FROM "${schema}".quick_request_types
      WHERE id = $1
      LIMIT 1;
    `;
    const findResult = await client.query(findQuery, [requestId]);
    if (!findResult.rows.length) {
      throw new Error("Request type not found");
    }

    const currentRequest = findResult.rows[0];
    const oldRequestName = currentRequest.request_name;

    const {
      name: requestName = oldRequestName,
      description = currentRequest.description,
      status = currentRequest.status,
      icon = currentRequest.icon || "other",
      is_bookable = currentRequest.is_bookable || false,
      slots = currentRequest.slots || [],
      max_bookings_per_slot = currentRequest.max_bookings_per_slot || 1,
      questions = [],
    } = data;

    // Check duplicate name
    const duplicateQuery = `
      SELECT id
      FROM "${schema}".quick_request_types
      WHERE org_id = $1
        AND LOWER(request_name) = LOWER($2)
        AND request_name <> $3
      LIMIT 1;
    `;
    const duplicateResult = await client.query(duplicateQuery, [
      currentRequest.org_id,
      requestName,
      oldRequestName,
    ]);
    if (duplicateResult.rows.length) {
      throw new Error("A request type with this name already exists");
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("At least one question is required");
    }

    const existingQuery = `
      SELECT id
      FROM "${schema}".quick_request_types
      WHERE request_name = $1
      ORDER BY display_order ASC, id ASC;
    `;
    const existingResult = await client.query(existingQuery, [oldRequestName]);
    const existingRows = existingResult.rows;
    const firstRowId = existingRows[0]?.id || requestId;

    const firstQuestion = questions[0];

    // Update first row
    await client.query(
      `
        UPDATE "${schema}".quick_request_types
        SET
          request_name = $1,
          description = $2,
          status = $3,
          icon = $4,
          is_bookable = $5,
          slots = $6,
          max_bookings_per_slot = $7,
          question = $8,
          question_type = $9,
          required = $10,
          options = $11,
          display_order = 0,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
      `,
      [
        requestName,
        description || null,
        status,
        icon,
        Boolean(is_bookable),
        JSON.stringify(slots || []),
        Number(max_bookings_per_slot) || 1,
        firstQuestion.question || "",
        firstQuestion.type || "text",
        Boolean(firstQuestion.required),
        JSON.stringify(firstQuestion.options || []),
        firstRowId,
      ]
    );

    // Delete extra question rows
    await client.query(
      `
        DELETE FROM "${schema}".quick_request_types
        WHERE request_name = $1
          AND id <> $2;
      `,
      [oldRequestName, firstRowId]
    );

    // Insert remaining questions
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
            is_bookable,
            slots,
            max_bookings_per_slot,
            question,
            question_type,
            required,
            options,
            display_order,
            created_by
          )
          VALUES
          (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
          );
        `,
        [
          currentRequest.org_id,
          requestName,
          description || null,
          status,
          icon,
          Boolean(is_bookable),
          JSON.stringify(slots || []),
          Number(max_bookings_per_slot) || 1,
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
    return { id: firstRowId, requestName };
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
export const deleteQuickRequest = async (db, schema, requestId) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const findQuery = `
      SELECT request_name, org_id
      FROM "${schema}".quick_request_types
      WHERE id = $1
      LIMIT 1;
    `;
    const findResult = await client.query(findQuery, [requestId]);
    if (!findResult.rows.length) {
      throw new Error("Request type not found");
    }

    const { request_name: requestName, org_id: orgId } = findResult.rows[0];

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
export const updateQuickRequestStatus = async (db, schema, requestId, status) => {
  const findQuery = `
    SELECT request_name, org_id
    FROM "${schema}".quick_request_types
    WHERE id = $1
    LIMIT 1;
  `;
  const findResult = await db.query(findQuery, [requestId]);
  if (!findResult.rows.length) return null;

  const { request_name: requestName, org_id: orgId } = findResult.rows[0];

  const query = `
    UPDATE "${schema}".quick_request_types
    SET
      status = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE request_name = $2
      AND org_id = $3
    RETURNING id, request_name, status;
  `;
  const result = await db.query(query, [status, requestName, orgId]);
  return result.rows[0];
};

// ============================================================
// CREATE RESPONSE
// ============================================================
export const createQuickRequestResponse = async (db, schema, data) => {
  const { requestTypeId, orgId, requestedBy, answers = {} } = data;

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
      $1, $2, $3, 'Pending', $4
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
      rejection_reason,
      approval_comment,
      announcement;
  `;

  const result = await db.query(query, [
    requestTypeId,
    orgId,
    requestedBy,
    JSON.stringify(answers || {}),
  ]);

  return result.rows[0];
};

// ============================================================
// GET ALL RESPONSES
// ============================================================
export const getAllQuickRequestResponses = async (db, schema) => {
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
      r.announcement,
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
export const getQuickRequestResponseById = async (db, schema, responseId) => {
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
      r.announcement,
      q.request_name
    FROM "${schema}".quick_request_responses r
    LEFT JOIN "${schema}".quick_request_types q
      ON q.id = r.request_type_id
    WHERE r.id = $1
    LIMIT 1;
  `;
  const result = await db.query(query, [responseId]);
  return result.rows[0] || null;
};

// ============================================================
// GET MY RESPONSES
// ============================================================
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
      r.announcement,
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
  approvalComment = null
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
      approval_comment,
      announcement;
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

// ============================================================
// SAVE ANNOUNCEMENT
// ============================================================
export const saveAnnouncementOnResponse = async (db, schema, responseId, announcement) => {
  const query = `
    UPDATE "${schema}".quick_request_responses
    SET announcement = $1
    WHERE id = $2
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
      approval_comment,
      announcement;
  `;
  const result = await db.query(query, [announcement, responseId]);
  return result.rows[0] || null;
};

// ============================================================
// SLOT AVAILABILITY (NEW)
// ============================================================

// export const getSlotAvailability = async (db, schema, requestTypeId, date) => {
//   // 1. Get request type config
//   const typeQuery = `
//     SELECT
//       id,
//       is_bookable,
//       slots,
//       max_bookings_per_slot
//     FROM "${schema}".quick_request_types
//     WHERE id = $1
//     LIMIT 1;
//   `;
//   const typeResult = await db.query(typeQuery, [requestTypeId]);
//   const requestType = typeResult.rows[0];

//   if (!requestType || !requestType.is_bookable) {
//     return { success: false, message: "This request type is not bookable" };
//   }

//   const slots = Array.isArray(requestType.slots)
//     ? requestType.slots
//     : typeof requestType.slots === "string"
//     ? JSON.parse(requestType.slots || "[]")
//     : [];

//   const maxPerSlot = Number(requestType.max_bookings_per_slot) || 1;

//   // 2. Get all responses for this request type that have the given date
//   const responsesQuery = `
//     SELECT
//       status,
//       answers
//     FROM "${schema}".quick_request_responses
//     WHERE request_type_id = $1
//       AND answers->>'date' = $2
//       AND status IN ('Pending', 'Approved');
//   `;
//   const responsesResult = await db.query(responsesQuery, [requestTypeId, date]);

//   // 3. Count per slot
//   const counts = {};
//   for (const slot of slots) {
//     counts[slot.id] = { approved: 0, pending: 0 };
//   }

//   for (const row of responsesResult.rows) {
//     const answers = typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers || {};
//     const slotId = answers.slot;
//     if (!slotId || !counts[slotId]) continue;

//     if (row.status === "Approved") counts[slotId].approved += 1;
//     else if (row.status === "Pending") counts[slotId].pending += 1;
//   }

//   // 4. Build response
//   const data = slots.map((slot) => {
//     const approved = counts[slot.id]?.approved || 0;
//     const pending = counts[slot.id]?.pending || 0;
//     const available = approved < maxPerSlot;

//     let status = "available";
//     if (!available) status = "booked";
//     else if (pending > 0) status = "pending";

//     return {
//       slotId: slot.id,
//       label: slot.label,
//       approvedCount: approved,
//       pendingCount: pending,
//       available,
//       status,
//     };
//   });

//   return { success: true, data };
// };
export const getSlotAvailability = async (db, schema, requestTypeId, date) => {
  // 1. Get any row of this request type (they all have the same slots)
  const typeQuery = `
    SELECT
      id,
      request_name,
      is_bookable,
      slots,
      max_bookings_per_slot
    FROM "${schema}".quick_request_types
    WHERE id = $1
    LIMIT 1;
  `;
  const typeResult = await db.query(typeQuery, [requestTypeId]);
  const requestType = typeResult.rows[0];

  if (!requestType) {
    return { success: false, message: "Request type not found" };
  }

  if (!requestType.is_bookable) {
    return { success: false, message: "This request type is not bookable" };
  }

  // Parse slots safely
  let slots = [];
  try {
    if (Array.isArray(requestType.slots)) {
      slots = requestType.slots;
    } else if (typeof requestType.slots === "string") {
      slots = JSON.parse(requestType.slots || "[]");
    } else if (requestType.slots && typeof requestType.slots === "object") {
      slots = requestType.slots;
    }
  } catch (e) {
    console.error("Failed to parse slots:", e);
    slots = [];
  }

  if (!Array.isArray(slots) || slots.length === 0) {
    return { success: true, data: [] };
  }

  const maxPerSlot = Number(requestType.max_bookings_per_slot) || 1;

  // 2. Get all responses for this request type on the given date
  //    We look at answers->>'date' and answers->>'slot'
  const responsesQuery = `
    SELECT
      status,
      answers
    FROM "${schema}".quick_request_responses
    WHERE request_type_id IN (
      SELECT id FROM "${schema}".quick_request_types
      WHERE request_name = $1
    )
    AND answers->>'date' = $2
    AND status IN ('Pending', 'Approved');
  `;
  const responsesResult = await db.query(responsesQuery, [
    requestType.request_name,
    date,
  ]);

  // 3. Count per slot
  const counts = {};
  for (const slot of slots) {
    counts[slot.id] = { approved: 0, pending: 0 };
  }

  for (const row of responsesResult.rows) {
    let answers = row.answers;
    if (typeof answers === "string") {
      try {
        answers = JSON.parse(answers);
      } catch {
        answers = {};
      }
    }
    answers = answers || {};

    const slotId = answers.slot;
    if (!slotId || !counts[slotId]) continue;

    if (row.status === "Approved") counts[slotId].approved += 1;
    else if (row.status === "Pending") counts[slotId].pending += 1;
  }

  // 4. Build final response
  const data = slots.map((slot) => {
    const approved = counts[slot.id]?.approved || 0;
    const pending = counts[slot.id]?.pending || 0;
    const available = approved < maxPerSlot;

    let status = "available";
    if (!available) status = "booked";
    else if (pending > 0) status = "pending";

    return {
      slotId: slot.id,
      label: slot.label,
      approvedCount: approved,
      pendingCount: pending,
      available,
      status,
    };
  });

  return { success: true, data };
};