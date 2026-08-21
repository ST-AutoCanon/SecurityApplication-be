import * as model from "../models/dynamicData.model.js";
import masterAuthDB from "../../config/masterAuthDB.js";
import { getDB } from "../../config/dbFactory.js";
import { getOrganisationById } from "../../auth/models/organisation.model.js";
import { validatePayload } from "../../utils/dynamicField.validator.js";

// ============================================================
// TRANSACTION HELPER
// ============================================================

const rollbackTransaction = async (db) => {
  try {
    await db.query("ROLLBACK");
  } catch (rollbackError) {
    console.error("Rollback Error:", rollbackError);
  }
};

// ============================================================
// FACE DESCRIPTOR NORMALIZATION
// ============================================================

const normalizeFaceDescriptor = (faceDescriptor) => {
  if (
    faceDescriptor === undefined ||
    faceDescriptor === null ||
    faceDescriptor === ""
  ) {
    return null;
  }

  if (Array.isArray(faceDescriptor)) {
    return faceDescriptor;
  }

  if (typeof faceDescriptor === "string") {
    try {
      const parsed = JSON.parse(faceDescriptor);

      if (!Array.isArray(parsed)) {
        throw new Error(
          "face_descriptor must be an array.",
        );
      }

      return parsed;
    } catch (error) {
      throw new Error(
        "Invalid face_descriptor format.",
      );
    }
  }

  throw new Error(
    "Invalid face_descriptor format.",
  );
};

// ============================================================
// FACE DESCRIPTOR VALIDATION
//
// Expected:
// [
//   [512 values],
//   [512 values],
//   [512 values],
//   [512 values],
//   [512 values]
// ]
//
// Maximum 5 vectors.
// ============================================================

const validateFaceDescriptor = (
  faceDescriptor,
) => {
  if (faceDescriptor === null) {
    return null;
  }

  if (!Array.isArray(faceDescriptor)) {
    throw new Error(
      "face_descriptor must be an array.",
    );
  }

  if (faceDescriptor.length === 0) {
    throw new Error(
      "face_descriptor cannot be empty.",
    );
  }

  // Maximum 5 face vectors
  if (faceDescriptor.length > 5) {
    throw new Error(
      `Maximum 5 face vectors are allowed. Received ${faceDescriptor.length}.`,
    );
  }

  // Must be array of 512-dimensional vectors
  for (
    let i = 0;
    i < faceDescriptor.length;
    i++
  ) {
    const vector = faceDescriptor[i];

    if (!Array.isArray(vector)) {
      throw new Error(
        `Face vector ${i + 1} must be an array.`,
      );
    }

    if (vector.length !== 512) {
      throw new Error(
        `Face vector ${
          i + 1
        } must contain 512 dimensions. Received ${vector.length}.`,
      );
    }

    const invalidValue = vector.some(
      (value) =>
        !Number.isFinite(Number(value)),
    );

    if (invalidValue) {
      throw new Error(
        `Face vector ${
          i + 1
        } contains invalid numeric values.`,
      );
    }
  }

  return faceDescriptor;
};

// ============================================================
// REMOVE FACE DESCRIPTOR FROM DYNAMIC PAYLOAD
//
// face_descriptor belongs to face_details, not the dynamic table.
// ============================================================

// const separateFaceDescriptor = (
//   payload,
// ) => {
//   const dynamicPayload = {
//     ...payload,
//   };

//   const faceDescriptor =
//     dynamicPayload.face_descriptor;

//   delete dynamicPayload.face_descriptor;

//   return {
//     dynamicPayload,
//     faceDescriptor,
//   };
// };

// ============================================================
// SEPARATE FACE DESCRIPTOR
// ============================================================

const separateFaceDescriptor = (payload) => {
  const data = {
    ...(payload || {}),
  };

  const faceDescriptor =
    data.face_descriptor;

  delete data.face_descriptor;

  return {
    dynamicPayload: data,
    faceDescriptor,
  };
};

// ============================================================
// CREATE DYNAMIC RECORD
// ============================================================

