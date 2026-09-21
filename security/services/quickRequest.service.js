// // // // // quickRequest/services/quickRequest.service.js

// // // // import masterAuthDB from "../../config/masterAuthDB.js";
// // // // import { getDB } from "../../config/dbFactory.js";
// // // // import {
// // // //   getOrganisationById,
// // // // } from "../../auth/models/organisation.model.js";

// // // // import * as model from "../models/quickRequest.model.js";

// // // // // ============================================================
// // // // // GET ORGANISATION DATABASE
// // // // // ============================================================

// // // // const getOrganisationDB = async (organisationId) => {
// // // //   const org = await getOrganisationById(
// // // //     masterAuthDB,
// // // //     organisationId
// // // //   );

// // // //   if (!org) {
// // // //     return {
// // // //       success: false,
// // // //       message: "Organisation not found",
// // // //     };
// // // //   }

// // // //   const db = getDB(org.org_type);

// // // //   if (!db) {
// // // //     return {
// // // //       success: false,
// // // //       message: "Organisation database not found",
// // // //     };
// // // //   }

// // // //   return {
// // // //     success: true,
// // // //     org,
// // // //     db,
// // // //     schema: org.schema_name,
// // // //   };
// // // // };

// // // // // ============================================================
// // // // // GET ALL REQUESTS
// // // // // ============================================================

// // // // export const getAllQuickRequestsService = async (
// // // //   organisationId
// // // // ) => {
// // // //   const connection = await getOrganisationDB(
// // // //     organisationId
// // // //   );

// // // //   if (!connection.success) {
// // // //     return connection;
// // // //   }

// // // //   const rows = await model.getAllQuickRequests(
// // // //     connection.db,
// // // //     connection.schema
// // // //   );

// // // //   // ----------------------------------------------------------
// // // //   // Group question rows into request objects
// // // //   // ----------------------------------------------------------

// // // //   const grouped = {};

// // // //   for (const row of rows) {
// // // //     const rowIcon = String(row.icon || "").trim().toLowerCase();

// // // //     if (!grouped[row.request_name]) {
// // // //       grouped[row.request_name] = {
// // // //         id: row.id,
// // // //         name: row.request_name,
// // // //         description: row.description || "",
// // // //         status: row.status,
// // // //         icon: rowIcon || "other",
// // // //         questions: [],
// // // //         createdDate: row.created_at,
// // // //       };
// // // //     } else if (grouped[row.request_name].icon === "other" && rowIcon) {
// // // //       grouped[row.request_name].icon = rowIcon;
// // // //     }

// // // //     if (row.question) {
// // // //       grouped[row.request_name].questions.push({
// // // //         id: row.id,
// // // //         question: row.question,
// // // //         type: row.question_type,
// // // //         required: row.required,
// // // //         options: Array.isArray(row.options)
// // // //           ? row.options
// // // //           : [],
// // // //       });
// // // //     }
// // // //   }

// // // //   return {
// // // //     success: true,
// // // //     data: Object.values(grouped),
// // // //   };
// // // // };

// // // // // ============================================================
// // // // // GET SINGLE REQUEST
// // // // // ============================================================

// // // // export const getQuickRequestByIdService = async (
// // // //   organisationId,
// // // //   requestId
// // // // ) => {
// // // //   const connection = await getOrganisationDB(
// // // //     organisationId
// // // //   );

// // // //   if (!connection.success) {
// // // //     return connection;
// // // //   }

// // // //   const row = await model.getQuickRequestById(
// // // //     connection.db,
// // // //     connection.schema,
// // // //     requestId
// // // //   );

// // // //   if (!row) {
// // // //     return {
// // // //       success: false,
// // // //       message: "Request type not found",
// // // //     };
// // // //   }

// // // //   const rows = await model.getQuestionsByRequestName(
// // // //     connection.db,
// // // //     connection.schema,
// // // //     row.request_name
// // // //   );

// // // //   return {
// // // //     success: true,
// // // //     data: {
// // // //       id: row.id,
// // // //       name: row.request_name,
// // // //       description: row.description || "",
// // // //       status: row.status,
// // // //       icon: row.icon || "other",
// // // //       questions: rows.map((item) => ({
// // // //         id: item.id,
// // // //         question: item.question,
// // // //         type: item.question_type,
// // // //         required: item.required,
// // // //         options: Array.isArray(item.options)
// // // //           ? item.options
// // // //           : [],
// // // //       })),
// // // //       createdDate: row.created_at,
// // // //     },
// // // //   };
// // // // };

// // // // // ============================================================
// // // // // CREATE REQUEST
// // // // // ============================================================

// // // // export const createQuickRequestService = async (
// // // //   organisationId,
// // // //   data,
// // // //   userId
// // // // ) => {
// // // //   const connection = await getOrganisationDB(
// // // //     organisationId
// // // //   );

// // // //   if (!connection.success) {
// // // //     return connection;
// // // //   }

// // // //   if (!data?.name?.trim()) {
// // // //     return {
// // // //       success: false,
// // // //       message: "Request name is required",
// // // //     };
// // // //   }

// // // //   if (
// // // //     !Array.isArray(data.questions) ||
// // // //     data.questions.length === 0
// // // //   ) {
// // // //     return {
// // // //       success: false,
// // // //       message: "At least one question is required",
// // // //     };
// // // //   }

// // // //   try {
// // // //     const row = await model.createQuickRequest(
// // // //       connection.db,
// // // //       connection.schema,
// // // //       {
// // // //         orgId: organisationId,
// // // //         requestName: data.name.trim(),
// // // //         description: data.description || "",
// // // //         status: data.status || "Active",
// // // //         icon: data.icon || "other",
// // // //         questions: data.questions,
// // // //         createdBy: userId,
// // // //       }
// // // //     );

// // // //     return {
// // // //       success: true,
// // // //       message: "Quick request created successfully",
// // // //       data: {
// // // //         id: row.id,
// // // //         name: row.request_name,
// // // //       },
// // // //     };
// // // //   } catch (error) {
// // // //     return {
// // // //       success: false,
// // // //       message: error.message,
// // // //     };
// // // //   }
// // // // };

// // // // // ============================================================
// // // // // UPDATE REQUEST
// // // // // ============================================================

// // // // export const updateQuickRequestService = async (
// // // //   organisationId,
// // // //   requestId,
// // // //   data
// // // // ) => {
// // // //   const connection = await getOrganisationDB(
// // // //     organisationId
// // // //   );

// // // //   if (!connection.success) {
// // // //     return connection;
// // // //   }

// // // //   try {
// // // //     const result = await model.updateQuickRequest(
// // // //       connection.db,
// // // //       connection.schema,
// // // //       requestId,
// // // //       data
// // // //     );

// // // //     return {
// // // //       success: true,
// // // //       message: "Quick request updated successfully",
// // // //       data: result,
// // // //     };
// // // //   } catch (error) {
// // // //     return {
// // // //       success: false,
// // // //       message: error.message,
// // // //     };
// // // //   }
// // // // };

// // // // // ============================================================
// // // // // DELETE REQUEST
// // // // // ============================================================

// // // // export const deleteQuickRequestService = async (
// // // //   organisationId,
// // // //   requestId
// // // // ) => {
// // // //   const connection = await getOrganisationDB(
// // // //     organisationId
// // // //   );

// // // //   if (!connection.success) {
// // // //     return connection;
// // // //   }

// // // //   try {
// // // //     await model.deleteQuickRequest(
// // // //       connection.db,
// // // //       connection.schema,
// // // //       requestId
// // // //     );

// // // //     return {
// // // //       success: true,
// // // //       message: "Quick request deleted successfully",
// // // //     };
// // // //   } catch (error) {
// // // //     return {
// // // //       success: false,
// // // //       message: error.message,
// // // //     };
// // // //   }
// // // // };

// // // // // ============================================================
// // // // // UPDATE REQUEST STATUS
// // // // // ============================================================

// // // // export const updateQuickRequestStatusService = async (
// // // //   organisationId,
// // // //   requestId,
// // // //   status
// // // // ) => {
// // // //   const connection = await getOrganisationDB(
// // // //     organisationId
// // // //   );

// // // //   if (!connection.success) {
// // // //     return connection;
// // // //   }

// // // //   if (!["Active", "Inactive"].includes(status)) {
// // // //     return {
// // // //       success: false,
// // // //       message: "Invalid request status",
// // // //     };
// // // //   }

// // // //   const result =
// // // //     await model.updateQuickRequestStatus(
// // // //       connection.db,
// // // //       connection.schema,
// // // //       requestId,
// // // //       status
// // // //     );

// // // //   if (!result) {
// // // //     return {
// // // //       success: false,
// // // //       message: "Request type not found",
// // // //     };
// // // //   }

