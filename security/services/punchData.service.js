import masterAuthDB from "../../config/masterAuthDB.js";
import { getDB } from "../../config/dbFactory.js";
import { getOrganisationById } from "../../auth/models/organisation.model.js";
import * as model from "../models/punchData.model.js";

/**
 * GET ALL REGISTERED FACES
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

    const tables = await model.getTablesWithFaceDescriptor(db, schema);

    const faces = [];

    for (const table of tables) {
      const records = await model.getFaceDescriptorsFromTable(
        db,
        schema,
        table,
      );

      for (const r of records) {
        faces.push({
          table,
          id: r.id,
          full_name: r.full_name,
          photo: r.photo || r.profile_photo,
          face_descriptor: r.face_descriptor,
        });
      }
    }

    return {
      success: true,
      data: faces,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

/**
 * FACE PUNCH SERVICE
 */
export const facePunchService = async (
  organisationId,
  inputDescriptor,
  photo,
) => {
  try {
    // Get organisation
    const org = await getOrganisationById(masterAuthDB, organisationId);

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    // Get all tables containing face descriptors
    const tables = await model.getTablesWithFaceDescriptor(db, schema);

    let bestMatch = null;
    let lowestDistance = 0.6;

    // Compare descriptor against every registered face
    for (const table of tables) {
      const records = await model.getFaceDescriptorsFromTable(
        db,
        schema,
        table,
      );

      for (const user of records) {
        if (!user.face_descriptor) continue;

        const distance = euclideanDistance(
          inputDescriptor,
          user.face_descriptor,
        );

        if (distance < lowestDistance) {
          lowestDistance = distance;

          bestMatch = {
            table,
            id: user.id,
            full_name: user.full_name || null,
            profile_photo: user.profile_photo || user.photo || null,
            distance,
          };
        }
      }
    }

    // No face matched
    if (!bestMatch) {
      return {
        success: false,
        message: "Face not recognized",
      };
    }

    // Determine punch type (IN / OUT)
    const lastPunch = await model.getLastPunch(db, schema, bestMatch.id);

    let punchType = "IN";

    if (lastPunch) {
      punchType = lastPunch.punch_type === "IN" ? "OUT" : "IN";
    }

    console.log("Matched table:", bestMatch.table);
    console.log("Matched user:", bestMatch.id);
    // Save punch
    await model.insertPunchLog(db, schema, {
      table_name: bestMatch.table,
      user_id: bestMatch.id,
      full_name: bestMatch.full_name,
      photo: photo || bestMatch.profile_photo,
      distance: bestMatch.distance,
      punch_type: punchType,
      punch_time: new Date(),
    });

    return {
      success: true,
      message: `Punch ${punchType} successful`,
      data: {
        ...bestMatch,
        punch_type: punchType,
      },
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

/**
 * EUCLIDEAN DISTANCE
 */
const euclideanDistance = (a, b) => {
  let sum = 0;

  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }

  return Math.sqrt(sum);
};

