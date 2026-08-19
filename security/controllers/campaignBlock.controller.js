// campaign/controllers/campaignBlock.controller.js

import {
  getCampaignBlocksService,
  getCampaignBlockByIdService,
  createCampaignBlockService,
  updateCampaignBlockService,
  deleteCampaignBlockService,
} from "../services/campaignBlock.service.js";

// ===================== GET ALL BLOCKS =====================

export const getCampaignBlocks = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;

    const result = await getCampaignBlocksService(
      organisationId,
      id
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("getCampaignBlocks error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===================== GET SINGLE BLOCK =====================

export const getCampaignBlockById = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { blockId } = req.params;

    const result = await getCampaignBlockByIdService(
      organisationId,
      blockId
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("getCampaignBlockById error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===================== CREATE BLOCK =====================

export const createCampaignBlock = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;

    const result = await createCampaignBlockService(
      organisationId,
      id,
      req.body
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (err) {
    console.error("createCampaignBlock error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===================== UPDATE BLOCK =====================

export const updateCampaignBlock = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { blockId } = req.params;

    const result = await updateCampaignBlockService(
      organisationId,
      blockId,
      req.body
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("updateCampaignBlock error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===================== DELETE BLOCK =====================

export const deleteCampaignBlock = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { blockId } = req.params;

    const result = await deleteCampaignBlockService(
      organisationId,
      blockId
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("deleteCampaignBlock error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};