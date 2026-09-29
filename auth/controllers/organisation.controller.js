import * as service from "../services/organisation.service.js";

// export const registerOrg = async (req, res) => {
//   try {
//     let { admin, ...organisationData } = req.body;

//     if (req.file) {
//       organisationData.photo_path = req.file.path;
//     }

//     if (!organisationData.org_type) {
//       return res.status(400).json({
//         success: false,
//         message: "org_type is required",
//       });
//     }

//     if (typeof admin === "string") {
//       try {
//         admin = JSON.parse(admin);
//       } catch {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid admin JSON format",
//         });
//       }
//     }

//     const result = await service.registerOrganisation(organisationData, admin);

//     return res.status(result.success ? 201 : 400).json(result);
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };


export const registerOrg = async (req, res) => {
  try {
    console.log("\n========== REGISTER ORGANISATION ==========");

    console.log("METHOD:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("USER:", req.user);

    console.log("BODY:", req.body);

    console.log(
      "FILE:",
      req.file
        ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            path: req.file.path,
            size: req.file.size,
          }
        : null,
    );

    let { admin, ...organisationData } = req.body;

    console.log("RAW ADMIN:", admin);
    console.log("RAW ORGANISATION DATA:", organisationData);

    if (req.file) {
      organisationData.photo_path = req.file.path;
    }

    if (!organisationData.org_type) {
      console.log("❌ org_type missing");

      return res.status(400).json({
        success: false,
        message: "org_type is required",
      });
    }

    if (typeof admin === "string") {
      try {
        admin = JSON.parse(admin);
      } catch (error) {
        console.error("❌ ADMIN JSON PARSE ERROR:", error);

        return res.status(400).json({
          success: false,
          message: "Invalid admin JSON format",
        });
      }
    }

    console.log("PARSED ADMIN:", admin);
    console.log("FINAL ORGANISATION DATA:", organisationData);

    const result = await service.registerOrganisation(organisationData, admin);

    console.log("SERVICE RESULT:", result);

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("❌ REGISTER CONTROLLER ERROR:", error);
    console.error("STACK:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
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