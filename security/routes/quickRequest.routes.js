import express from "express";

import {
  getQuickRequests,
  getQuickRequest,
  createQuickRequest,
  updateQuickRequest,
  deleteQuickRequest,
  updateQuickRequestStatus,
  submitQuickRequestResponse,
  getQuickRequestResponses,
  getQuickRequestResponse,
  updateQuickRequestResponseStatus,
  getMyQuickRequestResponses,
} from "../controllers/quickRequest.controller.js";

import { auth } from "../../middleware/auth.js";

const router = express.Router();

// ============================================================
// ALL routes require authentication
// ============================================================
router.use(auth);

// ============================================================
// MEMBER + ADMIN – must come BEFORE /:id
// ============================================================

// List all request types (used by both admin & member)
router.get("/", getQuickRequests);

// Member’s own responses
router.get("/my-responses", getMyQuickRequestResponses);

// Member submits a request
router.post("/:id/submit", submitQuickRequestResponse);

// ============================================================
// ADMIN ONLY
// ============================================================

// All responses (admin)
router.get("/responses", getQuickRequestResponses);

// Single response
router.get("/responses/:id", getQuickRequestResponse);

// Approve / Reject
router.patch("/responses/:id/status", updateQuickRequestResponseStatus);

// Create request type
router.post("/", createQuickRequest);

// Single request type
router.get("/:id", getQuickRequest);

// Update request type
router.put("/:id", updateQuickRequest);

// Delete request type
router.delete("/:id", deleteQuickRequest);

// Toggle Active / Inactive
router.patch("/:id/status", updateQuickRequestStatus);

export default router;