// // // //   return {
// // // //     success: true,
// // // //     message: "Request status updated successfully",
// // // //     data: result,
// // // //   };
// // // // };

// // // // // ============================================================
// // // // // CREATE RESPONSE
// // // // // ============================================================

// // // // export const createQuickRequestResponseService = async (
// // // //   organisationId,
// // // //   requestTypeId,
// // // //   answers,
// // // //   requestedBy
// // // // ) => {
// // // //   const connection = await getOrganisationDB(
// // // //     organisationId
// // // //   );

// // // //   if (!connection.success) {
// // // //     return connection;
// // // //   }

// // // //   // ----------------------------------------------------------
// // // //   // Verify request exists
// // // //   // ----------------------------------------------------------

// // // //   const request = await model.getQuickRequestById(
// // // //     connection.db,
// // // //     connection.schema,
// // // //     requestTypeId
// // // //   );

// // // //   if (!request) {
// // // //     return {
// // // //       success: false,
// // // //       message: "Request type not found",
// // // //     };
// // // //   }

// // // //   if (request.status !== "Active") {
// // // //     return {
// // // //       success: false,
// // // //       message: "This request type is inactive",
// // // //     };
// // // //   }

// // // //   try {
// // // //     const result =
// // // //       await model.createQuickRequestResponse(
// // // //         connection.db,
// // // //         connection.schema,
// // // //         {
// // // //           requestTypeId,
// // // //           orgId: organisationId,
// // // //           requestedBy,
// // // //           answers,
// // // //         }
// // // //       );

// // // //     return {
// // // //       success: true,
// // // //       message: "Request submitted successfully",
// // // //       data: result,
// // // //     };
// // // //   } catch (error) {
// // // //     return {
// // // //       success: false,
// // // //       message: error.message,
// // // //     };
// // // //   }
// // // // };

// // // // // ============================================================
// // // // // GET ALL RESPONSES
// // // // // ============================================================
// // // // // services/quickRequest.service.js

// // // // export const getMyQuickRequestResponsesService = async (organisationId, userId) => {
// // // //   const connection = await getOrganisationDB(organisationId);
// // // //   if (!connection.success) return connection;

// // // //   const rows = await model.getMyQuickRequestResponses(
// // // //     connection.db,
// // // //     connection.schema,
// // // //     userId
// // // //   );

// // // //   const data = await Promise.all(
// // // //     rows.map(async (row) => {
// // // //       const questionRows = row.request_name
// // // //         ? await model.getQuestionsByRequestName(
// // // //             connection.db,
// // // //             connection.schema,
// // // //             row.request_name
// // // //           )
// // // //         : [];

// // // //       return {
// // // //         id: row.id,
// // // //         requestTypeId: row.request_type_id,
// // // //         requestName: row.request_name || "Unknown Request",
// // // //         requestedBy: row.requested_by,
// // // //         date: row.submitted_at,
// // // //         status: row.status,
// // // //         icon: row.icon || "other",
// // // //         answers: row.answers || {},
// // // //         questions: questionRows.map((question) => ({
// // // //           id: question.id,
// // // //           question: question.question,
// // // //         })),
// // // //         reviewedBy: row.reviewed_by,
// // // //         reviewedAt: row.reviewed_at,
// // // //         rejectionReason: row.rejection_reason,
// // // //         approvalComment: row.approval_comment,
// // // //       };
// // // //     })
// // // //   );

// // // //   return { success: true, data };
// // // // };
// // // // export const getAllQuickRequestResponsesService =
// // // //   async (organisationId) => {
// // // //     const connection = await getOrganisationDB(
// // // //       organisationId
// // // //     );

// // // //     if (!connection.success) {
// // // //       return connection;
// // // //     }

// // // //     const rows =
// // // //       await model.getAllQuickRequestResponses(
// // // //         connection.db,
// // // //         connection.schema
// // // //       );

// // // //     const data = await Promise.all(
// // // //       rows.map(async (row) => {
// // // //         const questionRows = row.request_name
// // // //           ? await model.getQuestionsByRequestName(
// // // //               connection.db,
// // // //               connection.schema,
// // // //               row.request_name
// // // //             )
// // // //           : [];

// // // //         return {
// // // //           id: row.id,
// // // //           requestTypeId: row.request_type_id,
// // // //           requestName: row.request_name || "Unknown Request",
// // // //           icon: row.icon || "other",
// // // //           requestedBy: row.requested_by,
// // // //           date: row.submitted_at,
// // // //           status: row.status,
// // // //           answers: row.answers || {},
// // // //           questions: questionRows.map((question) => ({
// // // //             id: question.id,
// // // //             question: question.question,
// // // //           })),
// // // //           reviewedBy: row.reviewed_by,
// // // //           reviewedAt: row.reviewed_at,
// // // //           rejectionReason: row.rejection_reason,
// // // //           approvalComment: row.approval_comment,
// // // //         };
// // // //       })
// // // //     );

// // // //     return { success: true, data };
// // // //   };

// // // // // ============================================================
// // // // // GET RESPONSE
// // // // // ============================================================

// // // // export const getQuickRequestResponseByIdService =
// // // //   async (
// // // //     organisationId,
// // // //     responseId
// // // //   ) => {
// // // //     const connection = await getOrganisationDB(
// // // //       organisationId
// // // //     );

// // // //     if (!connection.success) {
// // // //       return connection;
// // // //     }

// // // //     const row =
// // // //       await model.getQuickRequestResponseById(
// // // //         connection.db,
// // // //         connection.schema,
// // // //         responseId
// // // //       );

// // // //     if (!row) {
// // // //       return {
// // // //         success: false,
// // // //         message: "Response not found",
// // // //       };
// // // //     }

// // // //     return {
// // // //       success: true,
// // // //       data: {
// // // //         id: row.id,
// // // //         requestTypeId: row.request_type_id,
// // // //         requestName: row.request_name,
// // // //         requestedBy: row.requested_by,
// // // //         status: row.status,
// // // //         answers: row.answers || {},
// // // //         submittedAt: row.submitted_at,
// // // //         reviewedBy: row.reviewed_by,
// // // //         reviewedAt: row.reviewed_at,
// // // //         rejectionReason: row.rejection_reason,
// // // //         approvalComment: row.approval_comment,
// // // //       },
// // // //     };
// // // //   };

// // // // // ============================================================
// // // // // UPDATE RESPONSE STATUS
// // // // // ============================================================

// // // // export const updateQuickRequestResponseStatusService = async (
// // // //   organisationId,
// // // //   responseId,
// // // //   status,
// // // //   reviewedBy,
// // // //   rejectionReason,
// // // //   approvalComment              // ← add
// // // // ) => {
// // // //   const connection = await getOrganisationDB(organisationId);
// // // //   if (!connection.success) return connection;

// // // //   if (!["Pending", "Approved", "Rejected"].includes(status)) {
// // // //     return { success: false, message: "Invalid response status" };
// // // //   }

// // // //   if (status === "Rejected" && !rejectionReason?.trim()) {
// // // //     return {
// // // //       success: false,
// // // //       message: "Rejection reason is required when rejecting a request",
// // // //     };
// // // //   }

// // // //   const result = await model.updateQuickRequestResponseStatus(
// // // //     connection.db,
// // // //     connection.schema,
// // // //     responseId,
// // // //     status,
// // // //     reviewedBy,
// // // //     status === "Rejected" ? rejectionReason || null : null,
// // // //     status === "Approved" ? approvalComment || null : null   // ← add
// // // //   );

// // // //   if (!result) {
// // // //     return { success: false, message: "Response not found" };
// // // //   }

// // // //   return {
// // // //     success: true,
// // // //     message: "Response status updated successfully",
// // // //     data: result,
// // // //   };
// // // // };

// // // import masterAuthDB from "../../config/masterAuthDB.js";
// // // import { getDB } from "../../config/dbFactory.js";
// // // import { getOrganisationById } from "../../auth/models/organisation.model.js";
// // // import * as model from "../models/quickRequest.model.js";

// // // // ============================================================
// // // // GET ORGANISATION DATABASE
// // // // ============================================================

// // // const getOrganisationDB = async (organisationId) => {
// // //   const org = await getOrganisationById(masterAuthDB, organisationId);

// // //   if (!org) {
// // //     return { success: false, message: "Organisation not found" };
// // //   }

// // //   const db = getDB(org.org_type);

// // //   if (!db) {
// // //     return { success: false, message: "Organisation database not found" };
// // //   }

// // //   return {
// // //     success: true,
// // //     org,
// // //     db,
// // //     schema: org.schema_name,
// // //   };
// // // };

// // // // ============================================================
// // // // GET ALL REQUESTS
// // // // ============================================================

// // // export const getAllQuickRequestsService = async (organisationId) => {
// // //   const connection = await getOrganisationDB(organisationId);
// // //   if (!connection.success) return connection;