export const createRecordService = async (
  organisationId,
  templateId,
  table,
  payload,
) => {
  const org = await getOrganisationById(
    masterAuthDB,
    organisationId,
  );

  if (!org) {
    return {
      success: false,
      message: "Organisation not found",
    };
  }

  const schema = org.schema_name;
  const db = getDB(org.org_type);

  try {
    // --------------------------------------------------------
    // STEP 1: Verify Template
    // --------------------------------------------------------

    const template =
      await model.getTemplate(
        masterAuthDB,
        organisationId,
        templateId,
      );

    if (!template) {
      return {
        success: false,
        message: "Template not found",
      };
    }

    if (template.table_name !== table) {
      return {
        success: false,
        message:
          "Invalid table for this template",
      };
    }

    // --------------------------------------------------------
    // STEP 2: Get Template Fields
    // --------------------------------------------------------

    const allowedFields =
      await model.getTemplateFields(
        masterAuthDB,
        organisationId,
        templateId,
      );

    
    // --------------------------------------------------------
// STATUS DEFAULT
//
// If this template contains a status field and the caller
// did not provide status, use the field's default value.
// --------------------------------------------------------

const statusField = allowedFields.find(
  (field) => field.field_key === "status",
);

const payloadWithDefaults = {
  ...(payload || {}),
};

if (
  statusField &&
  payloadWithDefaults.status === undefined
) {
  payloadWithDefaults.status =
    statusField.default_value || "Active";
    }
    
    // --------------------------------------------------------
    // STEP 3: Separate Face Descriptor
    // --------------------------------------------------------

    const { dynamicPayload, faceDescriptor: rawFaceDescriptor } =
      separateFaceDescriptor(payloadWithDefaults);

    // --------------------------------------------------------
    // STEP 4: Normalize + Validate Face Descriptor
    // --------------------------------------------------------

    let faceDescriptor = null;

    if (
      rawFaceDescriptor !== undefined &&
      rawFaceDescriptor !== null &&
      rawFaceDescriptor !== ""
    ) {
      faceDescriptor =
        normalizeFaceDescriptor(
          rawFaceDescriptor,
        );

      validateFaceDescriptor(
        faceDescriptor,
      );
    }

    // --------------------------------------------------------
    // STEP 5: Validate Dynamic Fields
    //
    // face_descriptor is excluded because it is stored
    // separately in face_details.
    // --------------------------------------------------------

    const validation =
      validatePayload(
        allowedFields,
        dynamicPayload,
      );

    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
      };
    }

    const cleanedPayload = {
      ...validation.data,
    };

    // --------------------------------------------------------
    // STEP 6: Begin Transaction
    // --------------------------------------------------------

    await db.query("BEGIN");

    // --------------------------------------------------------
    // STEP 7: Insert Dynamic Record
    // --------------------------------------------------------

    const result =
      await model.insertDynamicRecord(
        db,
        schema,
        table,
        cleanedPayload,
      );

    if (!result) {
      throw new Error(
        "Failed to create record.",
      );
    }

    // --------------------------------------------------------
    // STEP 8: Insert Face Details
    // --------------------------------------------------------

    if (faceDescriptor !== null) {
      await model.insertFaceDetails(
        db,
        schema,
        table,
        result.id,
        faceDescriptor,
      );
    }

    // --------------------------------------------------------
    // STEP 9: Commit
    // --------------------------------------------------------

    await db.query("COMMIT");

    // Return face descriptor as part of API response
    return {
      success: true,
      data: {
        ...result,
        face_descriptor:
          faceDescriptor || [],
      },
    };
  } catch (err) {
    await rollbackTransaction(db);

    console.error(
      "Create Record Error:",
      err,
    );

    return {
      success: false,
      message:
        err.message ||
        "Failed to create record.",
    };
  }
};

// ============================================================
// GET ALL RECORDS
// ============================================================

export const getAllRecordsService = async (
  organisationId,
  table,
) => {
  try {
    const org =
      await getOrganisationById(
        masterAuthDB,
        organisationId,
      );

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const db = getDB(org.org_type);

    const data =
      await model.getAllRecords(
        db,
        org.schema_name,
        table,
      );

    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error(
      "Get All Records Error:",
      err,
    );

    return {
      success: false,
      message:
        err.message ||
        "Failed to fetch records.",
    };
  }
};

// ============================================================
// GET RECORD BY ID
// ============================================================

