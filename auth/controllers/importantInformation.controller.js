import { getBusinessDB } from "../../db/dbRouter.js";
// import {
//   getBusinessDB,
//   masterAuthDB,
// } from "../../db/dbRouter.js";
import * as model from "../models/importantInformation.model.js";
import masterAuthDB from "../../config/masterAuthDB.js";
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
| VALIDATE CONTACT INFORMATION
|--------------------------------------------------------------------------
*/

const validateContactInformation = (
  title,
  description
) => {
  if (
    !title ||
    typeof title !== "string" ||
    !title.trim()
  ) {
    return {
      valid: false,
      message:
        "Important information title is required",
    };
  }

  let parsed;

  try {
    parsed = JSON.parse(
      description
    );
  } catch {
    return {
      valid: false,
      message:
        "Invalid contact information format",
    };
  }

  const {
    informationType,
    contacts,
  } = parsed || {};

  if (
    informationType !==
      "emergency" &&
    informationType !==
      "community"
  ) {
    return {
      valid: false,
      message:
        "Please select a valid information type",
    };
  }

  if (
    !Array.isArray(contacts) ||
    contacts.length === 0
  ) {
    return {
      valid: false,
      message:
        "At least one contact is required",
    };
  }

  for (
    let index = 0;
    index < contacts.length;
    index++
  ) {
    const contact =
      contacts[index];

    const rowNumber =
      index + 1;

    if (
      !contact ||
      typeof contact !==
        "object"
    ) {
      return {
        valid: false,
        message:
          `Contact ${rowNumber} is invalid`,
      };
    }

    const designation =
      typeof contact.designation ===
      "string"
        ? contact.designation.trim()
        : "";

    const name =
      typeof contact.name ===
      "string"
        ? contact.name.trim()
        : "";

    const contactNo =
      typeof contact.contactNo ===
      "string"
        ? contact.contactNo.trim()
        : "";

    if (!designation) {
      return {
        valid: false,
        message:
          `Designation is required for contact ${rowNumber}`,
      };
    }

    if (designation.length < 2) {
      return {
        valid: false,
        message:
          `Designation for contact ${rowNumber} must contain at least 2 characters`,
      };
    }

    if (!name) {
      return {
        valid: false,
        message:
          `Name is required for contact ${rowNumber}`,
      };
    }

    if (name.length < 2) {
      return {
        valid: false,
        message:
          `Name for contact ${rowNumber} must contain at least 2 characters`,
      };
    }

    if (!contactNo) {
      return {
        valid: false,
        message:
          `Contact number is required for contact ${rowNumber}`,
      };
    }

    if (
      !/^[6-9]\d{9}$/.test(
        contactNo
      )
    ) {
      return {
        valid: false,
        message:
          `Contact number for contact ${rowNumber} must be a valid 10-digit mobile number`,
      };
    }
  }

  return {
    valid: true,
    parsed: {
      informationType,
      contacts:
        contacts.map(
          (contact) => ({
            designation:
              contact.designation.trim(),
            name:
              contact.name.trim(),
            contactNo:
              contact.contactNo.trim(),
          })
        ),
    },
  };
};


/*
|--------------------------------------------------------------------------
| CREATE IMPORTANT INFORMATION
|--------------------------------------------------------------------------
*/

