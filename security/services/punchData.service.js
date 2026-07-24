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
//   try {
//     const org = await getOrganisationById(masterAuthDB, organisationId);

//     if (!org) {
//       return {
//         success: false,
//         message: "Organisation not found",
//       };
//     }

//     const db = getDB(org.org_type);
//     const schema = org.schema_name;

//     const FACE_MATCH_THRESHOLD = 0.6;

//     // 1. Search only face_details
//     const match = await model.searchNearestFace(db, schema, inputDescriptor);

//     console.log("Face vector match:", match);

//     if (!match) {
//       return {
//         success: false,
//         message: "Face not recognized",
//       };
//     }

//     const distance = Number(match.distance);

//     console.log("Distance:", distance, "Threshold:", FACE_MATCH_THRESHOLD);

//     if (distance > FACE_MATCH_THRESHOLD) {
//       return {
//         success: false,
//         message: "Face not recognized",
//       };
//     }

//     // 2. Get actual user details
//     const user = await model.getUserByFaceRecord(
//       db,
//       schema,
//       match.table_name,
//       match.record_id,
//     );

//     if (!user) {
//       return {
//         success: false,
//         message: "User record not found",
//       };
//     }

//     console.log("Matched user:", user);

//     // 3. Check last punch
//     const lastPunch = await model.getLastPunch(db, schema, user.id);

//     let punchType = "IN";

//     if (lastPunch) {
//       punchType = lastPunch.punch_type === "IN" ? "OUT" : "IN";
//     }

//     // 4. Insert punch
//     await model.insertPunchLog(db, schema, {
//       table_name: match.table_name,
//       user_id: user.id,
//       full_name: user.full_name,
//       photo: photo || user.profile_photo,
//       distance,
//       punch_type: punchType,
//       punch_time: new Date(),
//     });

//     return {
//       success: true,
//       message: `Punch ${punchType} successful`,
//       data: {
//         id: user.id,
//         full_name: user.full_name,
//         punch_type: punchType,
//         distance,
//       },
//     };
//   } catch (err) {
//     console.error("Face Punch Error:", err);

//     return {
//       success: false,
//       message: err.message,
//     };
//   }
// };


export const facePunchService = async (
  organisationId,
  inputDescriptor,
  photo,
) => {
  console.time("TOTAL FACE PUNCH TIME");

  try {
    console.time("GET ORGANISATION");
    const org = await getOrganisationById(masterAuthDB, organisationId);
    console.timeEnd("GET ORGANISATION");

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    console.time("VECTOR SEARCH");

    const match = await model.searchNearestFace(db, schema, inputDescriptor);

    console.timeEnd("VECTOR SEARCH");

    console.log("Face vector match:", match);

    if (!match) {
      console.timeEnd("TOTAL FACE PUNCH TIME");

      return {
        success: false,
        message: "Face not recognized",
      };
    }

    const distance = Number(match.distance);

    console.time("GET USER DETAILS");

    const user = await model.getUserByFaceRecord(
      db,
      schema,
      match.table_name,
      match.record_id,
    );

    console.timeEnd("GET USER DETAILS");

    console.time("INSERT PUNCH");

    await model.insertPunchLog(db, schema, {
      table_name: match.table_name,
      user_id: user.id,
      full_name: user.full_name,
      photo: photo || user.profile_photo,
      distance,
      punch_type: "IN",
      punch_time: new Date(),
    });

    console.timeEnd("INSERT PUNCH");

    console.timeEnd("TOTAL FACE PUNCH TIME");

    return {
      success: true,
      data: {
        id: user.id,
        full_name: user.full_name,
        distance,
      },
    };
  } catch (err) {
    console.timeEnd("TOTAL FACE PUNCH TIME");

    console.error(err);

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

