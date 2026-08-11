// import {
//   getAllRegisteredFaces,
//   verifyFaceService,
//   confirmPunchService,
// } from "../services/punchData.service.js";

// export const getRegisteredFaces = async (req, res) => {
//   try {
//     const organisationId = req.user.organisation_id;

//     const result = await getAllRegisteredFaces(organisationId);

//     return res.json(result);
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// // export const facePunch = async (req, res) => {

// //   try {
// //     const organisationId = req.user.organisation_id;
// //     console.log('orgid:', organisationId);
// //     const { descriptor, photo } = req.body;

// //     console.log("Logged in organisation:", organisationId);

// //     if (!descriptor) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Face descriptor is required",
// //       });
// //     }

// //     const result = await facePunchService(organisationId, descriptor, photo);

// //     return res.json(result);
// //   } catch (err) {
// //     return res.status(500).json({
// //       success: false,
// //       message: err.message,
// //     });
// //   }
// // };

// export const verifyFace = async (req, res) => {
//   try {
//     const organisationId = req.user.organisation_id;

//     const { descriptor, photo } = req.body;

//     if (!descriptor) {
//       return res.status(400).json({
//         success: false,
//         message: "Face descriptor is required",
//       });
//     }

//     const result = await verifyFaceService(organisationId, descriptor, photo);

//     return res.json(result);
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// export const confirmPunch = async (req, res) => {
//   try {
//     const organisationId = req.user.organisation_id;

//     const { user_id, table_name, full_name, distance, photo } = req.body;

//     if (!user_id || !table_name) {
//       return res.status(400).json({
//         success: false,
//         message: "user_id and table_name are required.",
//       });
//     }

//     const result = await confirmPunchService(
//       organisationId,
//       user_id,
//       table_name,
//       {
//         full_name,
//         distance,
//         photo,
//       },
//     );

//     return res.json(result);
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };


import {
  getAllRegisteredFaces,
  verifyFaceService,
  confirmPunchService,
} from "../services/punchData.service.js";

// ============================================================
// GET ALL REGISTERED FACES
// ============================================================
export const getRegisteredFaces = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const result = await getAllRegisteredFaces(
      organisationId,
    );

    return res.json(result);
  } catch (err) {
    console.error(
      "Get Registered Faces Controller Error:",
      err,
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch registered faces.",
    });
  }
};

// ============================================================
// VERIFY FACE
// ============================================================
export const verifyFace = async (req, res) => {
  try {
    const organisationId =
      req.user.organisation_id;

    const {
      descriptor,
      photo,
    } = req.body;

    // ----------------------------------------------------------
    // Validate descriptor
    // ----------------------------------------------------------
    if (!Array.isArray(descriptor)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_FACE_DESCRIPTOR",
        message:
          "Face descriptor must be an array.",
      });
    }

    // ----------------------------------------------------------
    // Validate descriptor dimensions
    // ----------------------------------------------------------
    if (descriptor.length !== 512) {
      return res.status(400).json({
        success: false,
        code: "INVALID_FACE_DESCRIPTOR",
        message:
          "Face descriptor must contain 512 dimensions.",
      });
    }

    // ----------------------------------------------------------
    // Verify face
    // ----------------------------------------------------------
    const result =
      await verifyFaceService(
        organisationId,
        descriptor,
        photo,
      );

    return res.json(result);
  } catch (err) {
    console.error(
      "Verify Face Controller Error:",
      err,
    );

    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message:
        err.message ||
        "Face verification failed.",
    });
  }
};

// ============================================================
// CONFIRM PUNCH
// ============================================================
export const confirmPunch = async (req, res) => {
  try {
    const organisationId =
      req.user.organisation_id;

    const {
      user_id,
      table_name,
      full_name,
      distance,
      photo,
    } = req.body;

    // ----------------------------------------------------------
    // Validate required fields
    // ----------------------------------------------------------
    if (
      user_id === undefined ||
      user_id === null ||
      !table_name
    ) {
      return res.status(400).json({
        success: false,
        code: "INVALID_PUNCH_DATA",
        message:
          "user_id and table_name are required.",
      });
    }

    // ----------------------------------------------------------
    // Confirm punch
    // ----------------------------------------------------------
    const result =
      await confirmPunchService(
        organisationId,
        user_id,
        table_name,
        {
          full_name,
          distance,
          photo,
        },
      );

    return res.json(result);
  } catch (err) {
    console.error(
      "Confirm Punch Controller Error:",
      err,
    );

    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message:
        err.message ||
        "Punch failed.",
    });
  }
};

