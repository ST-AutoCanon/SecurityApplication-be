// // import express from "express";

// // import {
// //   getQuickRequests,
// //   getQuickRequest,
// //   createQuickRequest,
// //   updateQuickRequest,
// //   deleteQuickRequest,
// //   updateQuickRequestStatus,
// //   submitQuickRequestResponse,
// //   getQuickRequestResponses,
// //   getQuickRequestResponse,
// //   updateQuickRequestResponseStatus,
// //   getMyQuickRequestResponses,
// // } from "../controllers/quickRequest.controller.js";

// // import { auth } from "../../middleware/auth.js";

// // const router = express.Router();

// // // ============================================================
// // // ALL routes require authentication
// // // ============================================================
// // router.use(auth);

// // // ============================================================
// // // MEMBER + ADMIN – must come BEFORE /:id
// // // ============================================================

// // // List all request types (used by both admin & member)
// // router.get("/", getQuickRequests);

// // // Member’s own responses
// // router.get("/my-responses", getMyQuickRequestResponses);

// // // Member submits a request
// // router.post("/:id/submit", submitQuickRequestResponse);

// // // ============================================================
// // // ADMIN ONLY
// // // ============================================================

// // // All responses (admin)
// // router.get("/responses", getQuickRequestResponses);

// // // Single response
// // router.get("/responses/:id", getQuickRequestResponse);

// // // Approve / Reject
// // router.patch("/responses/:id/status", updateQuickRequestResponseStatus);

// // // Create request type
// // router.post("/", createQuickRequest);

// // // Single request type
// // router.get("/:id", getQuickRequest);

// // // Update request type
// // router.put("/:id", updateQuickRequest);

// // // Delete request type
// // router.delete("/:id", deleteQuickRequest);

// // // Toggle Active / Inactive
// // router.patch("/:id/status", updateQuickRequestStatus);

// // export default router;

// import express from "express";

// import {
//   getQuickRequests,
//   getQuickRequest,
//   createQuickRequest,
//   updateQuickRequest,
//   deleteQuickRequest,
//   updateQuickRequestStatus,
//   submitQuickRequestResponse,
//   getQuickRequestResponses,
//   getQuickRequestResponse,
//   updateQuickRequestResponseStatus,
//   getMyQuickRequestResponses,
//   saveAnnouncementOnResponse,
// } from "../controllers/quickRequest.controller.js";

// import { auth } from "../../middleware/auth.js";

// const router = express.Router();

// // ============================================================
// // ALL routes require authentication
// // ============================================================
// router.use(auth);

// // ============================================================
// // MEMBER + ADMIN – must come BEFORE /:id
// // ============================================================

// // List all request types (used by both admin & member)
// router.get("/", getQuickRequests);

// // Member’s own responses
// router.get("/my-responses", getMyQuickRequestResponses);

// // Member submits a request
// router.post("/:id/submit", submitQuickRequestResponse);

// // ============================================================
// // ADMIN ONLY
// // ============================================================

// // All responses (admin)
// router.get("/responses", getQuickRequestResponses);

// // Single response
// router.get("/responses/:id", getQuickRequestResponse);

// // Approve / Reject
// router.patch("/responses/:id/status", updateQuickRequestResponseStatus);

// // Save / Update Announcement
// router.patch("/responses/:id/announcement", saveAnnouncementOnResponse);

// // Create request type
// router.post("/", createQuickRequest);

// // Single request type
// router.get("/:id", getQuickRequest);

// // Update request type
// router.put("/:id", updateQuickRequest);

// // Delete request type
// router.delete("/:id", deleteQuickRequest);

// // Toggle Active / Inactive
// router.patch("/:id/status", updateQuickRequestStatus);

// export default router;

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
  saveAnnouncementOnResponse,
  generateAnnouncementWithAI,
  getQuickRequestAvailability,
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

// List all request types
router.get("/", getQuickRequests);

// Member’s own responses
router.get("/my-responses", getMyQuickRequestResponses);

// Member submits a request
router.post("/:id/submit", submitQuickRequestResponse);

// ============================================================
// ADMIN ONLY
// ============================================================

// All responses
router.get("/responses", getQuickRequestResponses);

// Single response
router.get("/responses/:id", getQuickRequestResponse);

// Approve / Reject
router.patch("/responses/:id/status", updateQuickRequestResponseStatus);

// Save Announcement
router.patch("/responses/:id/announcement", saveAnnouncementOnResponse);

// Generate Announcement with AI
router.post("/responses/:id/generate-announcement", generateAnnouncementWithAI);

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
// Member + Admin – must come BEFORE /:id
router.get("/:id/availability", getQuickRequestAvailability);
export default router;