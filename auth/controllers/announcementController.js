import { getBusinessDB } from "../../db/dbRouter.js";
import * as model from "../models/announcement.model.js";

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
| CREATE ANNOUNCEMENT
|--------------------------------------------------------------------------
*/

export const createAnnouncement = async (req, res) => {
  let client;

  try {
    console.log("=================================");
    console.log("CREATE ANNOUNCEMENT REQUEST");
    console.log("=================================");

    const organisationId = req.user?.organisation_id;
    const orgType = req.user?.org_type?.toLowerCase();

    console.log("Organisation ID:", organisationId);
    console.log("Organisation Type:", orgType);
    console.log("User:", req.user);

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
      message,
      priority = "Notice",
      expiresAt = null,
    } = req.body;

    console.log("Title:", title);
    console.log("Message:", message);
    console.log("Priority:", priority);
    console.log("Expires At:", expiresAt);

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Announcement title is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Announcement message is required",
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
        message: "Invalid announcement priority",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ORGANISATION SCHEMA
    |--------------------------------------------------------------------------
    */

    const schemaName = getOrganisationSchema(
      organisationId
    );

    console.log(
      "Announcement Schema:",
      schemaName
    );

    /*
    |--------------------------------------------------------------------------
    | GET BUSINESS DATABASE
    |--------------------------------------------------------------------------
    */

    const businessDB = getBusinessDB(orgType);

    client = await businessDB.connect();

    console.log("Business DB connected");

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
    | INSERT ANNOUNCEMENT
    |--------------------------------------------------------------------------
    */

    const announcement =
      await model.createAnnouncement(
        client,
        schemaName,
        organisationId,
        title.trim(),
        message.trim(),
        priority,
        createdBy,
        expiresAt || null
      );

    console.log(
      "Announcement created:",
      announcement
    );

    return res.status(201).json({
      success: true,
      message: "Announcement published successfully",
      data: announcement,
    });
  } catch (error) {
    console.error(
      "CREATE ANNOUNCEMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create announcement",
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
| GET ANNOUNCEMENTS
|--------------------------------------------------------------------------
*/

export const getAnnouncements = async (req, res) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    console.log("=================================");
    console.log("GET ANNOUNCEMENTS");
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

    const schemaName = getOrganisationSchema(
      organisationId
    );

    console.log(
      "Announcement Schema:",
      schemaName
    );

    /*
    |--------------------------------------------------------------------------
    | BUSINESS DATABASE
    |--------------------------------------------------------------------------
    */

    const businessDB = getBusinessDB(orgType);

    client = await businessDB.connect();

    /*
    |--------------------------------------------------------------------------
    | FETCH ANNOUNCEMENTS
    |--------------------------------------------------------------------------
    */

    const announcements =
      await model.getAnnouncements(
        client,
        schemaName,
        organisationId
      );

    console.log(
      "Announcements found:",
      announcements.length
    );

    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error(
      "GET ANNOUNCEMENTS ERROR:",
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

/*
|--------------------------------------------------------------------------
| DELETE ANNOUNCEMENT
|--------------------------------------------------------------------------
*/

export const deleteAnnouncement = async (
  req,
  res
) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    const announcementId =
      Number(req.params.id);

    console.log("=================================");
    console.log("DELETE ANNOUNCEMENT");
    console.log("Organisation ID:", organisationId);
    console.log("Organisation Type:", orgType);
    console.log(
      "Announcement ID:",
      announcementId
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

    if (!Number.isInteger(announcementId) || announcementId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ORGANISATION SCHEMA
    |--------------------------------------------------------------------------
    */

    const schemaName = getOrganisationSchema(
      organisationId
    );

    console.log(
      "Announcement Schema:",
      schemaName
    );

    /*
    |--------------------------------------------------------------------------
    | BUSINESS DATABASE
    |--------------------------------------------------------------------------
    */

    const businessDB = getBusinessDB(orgType);

    client = await businessDB.connect();

    /*
    |--------------------------------------------------------------------------
    | DELETE ANNOUNCEMENT
    |--------------------------------------------------------------------------
    */

    const deleted =
      await model.deleteAnnouncement(
        client,
        schemaName,
        organisationId,
        announcementId
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Announcement deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE ANNOUNCEMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
      error: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};


export const updateAnnouncement = async (req, res) => {
  let client;

  try {
    const { id } = req.params;

    const {
      title,
      message,
      priority,
      expiresAt,
    } = req.body;

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

    const organisationId =
      req.user?.organisation_id;

      
      const orgType = (
  req.user?.org_type ||
  req.user?.orgType ||
  ""
).toLowerCase();

    if (!organisationId) {
      return res.status(400).json({
        success: false,
        message: "Organisation ID not found",
      });
    }

    const schemaName = `org_${String(
      organisationId
    ).padStart(3, "0")}`;

    client = await getBusinessDB(orgType).connect();

    const updatedAnnouncement =
      await model.updateAnnouncement(
        client,
        schemaName,
        organisationId,
        Number(id),
        title.trim(),
        message.trim(),
        priority || "Notice",
        expiresAt || null
      );

    if (!updatedAnnouncement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      data: updatedAnnouncement,
    });
  } catch (error) {
    console.error(
      "UPDATE ANNOUNCEMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update announcement",
      error: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

