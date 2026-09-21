// import masterAuthDB from "../../config/masterAuthDB.js";
// import * as model from "../models/importantInformation.model.js";

// /*
// |--------------------------------------------------------------------------
// | ADMIN - CREATE IMPORTANT INFORMATION
// |--------------------------------------------------------------------------
// */

// export const createImportantInformation = async (req, res) => {
//   let client;

//   try {
//     const organisationId = req.user?.organisation_id;
//     const createdBy = req.user?.user_id || req.user?.id || null;

//     if (!organisationId) {
//       return res.status(401).json({
//         success: false,
//         message: "Organisation ID not found in authentication token",
//       });
//     }

//     const {
//       title,
//       description,
//       status = "published",
//     } = req.body;

//     if (!title?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Title is required",
//       });
//     }

//     if (!description?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Description is required",
//       });
//     }

//     client = await masterAuthDB.connect();

//     const information =
//       await model.createImportantInformation(
//         client,
//         organisationId,
//         title.trim(),
//         description.trim(),
//         status,
//         createdBy
//       );

//     return res.status(201).json({
//       success: true,
//       message: "Important information created successfully",
//       data: information,
//     });
//   } catch (error) {
//     console.error(
//       "CREATE IMPORTANT INFORMATION ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create important information",
//       error: error.message,
//     });
//   } finally {
//     if (client) client.release();
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | ADMIN - GET ALL
// |--------------------------------------------------------------------------
// */

// export const getAdminImportantInformation = async (
//   req,
//   res
// ) => {
//   let client;

//   try {
//     const organisationId = req.user?.organisation_id;

//     if (!organisationId) {
//       return res.status(401).json({
//         success: false,
//         message: "Organisation ID not found in authentication token",
//       });
//     }

//     client = await masterAuthDB.connect();

//     const information =
//       await model.getAdminImportantInformation(
//         client,
//         organisationId
//       );

//     return res.json({
//       success: true,
//       data: information,
//     });
//   } catch (error) {
//     console.error(
//       "GET ADMIN IMPORTANT INFORMATION ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch important information",
//       error: error.message,
//     });
//   } finally {
//     if (client) client.release();
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | ADMIN - UPDATE
// |--------------------------------------------------------------------------
// */

// export const updateImportantInformation = async (
//   req,
//   res
// ) => {
//   let client;

//   try {
//     const organisationId = req.user?.organisation_id;
//     const { id } = req.params;

//     const {
//       title,
//       description,
//       status,
//     } = req.body;

//     if (!organisationId) {
//       return res.status(401).json({
//         success: false,
//         message: "Organisation ID not found in authentication token",
//       });
//     }

//     if (!title?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Title is required",
//       });
//     }

//     if (!description?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Description is required",
//       });
//     }

//     client = await masterAuthDB.connect();

//     const information =
//       await model.updateImportantInformation(
//         client,
//         id,
//         organisationId,
//         title.trim(),
//         description.trim(),
//         status || "published"
//       );

//     if (!information) {
//       return res.status(404).json({
//         success: false,
//         message: "Important information not found",
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Important information updated successfully",
//       data: information,
//     });
//   } catch (error) {
//     console.error(
//       "UPDATE IMPORTANT INFORMATION ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update important information",
//       error: error.message,
//     });
//   } finally {
//     if (client) client.release();
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | ADMIN - DELETE
// |--------------------------------------------------------------------------
// */

// export const deleteImportantInformation = async (
//   req,
//   res
// ) => {
//   let client;

//   try {
//     const organisationId = req.user?.organisation_id;
//     const { id } = req.params;

//     if (!organisationId) {
//       return res.status(401).json({
//         success: false,
//         message: "Organisation ID not found in authentication token",
//       });
//     }

//     client = await masterAuthDB.connect();

//     const deleted =
//       await model.deleteImportantInformation(
//         client,
//         id,
//         organisationId
//       );

//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         message: "Important information not found",
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Important information deleted successfully",
//     });
//   } catch (error) {
//     console.error(
//       "DELETE IMPORTANT INFORMATION ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete important information",
//       error: error.message,
//     });
//   } finally {
//     if (client) client.release();
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | ADMIN - PUBLISH / UNPUBLISH
// |--------------------------------------------------------------------------
// */

// export const toggleImportantInformationStatus = async (
//   req,
//   res
// ) => {
//   let client;

//   try {
//     const organisationId = req.user?.organisation_id;
//     const { id } = req.params;

//     if (!organisationId) {
//       return res.status(401).json({
//         success: false,
//         message: "Organisation ID not found in authentication token",
//       });
//     }

//     client = await masterAuthDB.connect();

//     const information =
//       await model.toggleImportantInformationStatus(
//         client,
//         id,
//         organisationId
//       );

//     if (!information) {
//       return res.status(404).json({
//         success: false,
//         message: "Important information not found",
//       });
//     }

