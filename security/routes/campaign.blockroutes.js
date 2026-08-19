// // campaign/routes/campaign.routes.js

// import express from "express";

// import {
//   getCampaigns,
//   getCampaign,
//   createCampaign,
//   updateCampaign,
//   deleteCampaign,
// } from "../controllers/campaign.controller.js";

// import {
//   getCampaignBlocks,
//   getCampaignBlockById,
//   createCampaignBlock,
//   updateCampaignBlock,
//   deleteCampaignBlock,
// } from "../controllers/campaignBlock.controller.js";

// import { auth } from "../../middleware/auth.js";

// const router = express.Router();

// // ===================== PROTECTED =====================

// router.use(auth);

// // ===================== CAMPAIGNS =====================

// // Get all campaigns
// router.get("/", getCampaigns);

// // Create campaign
// router.post("/", createCampaign);

// // Get single campaign
// router.get("/:id", getCampaign);

// // Update campaign
// router.put("/:id", updateCampaign);

// // Delete campaign
// router.delete("/:id", deleteCampaign);

// // ===================== CAMPAIGN BLOCKS =====================

// // Get all blocks of a campaign
// router.get("/:id/blocks", getCampaignBlocks);

// // Get single block
// router.get(
//   "/:id/blocks/:blockId",
//   getCampaignBlockById
// );

// // Create block
// router.post(
//   "/:id/blocks",
//   createCampaignBlock
// );

// // Update block
// router.put(
//   "/:id/blocks/:blockId",
//   updateCampaignBlock
// );

// // Delete block
// router.delete(
//   "/:id/blocks/:blockId",
//   deleteCampaignBlock
// );

// export default router;

import express from "express";

import {
  getCampaignBlocks,
  getCampaignBlockById,
  createCampaignBlock,
  updateCampaignBlock,
  deleteCampaignBlock,
} from "../controllers/campaignBlock.controller.js";

import { auth } from "../../middleware/auth.js";

const router = express.Router();

// ===================== PROTECTED =====================

router.use(auth);

// ===================== CAMPAIGN BLOCKS =====================

// Get all blocks of a campaign
router.get("/:id/blocks", getCampaignBlocks);

// Get single block
router.get("/:id/blocks/:blockId", getCampaignBlockById);

// Create block
router.post("/:id/blocks", createCampaignBlock);

// Update block
router.put("/:id/blocks/:blockId", updateCampaignBlock);

// Delete block
router.delete("/:id/blocks/:blockId", deleteCampaignBlock);

export default router;