// // //   const rows = await model.getAllQuickRequests(connection.db, connection.schema);

// // //   const grouped = {};

// // //   for (const row of rows) {
// // //     const rowIcon = String(row.icon || "").trim().toLowerCase();

// // //     if (!grouped[row.request_name]) {
// // //       grouped[row.request_name] = {
// // //         id: row.id,
// // //         name: row.request_name,
// // //         description: row.description || "",
// // //         status: row.status,
// // //         icon: rowIcon || "other",
// // //         questions: [],
// // //         createdDate: row.created_at,
// // //       };
// // //     } else if (grouped[row.request_name].icon === "other" && rowIcon) {
// // //       grouped[row.request_name].icon = rowIcon;
// // //     }

// // //     if (row.question) {
// // //       grouped[row.request_name].questions.push({
// // //         id: row.id,
// // //         question: row.question,
// // //         type: row.question_type,
// // //         required: row.required,
// // //         options: Array.isArray(row.options) ? row.options : [],
// // //       });
// // //     }
// // //   }

// // //   return {
// // //     success: true,
// // //     data: Object.values(grouped),
// // //   };
// // // };

// // // // ============================================================
// // // // GET SINGLE REQUEST
// // // // ============================================================

// // // export const getQuickRequestByIdService = async (organisationId, requestId) => {
// // //   const connection = await getOrganisationDB(organisationId);
// // //   if (!connection.success) return connection;

// // //   const row = await model.getQuickRequestById(connection.db, connection.schema, requestId);

// // //   if (!row) {
// // //     return { success: false, message: "Request type not found" };
// // //   }

// // //   const rows = await model.getQuestionsByRequestName(
// // //     connection.db,
// // //     connection.schema,
// // //     row.request_name
// // //   );

// // //   return {
// // //     success: true,
// // //     data: {
// // //       id: row.id,
// // //       name: row.request_name,
// // //       description: row.description || "",
// // //       status: row.status,
// // //       icon: row.icon || "other",
// // //       questions: rows.map((item) => ({
// // //         id: item.id,
// // //         question: item.question,
// // //         type: item.question_type,
// // //         required: item.required,
// // //         options: Array.isArray(item.options) ? item.options : [],
// // //       })),
// // //       createdDate: row.created_at,
// // //     },
// // //   };
// // // };

// // // // ============================================================
// // // // CREATE REQUEST
// // // // ============================================================

// // // export const createQuickRequestService = async (organisationId, data, userId) => {
// // //   const connection = await getOrganisationDB(organisationId);
// // //   if (!connection.success) return connection;

// // //   if (!data?.name?.trim()) {
// // //     return { success: false, message: "Request name is required" };
// // //   }

// // //   if (!Array.isArray(data.questions) || data.questions.length === 0) {
// // //     return { success: false, message: "At least one question is required" };
// // //   }

// // //   try {
// // //     const row = await model.createQuickRequest(connection.db, connection.schema, {
// // //       orgId: organisationId,
// // //       requestName: data.name.trim(),
// // //       description: data.description || "",
// // //       status: data.status || "Active",
// // //       icon: data.icon || "other",
// // //       questions: data.questions,
// // //       createdBy: userId,
// // //     });

// // //     return {
// // //       success: true,
// // //       message: "Quick request created successfully",
// // //       data: {
// // //         id: row.id,
// // //         name: row.request_name,
// // //       },
// // //     };
// // //   } catch (error) {
// // //     return { success: false, message: error.message };
// // //   }
// // // };

// // // // ============================================================
// // // // UPDATE REQUEST
// // // // ============================================================

// // // export const updateQuickRequestService = async (organisationId, requestId, data) => {
// // //   const connection = await getOrganisationDB(organisationId);
// // //   if (!connection.success) return connection;

// // //   try {
// // //     const result = await model.updateQuickRequest(
// // //       connection.db,
// // //       connection.schema,
// // //       requestId,
// // //       data
// // //     );

// // //     return {
// // //       success: true,
// // //       message: "Quick request updated successfully",
// // //       data: result,
// // //     };
// // //   } catch (error) {
// // //     return { success: false, message: error.message };
// // //   }
// // // };

// // // // ============================================================
// // // // DELETE REQUEST
// // // // ============================================================

// // // export const deleteQuickRequestService = async (organisationId, requestId) => {
// // //   const connection = await getOrganisationDB(organisationId);
// // //   if (!connection.success) return connection;

// // //   try {
// // //     await model.deleteQuickRequest(connection.db, connection.schema, requestId);

// // //     return {
// // //       success: true,
// // //       message: "Quick request deleted successfully",
// // //     };
// // //   } catch (error) {
// // //     return { success: false, message: error.message };
// // //   }
// // // };

// // // // ============================================================
// // // // UPDATE REQUEST STATUS
// // // // ============================================================

// // // export const updateQuickRequestStatusService = async (
// // //   organisationId,
// // //   requestId,
// // //   status
// // // ) => {
// // //   const connection = await getOrganisationDB(organisationId);
// // //   if (!connection.success) return connection;

// // //   if (!["Active", "Inactive"].includes(status)) {
// // //     return { success: false, message: "Invalid request status" };
// // //   }

// // //   const result = await model.updateQuickRequestStatus(
// // //     connection.db,
// // //     connection.schema,
// // //     requestId,
// // //     status
// // //   );

// // //   if (!result) {
// // //     return { success: false, message: "Request type not found" };
// // //   }

// // //   return {
// // //     success: true,
// // //     message: "Request status updated successfully",
// // //     data: result,
// // //   };
// // // };

// // // // ============================================================
// // // // CREATE RESPONSE
// // // // ============================================================

// // // export const createQuickRequestResponseService = async (
// // //   organisationId,
// // //   requestTypeId,
// // //   answers,
// // //   requestedBy
// // // ) => {
// // //   const connection = await getOrganisationDB(organisationId);
// // //   if (!connection.success) return connection;

// // //   const request = await model.getQuickRequestById(
// // //     connection.db,
// // //     connection.schema,
// // //     requestTypeId
// // //   );

// // //   if (!request) {
// // //     return { success: false, message: "Request type not found" };
// // //   }

// // //   if (request.status !== "Active") {
// // //     return { success: false, message: "This request type is inactive" };
// // //   }

// // //   try {
// // //     const result = await model.createQuickRequestResponse(
// // //       connection.db,
// // //       connection.schema,
// // //       {
// // //         requestTypeId,
// // //         orgId: organisationId,
// // //         requestedBy,
// // //         answers,
// // //       }
// // //     );

// // //     return {
// // //       success: true,
// // //       message: "Request submitted successfully",
// // //       data: result,
// // //     };
// // //   } catch (error) {
// // //     return { success: false, message: error.message };
// // //   }
// // // };

// // // // ============================================================
// // // // GET ALL RESPONSES
// // // // ============================================================

// // // export const getAllQuickRequestResponsesService = async (organisationId) => {
// // //   const connection = await getOrganisationDB(organisationId);
// // //   if (!connection.success) return connection;

// // //   const rows = await model.getAllQuickRequestResponses(
// // //     connection.db,
// // //     connection.schema
// // //   );

// // //   const data = await Promise.all(
// // //     rows.map(async (row) => {
// // //       const questionRows = row.request_name
// // //         ? await model.getQuestionsByRequestName(
// // //             connection.db,
// // //             connection.schema,
// // //             row.request_name
// // //           )
// // //         : [];

// // //       return {
// // //         id: row.id,
// // //         requestTypeId: row.request_type_id,
// // //         requestName: row.request_name || "Unknown Request",
// // //         icon: row.icon || "other",
// // //         requestedBy: row.requested_by,
// // //         date: row.submitted_at,
// // //         status: row.status,
// // //         answers: row.answers || {},
// // //         questions: questionRows.map((question) => ({
// // //           id: question.id,
// // //           question: question.question,
// // //         })),
// // //         reviewedBy: row.reviewed_by,
// // //         reviewedAt: row.reviewed_at,
// // //         rejectionReason: row.rejection_reason,
// // //         approvalComment: row.approval_comment,
// // //         announcement: row.announcement || null,
// // //       };
// // //     })
// // //   );

// // //   return { success: true, data };
// // // };

// // // // ============================================================
// // // // GET MY RESPONSES
// // // // ============================================================

// // // export const getMyQuickRequestResponsesService = async (organisationId, userId) => {
// // //   const connection = await getOrganisationDB(organisationId);
// // //   if (!connection.success) return connection;

// // //   const rows = await model.getMyQuickRequestResponses(
// // //     connection.db,
// // //     connection.schema,
// // //     userId
// // //   );