export const getRecordByIdService = async (
  organisationId,
  table,
  id,
) => {
  try {
    const org =
      await getOrganisationById(
        masterAuthDB,
        organisationId,
      );

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const db = getDB(org.org_type);

    const data =
      await model.getRecordById(
        db,
        org.schema_name,
        table,
        id,
      );

    if (!data) {
      return {
        success: false,
        message: "Record not found",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error(
      "Get Record By ID Error:",
      err,
    );

    return {
      success: false,
      message:
        err.message ||
        "Failed to fetch record.",
    };
  }
};





// ============================================================
// UPDATE DYNAMIC RECORD
// ============================================================

export const updateRecordService = async (
  organisationId,
  table,
  id,
  payload,
) => {
  // ============================================================
  // STEP 1: GET ORGANISATION
  // ============================================================

  const org = await getOrganisationById(
    masterAuthDB,
    organisationId,
  );

  if (!org) {
    return {
      success: false,
      message: "Organisation not found",
    };
  }

  const schema = org.schema_name;
  const db = getDB(org.org_type);

  try {
    // ============================================================
    // STEP 2: CHECK EXISTING RECORD
    // ============================================================

    const existingRecord =
      await model.getRecordById(
        db,
        schema,
        table,
        id,
      );

    if (!existingRecord) {
      return {
        success: false,
        message: "Record not found",
      };
    }

    // ============================================================
    // STEP 3: FIND TEMPLATE FOR THIS TABLE
    // ============================================================

    const templateResult =
      await db.query(
        `
          SELECT template_id
          FROM auth.dynamic_tables
          WHERE organisation_id = $1
            AND table_name = $2
          LIMIT 1;
        `,
        [
          organisationId,
          table,
        ],
      );

    const template =
      templateResult.rows[0];

    if (!template) {
      return {
        success: false,
        message:
          "Template not found for this table",
      };
    }

    const templateId =
      template.template_id;

    // ============================================================
    // STEP 4: GET TEMPLATE FIELDS
    // ============================================================

    const allowedFields =
      await model.getTemplateFields(
        masterAuthDB,
        organisationId,
        templateId,
      );

    // ============================================================
    // STEP 5: SEPARATE FACE DESCRIPTOR
    // ============================================================

    const {
      dynamicPayload,
      faceDescriptor: rawFaceDescriptor,
    } = separateFaceDescriptor(payload);

    // ============================================================
    // STEP 6: NORMALIZE + VALIDATE FACE DESCRIPTOR
    // ============================================================

    let faceDescriptor = null;
    let hasFaceDescriptorUpdate = false;

    if (
      rawFaceDescriptor !== undefined &&
      rawFaceDescriptor !== null &&
      rawFaceDescriptor !== ""
    ) {
      faceDescriptor =
        normalizeFaceDescriptor(
          rawFaceDescriptor,
        );

      validateFaceDescriptor(
        faceDescriptor,
      );

      hasFaceDescriptorUpdate = true;
    }

    // ============================================================
    // STEP 7: VALIDATE DYNAMIC FIELDS
    //
    // partial: true
    // Required fields are not required during UPDATE.
    // ============================================================

    const validation =
      validatePayload(
        allowedFields,
        dynamicPayload,
        {
          partial: true,
        },
      );

    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
      };
    }

    const cleanedPayload = {
      ...validation.data,
    };

    // ============================================================
    // STEP 8: CHECK WHETHER ANYTHING WAS PROVIDED
    // ============================================================

    const hasDynamicFields =
      Object.keys(cleanedPayload)
        .length > 0;

    if (
      !hasDynamicFields &&
      !hasFaceDescriptorUpdate
    ) {
      return {
        success: false,
        message:
          "No fields provided for update.",
      };
    }

    // ============================================================
    // STEP 9: BEGIN TRANSACTION
    // ============================================================

    await db.query("BEGIN");

    // ============================================================
    // STEP 10: UPDATE DYNAMIC TABLE
    // ============================================================

    let updatedRecord =
      existingRecord;

    if (hasDynamicFields) {
      updatedRecord =
        await model.updateDynamicRecord(
          db,
          schema,
          table,
          id,
          cleanedPayload,
        );

      if (!updatedRecord) {
        throw new Error(
          "Failed to update record.",
        );
      }
    }

    // ============================================================
    // STEP 11: UPDATE FACE DETAILS
    // ============================================================

    if (hasFaceDescriptorUpdate) {
      await model.updateFaceDetails(
        db,
        schema,
        table,
        id,
        faceDescriptor,
      );
    }

    // ============================================================
    // STEP 12: COMMIT
    // ============================================================

    await db.query("COMMIT");

    // ============================================================
    // STEP 13: RETURN UPDATED DATA
    // ============================================================

    return {
      success: true,
      data: {
        ...updatedRecord,

        face_descriptor:
          hasFaceDescriptorUpdate
            ? faceDescriptor
            : existingRecord.face_descriptor || [],
      },
    };
  } catch (err) {
    // ============================================================
    // ROLLBACK
    // ============================================================

    await rollbackTransaction(db);

    console.error(
      "Update Record Error:",
      err,
    );

    return {
      success: false,
      message:
        err.message ||
        "Failed to update record.",
    };
  }
};



// ============================================================
// DELETE DYNAMIC RECORD
// ============================================================

