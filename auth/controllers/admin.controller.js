import * as service from "../services/admin.service.js";
import {
  fetchAllDeliveryPersons,
  fetchAllBusinessData,
} from "../services/admin.service.js";

import { getBusinessDB } from "../../db/dbRouter.js";

import masterAuthDB from "../../config/masterAuthDB.js";
export const createSecurityUser = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    if (!organisationId) {
      return res.status(403).json({
        success: false,
        message: "Organisation not found for logged in admin",
      });
    }

    const result = await service.createSecurityUserService(
      organisationId,
      req.body,
    );

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("Create Security User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// admin.controller.js

export const getAllDeliveryPersons = async (req, res) => {
  const client = await firstDB.connect();

  try {
    const data = await fetchAllDeliveryPersons(client);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    client.release();
  }
};

export const getAllBusinessData = async (req, res) => {
  const organisationId = req.user.organisation_id;
  const orgType = req.user.org_type?.toLowerCase();

  const businessDB = getBusinessDB(orgType);

  const businessClient = await businessDB.connect();
  const authClient = await masterAuthDB.connect();

  try {
    console.log("Org Type:", orgType);
    console.log("Organisation ID:", organisationId);

    const data = await fetchAllBusinessData(
      businessClient,
      authClient,
      organisationId,
    );

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    businessClient.release();
    authClient.release();
  }
};

// export const updateBusinessData = async (req, res) => {
//   const { table, id } = req.params;

//   const organisationId = req.user.organisation_id;
//   const orgType = req.user.org_type.toLowerCase();

//   const businessDB = getBusinessDB(orgType);

//   const businessClient = await businessDB.connect();
//   const authClient = await masterAuthDB.connect();

//   try {
//     const org = await model.getOrganisationSchema(authClient, organisationId);

//     const data = await service.updateBusinessData(
//       businessClient,
//       org.schema_name,
//       table,
//       id,
//       req.body,
//     );

//     res.json({
//       success: true,
//       data,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   } finally {
//     businessClient.release();
//     authClient.release();
//   }
// };

// export const deactivateBusinessData = async (req, res) => {
//   const { table, id } = req.params;

//   const organisationId = req.user.organisation_id;
//   const orgType = req.user.org_type.toLowerCase();

//   const businessDB = getBusinessDB(orgType);

//   const businessClient = await businessDB.connect();
//   const authClient = await masterAuthDB.connect();

//   try {
//     const org = await model.getOrganisationSchema(authClient, organisationId);

//     const data = await service.deactivateBusinessData(
//       businessClient,
//       org.schema_name,
//       table,
//       id,
//     );

//     res.json({
//       success: true,
//       data,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   } finally {
//     businessClient.release();
//     authClient.release();
//   }
// };

// export const activateBusinessData = async (req, res) => {
//   const { table, id } = req.params;

//   const organisationId = req.user.organisation_id;
//   const orgType = req.user.org_type.toLowerCase();

//   const businessDB = getBusinessDB(orgType);

//   const businessClient = await businessDB.connect();
//   const authClient = await masterAuthDB.connect();

//   try {
//     const org = await model.getOrganisationSchema(authClient, organisationId);

//     const data = await service.activateBusinessData(
//       businessClient,
//       org.schema_name,
//       table,
//       id,
//     );

//     res.json({
//       success: true,
//       data,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   } finally {
//     businessClient.release();
//     authClient.release();
//   }
// };

// export const getBusinessDataById = async (req, res) => {
//   const { table, id } = req.params;

//   const organisationId = req.user.organisation_id;
//   const orgType = req.user.org_type?.toLowerCase();

//   const businessDB = getBusinessDB(orgType);

//   const businessClient = await businessDB.connect();
//   const authClient = await masterAuthDB.connect();

//   try {
//     const org = await model.getOrganisationSchema(authClient, organisationId);

//     const data = await service.getBusinessDataById(
//       businessClient,
//       org.schema_name,
//       table,
//       id,
//     );

//     if (!data) {
//       return res.status(404).json({
//         success: false,
//         message: "Record not found",
//       });
//     }

//     return res.json({
//       success: true,
//       data,
//     });
//   } catch (err) {
//     console.error(err);

//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   } finally {
//     businessClient.release();
//     authClient.release();
//   }
// };

// export const deleteBusinessData = async (req, res) => {
//   const { table, id } = req.params;

//   const organisationId = req.user.organisation_id;
//   const orgType = req.user.org_type.toLowerCase();

//   const businessDB = getBusinessDB(orgType);

//   const businessClient = await businessDB.connect();
//   const authClient = await masterAuthDB.connect();

//   try {
//     const org = await model.getOrganisationSchema(authClient, organisationId);

//     await service.deleteBusinessData(
//       businessClient,
//       org.schema_name,
//       table,
//       id,
//     );

//     res.json({
//       success: true,
//       message: "Deleted successfully",
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   } finally {
//     businessClient.release();
//     authClient.release();
//   }
// };




export const getBusinessDataById = async (req, res) => {
  try {
    const { table, id } = req.params;

    const organisationId = req.user.organisation_id;
    const orgType = req.user.org_type;

    const result = await service.getBusinessDataByIdService(
      organisationId,
      orgType,
      table,
      id,
    );

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Get Business Data Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
export const updateBusinessData = async (req, res) => {
  try {
    const { table, id } = req.params;

    const organisationId = req.user.organisation_id;
    const orgType = req.user.org_type;

    const result = await service.updateBusinessDataService(
      organisationId,
      orgType,
      table,
      id,
      req.body,
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Update Business Data Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
export const activateBusinessData = async (req, res) => {
  try {
    const { table, id } = req.params;

    const organisationId = req.user.organisation_id;
    const orgType = req.user.org_type;

    const result = await service.activateBusinessDataService(
      organisationId,
      orgType,
      table,
      id,
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Activate Business Data Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
export const deactivateBusinessData = async (req, res) => {
  try {
    const { table, id } = req.params;

    const organisationId = req.user.organisation_id;
    const orgType = req.user.org_type;

    const result = await service.deactivateBusinessDataService(
      organisationId,
      orgType,
      table,
      id,
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Deactivate Business Data Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
export const deleteBusinessData = async (req, res) => {
  try {
    const { table, id } = req.params;

    const organisationId = req.user.organisation_id;
    const orgType = req.user.org_type;

    const result = await service.deleteBusinessDataService(
      organisationId,
      orgType,
      table,
      id,
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Delete Business Data Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getSecurityUsers = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const result = await service.getSecurityUsersService(organisationId);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Get Security Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getSecurityUserById = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;

    const result = await service.getSecurityUserByIdService(organisationId, id);

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Get Security User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateSecurityUser = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;

    const result = await service.updateSecurityUserService(
      organisationId,
      id,
      req.body,
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Update Security User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const deleteSecurityUser = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;

    const result = await service.deleteSecurityUserService(organisationId, id);

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Delete Security User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deactivateSecurityUser = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;

    const result = await service.deactivateSecurityUserService(
      organisationId,
      id,
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Deactivate Security User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const activateSecurityUser = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    const { id } = req.params;

    const result = await service.activateSecurityUserService(
      organisationId,
      id,
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Activate Security User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
