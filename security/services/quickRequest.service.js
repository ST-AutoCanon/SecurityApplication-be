// quickRequest/services/quickRequest.service.js

import masterAuthDB from "../../config/masterAuthDB.js";
import { getDB } from "../../config/dbFactory.js";
import {
  getOrganisationById,
} from "../../auth/models/organisation.model.js";

import * as model from "../models/quickRequest.model.js";

// ============================================================
// GET ORGANISATION DATABASE
// ============================================================

const getOrganisationDB = async (organisationId) => {
  const org = await getOrganisationById(
    masterAuthDB,
    organisationId
  );

  if (!org) {
    return {
      success: false,
      message: "Organisation not found",
    };
  }

  const db = getDB(org.org_type);

  if (!db) {
    return {
      success: false,
      message: "Organisation database not found",
    };
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

export const getAllQuickRequestsService = async (
  organisationId
) => {
  const connection = await getOrganisationDB(
    organisationId
  );

  if (!connection.success) {
    return connection;
  }

  const rows = await model.getAllQuickRequests(
    connection.db,
    connection.schema
  );

  // ----------------------------------------------------------
  // Group question rows into request objects
  // ----------------------------------------------------------

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
        options: Array.isArray(row.options)
          ? row.options
          : [],
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

export const getQuickRequestByIdService = async (
  organisationId,
  requestId
) => {
  const connection = await getOrganisationDB(
    organisationId
  );

  if (!connection.success) {
    return connection;
  }

  const row = await model.getQuickRequestById(
    connection.db,
    connection.schema,
    requestId
  );

  if (!row) {
    return {
      success: false,
      message: "Request type not found",
    };
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
      questions: rows.map((item) => ({
        id: item.id,
        question: item.question,
        type: item.question_type,
        required: item.required,
        options: Array.isArray(item.options)
          ? item.options
          : [],
      })),
      createdDate: row.created_at,
    },
  };
};

// ============================================================
// CREATE REQUEST
// ============================================================

export const createQuickRequestService = async (
  organisationId,
  data,
  userId
) => {
  const connection = await getOrganisationDB(
    organisationId
  );

  if (!connection.success) {
    return connection;
  }

  if (!data?.name?.trim()) {
    return {
      success: false,
      message: "Request name is required",
    };
  }

  if (
    !Array.isArray(data.questions) ||
    data.questions.length === 0
  ) {
    return {
      success: false,
      message: "At least one question is required",
    };
  }

  try {
    const row = await model.createQuickRequest(
      connection.db,
      connection.schema,
      {
        orgId: organisationId,
        requestName: data.name.trim(),
        description: data.description || "",
        status: data.status || "Active",
        icon: data.icon || "other",
        questions: data.questions,
        createdBy: userId,
      }
    );

    return {
      success: true,
      message: "Quick request created successfully",
      data: {
        id: row.id,
        name: row.request_name,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// ============================================================
// UPDATE REQUEST
// ============================================================

export const updateQuickRequestService = async (
  organisationId,
  requestId,
  data
) => {
  const connection = await getOrganisationDB(
    organisationId
  );

  if (!connection.success) {
    return connection;
  }

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
    return {
      success: false,
      message: error.message,
    };
  }
};

// ============================================================
// DELETE REQUEST
// ============================================================

export const deleteQuickRequestService = async (
  organisationId,
  requestId
) => {
  const connection = await getOrganisationDB(
    organisationId
  );

  if (!connection.success) {
    return connection;
  }

  try {
    await model.deleteQuickRequest(
      connection.db,
      connection.schema,
      requestId
    );

    return {
      success: true,
      message: "Quick request deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
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
  const connection = await getOrganisationDB(
    organisationId
  );

  if (!connection.success) {
    return connection;
  }

  if (!["Active", "Inactive"].includes(status)) {
    return {
      success: false,
      message: "Invalid request status",
    };
  }

  const result =
    await model.updateQuickRequestStatus(
      connection.db,
      connection.schema,
      requestId,
      status
    );

  if (!result) {
    return {
      success: false,
      message: "Request type not found",
    };
  }

  return {
    success: true,
    message: "Request status updated successfully",
    data: result,
  };
};

// ============================================================
// CREATE RESPONSE
// ============================================================

export const createQuickRequestResponseService = async (
  organisationId,
  requestTypeId,
  answers,
  requestedBy
) => {
  const connection = await getOrganisationDB(
    organisationId
  );

  if (!connection.success) {
    return connection;
  }

  // ----------------------------------------------------------
  // Verify request exists
  // ----------------------------------------------------------

  const request = await model.getQuickRequestById(
    connection.db,
    connection.schema,
    requestTypeId
  );

  if (!request) {
    return {
      success: false,
      message: "Request type not found",
    };
  }

  if (request.status !== "Active") {
    return {
      success: false,
      message: "This request type is inactive",
    };
  }

  try {
    const result =
      await model.createQuickRequestResponse(
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
    return {
      success: false,
      message: error.message,
    };
  }
};

// ============================================================
// GET ALL RESPONSES
// ============================================================
// services/quickRequest.service.js

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
      };
    })
  );

  return { success: true, data };
};
export const getAllQuickRequestResponsesService =
  async (organisationId) => {
    const connection = await getOrganisationDB(
      organisationId
    );

    if (!connection.success) {
      return connection;
    }

    const rows =
      await model.getAllQuickRequestResponses(
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
        };
      })
    );

    return { success: true, data };
  };

// ============================================================
// GET RESPONSE
// ============================================================

export const getQuickRequestResponseByIdService =
  async (
    organisationId,
    responseId
  ) => {
    const connection = await getOrganisationDB(
      organisationId
    );

    if (!connection.success) {
      return connection;
    }

    const row =
      await model.getQuickRequestResponseById(
        connection.db,
        connection.schema,
        responseId
      );

    if (!row) {
      return {
        success: false,
        message: "Response not found",
      };
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
      },
    };
  };

// ============================================================
// UPDATE RESPONSE STATUS
// ============================================================

export const updateQuickRequestResponseStatusService =
  async (
    organisationId,
    responseId,
    status,
    reviewedBy,
    rejectionReason
  ) => {
    const connection = await getOrganisationDB(
      organisationId
    );

    if (!connection.success) {
      return connection;
    }

    if (
      !["Pending", "Approved", "Rejected"].includes(
        status
      )
    ) {
      return {
        success: false,
        message: "Invalid response status",
      };
    }

    if (
      status === "Rejected" &&
      !rejectionReason?.trim()
    ) {
      return {
        success: false,
        message:
          "Rejection reason is required when rejecting a request",
      };
    }

    const result =
      await model.updateQuickRequestResponseStatus(
        connection.db,
        connection.schema,
        responseId,
        status,
        reviewedBy,
        rejectionReason || null
      );

    if (!result) {
      return {
        success: false,
        message: "Response not found",
      };
    }

    return {
      success: true,
      message: "Response status updated successfully",
      data: result,
    };
  };