//     return res.json({
//       success: true,
//       message:
//         information.status === "published"
//           ? "Important information published"
//           : "Important information moved to draft",
//       data: information,
//     });
//   } catch (error) {
//     console.error(
//       "TOGGLE IMPORTANT INFORMATION ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update status",
//       error: error.message,
//     });
//   } finally {
//     if (client) client.release();
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | USER - GET PUBLISHED INFORMATION
// |--------------------------------------------------------------------------
// */

// export const getUserImportantInformation = async (
//   req,
//   res
// ) => {
//   let client;

//   try {
//     const organisationId = req.user?.organisation_id;

//     if (!organisationId) {
//       return res.status(401).json({
//         success: false,
//         message: "Organisation ID not found in authentication token",
//       });
//     }

//     client = await masterAuthDB.connect();

//     const information =
//       await model.getUserImportantInformation(
//         client,
//         organisationId
//       );

//     return res.json({
//       success: true,
//       data: information,
//     });
//   } catch (error) {
//     console.error(
//       "GET USER IMPORTANT INFORMATION ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch important information",
//       error: error.message,
//     });
//   } finally {
//     if (client) client.release();
//   }
// };

import { getBusinessDB } from "../../db/dbRouter.js";
import * as model from "../models/importantInformation.model.js";

/*
|--------------------------------------------------------------------------
| GET ORGANISATION SCHEMA
|--------------------------------------------------------------------------
*/

const getOrganisationSchema = (organisationId) => {
  return `org_${String(organisationId).padStart(3, "0")}`;
};


/*
|--------------------------------------------------------------------------
| CREATE IMPORTANT INFORMATION
|--------------------------------------------------------------------------
*/

