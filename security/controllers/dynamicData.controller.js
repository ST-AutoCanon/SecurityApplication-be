import {
  createRecordService,
  getAllRecordsService,
  getRecordByIdService,
  updateRecordService,
  deleteRecordService,
  getTemplateMetadataService,
  getModuleDetailsService,
  getModulesService,
} from "../services/dynamicData.service.js";

/* ============================================================
   CREATE RECORD
   ============================================================ */

export const createRecord = async (req, res) => {
  try {
    const {
      organisationId,
      templateId,
      table,
    } = req.params;

    /* --------------------------------------------------------
       Create payload
    -------------------------------------------------------- */

    const payload = {
      ...req.body,
    };

    /* --------------------------------------------------------
       FACE DESCRIPTOR
       
       Supports both:

       1. JSON string:
          "[[...512...],[...512...]]"

       2. Already parsed array:
          [
            [512 values],
            [512 values],
            ...
          ]
    -------------------------------------------------------- */

    if (payload.face_descriptor) {
      try {
        if (
          typeof payload.face_descriptor ===
          "string"
        ) {
          payload.face_descriptor =
            JSON.parse(
              payload.face_descriptor,
            );
        }
      } catch (err) {
        console.error(
          "Face descriptor JSON parse error:",
          err,
        );

        return res.status(400).json({
          success: false,
          message:
            "Invalid face_descriptor format.",
        });
      }

      /* ------------------------------------------------------
         Validate face descriptor structure
      ------------------------------------------------------ */

      if (
        !Array.isArray(
          payload.face_descriptor,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "face_descriptor must be an array.",
        });
      }

      /*
        Expected:

        [
          [512 values],
          [512 values],
          [512 values],
          [512 values],
          [512 values]
        ]
      */

      console.log(
        "Face vectors received:",
        payload.face_descriptor.length,
      );

      /* ------------------------------------------------------
         Maximum 5 vectors
      ------------------------------------------------------ */

      if (
        payload.face_descriptor.length >
        5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Maximum 5 face vectors are allowed.",
        });
      }

      /* ------------------------------------------------------
         Validate every vector
      ------------------------------------------------------ */

      for (
        let i = 0;
        i <
        payload.face_descriptor.length;
        i++
      ) {
        const vector =
          payload.face_descriptor[i];

        if (!Array.isArray(vector)) {
          return res.status(400).json({
            success: false,
            message: `Face vector ${
              i + 1
            } must be an array.`,
          });
        }

        if (vector.length !== 512) {
          return res.status(400).json({
            success: false,
            message: `Face vector ${
              i + 1
            } must contain 512 dimensions. Received ${vector.length}.`,
          });
        }
      }

      console.log(
        "Face descriptor validation passed.",
      );

      console.log(
        "Vector count:",
        payload.face_descriptor.length,
      );

      console.log(
        "Vector dimensions:",
        payload.face_descriptor.map(
          (vector) => vector.length,
        ),
      );
    }

    /* --------------------------------------------------------
       PROFILE PHOTO
       
       Profile photo remains ONE image.
       
       This is separate from the 5 face vectors.
    -------------------------------------------------------- */

    if (req.file) {
      payload.profile_photo =
        `uploads/${req.file.filename}`;

      console.log(
        "Profile photo:",
        payload.profile_photo,
      );
    }

    /* --------------------------------------------------------
       Log final payload information
    -------------------------------------------------------- */

    console.log(
      "======================================",
    );

    console.log(
      "CREATE RECORD CONTROLLER",
    );

    console.log(
      "Organisation:",
      organisationId,
    );

    console.log(
      "Template:",
      templateId,
    );

    console.log(
      "Table:",
      table,
    );

    console.log(
      "Has face descriptor:",
      !!payload.face_descriptor,
    );

    console.log(
      "Has profile photo:",
      !!payload.profile_photo,
    );

    console.log(
      "======================================",
    );

    /* --------------------------------------------------------
       Call service
    -------------------------------------------------------- */

    const result =
      await createRecordService(
        Number(organisationId),
        Number(templateId),
        table,
        payload,
      );

    /* --------------------------------------------------------
       Handle service error
    -------------------------------------------------------- */

    if (!result.success) {
      return res
        .status(400)
        .json(result);
    }

    /* --------------------------------------------------------
       Success
    -------------------------------------------------------- */

    return res
      .status(201)
      .json(result);
  } catch (err) {
    console.error(
      "Create Record Controller Error:",
      err,
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to create record.",
    });
  }
};


/* ============================================================
   GET ALL RECORDS
   ============================================================ */

