import masterAuthDB from "../../config/masterAuthDB.js";
import { getDB } from "../../config/dbFactory.js";
import { getOrganisationById } from "../../auth/models/organisation.model.js";
import * as model from "../models/punchData.model.js";

/**
 * ============================================================
 * GET ALL REGISTERED FACES
 * ============================================================
 *
 * Face vectors are stored ONLY in:
 *
 *   <schema>.face_details
 *
 * Each face_details record contains:
 *   - table_name
 *   - record_id
 *   - face_descriptor
 *
 * The actual user details are fetched from the dynamic table.
 */
export const getAllRegisteredFaces = async (organisationId) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const faceRecords = await model.getAllFaceDetails(db, schema);

    const faces = [];

    for (const face of faceRecords) {
      const user = await model.getUserByFaceRecord(
        db,
        schema,
        face.table_name,
        face.record_id,
      );

      if (!user) {
        continue;
      }

      faces.push({
        table: face.table_name,
        id: face.record_id,
        full_name: user.full_name,
        photo: user.photo || user.profile_photo || null,
        face_descriptor: face.face_descriptor,
      });
    }

    return {
      success: true,
      data: faces,
    };
  } catch (err) {
    console.error("Get All Registered Faces Error:", err);

    return {
      success: false,
      message: err.message || "Failed to fetch registered faces.",
    };
  }
};

/**
 * ============================================================
 * VERIFY FACE SERVICE
 * ============================================================
 *
 * Flow:
 *
 * 1. Get organisation
 * 2. Search input face against face_details
 * 3. Check distance threshold
 * 4. Get actual user from dynamic table
 * 5. Check today's last punch
 * 6. Return IN / OUT suggestion
 *
 * IMPORTANT:
 * Face vectors are NOT read from:
 *
 *   service_provider.face_descriptor
 *
 * They are read ONLY from:
 *
 *   face_details.face_descriptor
 */