// // //   const data = await Promise.all(
// // //     rows.map(async (row) => {
// // //       const questionRows = row.request_name
// // //         ? await model.getQuestionsByRequestName(
// // //             connection.db,
// // //             connection.schema,
// // //             row.request_name
// // //           )
// // //         : [];

// // //       return {
// // //         id: row.id,
// // //         requestTypeId: row.request_type_id,
// // //         requestName: row.request_name || "Unknown Request",
// // //         requestedBy: row.requested_by,
// // //         date: row.submitted_at,
// // //         status: row.status,
// // //         icon: row.icon || "other",
// // //         answers: row.answers || {},
// // //         questions: questionRows.map((question) => ({
// // //           id: question.id,
// // //           question: question.question,
// // //         })),
// // //         reviewedBy: row.reviewed_by,
// // //         reviewedAt: row.reviewed_at,
// // //         rejectionReason: row.rejection_reason,
// // //         approvalComment: row.approval_comment,
// // //         announcement: row.announcement || null,
// // //       };
// // //     })
// // //   );

// // //   return { success: true, data };
// // // };

// // // // ============================================================
// // // // GET RESPONSE BY ID
// // // // ============================================================

// // // export const getQuickRequestResponseByIdService = async (
// // //   organisationId,
// // //   responseId
// // // ) => {
// // //   const connection = await getOrganisationDB(organisationId);
// // //   if (!connection.success) return connection;

// // //   const row = await model.getQuickRequestResponseById(
// // //     connection.db,
// // //     connection.schema,
// // //     responseId
// // //   );

// // //   if (!row) {
// // //     return { success: false, message: "Response not found" };
// // //   }

// // //   return {
// // //     success: true,
// // //     data: {
// // //       id: row.id,
// // //       requestTypeId: row.request_type_id,
// // //       requestName: row.request_name,
// // //       requestedBy: row.requested_by,
// // //       status: row.status,
// // //       answers: row.answers || {},
// // //       submittedAt: row.submitted_at,
// // //       reviewedBy: row.reviewed_by,
// // //       reviewedAt: row.reviewed_at,
// // //       rejectionReason: row.rejection_reason,
// // //       approvalComment: row.approval_comment,
// // //       announcement: row.announcement || null,
// // //     },
// // //   };
// // // };

// // // // ============================================================
// // // // UPDATE RESPONSE STATUS
// // // // ============================================================

// // // export const updateQuickRequestResponseStatusService = async (
// // //   organisationId,
// // //   responseId,
// // //   status,
// // //   reviewedBy,
// // //   rejectionReason,
// // //   approvalComment
// // // ) => {
// // //   const connection = await getOrganisationDB(organisationId);
// // //   if (!connection.success) return connection;

// // //   if (!["Pending", "Approved", "Rejected"].includes(status)) {
// // //     return { success: false, message: "Invalid response status" };
// // //   }

// // //   if (status === "Rejected" && !rejectionReason?.trim()) {
// // //     return {
// // //       success: false,
// // //       message: "Rejection reason is required when rejecting a request",
// // //     };
// // //   }

// // //   const result = await model.updateQuickRequestResponseStatus(
// // //     connection.db,
// // //     connection.schema,
// // //     responseId,
// // //     status,
// // //     reviewedBy,
// // //     status === "Rejected" ? rejectionReason || null : null,
// // //     status === "Approved" ? approvalComment || null : null
// // //   );

// // //   if (!result) {
// // //     return { success: false, message: "Response not found" };
// // //   }

// // //   return {
// // //     success: true,
// // //     message: "Response status updated successfully",
// // //     data: result,
// // //   };
// // // };

// // // // ============================================================
// // // // SAVE ANNOUNCEMENT
// // // // ============================================================

// // // export const saveAnnouncementOnResponseService = async (
// // //   organisationId,
// // //   responseId,
// // //   announcement
// // // ) => {
// // //   const connection = await getOrganisationDB(organisationId);
// // //   if (!connection.success) return connection;

// // //   const existing = await model.getQuickRequestResponseById(
// // //     connection.db,
// // //     connection.schema,
// // //     responseId
// // //   );

// // //   if (!existing) {
// // //     return { success: false, message: "Response not found" };
// // //   }

// // //   try {
// // //     const result = await model.saveAnnouncementOnResponse(
// // //       connection.db,
// // //       connection.schema,
// // //       responseId,
// // //       announcement
// // //     );

// // //     return {
// // //       success: true,
// // //       message: "Announcement saved successfully",
// // //       data: result,
// // //     };
// // //   } catch (error) {
// // //     return { success: false, message: error.message };
// // //   }
// // // };

// // import masterAuthDB from "../../config/masterAuthDB.js";
// // import { getDB } from "../../config/dbFactory.js";
// // import { getOrganisationById } from "../../auth/models/organisation.model.js";
// // import * as model from "../models/quickRequest.model.js";
// // // import OpenAI from "openai";

// // // const openai = new OpenAI({
// // //   apiKey: process.env.OPENAI_API_KEY,
// // // });

// // // ============================================================
// // // GET ORGANISATION DATABASE
// // // ============================================================

// // const getOrganisationDB = async (organisationId) => {
// //   const org = await getOrganisationById(masterAuthDB, organisationId);

// //   if (!org) {
// //     return { success: false, message: "Organisation not found" };
// //   }

// //   const db = getDB(org.org_type);

// //   if (!db) {
// //     return { success: false, message: "Organisation database not found" };
// //   }

// //   return {
// //     success: true,
// //     org,
// //     db,
// //     schema: org.schema_name,
// //   };
// // };

// // // ============================================================
// // // GET ALL REQUESTS
// // // ============================================================

// // export const getAllQuickRequestsService = async (organisationId) => {
// //   const connection = await getOrganisationDB(organisationId);
// //   if (!connection.success) return connection;

// //   const rows = await model.getAllQuickRequests(connection.db, connection.schema);

// //   const grouped = {};

// //   for (const row of rows) {
// //     const rowIcon = String(row.icon || "").trim().toLowerCase();

// //     if (!grouped[row.request_name]) {
// //       grouped[row.request_name] = {
// //         id: row.id,
// //         name: row.request_name,
// //         description: row.description || "",
// //         status: row.status,
// //         icon: rowIcon || "other",
// //         questions: [],
// //         createdDate: row.created_at,
// //       };
// //     } else if (grouped[row.request_name].icon === "other" && rowIcon) {
// //       grouped[row.request_name].icon = rowIcon;
// //     }

// //     if (row.question) {
// //       grouped[row.request_name].questions.push({
// //         id: row.id,
// //         question: row.question,
// //         type: row.question_type,
// //         required: row.required,
// //         options: Array.isArray(row.options) ? row.options : [],
// //       });
// //     }
// //   }

// //   return {
// //     success: true,
// //     data: Object.values(grouped),
// //   };
// // };

// // // ============================================================
// // // GET SINGLE REQUEST
// // // ============================================================

// // export const getQuickRequestByIdService = async (organisationId, requestId) => {
// //   const connection = await getOrganisationDB(organisationId);
// //   if (!connection.success) return connection;

// //   const row = await model.getQuickRequestById(connection.db, connection.schema, requestId);

// //   if (!row) {
// //     return { success: false, message: "Request type not found" };
// //   }

// //   const rows = await model.getQuestionsByRequestName(
// //     connection.db,
// //     connection.schema,
// //     row.request_name
// //   );

// //   return {
// //     success: true,
// //     data: {
// //       id: row.id,
// //       name: row.request_name,
// //       description: row.description || "",
// //       status: row.status,
// //       icon: row.icon || "other",
// //       questions: rows.map((item) => ({
// //         id: item.id,
// //         question: item.question,
// //         type: item.question_type,
// //         required: item.required,
// //         options: Array.isArray(item.options) ? item.options : [],
// //       })),
// //       createdDate: row.created_at,
// //     },
// //   };
// // };

// // // ============================================================
// // // CREATE REQUEST
// // // ============================================================

// // export const createQuickRequestService = async (organisationId, data, userId) => {
// //   const connection = await getOrganisationDB(organisationId);
// //   if (!connection.success) return connection;

// //   if (!data?.name?.trim()) {
// //     return { success: false, message: "Request name is required" };
// //   }

// //   if (!Array.isArray(data.questions) || data.questions.length === 0) {
// //     return { success: false, message: "At least one question is required" };
// //   }

// //   try {
// //     const row = await model.createQuickRequest(connection.db, connection.schema, {
// //       orgId: organisationId,
// //       requestName: data.name.trim(),
// //       description: data.description || "",
// //       status: data.status || "Active",
// //       icon: data.icon || "other",
// //       questions: data.questions,
// //       createdBy: userId,
// //     });

// //     return {
// //       success: true,
// //       message: "Quick request created successfully",
// //       data: {
// //         id: row.id,
// //         name: row.request_name,
// //       },
// //     };
// //   } catch (error) {
// //     return { success: false, message: error.message };
// //   }
// // };

