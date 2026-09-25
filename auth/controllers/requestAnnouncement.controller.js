import { getBusinessDB } from "../../db/dbRouter.js";
import * as model from "../models/requestAnnouncement.model.js";

export const getRequestAnnouncements = async (req, res) => {
  let client;

  try {
    // ============================================================
    // 1. AUTHENTICATION DATA
    // ============================================================

    const organisationId = req.user?.organisation_id;
    const orgType = req.user?.org_type;

    if (!organisationId) {
      return res.status(401).json({
        success: false,
        message: "Organisation ID not found in authentication token",
      });
    }

    if (!orgType) {
      return res.status(401).json({
        success: false,
        message: "Organisation type not found in authentication token",
      });
    }

    // ============================================================
    // 2. ORGANISATION SCHEMA
    // ============================================================

    const schemaName = `org_${String(organisationId).padStart(3, "0")}`;

    // ============================================================
    // 3. BUSINESS DATABASE
    // ============================================================

    const businessDB = getBusinessDB(orgType.toLowerCase());

    client = await businessDB.connect();

    // ============================================================
    // 4. FETCH ANNOUNCEMENTS
    // ============================================================

    const announcements = await model.getRequestAnnouncements(
      client,
      schemaName
    );

    // ============================================================
    // 5. RESPONSE
    // ============================================================

    return res.status(200).json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error(
      "GET REQUEST ANNOUNCEMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch request announcements",
      error: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};