export const verifyFaceService = async (
  organisationId,
  inputDescriptor,
  photo,
) => {
  console.time("TOTAL FACE VERIFY TIME");

  try {
    /**
     * --------------------------------------------------------
     * STEP 1: GET ORGANISATION
     * --------------------------------------------------------
     */

    console.time("GET ORGANISATION");

    const org = await getOrganisationById(masterAuthDB, organisationId);

    console.timeEnd("GET ORGANISATION");

    if (!org) {
      console.timeEnd("TOTAL FACE VERIFY TIME");

      return {
        success: false,
        code: "ORGANISATION_NOT_FOUND",
        message: "Organisation not found.",
      };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    /**
     * --------------------------------------------------------
     * STEP 2: VALIDATE INPUT DESCRIPTOR
     * --------------------------------------------------------
     */

    if (!Array.isArray(inputDescriptor)) {
      console.timeEnd("TOTAL FACE VERIFY TIME");

      return {
        success: false,
        code: "INVALID_FACE_DESCRIPTOR",
        message: "Invalid face descriptor.",
      };
    }

    if (inputDescriptor.length !== 512) {
      console.timeEnd("TOTAL FACE VERIFY TIME");

      return {
        success: false,
        code: "INVALID_FACE_DESCRIPTOR",
        message: "Face descriptor must contain 512 dimensions.",
      };
    }

    /**
     * --------------------------------------------------------
     * STEP 3: SEARCH FACE_DETAILS
     * --------------------------------------------------------
     */

    console.time("VECTOR SEARCH");

    const match = await model.searchNearestFace(db, schema, inputDescriptor);

    console.timeEnd("VECTOR SEARCH");

    console.log("Face vector match:", match);

    if (!match) {
      console.timeEnd("TOTAL FACE VERIFY TIME");

      return {
        success: false,
        code: "FACE_NOT_FOUND",
        message: "No registered face found. Please try again.",
      };
    }

    /**
     * --------------------------------------------------------
     * STEP 4: CHECK DISTANCE
     * --------------------------------------------------------
     */

    const distance = Number(match.distance);

    const FACE_MATCH_THRESHOLD = 0.7;

    console.log("Threshold:", FACE_MATCH_THRESHOLD);

    console.log("Distance:", distance);

    if (!Number.isFinite(distance)) {
      console.timeEnd("TOTAL FACE VERIFY TIME");

      return {
        success: false,
        code: "INVALID_FACE_DISTANCE",
        message: "Unable to calculate face match distance.",
      };
    }

    if (distance > FACE_MATCH_THRESHOLD) {
      console.log("Face rejected - distance too high");

      console.timeEnd("TOTAL FACE VERIFY TIME");

      return {
        success: false,
        code: "LOW_CONFIDENCE_MATCH",
        message:
          "Face verification failed. Please move closer to the camera and try again.",
        distance,
      };
    }

    /**
     * --------------------------------------------------------
     * STEP 5: GET USER FROM DYNAMIC TABLE
     * --------------------------------------------------------
     *
     * match.table_name
     * match.record_id
     *
     * come from face_details.
     */

    console.time("GET USER DETAILS");

    const user = await model.getUserByFaceRecord(
      db,
      schema,
      match.table_name,
      match.record_id,
    );

    console.timeEnd("GET USER DETAILS");

    if (!user) {
      console.timeEnd("TOTAL FACE VERIFY TIME");

      return {
        success: false,
        code: "USER_NOT_FOUND",
        message: "Face matched but user record was not found.",
      };
    }

    /**
     * --------------------------------------------------------
     * STEP 6: GET LAST PUNCH
     * --------------------------------------------------------
     */

    console.time("GET LAST PUNCH");

    const lastPunch = await model.getLastPunch(db, schema, user.id);

    console.timeEnd("GET LAST PUNCH");

    console.log("Last Punch:", lastPunch);

    /**
     * --------------------------------------------------------
     * STEP 7: DETERMINE NEXT PUNCH
     * --------------------------------------------------------
     */

    let punchType = "IN";

    if (lastPunch?.punch_type === "IN") {
      punchType = "OUT";
    }

    console.log("Next Punch Type:", punchType);

    /**
     * --------------------------------------------------------
     * STEP 8: RETURN VERIFICATION RESULT
     * --------------------------------------------------------
     */

    console.timeEnd("TOTAL FACE VERIFY TIME");

    return {
      success: true,
      code: "FACE_VERIFIED",
      message: "Face verified successfully.",

      data: {
        id: user.id,

        full_name: user.full_name,

        module_name: match.table_name,

        distance,

        punch_type: punchType,

        photo: photo || user.photo || user.profile_photo || null,
      },
    };
  } catch (err) {
    console.timeEnd("TOTAL FACE VERIFY TIME");

    console.error("Face Verify Error:", err);

    return {
      success: false,
      code: "SERVER_ERROR",
      message: err.message || "Face verification failed.",
    };
  }
};

/**
 * ============================================================
 * CONFIRM PUNCH SERVICE
 * ============================================================
 *
 * This is called after the frontend confirms the verified face.
 *
 * It checks the user again and determines IN / OUT from the
 * latest punch before inserting the new punch.
 */
export const confirmPunchService = async (
  organisationId,
  userId,
  moduleName,
  data = {},
) => {
  console.time("TOTAL CONFIRM PUNCH TIME");

  try {
    /**
     * --------------------------------------------------------
     * STEP 1: GET ORGANISATION
     * --------------------------------------------------------
     */

    const org = await getOrganisationById(masterAuthDB, organisationId);

    if (!org) {
      console.timeEnd("TOTAL CONFIRM PUNCH TIME");

      return {
        success: false,
        code: "ORGANISATION_NOT_FOUND",
        message: "Organisation not found.",
      };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    /**
     * --------------------------------------------------------
     * STEP 2: GET USER
     * --------------------------------------------------------
     */

    const user = await model.getUserById(db, schema, moduleName, userId);

    console.log("========== CONFIRM PUNCH DEBUG ==========");
    console.log("moduleName:", moduleName);
    console.log("userId:", userId);
    // console.log("data:", data);
    console.log("user:", user);
    console.log("user.full_name:", user?.full_name);
        console.log("apartment_number:", data?.apartment_number);
        console.log("vehicle_number:", data?.vehicle_number);
    console.log("==========================================");

    if (!user) {
      console.timeEnd("TOTAL CONFIRM PUNCH TIME");

      console.log("CONFIRM PUNCH USER:", user);
      console.log("CONFIRM PUNCH USER FULL NAME:", user?.full_name);
      console.log("FRONTEND FULL NAME:", data?.full_name);

      return {
        success: false,
        code: "USER_NOT_FOUND",
        message: "User not found.",
      };
    }

    /**
     * --------------------------------------------------------
     * STEP 3: GET LAST PUNCH
     * --------------------------------------------------------
     */

    const lastPunch = await model.getLastPunch(db, schema, user.id);

    /**
     * --------------------------------------------------------
     * STEP 4: DETERMINE PUNCH TYPE
     * --------------------------------------------------------
     */

    let punchType = "IN";

    if (lastPunch?.punch_type === "IN") {
      punchType = "OUT";
    }

    /**
     * --------------------------------------------------------
     * STEP 5: INSERT PUNCH
     * --------------------------------------------------------
     */

    const punch = await model.insertPunchLog(db, schema, {
      table_name: moduleName,

      user_id: user.id,

      // full_name:
      //   data.full_name ||
      //   user.full_name,

      full_name: data.full_name || user.full_name,

      distance: data.distance ?? 0,

      punch_type: punchType,

      // Voice-only fields
      apartment_number: data.apartment_number,
      vehicle_number: data.vehicle_number,

    });

    console.log("Punch inserted:", punch);

    /**
     * --------------------------------------------------------
     * STEP 6: RETURN RESULT
     * --------------------------------------------------------
     */

    console.timeEnd("TOTAL CONFIRM PUNCH TIME");

    return {
      success: true,
      code: "PUNCH_SUCCESS",
      message: `Punch ${punchType} successful.`,

      data: {
        id: user.id,

        full_name: user.full_name,

        module_name: moduleName,

        distance: data.distance ?? 0,

        punch_type: punchType,
        apartment_number: data.apartment_number || "",

        vehicle_number: data.vehicle_number || "",
      },
    };
  } catch (err) {
    console.timeEnd("TOTAL CONFIRM PUNCH TIME");

    console.error("Confirm Punch Error:", err);

    return {
      success: false,
      code: "SERVER_ERROR",
      message: err.message || "Punch failed.",
    };
  }
};

/**
 * ============================================================
 * EUCLIDEAN DISTANCE
 * ============================================================
 *
 * Currently not used by the PostgreSQL vector search because
 * pgvector performs the nearest-neighbour search.
 *
 * Kept here if you need local JavaScript comparison later.
 */
const euclideanDistance = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return Infinity;
  }

  if (a.length !== b.length) {
    return Infinity;
  }

  let sum = 0;

  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }

  return Math.sqrt(sum);
};