// // // ============================================================
// // // UPDATE REQUEST
// // // ============================================================

// // export const updateQuickRequestService = async (organisationId, requestId, data) => {
// //   const connection = await getOrganisationDB(organisationId);
// //   if (!connection.success) return connection;

// //   try {
// //     const result = await model.updateQuickRequest(
// //       connection.db,
// //       connection.schema,
// //       requestId,
// //       data
// //     );

// //     return {
// //       success: true,
// //       message: "Quick request updated successfully",
// //       data: result,
// //     };
// //   } catch (error) {
// //     return { success: false, message: error.message };
// //   }
// // };

// // // ============================================================
// // // DELETE REQUEST
// // // ============================================================

// // export const deleteQuickRequestService = async (organisationId, requestId) => {
// //   const connection = await getOrganisationDB(organisationId);
// //   if (!connection.success) return connection;

// //   try {
// //     await model.deleteQuickRequest(connection.db, connection.schema, requestId);

// //     return {
// //       success: true,
// //       message: "Quick request deleted successfully",
// //     };
// //   } catch (error) {
// //     return { success: false, message: error.message };
// //   }
// // };

// // // ============================================================
// // // UPDATE REQUEST STATUS
// // // ============================================================

// // export const updateQuickRequestStatusService = async (
// //   organisationId,
// //   requestId,
// //   status
// // ) => {
// //   const connection = await getOrganisationDB(organisationId);
// //   if (!connection.success) return connection;

// //   if (!["Active", "Inactive"].includes(status)) {
// //     return { success: false, message: "Invalid request status" };
// //   }

// //   const result = await model.updateQuickRequestStatus(
// //     connection.db,
// //     connection.schema,
// //     requestId,
// //     status
// //   );

// //   if (!result) {
// //     return { success: false, message: "Request type not found" };
// //   }

// //   return {
// //     success: true,
// //     message: "Request status updated successfully",
// //     data: result,
// //   };
// // };

// // // ============================================================
// // // CREATE RESPONSE
// // // ============================================================

// // export const createQuickRequestResponseService = async (
// //   organisationId,
// //   requestTypeId,
// //   answers,
// //   requestedBy
// // ) => {
// //   const connection = await getOrganisationDB(organisationId);
// //   if (!connection.success) return connection;

// //   const request = await model.getQuickRequestById(
// //     connection.db,
// //     connection.schema,
// //     requestTypeId
// //   );

// //   if (!request) {
// //     return { success: false, message: "Request type not found" };
// //   }

// //   if (request.status !== "Active") {
// //     return { success: false, message: "This request type is inactive" };
// //   }

// //   try {
// //     const result = await model.createQuickRequestResponse(
// //       connection.db,
// //       connection.schema,
// //       {
// //         requestTypeId,
// //         orgId: organisationId,
// //         requestedBy,
// //         answers,
// //       }
// //     );

// //     return {
// //       success: true,
// //       message: "Request submitted successfully",
// //       data: result,
// //     };
// //   } catch (error) {
// //     return { success: false, message: error.message };
// //   }
// // };

// // // ============================================================
// // // GET ALL RESPONSES
// // // ============================================================

// // export const getAllQuickRequestResponsesService = async (organisationId) => {
// //   const connection = await getOrganisationDB(organisationId);
// //   if (!connection.success) return connection;

// //   const rows = await model.getAllQuickRequestResponses(
// //     connection.db,
// //     connection.schema
// //   );

// //   const data = await Promise.all(
// //     rows.map(async (row) => {
// //       const questionRows = row.request_name
// //         ? await model.getQuestionsByRequestName(
// //             connection.db,
// //             connection.schema,
// //             row.request_name
// //           )
// //         : [];

// //       return {
// //         id: row.id,
// //         requestTypeId: row.request_type_id,
// //         requestName: row.request_name || "Unknown Request",
// //         icon: row.icon || "other",
// //         requestedBy: row.requested_by,
// //         date: row.submitted_at,
// //         status: row.status,
// //         answers: row.answers || {},
// //         questions: questionRows.map((question) => ({
// //           id: question.id,
// //           question: question.question,
// //         })),
// //         reviewedBy: row.reviewed_by,
// //         reviewedAt: row.reviewed_at,
// //         rejectionReason: row.rejection_reason,
// //         approvalComment: row.approval_comment,
// //         announcement: row.announcement || null,
// //       };
// //     })
// //   );

// //   return { success: true, data };
// // };

// // // ============================================================
// // // GET MY RESPONSES
// // // ============================================================

// // export const getMyQuickRequestResponsesService = async (organisationId, userId) => {
// //   const connection = await getOrganisationDB(organisationId);
// //   if (!connection.success) return connection;

// //   const rows = await model.getMyQuickRequestResponses(
// //     connection.db,
// //     connection.schema,
// //     userId
// //   );

// //   const data = await Promise.all(
// //     rows.map(async (row) => {
// //       const questionRows = row.request_name
// //         ? await model.getQuestionsByRequestName(
// //             connection.db,
// //             connection.schema,
// //             row.request_name
// //           )
// //         : [];

// //       return {
// //         id: row.id,
// //         requestTypeId: row.request_type_id,
// //         requestName: row.request_name || "Unknown Request",
// //         requestedBy: row.requested_by,
// //         date: row.submitted_at,
// //         status: row.status,
// //         icon: row.icon || "other",
// //         answers: row.answers || {},
// //         questions: questionRows.map((question) => ({
// //           id: question.id,
// //           question: question.question,
// //         })),
// //         reviewedBy: row.reviewed_by,
// //         reviewedAt: row.reviewed_at,
// //         rejectionReason: row.rejection_reason,
// //         approvalComment: row.approval_comment,
// //         announcement: row.announcement || null,
// //       };
// //     })
// //   );

// //   return { success: true, data };
// // };

// // // ============================================================
// // // GET RESPONSE BY ID
// // // ============================================================

// // export const getQuickRequestResponseByIdService = async (
// //   organisationId,
// //   responseId
// // ) => {
// //   const connection = await getOrganisationDB(organisationId);
// //   if (!connection.success) return connection;

// //   const row = await model.getQuickRequestResponseById(
// //     connection.db,
// //     connection.schema,
// //     responseId
// //   );

// //   if (!row) {
// //     return { success: false, message: "Response not found" };
// //   }

// //   return {
// //     success: true,
// //     data: {
// //       id: row.id,
// //       requestTypeId: row.request_type_id,
// //       requestName: row.request_name,
// //       requestedBy: row.requested_by,
// //       status: row.status,
// //       answers: row.answers || {},
// //       submittedAt: row.submitted_at,
// //       reviewedBy: row.reviewed_by,
// //       reviewedAt: row.reviewed_at,
// //       rejectionReason: row.rejection_reason,
// //       approvalComment: row.approval_comment,
// //       announcement: row.announcement || null,
// //     },
// //   };
// // };

// // // ============================================================
// // // UPDATE RESPONSE STATUS
// // // ============================================================

// // export const updateQuickRequestResponseStatusService = async (
// //   organisationId,
// //   responseId,
// //   status,
// //   reviewedBy,
// //   rejectionReason,
// //   approvalComment
// // ) => {
// //   const connection = await getOrganisationDB(organisationId);
// //   if (!connection.success) return connection;

// //   if (!["Pending", "Approved", "Rejected"].includes(status)) {
// //     return { success: false, message: "Invalid response status" };
// //   }

// //   if (status === "Rejected" && !rejectionReason?.trim()) {
// //     return {
// //       success: false,
// //       message: "Rejection reason is required when rejecting a request",
// //     };
// //   }

// //   const result = await model.updateQuickRequestResponseStatus(
// //     connection.db,
// //     connection.schema,
// //     responseId,
// //     status,
// //     reviewedBy,
// //     status === "Rejected" ? rejectionReason || null : null,
// //     status === "Approved" ? approvalComment || null : null
// //   );

// //   if (!result) {
// //     return { success: false, message: "Response not found" };
// //   }

// //   return {
// //     success: true,
// //     message: "Response status updated successfully",
// //     data: result,
// //   };
// // };

// // // ============================================================
// // // SAVE ANNOUNCEMENT
// // // ============================================================

// // export const saveAnnouncementOnResponseService = async (
// //   organisationId,
// //   responseId,
// //   announcement
// // ) => {
// //   const connection = await getOrganisationDB(organisationId);
// //   if (!connection.success) return connection;

// //   const existing = await model.getQuickRequestResponseById(
// //     connection.db,
// //     connection.schema,
// //     responseId
// //   );

// //   if (!existing) {
// //     return { success: false, message: "Response not found" };
// //   }

// //   try {
// //     const result = await model.saveAnnouncementOnResponse(
// //       connection.db,
// //       connection.schema,
// //       responseId,
// //       announcement
// //     );

