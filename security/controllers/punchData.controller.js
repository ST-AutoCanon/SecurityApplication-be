import {
  getAllRegisteredFaces,
  verifyFaceService,
  confirmPunchService,
} from "../services/punchData.service.js";

export const getRegisteredFaces = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const result = await getAllRegisteredFaces(organisationId);

    return res.json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// export const facePunch = async (req, res) => {

//   try {
//     const organisationId = req.user.organisation_id;
//     console.log('orgid:', organisationId);
//     const { descriptor, photo } = req.body;

//     console.log("Logged in organisation:", organisationId);

//     if (!descriptor) {
//       return res.status(400).json({
//         success: false,
//         message: "Face descriptor is required",
//       });
//     }

//     const result = await facePunchService(organisationId, descriptor, photo);

//     return res.json(result);
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

export const verifyFace = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const { descriptor, photo } = req.body;

    if (!descriptor) {
      return res.status(400).json({
        success: false,
        message: "Face descriptor is required",
      });
    }

    const result = await verifyFaceService(organisationId, descriptor, photo);

    return res.json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const confirmPunch = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    const { user_id, table_name, full_name, distance, photo } = req.body;

    if (!user_id || !table_name) {
      return res.status(400).json({
        success: false,
        message: "user_id and table_name are required.",
      });
    }

    const result = await confirmPunchService(
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
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};