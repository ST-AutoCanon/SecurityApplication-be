import * as service from "../services/organisation.service.js";

export const registerOrg = async (req, res) => {
  try {
    let { admin, ...organisationData } = req.body;

    if (req.file) {
      organisationData.photo_path = req.file.path;
    }

    if (!organisationData.org_type) {
      return res.status(400).json({
        success: false,
        message: "org_type is required",
      });
    }

    if (typeof admin === "string") {
      try {
        admin = JSON.parse(admin);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid admin JSON format",
        });
      }
    }

    const result = await service.registerOrganisation(organisationData, admin);

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateOrg = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid organisation ID is required",
      });
    }
    let { admin, ...organisationData } = req.body;

    if (req.file) {
      organisationData.photo_path = req.file.path;
    }

    if (typeof admin === "string") {
      try {
        admin = JSON.parse(admin);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid admin JSON format",
        });
      }
    }

    organisationData.admin = admin;

    const result = await service.updateOrganisationService(
      Number(id),
      organisationData,
    );

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* Get All Organisations */
export const getAllOrgs = async (req, res) => {
  try {
    const result = await service.listOrganisations();

    return res.json(result);
  } catch (error) {
    console.error("Organisation List Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* Get Single Organisation */
export const getOrgById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Organisation ID is required",
      });
    }

    const result = await service.getSingleOrganisation(Number(id));

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Get Organisation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* Delete Organisation */
export const deleteOrg = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Organisation ID is required",
      });
    }

    const result = await service.deleteOrganisationService(Number(id));

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Delete Organisation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* Get Org Codes */
export const getOrganisations = async (req, res) => {
  try {
    const result = await service.fetchAllOrganisations();

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Get Org id And Names Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const createSecurityUser = async (req, res) => {
  try {
    const { organisationId } = req.params;

    const result = await service.createSecurityUserService(
      Number(organisationId),
      req.body,
    );

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};