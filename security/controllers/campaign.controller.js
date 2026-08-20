import {
  getAllCampaignsService,
  getCampaignByIdService,
  createCampaignService,
  updateCampaignService,
  deleteCampaignService,
  sendCampaignService,   // ← important/
} from "../services/campaign.service.js";

// ===================== GET ALL CAMPAIGNS =====================

export const getCampaigns = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const result = await getAllCampaignsService(organisationId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("getCampaigns error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===================== GET CAMPAIGN =====================

export const getCampaign = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;

    const result = await getCampaignByIdService(
      organisationId,
      id
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("getCampaign error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===================== CREATE CAMPAIGN =====================

export const createCampaign = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const userId =
      req.user.id ||
      req.user.employee_id ||
      null;

    const result = await createCampaignService(
      organisationId,
      req.body,
      userId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (err) {
    console.error("createCampaign error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===================== UPDATE CAMPAIGN =====================

export const updateCampaign = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;

    const result = await updateCampaignService(
      organisationId,
      id,
      req.body
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("updateCampaign error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===================== DELETE CAMPAIGN =====================

export const deleteCampaign = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;

    const result = await deleteCampaignService(
      organisationId,
      id
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("deleteCampaign error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const sendCampaign = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;
    const { emails } = req.body; // array of emails from frontend

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one email address is required",
      });
    }

    const result = await sendCampaignService(organisationId, id, emails);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("sendCampaign error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};