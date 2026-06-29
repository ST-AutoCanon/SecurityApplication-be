import {
  getAllRegisteredFaces,
  facePunchService,
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

export const facePunch = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;
    console.log('orgid:', organisationId);
    const { descriptor, photo } = req.body;
    

    console.log("Logged in organisation:", organisationId);

    if (!descriptor) {
      return res.status(400).json({
        success: false,
        message: "Face descriptor is required",
      });
    }

    const result = await facePunchService(organisationId, descriptor, photo);

    return res.json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};