// //     return {
// //       success: true,
// //       message: "Announcement saved successfully",
// //       data: result,
// //     };
// //   } catch (error) {
// //     return { success: false, message: error.message };
// //   }
// // };

// // // ============================================================
// // // GENERATE ANNOUNCEMENT WITH OPENAI
// // // ============================================================

// // // ============================================================
// // // GENERATE ANNOUNCEMENT WITH OPENAI
// // // ============================================================
// // // ============================================================
// // // GENERATE ANNOUNCEMENT WITH OPENAI
// // // ============================================================
// // export const generateAnnouncementWithAIService = async (
// //   organisationId,
// //   responseId,
// //   tone = "formal"
// // ) => {
// //   const connection = await getOrganisationDB(organisationId);
// //   if (!connection.success) return connection;

// //   const response = await model.getQuickRequestResponseById(
// //     connection.db,
// //     connection.schema,
// //     responseId
// //   );

// //   if (!response) {
// //     return { success: false, message: "Response not found" };
// //   }

// //   if (response.status !== "Approved") {
// //     return {
// //       success: false,
// //       message: "Only approved requests can be turned into announcements",
// //     };
// //   }

// //   if (!process.env.OPENAI_API_KEY) {
// //     return {
// //       success: false,
// //       message: "OpenAI API key is not configured on the server",
// //     };
// //   }

// //   // Create client only when needed
// //   const { default: OpenAI } = await import("openai");
// //   const openai = new OpenAI({
// //     apiKey: process.env.OPENAI_API_KEY,
// //   });

// //   // Build answers text
// //   let answersText = "No additional details provided.";
// //   if (response.answers && Object.keys(response.answers).length > 0) {
// //     answersText = Object.entries(response.answers)
// //       .map(([key, value]) => {
// //         return `• ${key}: ${
// //           typeof value === "object" ? JSON.stringify(value) : value
// //         }`;
// //       })
// //       .join("\n");
// //   }

// //   // Tone instructions
// //   let toneInstruction = "";
// //   switch (tone) {
// //     case "friendly":
// //       toneInstruction =
// //         "Write in a warm, friendly and approachable tone, as if speaking politely to the residents.";
// //       break;
// //     case "short":
// //       toneInstruction =
// //         "Write a very short and direct announcement. Keep it maximum 4 lines.";
// //       break;
// //     case "detailed":
// //       toneInstruction =
// //         "Write a detailed and informative announcement with more context and clarity.";
// //       break;
// //     default:
// //       toneInstruction =
// //         "Write in a formal, professional and respectful tone.";
// //   }

// //   const prompt = `
// // You are a professional community manager of a residential society / apartment complex.

// // Write an announcement based on the following approved request:

// // Request Type: ${response.request_name || "General Request"}
// // Submitted by: ${response.requested_by}
// // Date: ${response.submitted_at}
// // Status: Approved

// // Details submitted by the resident:
// // ${answersText}

// // ${
// //   response.approval_comment
// //     ? `Admin note: ${response.approval_comment}`
// //     : ""
// // }

// // Tone instruction: ${toneInstruction}

// // Rules:
// // - Start with a clear subject line (example: Subject: Plumbing Request Update)
// // - Write naturally like a real announcement, not like a form or bullet list
// // - Clearly mention what the request was about and that it has been approved
// // - Keep the language polite and professional
// // - Do NOT use hashtags, emojis, or the word "AI"
// // - Do NOT mention that this was generated by AI
// // `;

// //   try {
// //     const completion = await openai.chat.completions.create({
// //       model: "gpt-4o-mini",
// //       messages: [
// //         {
// //           role: "system",
// //           content:
// //             "You are a professional community manager who writes clear, natural and well-structured announcements for residential societies.",
// //         },
// //         {
// //           role: "user",
// //           content: prompt,
// //         },
// //       ],
// //       temperature: 0.7,
// //       max_tokens: 400,
// //     });

// //     const aiText = completion.choices[0]?.message?.content?.trim();

// //     if (!aiText) {
// //       return { success: false, message: "AI returned empty response" };
// //     }

// //     return {
// //       success: true,
// //       data: {
// //         announcement: aiText,
// //       },
// //     };
// //   } catch (error) {
// //     console.error("OpenAI error:", error);
// //     return {
// //       success: false,
// //       message: error.message || "Failed to generate announcement with AI",
// //     };
// //   }
// // };

// // ============================================================
// // GET ALL REQUESTS  (updated grouping)
// // ============================================================
// export const getAllQuickRequestsService = async (organisationId) => {
//   const connection = await getOrganisationDB(organisationId);
//   if (!connection.success) return connection;

//   const rows = await model.getAllQuickRequests(connection.db, connection.schema);

//   const grouped = {};

//   for (const row of rows) {
//     const rowIcon = String(row.icon || "").trim().toLowerCase();

//     if (!grouped[row.request_name]) {
//       grouped[row.request_name] = {
//         id: row.id,
//         name: row.request_name,
//         description: row.description || "",
//         status: row.status,
//         icon: rowIcon || "other",
//         is_bookable: Boolean(row.is_bookable),
//         slots: Array.isArray(row.slots)
//           ? row.slots
//           : typeof row.slots === "string"
//           ? JSON.parse(row.slots || "[]")
//           : [],
//         max_bookings_per_slot: Number(row.max_bookings_per_slot) || 1,
//         questions: [],
//         createdDate: row.created_at,
//       };
//     } else {
//       // keep the first non-empty icon / bookable config
//       if (grouped[row.request_name].icon === "other" && rowIcon) {
//         grouped[row.request_name].icon = rowIcon;
//       }
//     }

//     if (row.question) {
//       grouped[row.request_name].questions.push({
//         id: row.id,
//         question: row.question,
//         type: row.question_type,
//         required: row.required,
//         options: Array.isArray(row.options) ? row.options : [],
//       });
//     }
//   }

//   return {
//     success: true,
//     data: Object.values(grouped),
//   };
// };

// // ============================================================
// // GET SINGLE REQUEST  (updated)
// // ============================================================
// export const getQuickRequestByIdService = async (organisationId, requestId) => {
//   const connection = await getOrganisationDB(organisationId);
//   if (!connection.success) return connection;

//   const row = await model.getQuickRequestById(connection.db, connection.schema, requestId);
//   if (!row) {
//     return { success: false, message: "Request type not found" };
//   }

//   const rows = await model.getQuestionsByRequestName(
//     connection.db,
//     connection.schema,
//     row.request_name
//   );

//   return {
//     success: true,
//     data: {
//       id: row.id,
//       name: row.request_name,
//       description: row.description || "",
//       status: row.status,
//       icon: row.icon || "other",
//       is_bookable: Boolean(row.is_bookable),
//       slots: Array.isArray(row.slots)
//         ? row.slots
//         : typeof row.slots === "string"
//         ? JSON.parse(row.slots || "[]")
//         : [],
//       max_bookings_per_slot: Number(row.max_bookings_per_slot) || 1,
//       questions: rows.map((item) => ({
//         id: item.id,
//         question: item.question,
//         type: item.question_type,
//         required: item.required,
//         options: Array.isArray(item.options) ? item.options : [],
//       })),
//       createdDate: row.created_at,
//     },
//   };
// };

// // ============================================================
// // CREATE REQUEST  (updated)
// // ============================================================
// export const createQuickRequestService = async (organisationId, data, userId) => {
//   const connection = await getOrganisationDB(organisationId);
//   if (!connection.success) return connection;

//   if (!data?.name?.trim()) {
//     return { success: false, message: "Request name is required" };
//   }
//   if (!Array.isArray(data.questions) || data.questions.length === 0) {
//     return { success: false, message: "At least one question is required" };
//   }

//   try {
//     const row = await model.createQuickRequest(connection.db, connection.schema, {
//       orgId: organisationId,
//       requestName: data.name.trim(),
//       description: data.description || "",
//       status: data.status || "Active",
//       icon: data.icon || "other",
//       is_bookable: Boolean(data.is_bookable),
//       slots: data.slots || [],
//       max_bookings_per_slot: Number(data.max_bookings_per_slot) || 1,
//       questions: data.questions,
//       createdBy: userId,
//     });

//     return {
//       success: true,
//       message: "Quick request created successfully",
//       data: { id: row.id, name: row.request_name },
//     };
//   } catch (error) {
//     return { success: false, message: error.message };
//   }
// };

// // ============================================================
// // UPDATE REQUEST  (updated)
// // ============================================================
// export const updateQuickRequestService = async (organisationId, requestId, data) => {
//   const connection = await getOrganisationDB(organisationId);
//   if (!connection.success) return connection;