export const deleteRecordService = async (
  organisationId,
  table,
  id,
) => {
  const org =
    await getOrganisationById(
      masterAuthDB,
      organisationId,
    );

  if (!org) {
    return {
      success: false,
      message: "Organisation not found",
    };
  }

  const db = getDB(org.org_type);

  try {
    // --------------------------------------------------------
    // STEP 1: Begin Transaction
    // --------------------------------------------------------

    await db.query("BEGIN");

    // --------------------------------------------------------
    // STEP 2: Delete Dynamic Record
    // --------------------------------------------------------

    const deletedRecord =
      await model.deleteDynamicRecord(
        db,
        org.schema_name,
        table,
        id,
      );

    if (!deletedRecord) {
      await rollbackTransaction(db);

      return {
        success: false,
        message: "Record not found",
      };
    }

    // --------------------------------------------------------
    // STEP 3: Delete Face Details
    // --------------------------------------------------------

    await model.deleteFaceDetails(
      db,
      org.schema_name,
      table,
      id,
    );

    // --------------------------------------------------------
    // STEP 4: Commit
    // --------------------------------------------------------

    await db.query("COMMIT");

    return {
      success: true,
      data: deletedRecord,
    };
  } catch (err) {
    await rollbackTransaction(db);

    console.error(
      "Delete Record Error:",
      err,
    );

    return {
      success: false,
      message:
        err.message ||
        "Failed to delete record.",
    };
  }
};

// ============================================================
// GET TEMPLATE METADATA
// ============================================================

export const getTemplateMetadataService =
  async (
    organisationId,
    templateId,
  ) => {
    try {
      const org =
        await getOrganisationById(
          masterAuthDB,
          organisationId,
        );

      if (!org) {
        return {
          success: false,
          message:
            "Organisation not found",
        };
      }

      const template =
        await model.getTemplate(
          masterAuthDB,
          organisationId,
          templateId,
        );

      if (!template) {
        return {
          success: false,
          message: "Template not found",
        };
      }

      const fields =
        await model.getTemplateFields(
          masterAuthDB,
          organisationId,
          templateId,
        );
      
      
      
       console.log("🔥 GET TEMPLATE METADATA - ALL FIELDS FROM MODEL:", fields);

       // Hide status only from API response
       const visibleFields = fields.filter(
         (field) => field.field_key !== "status",
       );

       console.log(
         "🔥 GET TEMPLATE METADATA - FIELDS AFTER HIDING STATUS:",
         visibleFields,
       );

       console.log(
         "🔥 GET TEMPLATE METADATA - STATUS STILL EXISTS IN MODEL:",
         fields.some((field) => field.field_key === "status"),
       );

       console.log(
         "🔥 GET TEMPLATE METADATA - STATUS IN RESPONSE:",
         visibleFields.some((field) => field.field_key === "status"),
       );

      return {
        success: true,
        data: {
          table: template.table_name,
          templateName:
            template.template_name,
          displayName:
            template.display_name,
          fields: visibleFields,
        },
      };
    } catch (err) {
      console.error(
        "Get Template Metadata Error:",
        err,
      );

      return {
        success: false,
        message:
          err.message ||
          "Failed to fetch template metadata.",
      };
    }
  };

// ============================================================
// GET MODULES
// ============================================================

export const getModulesService = async (
  organisationId,
) => {
  try {
    const org =
      await getOrganisationById(
        masterAuthDB,
        organisationId,
      );

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const modules =
      await model.getModules(
        masterAuthDB,
        organisationId,
      );

    return {
      success: true,
      data: modules,
    };
  } catch (err) {
    console.error(
      "Get Modules Error:",
      err,
    );

    return {
      success: false,
      message:
        err.message ||
        "Failed to fetch modules.",
    };
  }
};

// ============================================================
// GET MODULE DETAILS
// ============================================================

export const getModuleDetailsService =
  async (
    organisationId,
    templateId,
  ) => {
    try {
      const org =
        await getOrganisationById(
          masterAuthDB,
          organisationId,
        );

      if (!org) {
        return {
          success: false,
          message:
            "Organisation not found",
        };
      }

      const template =
        await model.getTemplateDetails(
          masterAuthDB,
          organisationId,
          templateId,
        );

      if (!template) {
        return {
          success: false,
          message: "Template not found",
        };
      }

      const fields =
        await model.getTemplateFields(
          masterAuthDB,
          organisationId,
          templateId,
        );
      
    console.log("🔥 GET MODULE DETAILS - ALL FIELDS FROM MODEL:", fields);

    const visibleFields = fields.filter(
      (field) => field.field_key !== "status",
    );

    console.log(
      "🔥 GET MODULE DETAILS - FIELDS AFTER HIDING STATUS:",
      visibleFields,
    );

    console.log(
      "🔥 GET MODULE DETAILS - STATUS IN RESPONSE:",
      visibleFields.some((field) => field.field_key === "status"),
    );

      return {
        success: true,
        data: {
          ...template,
          fields: visibleFields,
        },
      };
    } catch (err) {
      console.error(
        "Get Module Details Error:",
        err,
      );

      return {
        success: false,
        message:
          err.message ||
          "Failed to fetch module details.",
      };
    }
  };

