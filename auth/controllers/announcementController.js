// import { getBusinessDB } from "../../db/dbRouter.js";
// import * as model from "../models/announcement.model.js";

// /*
// |--------------------------------------------------------------------------
// | GET ORGANISATION SCHEMA
// |--------------------------------------------------------------------------
// */

// const getOrganisationSchema = (organisationId) => {
//   return `org_${String(organisationId).padStart(3, "0")}`;
// };


// /*
// |--------------------------------------------------------------------------
// | CHECK USER ROLE
// |--------------------------------------------------------------------------
// |
// | Admin:
// |   Can see future announcements.
// |
// | User:
// |   Can see only currently active announcements based on
// |   starts_at and expires_at.
// |
// |--------------------------------------------------------------------------
// */

// const isAdminUser = (req) => {
//   const role = String(
//     req.user?.role ||
//     req.user?.user_role ||
//     ""
//   ).toLowerCase();

//   return [
//     "admin",
//     "superadmin",
//     "super_admin",
//   ].includes(role);
// };


// /*
// |--------------------------------------------------------------------------
// | CREATE ANNOUNCEMENT
// |--------------------------------------------------------------------------
// */

// export const createAnnouncement = async (req, res) => {
//   let client;

//   try {
//     console.log("=================================");
//     console.log("CREATE ANNOUNCEMENT REQUEST");
//     console.log("=================================");

//     const organisationId = req.user?.organisation_id;

//     const orgType = String(
//       req.user?.org_type ||
//       req.user?.orgType ||
//       ""
//     ).toLowerCase();

//     console.log("Organisation ID:", organisationId);
//     console.log("Organisation Type:", orgType);
//     console.log("User:", req.user);

//     if (!organisationId) {
//       return res.status(401).json({
//         success: false,
//         message:
//           "Organisation ID not found in authentication token",
//       });
//     }

//     if (!orgType) {
//       return res.status(401).json({
//         success: false,
//         message:
//           "Organisation type not found in authentication token",
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | REQUEST BODY
//     |--------------------------------------------------------------------------
//     */

//     const {
//       title,
//       message,
//       priority = "Notice",

//       // IMPORTANT:
//       // Frontend sends startsAt
//       startsAt = null,

//       // Frontend sends expiresAt
//       expiresAt = null,
//     } = req.body;

//     console.log("Title:", title);
//     console.log("Message:", message);
//     console.log("Priority:", priority);
//     console.log("Starts At:", startsAt);
//     console.log("Expires At:", expiresAt);

//     /*
//     |--------------------------------------------------------------------------
//     | VALIDATION
//     |--------------------------------------------------------------------------
//     */

//     if (!title || !title.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Announcement title is required",
//       });
//     }

//     if (!message || !message.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Announcement message is required",
//       });
//     }

//     const allowedPriorities = [
//       "Important",
//       "Notice",
//       "General",
//     ];

//     if (!allowedPriorities.includes(priority)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid announcement priority",
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | DATE VALIDATION
//     |--------------------------------------------------------------------------
//     */

//     if (startsAt && expiresAt) {
//       const startDate = new Date(startsAt);
//       const expiryDate = new Date(expiresAt);

//       if (
//         Number.isNaN(startDate.getTime()) ||
//         Number.isNaN(expiryDate.getTime())
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid start or expiry date",
//         });
//       }

//       if (expiryDate < startDate) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Expiry date cannot be earlier than start date",
//         });
//       }
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | ORGANISATION SCHEMA
//     |--------------------------------------------------------------------------
//     */

//     const schemaName = getOrganisationSchema(
//       organisationId
//     );

//     console.log(
//       "Announcement Schema:",
//       schemaName
//     );

//     /*
//     |--------------------------------------------------------------------------
//     | BUSINESS DATABASE
//     |--------------------------------------------------------------------------
//     */

//     const businessDB = getBusinessDB(orgType);

//     client = await businessDB.connect();