//   try {
//     const result = await model.updateQuickRequest(
//       connection.db,
//       connection.schema,
//       requestId,
//       data
//     );

//     return {
//       success: true,
//       message: "Quick request updated successfully",
//       data: result,
//     };
//   } catch (error) {
//     return { success: false, message: error.message };
//   }
// };

// // ============================================================
// // CREATE RESPONSE  (with booking validation)
// // ============================================================
// export const createQuickRequestResponseService = async (
//   organisationId,
//   requestTypeId,
//   answers,
//   requestedBy
// ) => {
//   const connection = await getOrganisationDB(organisationId);
//   if (!connection.success) return connection;

//   const request = await model.getQuickRequestById(
//     connection.db,
//     connection.schema,
//     requestTypeId
//   );

//   if (!request) {
//     return { success: false, message: "Request type not found" };
//   }
//   if (request.status !== "Active") {
//     return { success: false, message: "This request type is inactive" };
//   }

//   // ---------- BOOKING VALIDATION ----------
//   if (request.is_bookable) {
//     const date = answers?.date;
//     const slot = answers?.slot;

//     if (!date || !slot) {
//       return {
//         success: false,
//         message: "Date and time slot are required for this request",
//       };
//     }

//     const availability = await model.getSlotAvailability(
//       connection.db,
//       connection.schema,
//       requestTypeId,
//       date
//     );

//     if (!availability.success) {
//       return availability;
//     }

//     const selected = availability.data.find((s) => s.slotId === slot);
//     if (!selected) {
//       return { success: false, message: "Invalid time slot selected" };
//     }
//     if (!selected.available) {
//       return {
//         success: false,
//         message: "This slot is already fully booked",
//       };
//     }
//   }

//   try {
//     const result = await model.createQuickRequestResponse(
//       connection.db,
//       connection.schema,
//       {
//         requestTypeId,
//         orgId: organisationId,
//         requestedBy,
//         answers,
//       }
//     );

//     return {
//       success: true,
//       message: "Request submitted successfully",
//       data: result,
//     };
//   } catch (error) {
//     return { success: false, message: error.message };
//   }
// };

// // ============================================================
// // AVAILABILITY SERVICE (NEW)
// // ============================================================
// export const getAvailabilityService = async (organisationId, requestTypeId, date) => {
//   const connection = await getOrganisationDB(organisationId);
//   if (!connection.success) return connection;

//   if (!date) {
//     return { success: false, message: "Date is required" };
//   }

//   return await model.getSlotAvailability(
//     connection.db,
//     connection.schema,
//     requestTypeId,
//     date
//   );
// };
import masterAuthDB from "../../config/masterAuthDB.js";
import { getDB } from "../../config/dbFactory.js";
import { getOrganisationById } from "../../auth/models/organisation.model.js";
import * as model from "../models/quickRequest.model.js";

// ============================================================
// GET ORGANISATION DATABASE
// ============================================================
const getOrganisationDB = async (organisationId) => {
  const org = await getOrganisationById(masterAuthDB, organisationId);

  if (!org) {
    return { success: false, message: "Organisation not found" };
  }

  const db = getDB(org.org_type);

  if (!db) {
    return { success: false, message: "Organisation database not found" };
  }

  return {
    success: true,
    org,
    db,
    schema: org.schema_name,
  };
};

// ============================================================
// GET ALL REQUESTS
// ============================================================
export const getAllQuickRequestsService = async (organisationId) => {
  const connection = await getOrganisationDB(organisationId);
  if (!connection.success) return connection;

  const rows = await model.getAllQuickRequests(connection.db, connection.schema);

  const grouped = {};

  for (const row of rows) {
    const rowIcon = String(row.icon || "").trim().toLowerCase();

    if (!grouped[row.request_name]) {
      grouped[row.request_name] = {
        id: row.id,
        name: row.request_name,
        description: row.description || "",
        status: row.status,
        icon: rowIcon || "other",
        is_bookable: Boolean(row.is_bookable),
        slots: Array.isArray(row.slots)
          ? row.slots
          : typeof row.slots === "string"
          ? JSON.parse(row.slots || "[]")
          : [],
        max_bookings_per_slot: Number(row.max_bookings_per_slot) || 1,
        questions: [],
        createdDate: row.created_at,
      };
    } else if (grouped[row.request_name].icon === "other" && rowIcon) {
      grouped[row.request_name].icon = rowIcon;
    }

    if (row.question) {
      grouped[row.request_name].questions.push({
        id: row.id,
        question: row.question,
        type: row.question_type,
        required: row.required,
        options: Array.isArray(row.options) ? row.options : [],
      });
    }
  }

  return {
    success: true,
    data: Object.values(grouped),
  };
};

// ============================================================
// GET SINGLE REQUEST
// ============================================================
export const getQuickRequestByIdService = async (organisationId, requestId) => {
  const connection = await getOrganisationDB(organisationId);
  if (!connection.success) return connection;

  const row = await model.getQuickRequestById(connection.db, connection.schema, requestId);
  if (!row) {
    return { success: false, message: "Request type not found" };
  }

  const rows = await model.getQuestionsByRequestName(
    connection.db,
    connection.schema,
    row.request_name
  );

  return {
    success: true,
    data: {
      id: row.id,
      name: row.request_name,
      description: row.description || "",
      status: row.status,
      icon: row.icon || "other",
      is_bookable: Boolean(row.is_bookable),
      slots: Array.isArray(row.slots)
        ? row.slots
        : typeof row.slots === "string"
        ? JSON.parse(row.slots || "[]")
        : [],
      max_bookings_per_slot: Number(row.max_bookings_per_slot) || 1,
      questions: rows.map((item) => ({
        id: item.id,
        question: item.question,
        type: item.question_type,
        required: item.required,
        options: Array.isArray(item.options) ? item.options : [],
      })),
      createdDate: row.created_at,
    },
  };
};

