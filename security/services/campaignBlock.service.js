// campaign/services/campaignBlock.service.js

import masterAuthDB from "../../config/masterAuthDB.js";
import { getDB } from "../../config/dbFactory.js";
import { getOrganisationById } from "../../auth/models/organisation.model.js";

import * as model from "../models/campaignBlock.model.js";
import * as campaignModel from "../models/campaign.model.js";

// ===================== GET CAMPAIGN BLOCKS =====================

export const getCampaignBlocksService = async (
  organisationId,
  campaignId
) => {
  try {
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
    const schema = org.schema_name;

    // Verify campaign exists
    const campaign = await campaignModel.getCampaignById(
      db,
      schema,
      campaignId
    );

    if (!campaign) {
      return {
        success: false,
        message: "Campaign not found",
      };
    }

    const rows = await model.getCampaignBlocks(
      db,
      schema,
      campaignId
    );

    const data = rows.map((row) => ({
      id: String(row.id),
      campaignId: String(row.campaign_id),
      blockType: row.block_type,
      content: parseContent(row.content),
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("getCampaignBlocksService error:", err);

    return {
      success: false,
      message: err.message,
    };
  }
};

// ===================== GET SINGLE BLOCK =====================

export const getCampaignBlockByIdService = async (
  organisationId,
  blockId
) => {
  try {
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
    const schema = org.schema_name;

    const row = await model.getCampaignBlockById(
      db,
      schema,
      blockId
    );

    if (!row) {
      return {
        success: false,
        message: "Campaign block not found",
      };
    }

    return {
      success: true,
      data: {
        id: String(row.id),
        campaignId: String(row.campaign_id),
        blockType: row.block_type,
        content: parseContent(row.content),
        sortOrder: row.sort_order,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  } catch (err) {
    console.error("getCampaignBlockByIdService error:", err);

    return {
      success: false,
      message: err.message,
    };
  }
};

// ===================== CREATE BLOCK =====================

export const createCampaignBlockService = async (
  organisationId,
  campaignId,
  payload
) => {
  try {
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

    // Validate campaign ID
    if (!campaignId) {
      return {
        success: false,
        message: "Campaign ID is required",
      };
    }

    // Validate block type
    if (!payload.block_type?.trim()) {
      return {
        success: false,
        message: "block_type is required",
      };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    // Verify campaign exists
    const campaign = await campaignModel.getCampaignById(
      db,
      schema,
      campaignId
    );

    if (!campaign) {
      return {
        success: false,
        message: "Campaign not found",
      };
    }

    const row = await model.createCampaignBlock(
      db,
      schema,
      {
        campaign_id: campaignId,
        block_type: payload.block_type.trim(),
        content: payload.content || {},
        sort_order: payload.sort_order ?? 0,
      }
    );

    return {
      success: true,
      message: "Campaign block created successfully",
      data: {
        id: String(row.id),
        campaignId: String(row.campaign_id),
        blockType: row.block_type,
        content: parseContent(row.content),
        sortOrder: row.sort_order,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  } catch (err) {
    console.error("createCampaignBlockService error:", err);

    return {
      success: false,
      message: err.message,
    };
  }
};

// ===================== UPDATE BLOCK =====================

export const updateCampaignBlockService = async (
  organisationId,
  blockId,
  payload
) => {
  try {
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

    if (!payload.block_type?.trim()) {
      return {
        success: false,
        message: "block_type is required",
      };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    // Verify block exists
    const existingBlock = await model.getCampaignBlockById(
      db,
      schema,
      blockId
    );

    if (!existingBlock) {
      return {
        success: false,
        message: "Campaign block not found",
      };
    }

    const row = await model.updateCampaignBlock(
      db,
      schema,
      blockId,
      {
        block_type: payload.block_type.trim(),
        content: payload.content || {},
        sort_order: payload.sort_order ?? 0,
      }
    );

    if (!row) {
      return {
        success: false,
        message: "Campaign block not found",
      };
    }

    return {
      success: true,
      message: "Campaign block updated successfully",
      data: {
        id: String(row.id),
        campaignId: String(row.campaign_id),
        blockType: row.block_type,
        content: parseContent(row.content),
        sortOrder: row.sort_order,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  } catch (err) {
    console.error("updateCampaignBlockService error:", err);

    return {
      success: false,
      message: err.message,
    };
  }
};

// ===================== DELETE BLOCK =====================

export const deleteCampaignBlockService = async (
  organisationId,
  blockId
) => {
  try {
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
    const schema = org.schema_name;

    const row = await model.deleteCampaignBlock(
      db,
      schema,
      blockId
    );

    if (!row) {
      return {
        success: false,
        message: "Campaign block not found",
      };
    }

    return {
      success: true,
      message: "Campaign block deleted successfully",
    };
  } catch (err) {
    console.error("deleteCampaignBlockService error:", err);

    return {
      success: false,
      message: err.message,
    };
  }
};

// ===================== HELPER =====================

const parseContent = (content) => {
  if (!content) {
    return {};
  }

  if (typeof content === "object") {
    return content;
  }

  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
};