//     console.log("Business DB connected");

//     /*
//     |--------------------------------------------------------------------------
//     | CREATED BY
//     |--------------------------------------------------------------------------
//     */

//     const createdBy =
//       req.user?.user_id ||
//       req.user?.id ||
//       null;

//     /*
//     |--------------------------------------------------------------------------
//     | INSERT ANNOUNCEMENT
//     |--------------------------------------------------------------------------
//     |
//     | IMPORTANT:
//     | Pass BOTH startsAt and expiresAt.
//     |--------------------------------------------------------------------------
//     */

//     const announcement =
//       await model.createAnnouncement(
//         client,
//         schemaName,
//         organisationId,
//         title.trim(),
//         message.trim(),
//         priority,
//         createdBy,
//         startsAt || null,
//         expiresAt || null
//       );

//     console.log(
//       "Announcement created:",
//       announcement
//     );

//     return res.status(201).json({
//       success: true,
//       message:
//         "Announcement published successfully",
//       data: announcement,
//     });
//   } catch (error) {
//     console.error(
//       "CREATE ANNOUNCEMENT ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create announcement",
//       error: error.message,
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };


// /*
// |--------------------------------------------------------------------------
// | GET ANNOUNCEMENTS
// |--------------------------------------------------------------------------
// |
// | SAME ENDPOINT FOR ADMIN + USER
// |
// | ADMIN:
// |   Returns all active announcements.
// |
// | USER:
// |   Returns only currently valid announcements.
// |
// |--------------------------------------------------------------------------
// */

// export const getAnnouncements = async (req, res) => {
//   let client;

//   try {
//     const organisationId =
//       req.user?.organisation_id;

//     const orgType = String(
//       req.user?.org_type ||
//       req.user?.orgType ||
//       ""
//     ).toLowerCase();

//     console.log("=================================");
//     console.log("GET ANNOUNCEMENTS");
//     console.log("Organisation ID:", organisationId);
//     console.log("Organisation Type:", orgType);
//     console.log("Role:", req.user?.role);
//     console.log("=================================");

//     if (!organisationId) {
//       return res.status(401).json({
//         success: false,
//         message:
//           "Organisation ID not found in authentication token",
//       });
//     }

//     if (!orgType) {
//       return res.status(401).json({
//         success: false,
//         message:
//           "Organisation type not found in authentication token",
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | ORGANISATION SCHEMA
//     |--------------------------------------------------------------------------
//     */

//     const schemaName = getOrganisationSchema(
//       organisationId
//     );

//     console.log(
//       "Announcement Schema:",
//       schemaName
//     );

//     /*
//     |--------------------------------------------------------------------------
//     | BUSINESS DATABASE
//     |--------------------------------------------------------------------------
//     */

//     const businessDB = getBusinessDB(orgType);

//     client = await businessDB.connect();

//     /*
//     |--------------------------------------------------------------------------
//     | ADMIN OR USER?
//     |--------------------------------------------------------------------------
//     */

//     const admin = isAdminUser(req);

//     console.log(
//       "Is Admin:",
//       admin
//     );

//     /*
//     |--------------------------------------------------------------------------
//     | FETCH ANNOUNCEMENTS
//     |--------------------------------------------------------------------------
//     |
//     | IMPORTANT:
//     |
//     | admin = true
//     |   → future announcements INCLUDED
//     |
//     | admin = false
//     |   → future/expired announcements EXCLUDED
//     |--------------------------------------------------------------------------
//     */

//     const announcements =
//       await model.getAnnouncements(
//         client,
//         schemaName,
//         organisationId,
//         admin
//       );

//     console.log(
//       "Announcements found:",
//       announcements.length
//     );

//     console.log(
//       "Announcements:",
//       announcements
//     );

//     return res.status(200).json({
//       success: true,
//       data: announcements,
//     });
//   } catch (error) {
//     console.error(
//       "GET ANNOUNCEMENTS ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch announcements",
//       error: error.message,
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };


// /*
// |--------------------------------------------------------------------------
// | DELETE ANNOUNCEMENT
// |--------------------------------------------------------------------------
// */

// export const deleteAnnouncement = async (
//   req,
//   res
// ) => {
//   let client;

//   try {
//     const organisationId =
//       req.user?.organisation_id;

//     const orgType = String(
//       req.user?.org_type ||
//       req.user?.orgType ||
//       ""
//     ).toLowerCase();

//     const announcementId =
//       Number(req.params.id);

//     console.log("=================================");
//     console.log("DELETE ANNOUNCEMENT");
//     console.log("Organisation ID:", organisationId);
//     console.log("Organisation Type:", orgType);
//     console.log(
//       "Announcement ID:",
//       announcementId
//     );
//     console.log("=================================");

//     if (!organisationId) {
//       return res.status(401).json({
//         success: false,
//         message:
//           "Organisation ID not found in authentication token",
//       });
//     }

//     if (!orgType) {
//       return res.status(401).json({
//         success: false,
//         message:
//           "Organisation type not found in authentication token",
//       });
//     }

//     if (
//       !Number.isInteger(announcementId) ||
//       announcementId <= 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid announcement ID",
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | ORGANISATION SCHEMA
//     |--------------------------------------------------------------------------
//     */

//     const schemaName = getOrganisationSchema(
//       organisationId
//     );

//     /*
//     |--------------------------------------------------------------------------
//     | BUSINESS DATABASE
//     |--------------------------------------------------------------------------
//     */

//     const businessDB = getBusinessDB(orgType);

//     client = await businessDB.connect();

//     /*
//     |--------------------------------------------------------------------------
//     | DELETE ANNOUNCEMENT
//     |--------------------------------------------------------------------------
//     */

//     const deleted =
//       await model.deleteAnnouncement(
//         client,
//         schemaName,
//         organisationId,
//         announcementId
//       );

//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Announcement not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message:
//         "Announcement deleted successfully",
//     });
//   } catch (error) {
//     console.error(
//       "DELETE ANNOUNCEMENT ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to delete announcement",
//       error: error.message,
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };


// /*
// |--------------------------------------------------------------------------
// | UPDATE ANNOUNCEMENT
// |--------------------------------------------------------------------------
// */

// export const updateAnnouncement = async (
//   req,
//   res
// ) => {
//   let client;

//   try {
//     const { id } = req.params;

//     const {
//       title,
//       message,
//       priority,
//       startsAt,
//       expiresAt,
//     } = req.body;

//     console.log("=================================");
//     console.log("UPDATE ANNOUNCEMENT");
//     console.log("Announcement ID:", id);
//     console.log("Starts At:", startsAt);
//     console.log("Expires At:", expiresAt);
//     console.log("=================================");

//     /*
//     |--------------------------------------------------------------------------
//     | BASIC VALIDATION
//     |--------------------------------------------------------------------------
//     */

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Announcement ID is required",
//       });
//     }

//     if (!title?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Title is required",
//       });
//     }

//     if (!message?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Message is required",
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | DATE VALIDATION
//     |--------------------------------------------------------------------------
//     */

//     if (startsAt && expiresAt) {
//       const startDate = new Date(startsAt);
//       const expiryDate = new Date(expiresAt);

//       if (
//         Number.isNaN(startDate.getTime()) ||
//         Number.isNaN(expiryDate.getTime())
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Invalid start or expiry date",
//         });
//       }

//       if (expiryDate < startDate) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Expiry date cannot be earlier than start date",
//         });
//       }
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | AUTH
//     |--------------------------------------------------------------------------
//     */

//     const organisationId =
//       req.user?.organisation_id;

//     const orgType = String(
//       req.user?.org_type ||
//       req.user?.orgType ||
//       ""
//     ).toLowerCase();

//     if (!organisationId) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Organisation ID not found",
//       });
//     }

