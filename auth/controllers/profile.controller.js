
// const { masterAuthDB, getBusinessDB } = require("../../config/db");
import { getBusinessDB } from "../../db/dbRouter.js";
import masterAuthDB from "../../config/masterAuthDB.js";

const getProfile = async (req, res) => {
  let authClient;
  let businessClient;

  try {
    const user = req.user;

    const securityUserId = user?.user_id ?? user?.id;
    const organisationId = user?.organisation_id;
    const orgType = String(user?.org_type || "").toLowerCase();

    if (!securityUserId || !organisationId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user or organisation not found.",
      });
    }

    if (orgType !== "apartment") {
      return res.status(403).json({
        success: false,
        message: "This profile endpoint is for apartment members.",
      });
    }

    // Resolve the organisation's database schema.
    authClient = await masterAuthDB.connect();

    const organisationResult = await authClient.query(
      `SELECT schema_name
       FROM auth.organisations
       WHERE id = $1`,
      [organisationId]
    );

    if (organisationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Organisation not found.",
      });
    }

    const schemaName = organisationResult.rows[0].schema_name;

    // Validate schema identifier before interpolating it into SQL.
    if (
      !schemaName ||
      !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schemaName)
    ) {
      return res.status(500).json({
        success: false,
        message: "Invalid organisation schema configuration.",
      });
    }

    businessClient = await getBusinessDB(orgType).connect();

    const result = await businessClient.query(
      `SELECT
         id,
         security_user_id,
         member_code,
         first_name,
         last_name,
         gender,
         date_of_birth,
         mobile_number,
         alternate_mobile_number,
         email,
         profile_photo,
         aadhaar_number,
         occupation,
         apartment_name,
         block_tower,
         floor_number,
         flat_number,
         ownership_type,
         move_in_date,
         family_member_count,
         emergency_contact_name,
         emergency_contact_relationship,
         emergency_contact_mobile,
         member_type
       FROM "${schemaName}"."apartment_member"
       WHERE security_user_id = $1
       LIMIT 1`,
      [securityUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Apartment member profile not found for the logged-in account.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile.",
    });
  } finally {
    if (businessClient) businessClient.release();
    if (authClient) authClient.release();
  }
};

export { getProfile };