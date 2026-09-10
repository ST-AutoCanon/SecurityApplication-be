// quickRequest/controllers/quickRequest.controller.js

import {
  getAllQuickRequestsService,
  getQuickRequestByIdService,
  createQuickRequestService,
  updateQuickRequestService,
  deleteQuickRequestService,
  updateQuickRequestStatusService,
  createQuickRequestResponseService,
  getAllQuickRequestResponsesService,
  getQuickRequestResponseByIdService,
  updateQuickRequestResponseStatusService,
  getMyQuickRequestResponsesService,
} from "../services/quickRequest.service.js";

// ============================================================
// GET ALL REQUEST TYPES
// ============================================================

export const getQuickRequests = async (
  req,
  res
) => {
  try {
    const organisationId =
      req.user.organisation_id;

    const result =
      await getAllQuickRequestsService(
        organisationId
      );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error(
      "getQuickRequests error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// GET SINGLE REQUEST
// ============================================================

export const getQuickRequest = async (
  req,
  res
) => {
  try {
    const organisationId =
      req.user.organisation_id;

    const { id } = req.params;

    const result =
      await getQuickRequestByIdService(
        organisationId,
        id
      );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error(
      "getQuickRequest error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// CREATE REQUEST
// ============================================================

export const createQuickRequest = async (
  req,
  res
) => {
  try {
    const organisationId =
      req.user.organisation_id;

    const userId =
      req.user.id ||
      req.user.employee_id ||
      null;

    const result =
      await createQuickRequestService(
        organisationId,
        req.body,
        userId
      );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (err) {
    console.error(
      "createQuickRequest error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// UPDATE REQUEST
// ============================================================

export const updateQuickRequest = async (
  req,
  res
) => {
  try {
    const organisationId =
      req.user.organisation_id;

    const { id } = req.params;

    const result =
      await updateQuickRequestService(
        organisationId,
        id,
        req.body
      );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error(
      "updateQuickRequest error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// DELETE REQUEST
// ============================================================

export const deleteQuickRequest = async (
  req,
  res
) => {
  try {
    const organisationId =
      req.user.organisation_id;

    const { id } = req.params;

    const result =
      await deleteQuickRequestService(
        organisationId,
        id
      );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error(
      "deleteQuickRequest error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// UPDATE REQUEST STATUS
// ============================================================

export const updateQuickRequestStatus = async (
  req,
  res
) => {
  try {
    const organisationId =
      req.user.organisation_id;

    const { id } = req.params;
    const { status } = req.body;

    const result =
      await updateQuickRequestStatusService(
        organisationId,
        id,
        status
      );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error(
      "updateQuickRequestStatus error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// SUBMIT RESPONSE
// ============================================================

export const submitQuickRequestResponse = async (
  req,
  res
) => {
  try {
    const organisationId =
      req.user.organisation_id;

    const requestedBy =
      req.user.id ||
      req.user.employee_id;

    const { id } = req.params;

    const {
      answers = {},
    } = req.body;

    if (!requestedBy) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    const result =
      await createQuickRequestResponseService(
        organisationId,
        id,
        answers,
        requestedBy
      );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (err) {
    console.error(
      "submitQuickRequestResponse error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// GET ALL RESPONSES
// ============================================================

export const getQuickRequestResponses = async (
  req,
  res
) => {
  try {
    const organisationId =
      req.user.organisation_id;

    const result =
      await getAllQuickRequestResponsesService(
        organisationId
      );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error(
      "getQuickRequestResponses error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// GET SINGLE RESPONSE
// ============================================================

export const getQuickRequestResponse = async (
  req,
  res
) => {
  try {
    const organisationId =
      req.user.organisation_id;

    const { id } = req.params;

    const result =
      await getQuickRequestResponseByIdService(
        organisationId,
        id
      );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error(
      "getQuickRequestResponse error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// UPDATE RESPONSE STATUS
// ============================================================
// controllers/quickRequest.controller.js

export const getMyQuickRequestResponses = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const userId = req.user.id || req.user.employee_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User ID not found" });
    }

    const result = await getMyQuickRequestResponsesService(organisationId, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("getMyQuickRequestResponses error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateQuickRequestResponseStatus = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const reviewedBy = req.user.id || req.user.employee_id || null;
    const { id } = req.params;

    const {
      status,
      rejectionReason = null,
      approvalComment = null,   // ← add
    } = req.body;

    const result = await updateQuickRequestResponseStatusService(
      organisationId,
      id,
      status,
      reviewedBy,
      rejectionReason,
      approvalComment            // ← add
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("updateQuickRequestResponseStatus error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};