//     if (!orgType) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Organisation type not found",
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | ORGANISATION SCHEMA
//     |--------------------------------------------------------------------------
//     */

//     const schemaName = getOrganisationSchema(
//       organisationId
//     );

//     /*
//     |--------------------------------------------------------------------------
//     | BUSINESS DATABASE
//     |--------------------------------------------------------------------------
//     */

//     client = await getBusinessDB(
//       orgType
//     ).connect();

//     /*
//     |--------------------------------------------------------------------------
//     | UPDATE
//     |--------------------------------------------------------------------------
//     */

//     const updatedAnnouncement =
//       await model.updateAnnouncement(
//         client,
//         schemaName,
//         organisationId,
//         Number(id),
//         title.trim(),
//         message.trim(),
//         priority || "Notice",
//         startsAt || null,
//         expiresAt || null
//       );

//     if (!updatedAnnouncement) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Announcement not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message:
//         "Announcement updated successfully",
//       data: updatedAnnouncement,
//     });
//   } catch (error) {
//     console.error(
//       "UPDATE ANNOUNCEMENT ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to update announcement",
//       error: error.message,
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };
import { getBusinessDB } from "../../db/dbRouter.js";
import * as model from "../models/announcement.model.js";


/* =========================================================
   ORGANISATION SCHEMA
   ========================================================= */

const getOrganisationSchema = (
  organisationId
) => {
  return `org_${String(
    organisationId
  ).padStart(3, "0")}`;
};


/* =========================================================
   ADMIN ROLE CHECK
   ========================================================= */

const isAdminUser = (req) => {
  const role = String(
    req.user?.role ||
    req.user?.user_role ||
    ""
  ).toLowerCase();

  return [
    "admin",
    "superadmin",
    "super_admin",
  ].includes(role);
};


/* =========================================================
   CREATE ANNOUNCEMENT
   ========================================================= */

   export const createAnnouncement = async (req, res) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      String(
        req.user?.org_type || ""
      ).toLowerCase();

    const createdBy =
      req.user?.id ||
      req.user?.user_id;

    console.log("=================================");
    console.log("CREATE ANNOUNCEMENT");
    console.log("Organisation ID:", organisationId);
    console.log("Organisation Type:", orgType);
    console.log("Created By:", createdBy);
    console.log("=================================");

    if (!organisationId) {
      return res.status(400).json({
        success: false,
        message: "Organisation ID is missing",
      });
    }

    if (!orgType) {
      return res.status(400).json({
        success: false,
        message: "Organisation type is missing",
      });
    }

    const {
      title,
      message,
      priority = "Notice",
      startsAt = null,
      expiresAt = null,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const schemaName =
      getOrganisationSchema(
        organisationId
      );

    /*
     * IMPORTANT:
     * getBusinessDB expects:
     * apartment / event / hospital
     *
     * NOT:
     * 61
     * APARTMENT
     */
    const businessDB =
      getBusinessDB(orgType);

    client =
      await businessDB.connect();

    const announcement =
      await model.createAnnouncement(
        client,
        schemaName,
        organisationId,
        title.trim(),
        message.trim(),
        priority,
        createdBy,
        startsAt || null,
        expiresAt || null
      );

    return res.status(201).json({
      success: true,
      message:
        "Announcement created successfully",
      data: announcement,
    });
  } catch (error) {
    console.error(
      "Create announcement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create announcement",
      error: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}; 
// export const createAnnouncement = async (
//   req,
//   res
// ) => {
//   let client;

//   try {
//     const organisationId =
//       req.user?.organisation_id;

//     const orgType =
//       req.user?.org_type;

//     const createdBy =
//       req.user?.id ||
//       req.user?.user_id;

//     if (!organisationId) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Organisation ID is missing",
//       });
//     }

//     const {
//       title,
//       message,
//       priority = "Notice",
//       startsAt = null,
//       expiresAt = null,
//     } = req.body;

//     if (!title?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Title is required",
//       });
//     }

//     if (!message?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Message is required",
//       });
//     }

//     const schemaName =
//       getOrganisationSchema(
//         organisationId
//       );

//     client = await getBusinessDB(
//       orgType
//     );

//     const announcement =
//       await model.createAnnouncement(
//         client,
//         schemaName,
//         organisationId,
//         title.trim(),
//         message.trim(),
//         priority,
//         createdBy,
//         startsAt || null,
//         expiresAt || null
//       );

//     return res.status(201).json({
//       success: true,
//       message:
//         "Announcement created successfully",
//       data: announcement,
//     });
//   } catch (error) {
//     console.error(
//       "Create announcement error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to create announcement",
//       error: error.message,
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };


/* =========================================================
   GET ANNOUNCEMENTS
   ========================================================= */
export const getAnnouncements = async (req, res) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    if (!organisationId) {
      return res.status(400).json({
        success: false,
        message: "Organisation ID is missing",
      });
    }

    if (!orgType) {
      return res.status(400).json({
        success: false,
        message: "Organisation type is missing",
      });
    }

    const schemaName =
      getOrganisationSchema(organisationId);

    console.log("=================================");
    console.log("ADMIN GET ANNOUNCEMENTS");
    console.log("Organisation ID:", organisationId);
    console.log("Organisation Type:", orgType);
    console.log("Schema:", schemaName);
    console.log("=================================");

    /*
     * IMPORTANT:
     * getBusinessDB expects orgType, NOT organisationId.
     */
    const businessDB =
      getBusinessDB(orgType);

    client =
      await businessDB.connect();

    /*
     * ADMIN:
     * Get ALL active announcements.
     *
     * Future announcements are visible to admin.
     * Expired announcements are also visible to admin.
     * Nothing is automatically deleted.
     */
    const announcements =
      await model.getAnnouncements(
        client,
        schemaName,
        organisationId
      );

    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error(
      "Get announcements error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
      error: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};
// export const getAnnouncements = async (
//   req,
//   res
// ) => {
//   let client;

//   try {
//     const organisationId =
//       req.user?.organisation_id;

//     const orgType =
//       req.user?.org_type;

//     if (!organisationId) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Organisation ID is missing",
//       });
//     }

//     const schemaName =
//       getOrganisationSchema(
//         organisationId
//       );

//     client = await getBusinessDB(
//       organisationId,
//       orgType
//     );

//     /*
//      * IMPORTANT:
//      *
//      * Admin:
//      *   gets every active announcement
//      *
//      * User:
//      *   gets only currently valid announcements
//      */

//     const admin = isAdminUser(req);

//     const announcements =
//       await model.getAnnouncements(
//         client,
//         schemaName,
//         organisationId,
//         admin
//       );

//     return res.status(200).json({
//       success: true,
//       data: announcements,
//     });
//   } catch (error) {
//     console.error(
//       "Get announcements error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to fetch announcements",
//       error: error.message,
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };


/* =========================================================
   UPDATE ANNOUNCEMENT
   ========================================================= */
/* =========================================================
   UPDATE ANNOUNCEMENT
   ========================================================= */