export const createImportantInformation = async (
  req,
  res
) => {
  let client;

  try {
    console.log("=================================");
    console.log(
      "CREATE IMPORTANT INFORMATION REQUEST"
    );
    console.log("=================================");

    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    console.log(
      "Organisation ID:",
      organisationId
    );

    console.log(
      "Organisation Type:",
      orgType
    );

    console.log(
      "User:",
      req.user
    );

    /*
    |--------------------------------------------------------------------------
    | VALIDATE AUTH
    |--------------------------------------------------------------------------
    */

    if (!organisationId) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation ID not found in authentication token",
      });
    }

    if (!orgType) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation type not found in authentication token",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | REQUEST BODY
    |--------------------------------------------------------------------------
    */

    const {
      title,
      description,
      priority = "Important",
      expiresAt = null,
    } = req.body;

    console.log(
      "Title:",
      title
    );

    console.log(
      "Description:",
      description
    );

    console.log(
      "Priority:",
      priority
    );

    console.log(
      "Expires At:",
      expiresAt
    );

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Important information title is required",
      });
    }

    if (
      !description ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Important information description is required",
      });
    }

    const allowedPriorities = [
      "Important",
      "Notice",
      "General",
    ];

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid important information priority",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ORGANISATION SCHEMA
    |--------------------------------------------------------------------------
    */

    const schemaName =
      getOrganisationSchema(
        organisationId
      );

    console.log(
      "Important Information Schema:",
      schemaName
    );

    /*
    |--------------------------------------------------------------------------
    | BUSINESS DATABASE
    |--------------------------------------------------------------------------
    */

    const businessDB =
      getBusinessDB(orgType);

    client =
      await businessDB.connect();

    console.log(
      "Business DB connected"
    );

    /*
    |--------------------------------------------------------------------------
    | CREATED BY
    |--------------------------------------------------------------------------
    */

    const createdBy =
      req.user?.user_id ||
      req.user?.id ||
      null;

    /*
    |--------------------------------------------------------------------------
    | INSERT
    |--------------------------------------------------------------------------
    */

    const information =
      await model.createImportantInformation(
        client,
        schemaName,
        organisationId,
        title.trim(),
        description.trim(),
        priority,
        createdBy,
        expiresAt || null
      );

    console.log(
      "Important information created:",
      information
    );

    return res.status(201).json({
      success: true,
      message:
        "Important information added successfully",
      data: information,
    });

  } catch (error) {
    console.error(
      "CREATE IMPORTANT INFORMATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create important information",
      error: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};


/*
|--------------------------------------------------------------------------
| GET ADMIN IMPORTANT INFORMATION
|--------------------------------------------------------------------------
*/

export const getAdminImportantInformation = async (
  req,
  res
) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    console.log("=================================");
    console.log(
      "GET ADMIN IMPORTANT INFORMATION"
    );
    console.log(
      "Organisation ID:",
      organisationId
    );
    console.log(
      "Organisation Type:",
      orgType
    );
    console.log("=================================");

    if (!organisationId) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation ID not found in authentication token",
      });
    }

    if (!orgType) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation type not found in authentication token",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | SCHEMA
    |--------------------------------------------------------------------------
    */

    const schemaName =
      getOrganisationSchema(
        organisationId
      );

    /*
    |--------------------------------------------------------------------------
    | DATABASE
    |--------------------------------------------------------------------------
    */

    const businessDB =
      getBusinessDB(orgType);

    client =
      await businessDB.connect();

    /*
    |--------------------------------------------------------------------------
    | FETCH
    |--------------------------------------------------------------------------
    */

    const information =
      await model.getAdminImportantInformation(
        client,
        schemaName,
        organisationId
      );

    return res.status(200).json({
      success: true,
      data: information,
    });

  } catch (error) {
    console.error(
      "GET ADMIN IMPORTANT INFORMATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch important information",
      error: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};


/*
|--------------------------------------------------------------------------
| GET USER IMPORTANT INFORMATION
|--------------------------------------------------------------------------
*/

export const getUserImportantInformation = async (
  req,
  res
) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    console.log("=================================");
    console.log(
      "GET USER IMPORTANT INFORMATION"
    );
    console.log(
      "Organisation ID:",
      organisationId
    );
    console.log(
      "Organisation Type:",
      orgType
    );
    console.log("=================================");

    if (!organisationId) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation ID not found in authentication token",
      });
    }

    if (!orgType) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation type not found in authentication token",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | SCHEMA
    |--------------------------------------------------------------------------
    */

    const schemaName =
      getOrganisationSchema(
        organisationId
      );

    /*
    |--------------------------------------------------------------------------
    | DATABASE
    |--------------------------------------------------------------------------
    */

    const businessDB =
      getBusinessDB(orgType);

    client =
      await businessDB.connect();

    /*
    |--------------------------------------------------------------------------
    | FETCH PUBLISHED/ACTIVE INFORMATION
    |--------------------------------------------------------------------------
    */

    const information =
      await model.getUserImportantInformation(
        client,
        schemaName,
        organisationId
      );

    return res.status(200).json({
      success: true,
      data: information,
    });

  } catch (error) {
    console.error(
      "GET USER IMPORTANT INFORMATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch important information",
      error: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE IMPORTANT INFORMATION
|--------------------------------------------------------------------------
*/

export const updateImportantInformation = async (
  req,
  res
) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    const informationId =
      Number(req.params.id);

    const {
      title,
      description,
      priority = "Important",
      expiresAt = null,
    } = req.body;

    if (!organisationId) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation ID not found in authentication token",
      });
    }

    if (!orgType) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation type not found in authentication token",
      });
    }

    if (
      !Number.isInteger(
        informationId
      ) ||
      informationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid important information ID",
      });
    }

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Description is required",
      });
    }

    const schemaName =
      getOrganisationSchema(
        organisationId
      );

    const businessDB =
      getBusinessDB(orgType);

    client =
      await businessDB.connect();

    const information =
      await model.updateImportantInformation(
        client,
        schemaName,
        organisationId,
        informationId,
        title.trim(),
        description.trim(),
        priority,
        expiresAt || null
      );

    if (!information) {
      return res.status(404).json({
        success: false,
        message:
          "Important information not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Important information updated successfully",
      data: information,
    });

  } catch (error) {
    console.error(
      "UPDATE IMPORTANT INFORMATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update important information",
      error: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};


/*
|--------------------------------------------------------------------------
| DELETE IMPORTANT INFORMATION
|--------------------------------------------------------------------------
*/

export const deleteImportantInformation = async (
  req,
  res
) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    const informationId =
      Number(req.params.id);

    if (!organisationId) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation ID not found in authentication token",
      });
    }

    if (!orgType) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation type not found in authentication token",
      });
    }

    if (
      !Number.isInteger(
        informationId
      ) ||
      informationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid important information ID",
      });
    }

    const schemaName =
      getOrganisationSchema(
        organisationId
      );

    const businessDB =
      getBusinessDB(orgType);

    client =
      await businessDB.connect();

    const deleted =
      await model.deleteImportantInformation(
        client,
        schemaName,
        organisationId,
        informationId
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message:
          "Important information not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Important information deleted successfully",
    });

  } catch (error) {
    console.error(
      "DELETE IMPORTANT INFORMATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete important information",
      error: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};


/*
|--------------------------------------------------------------------------
| TOGGLE ACTIVE / INACTIVE
|--------------------------------------------------------------------------
*/

export const toggleImportantInformation = async (
  req,
  res
) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    const informationId =
      Number(req.params.id);

    if (!organisationId) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation ID not found in authentication token",
      });
    }

    if (!orgType) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation type not found in authentication token",
      });
    }

    if (
      !Number.isInteger(
        informationId
      ) ||
      informationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid important information ID",
      });
    }

    const schemaName =
      getOrganisationSchema(
        organisationId
      );

    const businessDB =
      getBusinessDB(orgType);

    client =
      await businessDB.connect();

    const information =
      await model.toggleImportantInformation(
        client,
        schemaName,
        organisationId,
        informationId
      );

    if (!information) {
      return res.status(404).json({
        success: false,
        message:
          "Important information not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        information.is_active
          ? "Important information activated"
          : "Important information deactivated",
      data: information,
    });

  } catch (error) {
    console.error(
      "TOGGLE IMPORTANT INFORMATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update important information",
      error: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