export const getAllRecords = async (
  req,
  res,
) => {
  try {
    const {
      organisationId,
      table,
    } = req.params;

    const result =
      await getAllRecordsService(
        Number(organisationId),
        table,
      );

    return res.json(result);
  } catch (err) {
    console.error(
      "Get All Records Controller Error:",
      err,
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch records.",
    });
  }
};


/* ============================================================
   GET RECORD BY ID
   ============================================================ */

export const getRecordById = async (
  req,
  res,
) => {
  try {
    const {
      organisationId,
      table,
      id,
    } = req.params;

    const result =
      await getRecordByIdService(
        Number(organisationId),
        table,
        Number(id),
      );

    return res.json(result);
  } catch (err) {
    console.error(
      "Get Record By ID Controller Error:",
      err,
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch record.",
    });
  }
};


/* ============================================================
   UPDATE RECORD
   ============================================================ */

export const updateRecord = async (
  req,
  res,
) => {
  try {
    const {
      organisationId,
      table,
      id,
    } = req.params;

    const payload = {
      ...req.body,
    };

    /* --------------------------------------------------------
       FACE DESCRIPTOR
       
       Support JSON string or already parsed array.
    -------------------------------------------------------- */

    if (payload.face_descriptor) {
      try {
        if (
          typeof payload.face_descriptor ===
          "string"
        ) {
          payload.face_descriptor =
            JSON.parse(
              payload.face_descriptor,
            );
        }
      } catch (err) {
        console.error(
          "Face descriptor JSON parse error:",
          err,
        );

        return res.status(400).json({
          success: false,
          message:
            "Invalid face_descriptor format.",
        });
      }

      /* ------------------------------------------------------
         Validate array
      ------------------------------------------------------ */

      if (
        !Array.isArray(
          payload.face_descriptor,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "face_descriptor must be an array.",
        });
      }

      /* ------------------------------------------------------
         Maximum 5 vectors
      ------------------------------------------------------ */

      if (
        payload.face_descriptor.length >
        5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Maximum 5 face vectors are allowed.",
        });
      }

      /* ------------------------------------------------------
         Validate every vector = 512 dimensions
      ------------------------------------------------------ */

      for (
        let i = 0;
        i <
        payload.face_descriptor.length;
        i++
      ) {
        const vector =
          payload.face_descriptor[i];

        if (!Array.isArray(vector)) {
          return res.status(400).json({
            success: false,
            message: `Face vector ${
              i + 1
            } must be an array.`,
          });
        }

        if (vector.length !== 512) {
          return res.status(400).json({
            success: false,
            message: `Face vector ${
              i + 1
            } must contain 512 dimensions. Received ${vector.length}.`,
          });
        }
      }

      console.log(
        "Update face vectors:",
        payload.face_descriptor.length,
      );
    }

    /* --------------------------------------------------------
       Call service
    -------------------------------------------------------- */

    const result =
      await updateRecordService(
        Number(organisationId),
        table,
        Number(id),
        payload,
      );

    return res.json(result);
  } catch (err) {
    console.error(
      "Update Record Controller Error:",
      err,
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to update record.",
    });
  }
};


/* ============================================================
   DELETE RECORD
   ============================================================ */

export const deleteRecord = async (
  req,
  res,
) => {
  try {
    const {
      organisationId,
      table,
      id,
    } = req.params;

    const result =
      await deleteRecordService(
        Number(organisationId),
        table,
        Number(id),
      );

    return res.json(result);
  } catch (err) {
    console.error(
      "Delete Record Controller Error:",
      err,
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to delete record.",
    });
  }
};


/* ============================================================
   GET TEMPLATE METADATA
   ============================================================ */

export const getTemplateMetadata = async (
  req,
  res,
) => {
  try {
    const {
      organisationId,
      templateId,
    } = req.params;

    const result =
      await getTemplateMetadataService(
        Number(organisationId),
        Number(templateId),
      );

    return res.json(result);
  } catch (err) {
    console.error(
      "Get Template Metadata Controller Error:",
      err,
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch template metadata.",
    });
  }
};


/* ============================================================
   GET MODULES
   ============================================================ */

export const getModules = async (
  req,
  res,
) => {
  try {
    const {
      organisationId,
    } = req.params;

    const result =
      await getModulesService(
        Number(organisationId),
      );

    return res.json(result);
  } catch (err) {
    console.error(
      "Get Modules Controller Error:",
      err,
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch modules.",
    });
  }
};


/* ============================================================
   GET MODULE DETAILS
   ============================================================ */

export const getModuleDetails = async (
  req,
  res,
) => {
  try {
    const {
      organisationId,
      templateId,
    } = req.params;

    const result =
      await getModuleDetailsService(
        Number(organisationId),
        Number(templateId),
      );

    return res.json(result);
  } catch (err) {
    console.error(
      "Get Module Details Controller Error:",
      err,
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch module details.",
    });
  }
};

