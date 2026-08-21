import * as service from "../services/assignGates.service.js";

// Get all assign gates
export const getAssignGates = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const orgType = req.user.org_type;

    const result = await service.getAssignGatesService(organisationId, orgType);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Get Assign Gates Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get assign gate by ID
export const getAssignGateById = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const orgType = req.user.org_type;
    const { id } = req.params;

    const result = await service.getAssignGateByIdService(
      organisationId,
      orgType,
      id,
    );

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Get Assign Gate Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Create assign gate
export const createAssignGate = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const orgType = req.user.org_type;

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Gate name is required",
      });
    }

    const result = await service.createAssignGateService(
      organisationId,
      orgType,
      name,
    );

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("Create Assign Gate Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update assign gate
export const updateAssignGate = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const orgType = req.user.org_type;
    const { id } = req.params;

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Gate name is required",
      });
    }

    const result = await service.updateAssignGateService(
      organisationId,
      orgType,
      id,
      name,
    );

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Update Assign Gate Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Deactivate assign gate
export const deactivateAssignGate = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const orgType = req.user.org_type;
    const { id } = req.params;

    const result = await service.deactivateAssignGateService(
      organisationId,
      orgType,
      id,
    );

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Deactivate Assign Gate Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Activate assign gate
export const activateAssignGate = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const orgType = req.user.org_type;
    const { id } = req.params;

    const result = await service.activateAssignGateService(
      organisationId,
      orgType,
      id,
    );

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Activate Assign Gate Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteAssignGate = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const orgType = req.user.org_type;
    const { id } = req.params;

    const result = await service.deleteAssignGateService(
      organisationId,
      orgType,
      id,
    );

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Delete assign gate error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};