export const createImportantInformation =
  async (
    req,
    res
  ) => {
    let client;

    try {
      const organisationId =
        req.user?.organisation_id;

      const orgType =
        req.user?.org_type?.toLowerCase();

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

      const {
        title,
        description,
        priority = "Important",
        expiresAt = null,
      } = req.body;

      const validation =
        validateContactInformation(
          title,
          description
        );

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message:
            validation.message,
        });
      }

      const allowedPriorities = [
        "Important",
        "Notice",
        "General",
      ];

      if (
        !allowedPriorities.includes(
          priority
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid important information priority",
        });
      }

      const schemaName =
        `org_${String(
          organisationId
        ).padStart(3, "0")}`;

      const businessDB =
        getBusinessDB(
          orgType
        );

      client =
        await businessDB.connect();

      const createdBy =
        req.user?.user_id ||
        req.user?.id ||
        null;

      /*
       * Store only the validated/clean
       * JSON in the existing description
       * column.
       */

      const cleanDescription =
        JSON.stringify(
          validation.parsed
        );

      const information =
        await model.createImportantInformation(
          client,
          schemaName,
          organisationId,
          title.trim(),
          cleanDescription,
          priority,
          createdBy,
          expiresAt || null
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
    console.log("GET ADMIN IMPORTANT INFORMATION");
    console.log("Organisation ID:", organisationId);
    console.log("Organisation Type:", orgType);
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
    | ORGANISATION SCHEMA
    |--------------------------------------------------------------------------
    */

    const schemaName =
      `org_${String(organisationId).padStart(3, "0")}`;

    /*
    |--------------------------------------------------------------------------
    | BUSINESS DATABASE
    |--------------------------------------------------------------------------
    */

    const businessDB =
      getBusinessDB(orgType);

    client =
      await businessDB.connect();

    /*
    |--------------------------------------------------------------------------
    | FETCH SAVED INFORMATION
    |--------------------------------------------------------------------------
    */

    const information =
      await model.getAdminImportantInformation(
        client,
        schemaName,
        organisationId
      );

    console.log(
      "Important information fetched:",
      information
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
      !Number.isInteger(informationId) ||
      informationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid important information ID",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ORGANISATION SCHEMA
    |--------------------------------------------------------------------------
    */

    const schemaName =
      `org_${String(organisationId).padStart(3, "0")}`;

    /*
    |--------------------------------------------------------------------------
    | BUSINESS DATABASE
    |--------------------------------------------------------------------------
    */

    const businessDB =
      getBusinessDB(orgType);

    client =
      await businessDB.connect();

    /*
    |--------------------------------------------------------------------------
    | DELETE / DEACTIVATE
    |--------------------------------------------------------------------------
    */

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
      data: deleted,
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
| UPDATE IMPORTANT INFORMATION
|--------------------------------------------------------------------------
*/

export const updateImportantInformation =
  async (
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
        Number(
          req.params.id
        );

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

      const {
        title,
        description,
        priority = "Important",
        expiresAt = null,
      } = req.body;

      const validation =
        validateContactInformation(
          title,
          description
        );

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message:
            validation.message,
        });
      }

      const allowedPriorities = [
        "Important",
        "Notice",
        "General",
      ];

      if (
        !allowedPriorities.includes(
          priority
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid important information priority",
        });
      }

      const schemaName =
        `org_${String(
          organisationId
        ).padStart(3, "0")}`;

      const businessDB =
        getBusinessDB(
          orgType
        );

      client =
        await businessDB.connect();

      const cleanDescription =
        JSON.stringify(
          validation.parsed
        );

      const information =
        await model.updateImportantInformation(
          client,
          schemaName,
          organisationId,
          informationId,
          title.trim(),
          cleanDescription,
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
  export const getUserImportantInformation = async (
  req,
  res
) => {
  let client;

  try {
    console.log("=================================");
    console.log("GET USER IMPORTANT INFORMATION");
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

    /*
    |--------------------------------------------------------------------------
    | VALIDATE AUTHENTICATION DATA
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
    | GET IMPORTANT INFORMATION
    |--------------------------------------------------------------------------
    */

    const information =
      await model.getUserImportantInformation(
        client,
        schemaName,
        organisationId
      );

    console.log(
      "Important Information found:",
      information.length
    );

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

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
//   export const getUserImportantInformation = async (req, res) => {
//   let client;

//   try {
//     const organisationId = req.user?.organisation_id;
//     const orgType = req.user?.org_type?.toLowerCase();

//     console.log("=================================");
//     console.log("GET USER IMPORTANT INFORMATION");
//     console.log("Organisation ID:", organisationId);
//     console.log("Organisation Type:", orgType);
//     console.log("=================================");

//     if (!organisationId) {
//       return res.status(401).json({
//         success: false,
//         message: "Organisation ID not found in authentication token",
//       });
//     }

//     if (!orgType) {
//       return res.status(401).json({
//         success: false,
//         message: "Organisation type not found in authentication token",
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | AUTH DATABASE
//     |--------------------------------------------------------------------------
//     */

//     const authDB = getAuthDB();
//     const authClient = await authDB.connect();

//     let schemaName;

//     try {
//       const organisation = await getOrganisationSchema(
//         authClient,
//         organisationId
//       );

//       if (!organisation?.schema_name) {
//         return res.status(404).json({
//           success: false,
//           message: "Organisation schema not found",
//         });
//       }

//       schemaName = organisation.schema_name;
//     } finally {
//       authClient.release();
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | BUSINESS DATABASE
//     |--------------------------------------------------------------------------
//     */

//     const businessDB = getBusinessDB(orgType);

//     client = await businessDB.connect();

//     /*
//     |--------------------------------------------------------------------------
//     | FETCH ACTIVE IMPORTANT INFORMATION
//     |--------------------------------------------------------------------------
//     */

//     const information =
//       await model.getUserImportantInformation(
//         client,
//         schemaName,
//         organisationId
//       );

//     console.log(
//       "Important information returned:",
//       information.length
//     );

//     return res.status(200).json({
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
//     if (client) {
//       client.release();
//     }
//   }
// };
// export const getUserImportantInformation = async (req, res) => {
//   let client;
//   let authClient;

//   try {
//     const organisationId = req.user?.organisation_id;
//     const orgType = req.user?.org_type?.toLowerCase();

//     console.log("=================================");
//     console.log("GET USER IMPORTANT INFORMATION");
//     console.log("Organisation ID:", organisationId);
//     console.log("Organisation Type:", orgType);
//     console.log("=================================");

//     if (!organisationId) {
//       return res.status(401).json({
//         success: false,
//         message: "Organisation ID not found in authentication token",
//       });
//     }

//     if (!orgType) {
//       return res.status(401).json({
//         success: false,
//         message: "Organisation type not found in authentication token",
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | GET ORGANISATION SCHEMA
//     |--------------------------------------------------------------------------
//     */

//     authClient = await masterAuthDB.connect();

//     const organisation = await getOrganisationSchema(
//       authClient,
//       organisationId
//     );

//     if (!organisation?.schema_name) {
//       return res.status(404).json({
//         success: false,
//         message: "Organisation schema not found",
//       });
//     }

//     const schemaName = organisation.schema_name;

//     console.log("Organisation Schema:", schemaName);

//     /*
//     |--------------------------------------------------------------------------
//     | RELEASE AUTH DATABASE CONNECTION
//     |--------------------------------------------------------------------------
//     */

//     authClient.release();
//     authClient = null;

//     /*
//     |--------------------------------------------------------------------------
//     | GET BUSINESS DATABASE
//     |--------------------------------------------------------------------------
//     */

//     const businessDB = getBusinessDB(orgType);

//     client = await businessDB.connect();

//     /*
//     |--------------------------------------------------------------------------
//     | FETCH IMPORTANT INFORMATION
//     |--------------------------------------------------------------------------
//     */

//     const information =
//       await model.getUserImportantInformation(
//         client,
//         schemaName,
//         organisationId
//       );

//     console.log(
//       "Important information returned:",
//       information.length
//     );

//     return res.status(200).json({
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
//     if (authClient) {
//       authClient.release();
//     }

//     if (client) {
//       client.release();
//     }
//   }
// };