import express from "express";

import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  sendCampaign,
} from "../controllers/campaign.controller.js";

import { auth } from "../../middleware/auth.js";

const router = express.Router();

// ===================== PROTECTED =====================

router.use(auth);

// Get all campaigns
router.get("/", getCampaigns);

// Get campaign by ID
router.get("/:id", getCampaign);

// Create campaign
router.post("/", createCampaign);

// Update campaign
router.put("/:id", updateCampaign);
router.post("/:id/send", sendCampaign);
// Delete campaign
router.delete("/:id", deleteCampaign);

export default router;