export const updateAnnouncement = async (
  req,
  res
) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType = String(
      req.user?.org_type || ""
    ).toLowerCase();

    const { id } = req.params;

    const {
      title,
      message,
      priority,
      startsAt = null,
      expiresAt = null,
    } = req.body;

    console.log("=================================");
    console.log("UPDATE ANNOUNCEMENT");
    console.log("Organisation ID:", organisationId);
    console.log("Organisation Type:", orgType);
    console.log("Announcement ID:", id);
    console.log("Starts At:", startsAt);
    console.log("Expires At:", expiresAt);
    console.log("=================================");

    if (!organisationId) {
      return res.status(400).json({
        success: false,
        message: "Organisation ID is missing",
      });
    }

    if (!orgType) {
      return res.status(400).json({
        success: false,
        message: "Organisation type is missing",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Announcement ID is required",
      });
    }

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const schemaName =
      getOrganisationSchema(
        organisationId
      );

    /*
     * IMPORTANT:
     * getBusinessDB() returns the database pool.
     * We must connect() to get a client.
     */
    const businessDB =
      getBusinessDB(orgType);

    client =
      await businessDB.connect();

    const updatedAnnouncement =
      await model.updateAnnouncement(
        client,
        schemaName,
        organisationId,
        Number(id),
        title.trim(),
        message.trim(),
        priority || "Notice",
        startsAt || null,
        expiresAt || null
      );

    if (!updatedAnnouncement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    console.log(
      "Updated announcement:",
      updatedAnnouncement
    );

    return res.status(200).json({
      success: true,
      message:
        "Announcement updated successfully",
      data: updatedAnnouncement,
    });
  } catch (error) {
    console.error(
      "Update announcement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update announcement",
      error: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};
// export const updateAnnouncement = async (
//   req,
//   res
// ) => {
//   let client;

//   try {
//     const organisationId =
//       req.user?.organisation_id;

//     const orgType =
//       req.user?.org_type.toLowerCase();

//     const { id } = req.params;

//     const {
//       title,
//       message,
//       priority,
//       startsAt = null,
//       expiresAt = null,
//     } = req.body;

//     if (!organisationId) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Organisation ID is missing",
//       });
//     }

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Announcement ID is required",
//       });
//     }

//     if (!title?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Title is required",
//       });
//     }

//     if (!message?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Message is required",
//       });
//     }

//     const schemaName =
//       getOrganisationSchema(
//         organisationId
//       );

//     client = await getBusinessDB(
//       orgType
//     );

//     const updatedAnnouncement =
//       await model.updateAnnouncement(
//         client,
//         schemaName,
//         organisationId,
//         Number(id),
//         title.trim(),
//         message.trim(),
//         priority || "Notice",
//         startsAt || null,
//         expiresAt || null
//       );

//     if (!updatedAnnouncement) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Announcement not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message:
//         "Announcement updated successfully",
//       data: updatedAnnouncement,
//     });
//   } catch (error) {
//     console.error(
//       "Update announcement error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to update announcement",
//       error: error.message,
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };


/* =========================================================
   DELETE ANNOUNCEMENT
   ========================================================= */
/* =========================================================
   DELETE ANNOUNCEMENT
   ========================================================= */

export const deleteAnnouncement = async (
  req,
  res
) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType = String(
      req.user?.org_type || ""
    ).toLowerCase();

    const { id } = req.params;

    if (!organisationId) {
      return res.status(400).json({
        success: false,
        message:
          "Organisation ID is missing",
      });
    }

    if (!orgType) {
      return res.status(400).json({
        success: false,
        message:
          "Organisation type is missing",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Announcement ID is required",
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
      await model.deleteAnnouncement(
        client,
        schemaName,
        organisationId,
        Number(id)
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message:
          "Announcement not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Announcement deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete announcement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete announcement",
      error: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};
// export const deleteAnnouncement = async (
//   req,
//   res
// ) => {
//   let client;

//   try {
//     const organisationId =
//       req.user?.organisation_id;

//     const orgType =
//       req.user?.org_type.toLowerCase();

//     const { id } = req.params;

//     if (!organisationId) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Organisation ID is missing",
//       });
//     }

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Announcement ID is required",
//       });
//     }

//     const schemaName =
//       getOrganisationSchema(
//         organisationId
//       );

//     client = await getBusinessDB(
//       orgType
//     );

//     const deleted =
//       await model.deleteAnnouncement(
//         client,
//         schemaName,
//         organisationId,
//         Number(id)
//       );

//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Announcement not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message:
//         "Announcement deleted successfully",
//     });
//   } catch (error) {
//     console.error(
//       "Delete announcement error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to delete announcement",
//       error: error.message,
//     });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };