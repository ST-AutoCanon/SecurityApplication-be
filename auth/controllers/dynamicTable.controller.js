import * as service from "../services/dynamicTable.service.js";

/* -------------------------------------------------------------------------- */
/*                            GET ALL TEMPLATES                               */
/* -------------------------------------------------------------------------- */

export const getTemplates = async (req, res) => {
  try {
    const result = await service.getTemplatesService();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Templates Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                         GET TEMPLATE FIELDS                                */
/* -------------------------------------------------------------------------- */

export const getTemplateFields = async (req, res) => {
  try {
    const { templateId } = req.params;

    const result = await service.getTemplateFieldsService(templateId);

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Get Template Fields Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                        CREATE DYNAMIC TABLE                                */
/* -------------------------------------------------------------------------- */

export const createDynamicTable = async (req, res) => {
  try {
    const payload = {
      ...req.body,

      // Change this according to your auth middleware
      createdBy: req.user?.id || null,
    };

    const result = await service.createDynamicTableService(payload);

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("Create Dynamic Table Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                 GET DYNAMIC TABLE CONFIGURATION                            */
/* -------------------------------------------------------------------------- */

export const getDynamicTableConfiguration = async (req, res) => {
  try {
    const { organisationId, templateId } = req.query;

    const result = await service.getDynamicTableConfigurationService(
      organisationId,
      templateId,
    );

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Get Dynamic Table Configuration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateDynamicTable = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      updatedBy: req.user?.id || null,
    };

    const result = await service.updateDynamicTableService(payload);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Update Dynamic Table Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};