import express from "express";
import {
  getModules,
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getTemplateMetadata,
} from "../controllers/dynamicData.controller.js";

import { upload } from "../middleware/upload.js"; // <-- adjust path if needed


const router = express.Router();

// Specific routes
router.get("/:organisationId/modules", getModules);
router.get("/:organisationId/template/:templateId", getTemplateMetadata);

// CRUD routes
// router.post("/:organisationId/:templateId/:table", createRecord);
// Create record with image upload
router.post(
  "/:organisationId/:templateId/:table",
  upload.single("profile_photo"),
  createRecord
);
router.get("/:organisationId/:table", getAllRecords);
router.get("/:organisationId/:table/:id", getRecordById);
router.put("/:organisationId/:table/:id", updateRecord);
router.delete("/:organisationId/:table/:id", deleteRecord);

export default router;