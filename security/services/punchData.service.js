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

// export const facePunchService = async (
//   organisationId,
//   inputDescriptor,
//   photo,
// ) => {
//   console.time("TOTAL FACE PUNCH TIME");

//   try {
//     console.time("GET ORGANISATION");

//     const org = await getOrganisationById(masterAuthDB, organisationId);

//     console.timeEnd("GET ORGANISATION");

//     if (!org) {
//       console.timeEnd("TOTAL FACE PUNCH TIME");

//       return {
//         success: false,
//         code: "ORGANISATION_NOT_FOUND",
//         message: "Organisation not found.",
//       };
//     }

//     const db = getDB(org.org_type);
//     const schema = org.schema_name;

//     console.time("VECTOR SEARCH");

//     const match = await model.searchNearestFace(db, schema, inputDescriptor);

//     console.timeEnd("VECTOR SEARCH");

//     console.log("Face vector match:", match);

//     if (!match) {
//       console.timeEnd("TOTAL FACE PUNCH TIME");

//       return {
//         success: false,
//         code: "FACE_NOT_FOUND",
//         message: "No registered face found. Please try again.",
//       };
//     }

//     const distance = Number(match.distance);

//     const FACE_MATCH_THRESHOLD = 0.6;

//     console.log("Threshold:", FACE_MATCH_THRESHOLD);
//     console.log("Distance:", distance);

//     /**
//      * FACE CONFIDENCE CHECK
//      */
//     if (distance > FACE_MATCH_THRESHOLD) {
//       console.log("Face rejected - distance too high");

//       console.timeEnd("TOTAL FACE PUNCH TIME");

//       return {
//         success: false,
//         code: "LOW_CONFIDENCE_MATCH",
//         message:
//           "Face verification failed. Please move closer to the camera and try again.",
//         distance,
//       };
//     }

//     console.time("GET USER DETAILS");

//     const user = await model.getUserByFaceRecord(
//       db,
//       schema,
//       match.table_name,
//       match.record_id,
//     );

//     console.timeEnd("GET USER DETAILS");

//     if (!user) {
//       console.timeEnd("TOTAL FACE PUNCH TIME");

//       return {
//         success: false,
//         code: "USER_NOT_FOUND",
//         message: "Face matched but user record was not found.",
//       };
//     }

//     console.time("GET LAST PUNCH");

//     const lastPunch = await model.getLastPunch(db, schema, user.id);

//     console.timeEnd("GET LAST PUNCH");

//     console.log("Last Punch:", lastPunch);

//     let punchType = "IN";

//     if (lastPunch && lastPunch.punch_type === "IN") {
//       punchType = "OUT";
//     }

//     console.log("Current Punch Type:", punchType);

//     console.time("INSERT PUNCH");

//     await model.insertPunchLog(db, schema, {
//       table_name: match.table_name,
//       user_id: user.id,
//       full_name: user.full_name,
//       photo: photo || user.profile_photo,
//       distance,
//       punch_type: punchType,
//       punch_time: new Date(),
//     });

//     console.timeEnd("INSERT PUNCH");

//     console.timeEnd("TOTAL FACE PUNCH TIME");

//     return {
//       success: true,
//       code: "PUNCH_SUCCESS",
//       message: `Punch ${punchType} successful`,
//       data: {
//         id: user.id,
//         full_name: user.full_name,
//         module_name: match.table_name,
//         distance,
//         punch_type: punchType,
//       },
//     };
//   } catch (err) {
//     console.timeEnd("TOTAL FACE PUNCH TIME");

//     console.error("Face Punch Error:", err);

//     return {
//       success: false,
//       code: "SERVER_ERROR",
//       message: err.message || "Face punch failed.",
//     };
//   }
// };

/**
 * VERIFY FACE SERVICE
 */
export const verifyFaceService = async (
  organisationId,
  inputDescriptor,
  photo,
) => {
  console.time("TOTAL FACE VERIFY TIME");

  try {
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

    const distance = Number(match.distance);

    const FACE_MATCH_THRESHOLD = 0.6;

    console.log("Threshold:", FACE_MATCH_THRESHOLD);
    console.log("Distance:", distance);

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

    console.time("GET LAST PUNCH");

    const lastPunch = await model.getLastPunch(db, schema, user.id);

    console.timeEnd("GET LAST PUNCH");

    let punchType = "IN";

    if (lastPunch && lastPunch.punch_type === "IN") {
      punchType = "OUT";
    }

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
        photo: photo || user.profile_photo,
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
 * CONFIRM PUNCH SERVICE
 */
// export const confirmPunchService = async (
//   organisationId,
//   userId,
//   moduleName,
//   photo,
// ) => {
//   console.time("TOTAL CONFIRM PUNCH TIME");

//   try {
//     const org = await getOrganisationById(masterAuthDB, organisationId);

//     if (!org) {
//       console.timeEnd("TOTAL CONFIRM PUNCH TIME");

//       return {
//         success: false,
//         code: "ORGANISATION_NOT_FOUND",
//         message: "Organisation not found.",
//       };
//     }

//     const db = getDB(org.org_type);
//     const schema = org.schema_name;

//     const user = await model.getUserById(
//       db,
//       schema,
//       moduleName,
//       userId,
//     );

//     if (!user) {
//       console.timeEnd("TOTAL CONFIRM PUNCH TIME");

//       return {
//         success: false,
//         code: "USER_NOT_FOUND",
//         message: "User not found.",
//       };
//     }

//     // Check latest punch again
//     const lastPunch = await model.getLastPunch(
//       db,
//       schema,
//       user.id,
//     );

//     let punchType = "IN";

//     if (lastPunch?.punch_type === "IN") {
//       punchType = "OUT";
//     }

//     await model.insertPunchLog(db, schema, {
//       table_name: moduleName,
//       user_id: user.id,
//       full_name: user.full_name,
//       photo: photo || user.profile_photo,
//       distance: 0,
//       punch_type: punchType,
//       punch_time: new Date(),
//     });

//     console.timeEnd("TOTAL CONFIRM PUNCH TIME");

//     return {
//       success: true,
//       code: "PUNCH_SUCCESS",
//       message: `Punch ${punchType} successful.`,
//       data: {
//         id: user.id,
//         full_name: user.full_name,
//         module_name: moduleName,
//         punch_type: punchType,
//       },
//     };
//   } catch (err) {
//     console.timeEnd("TOTAL CONFIRM PUNCH TIME");

//     console.error(err);

//     return {
//       success: false,
//       code: "SERVER_ERROR",
//       message: err.message || "Punch failed.",
//     };
//   }
// };

export const confirmPunchService = async (
  organisationId,
  userId,
  moduleName,
  data,
) => {
  console.time("TOTAL CONFIRM PUNCH TIME");

  try {
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

    const user = await model.getUserById(db, schema, moduleName, userId);

    if (!user) {
      console.timeEnd("TOTAL CONFIRM PUNCH TIME");

      return {
        success: false,
        code: "USER_NOT_FOUND",
        message: "User not found.",
      };
    }

    // Check latest punch
    const lastPunch = await model.getLastPunch(db, schema, user.id);

    let punchType = "IN";

    if (lastPunch?.punch_type === "IN") {
      punchType = "OUT";
    }

    await model.insertPunchLog(db, schema, {
      table_name: moduleName,
      user_id: user.id,
      full_name: data.full_name || user.full_name,
      photo: data.photo || user.profile_photo,
      distance: data.distance ?? 0,
      punch_type: punchType,
      punch_time: new Date(),
    });

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
 * EUCLIDEAN DISTANCE
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