// ============================================================
// CREATE REQUEST
// ============================================================
export const createQuickRequestService = async (organisationId, data, userId) => {
  const connection = await getOrganisationDB(organisationId);
  if (!connection.success) return connection;

  if (!data?.name?.trim()) {
    return { success: false, message: "Request name is required" };
  }
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    return { success: false, message: "At least one question is required" };
  }

  try {
    const row = await model.createQuickRequest(connection.db, connection.schema, {
      orgId: organisationId,
      requestName: data.name.trim(),
      description: data.description || "",
      status: data.status || "Active",
      icon: data.icon || "other",
      is_bookable: Boolean(data.is_bookable),
      slots: data.slots || [],
      max_bookings_per_slot: Number(data.max_bookings_per_slot) || 1,
      questions: data.questions,
      createdBy: userId,
    });

    return {
      success: true,
      message: "Quick request created successfully",
      data: { id: row.id, name: row.request_name },
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ============================================================
// UPDATE REQUEST
// ============================================================
export const updateQuickRequestService = async (organisationId, requestId, data) => {
  const connection = await getOrganisationDB(organisationId);
  if (!connection.success) return connection;

  try {
    const result = await model.updateQuickRequest(
      connection.db,
      connection.schema,
      requestId,
      data
    );

    return {
      success: true,
      message: "Quick request updated successfully",
      data: result,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ============================================================
// DELETE REQUEST
// ============================================================
export const deleteQuickRequestService = async (organisationId, requestId) => {
  const connection = await getOrganisationDB(organisationId);
  if (!connection.success) return connection;

  try {
    await model.deleteQuickRequest(connection.db, connection.schema, requestId);

    return {
      success: true,
      message: "Quick request deleted successfully",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ============================================================
// UPDATE REQUEST STATUS
// ============================================================
export const updateQuickRequestStatusService = async (
  organisationId,
  requestId,
  status
) => {
  const connection = await getOrganisationDB(organisationId);
  if (!connection.success) return connection;

  if (!["Active", "Inactive"].includes(status)) {
    return { success: false, message: "Invalid request status" };
  }

  const result = await model.updateQuickRequestStatus(
    connection.db,
    connection.schema,
    requestId,
    status
  );

  if (!result) {
    return { success: false, message: "Request type not found" };
  }

  return {
    success: true,
    message: "Request status updated successfully",
    data: result,
  };
};

// ============================================================
// CREATE RESPONSE (with booking validation)
// ============================================================
export const createQuickRequestResponseService = async (
  organisationId,
  requestTypeId,
  answers,
  requestedBy
) => {
  const connection = await getOrganisationDB(organisationId);
  if (!connection.success) return connection;

  const request = await model.getQuickRequestById(
    connection.db,
    connection.schema,
    requestTypeId
  );

  if (!request) {
    return { success: false, message: "Request type not found" };
  }
  if (request.status !== "Active") {
    return { success: false, message: "This request type is inactive" };
  }

  // ---------- BOOKING VALIDATION ----------
  if (request.is_bookable) {
    const date = answers?.date;
    const slot = answers?.slot;

    if (!date || !slot) {
      return {
        success: false,
        message: "Date and time slot are required for this request",
      };
    }

    const availability = await model.getSlotAvailability(
      connection.db,
      connection.schema,
      requestTypeId,
      date
    );

    if (!availability.success) {
      return availability;
    }

    const selected = availability.data.find((s) => s.slotId === slot);
    if (!selected) {
      return { success: false, message: "Invalid time slot selected" };
    }
    if (!selected.available) {
      return {
        success: false,
        message: "This slot is already fully booked",
      };
    }
  }

  try {
    const result = await model.createQuickRequestResponse(
      connection.db,
      connection.schema,
      {
        requestTypeId,
        orgId: organisationId,
        requestedBy,
        answers,
      }
    );

    return {
      success: true,
      message: "Request submitted successfully",
      data: result,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ============================================================
// GET ALL RESPONSES
// ============================================================
export const getAllQuickRequestResponsesService = async (organisationId) => {
  const connection = await getOrganisationDB(organisationId);
  if (!connection.success) return connection;

  const rows = await model.getAllQuickRequestResponses(
    connection.db,
    connection.schema
  );

  const data = await Promise.all(
    rows.map(async (row) => {
      const questionRows = row.request_name
        ? await model.getQuestionsByRequestName(
            connection.db,
            connection.schema,
            row.request_name
          )
        : [];

      return {
        id: row.id,
        requestTypeId: row.request_type_id,
        requestName: row.request_name || "Unknown Request",
        icon: row.icon || "other",
        requestedBy: row.requested_by,
        date: row.submitted_at,
        status: row.status,
        answers: row.answers || {},
        questions: questionRows.map((question) => ({
          id: question.id,
          question: question.question,
        })),
        reviewedBy: row.reviewed_by,
        reviewedAt: row.reviewed_at,
        rejectionReason: row.rejection_reason,
        approvalComment: row.approval_comment,
        announcement: row.announcement || null,
      };
    })
  );

  return { success: true, data };
};

// ============================================================
// GET MY RESPONSES
// ============================================================
export const getMyQuickRequestResponsesService = async (organisationId, userId) => {
  const connection = await getOrganisationDB(organisationId);
  if (!connection.success) return connection;

  const rows = await model.getMyQuickRequestResponses(
    connection.db,
    connection.schema,
    userId
  );

  const data = await Promise.all(
    rows.map(async (row) => {
      const questionRows = row.request_name
        ? await model.getQuestionsByRequestName(
            connection.db,
            connection.schema,
            row.request_name
          )
        : [];

      return {
        id: row.id,
        requestTypeId: row.request_type_id,
        requestName: row.request_name || "Unknown Request",
        requestedBy: row.requested_by,
        date: row.submitted_at,
        status: row.status,
        icon: row.icon || "other",
        answers: row.answers || {},
        questions: questionRows.map((question) => ({
          id: question.id,
          question: question.question,
        })),
        reviewedBy: row.reviewed_by,
        reviewedAt: row.reviewed_at,
        rejectionReason: row.rejection_reason,
        approvalComment: row.approval_comment,
        announcement: row.announcement || null,
      };
    })
  );

  return { success: true, data };
};

// ============================================================
// GET RESPONSE BY ID
// ============================================================
export const getQuickRequestResponseByIdService = async (
  organisationId,
  responseId
) => {
  const connection = await getOrganisationDB(organisationId);
  if (!connection.success) return connection;

  const row = await model.getQuickRequestResponseById(
    connection.db,
    connection.schema,
    responseId
  );

  if (!row) {
    return { success: false, message: "Response not found" };
  }

  return {
    success: true,
    data: {
      id: row.id,
      requestTypeId: row.request_type_id,
      requestName: row.request_name,
      requestedBy: row.requested_by,
      status: row.status,
      answers: row.answers || {},
      submittedAt: row.submitted_at,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      rejectionReason: row.rejection_reason,
      approvalComment: row.approval_comment,
      announcement: row.announcement || null,
    },
  };
};

// ============================================================
// UPDATE RESPONSE STATUS
// ============================================================
export const updateQuickRequestResponseStatusService = async (
  organisationId,
  responseId,
  status,
  reviewedBy,
  rejectionReason,
  approvalComment
) => {
  const connection = await getOrganisationDB(organisationId);
  if (!connection.success) return connection;

  if (!["Pending", "Approved", "Rejected"].includes(status)) {
    return { success: false, message: "Invalid response status" };
  }

  if (status === "Rejected" && !rejectionReason?.trim()) {
    return {
      success: false,
      message: "Rejection reason is required when rejecting a request",
    };
  }

  const result = await model.updateQuickRequestResponseStatus(
    connection.db,
    connection.schema,
    responseId,
    status,
    reviewedBy,
    status === "Rejected" ? rejectionReason || null : null,
    status === "Approved" ? approvalComment || null : null
  );

  if (!result) {
    return { success: false, message: "Response not found" };
  }

  return {
    success: true,
    message: "Response status updated successfully",
    data: result,
  };
};

// ============================================================
// SAVE ANNOUNCEMENT
// ============================================================
export const saveAnnouncementOnResponseService = async (
  organisationId,
  responseId,
  announcement
) => {
  const connection = await getOrganisationDB(organisationId);
  if (!connection.success) return connection;

  const existing = await model.getQuickRequestResponseById(
    connection.db,
    connection.schema,
    responseId
  );

  if (!existing) {
    return { success: false, message: "Response not found" };
  }

  try {
    const result = await model.saveAnnouncementOnResponse(
      connection.db,
      connection.schema,
      responseId,
      announcement
    );

    return {
      success: true,
      message: "Announcement saved successfully",
      data: result,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ============================================================
// GENERATE ANNOUNCEMENT WITH AI
// ============================================================
export const generateAnnouncementWithAIService = async (
  organisationId,
  responseId,
  tone = "formal"
) => {
  const connection = await getOrganisationDB(organisationId);
  if (!connection.success) return connection;

  const response = await model.getQuickRequestResponseById(
    connection.db,
    connection.schema,
    responseId
  );

  if (!response) {
    return { success: false, message: "Response not found" };
  }

  if (response.status !== "Approved") {
    return {
      success: false,
      message: "Only approved requests can be turned into announcements",
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      message: "OpenAI API key is not configured on the server",
    };
  }

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let answersText = "No additional details provided.";
  if (response.answers && Object.keys(response.answers).length > 0) {
    answersText = Object.entries(response.answers)
      .map(([key, value]) => {
        return `• ${key}: ${
          typeof value === "object" ? JSON.stringify(value) : value
        }`;
      })
      .join("\n");
  }

  let toneInstruction = "";
  switch (tone) {
    case "friendly":
      toneInstruction =
        "Write in a warm, friendly and approachable tone, as if speaking politely to the residents.";
      break;
    case "short":
      toneInstruction =
        "Write a very short and direct announcement. Keep it maximum 4 lines.";
      break;
    case "detailed":
      toneInstruction =
        "Write a detailed and informative announcement with more context and clarity.";
      break;
    default:
      toneInstruction =
        "Write in a formal, professional and respectful tone.";
  }

  const prompt = `
You are a professional community manager of a residential society / apartment complex.

Write an announcement based on the following approved request:

Request Type: ${response.request_name || "General Request"}
Submitted by: ${response.requested_by}
Date: ${response.submitted_at}
Status: Approved

Details submitted by the resident:
${answersText}

${
  response.approval_comment
    ? `Admin note: ${response.approval_comment}`
    : ""
}

Tone instruction: ${toneInstruction}

Rules:
- Start with a clear subject line (example: Subject: Plumbing Request Update)
- Write naturally like a real announcement, not like a form or bullet list
- Clearly mention what the request was about and that it has been approved
- Keep the language polite and professional
- Do NOT use hashtags, emojis, or the word "AI"
- Do NOT mention that this was generated by AI
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional community manager who writes clear, natural and well-structured announcements for residential societies.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const aiText = completion.choices[0]?.message?.content?.trim();

    if (!aiText) {
      return { success: false, message: "AI returned empty response" };
    }

    return {
      success: true,
      data: {
        announcement: aiText,
      },
    };
  } catch (error) {
    console.error("OpenAI error:", error);
    return {
      success: false,
      message: error.message || "Failed to generate announcement with AI",
    };
  }
};

// ============================================================
// AVAILABILITY SERVICE (NEW)
// ============================================================
export const getAvailabilityService = async (organisationId, requestTypeId, date) => {
  const connection = await getOrganisationDB(organisationId);
  if (!connection.success) return connection;

  if (!date) {
    return { success: false, message: "Date is required" };
  }

  return await model.getSlotAvailability(
    connection.db,
    connection.schema,
    requestTypeId,
    date
  );
};