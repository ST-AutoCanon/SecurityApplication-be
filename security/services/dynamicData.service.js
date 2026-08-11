// import * as model from "../models/dynamicData.model.js";
// import masterAuthDB from "../../config/masterAuthDB.js";
// import { getDB } from "../../config/dbFactory.js";
// import { getOrganisationById } from "../../auth/models/organisation.model.js";
// import { getTemplateFields, getTemplate } from "../models/dynamicData.model.js";
// import { validatePayload } from "../../utils/dynamicField.validator.js";

// export const createRecordService = async (
//   organisationId,
//   templateId,
//   table,
//   payload,
// ) => {
//   const org = await getOrganisationById(masterAuthDB, organisationId);

//   if (!org) {
//     return {
//       success: false,
//       message: "Organisation not found",
//     };
//   }

//   const schema = org.schema_name;
//   const db = getDB(org.org_type);

//   try {
//     // STEP 1: Verify template
//     const template = await getTemplate(
//       masterAuthDB,
//       organisationId,
//       templateId,
//     );

//     if (!template) {
//       return {
//         success: false,
//         message: "Template not found",
//       };
//     }

//     if (template.table_name !== table) {
//       return {
//         success: false,
//         message: "Invalid table for this template",
//       };
//     }

//     // STEP 2: Get template fields
//     const allowedFields = await getTemplateFields(
//       masterAuthDB,
//       organisationId,
//       templateId,
//     );

//     console.log("Payload:", payload);
//     console.log(
//       "Allowed Fields:",
//       allowedFields.map((f) => f.field_key),
//     );

//     // STEP 3: Validate payload
//     const validation = validatePayload(allowedFields, payload);

//     if (!validation.valid) {
//       return {
//         success: false,
//         message: validation.message,
//       };
//     }

//     // STEP 4: Begin Transaction
//     await db.query("BEGIN");

//     // STEP 5: Insert into Dynamic Table
//     const result = await model.insertDynamicRecord(
//       db,
//       schema,
//       table,
//       validation.data,
//     );

//     // STEP 6: Insert into Face Details
//     // if (result.face_descriptor) {
//     if (result.face_descriptor) {
//       await model.insertFaceDetails(
//         db,
//         schema,
//         table,
//         result.id,
//         result.face_descriptor,
//       );
//     }
//     // STEP 7: Commit
//     await db.query("COMMIT");

//     return {
//       success: true,
//       data: result,
//     };
//   } catch (err) {
//     // Rollback if transaction started
//     try {
//       await db.query("ROLLBACK");
//     } catch (_) {}

//     console.error("Create Record Error:", err);

//     return {
//       success: false,
//       message: err.message,
//     };
//   }
// };

// export const getAllRecordsService = async (organisationId, table) => {
//   try {
//     const org = await getOrganisationById(masterAuthDB, organisationId);

//     console.log("ORG:", org);
//     console.log("ORG TYPE:", org.org_type);
//     console.log("SCHEMA:", org.schema_name);

//     if (!org) {
//       return {
//         success: false,
//         message: "Organisation not found",
//       };
//     }

//     const db = getDB(org.org_type);

//     const data = await model.getAllRecords(db, org.schema_name, table);

//     return {
//       success: true,
//       data,
//     };
//   } catch (err) {
//     return {
//       success: false,
//       message: err.message,
//     };
//   }
// };

// export const getRecordByIdService = async (organisationId, table, id) => {
//   try {
//     const org = await getOrganisationById(masterAuthDB, organisationId);

//     if (!org) {
//       return {
//         success: false,
//         message: "Organisation not found",
//       };
//     }

//     const db = getDB(org.org_type);

//     const data = await model.getRecordById(db, org.schema_name, table, id);

//     if (!data) {
//       return {
//         success: false,
//         message: "Record not found",
//       };
//     }

//     return {
//       success: true,
//       data,
//     };
//   } catch (err) {
//     return {
//       success: false,
//       message: err.message,
//     };
//   }
// };

// export const updateRecordService = async (
//   organisationId,
//   table,
//   id,
//   payload,
// ) => {
//   const org = await getOrganisationById(masterAuthDB, organisationId);

//   if (!org) {
//     return {
//       success: false,
//       message: "Organisation not found",
//     };
//   }

//   const db = getDB(org.org_type);

//   try {
//     // STEP 1: Check record exists
//     const existingRecord = await model.getRecordById(
//       db,
//       org.schema_name,
//       table,
//       id,
//     );

//     if (!existingRecord) {
//       return {
//         success: false,
//         message: "Record not found",
//       };
//     }

//     // STEP 2: Begin Transaction
//     await db.query("BEGIN");

//     // STEP 3: Update Dynamic Table
//     const updatedRecord = await model.updateDynamicRecord(
//       db,
//       org.schema_name,
//       table,
//       id,
//       payload,
//     );

//     // STEP 4: Update Face Details (only if face changed)
//     if (payload.face_descriptor) {
//       await model.updateFaceDetails(
//         db,
//         org.schema_name,
//         table,
//         id,
//         payload.face_descriptor,
//       );
//     }

//     // STEP 5: Commit
//     await db.query("COMMIT");

//     return {
//       success: true,
//       data: updatedRecord,
//     };
//   } catch (err) {
//     try {
//       await db.query("ROLLBACK");
//     } catch (_) {}

//     console.error("Update Record Error:", err);

//     return {
//       success: false,
//       message: err.message,
//     };
//   }
// };

// export const deleteRecordService = async (organisationId, table, id) => {
//   const org = await getOrganisationById(masterAuthDB, organisationId);

//   if (!org) {
//     return {
//       success: false,
//       message: "Organisation not found",
//     };
//   }

//   const db = getDB(org.org_type);

//   try {
//     // STEP 1: Begin Transaction
//     await db.query("BEGIN");

//     // STEP 2: Delete from Dynamic Table
//     const deletedRecord = await model.deleteDynamicRecord(
//       db,
//       org.schema_name,
//       table,
//       id,
//     );

//     if (!deletedRecord) {
//       await db.query("ROLLBACK");

//       return {
//         success: false,
//         message: "Record not found",
//       };
//     }

//     // STEP 3: Delete from Face Details
//     await model.deleteFaceDetails(db, org.schema_name, table, id);

//     // STEP 4: Commit
//     await db.query("COMMIT");

//     return {
//       success: true,
//       data: deletedRecord,
//     };
//   } catch (err) {
//     try {
//       await db.query("ROLLBACK");
//     } catch (_) {}

//     console.error("Delete Record Error:", err);

//     return {
//       success: false,
//       message: err.message,
//     };
//   }
// };
// export const getTemplateMetadataService = async (
//   organisationId,
//   templateId,
// ) => {
//   // Check organisation exists
//   const org = await getOrganisationById(masterAuthDB, organisationId);

//   if (!org) {
//     return {
//       success: false,
//       message: "Organisation not found",
//     };
//   }

//   // Get template details for this organisation
//   const template = await model.getTemplate(
//     masterAuthDB,
//     organisationId,
//     templateId,
//   );

//   if (!template) {
//     return {
//       success: false,
//       message: "Template not found",
//     };
//   }

//   // Get template fields
//   // const fields = await model.getTemplateFields(masterAuthDB, templateId);
//   const fields = await model.getTemplateFields(
//     masterAuthDB,
//     organisationId,
//     templateId,
//   );

//   return {
//     success: true,
//     data: {
//       table: template.table_name,
//       templateName: template.template_name,
//       displayName: template.display_name,
//       fields,
//     },
//   };
// };

// export const getModulesService = async (organisationId) => {
//   const org = await getOrganisationById(masterAuthDB, organisationId);

//   if (!org) {
//     return {
//       success: false,
//       message: "Organisation not found",
//     };
//   }

//   const modules = await model.getModules(masterAuthDB, organisationId);

//   return {
//     success: true,
//     data: modules,
//   };
// };

// export const getModuleDetailsService = async (organisationId, templateId) => {
//   // Check organisation exists
//   const org = await getOrganisationById(masterAuthDB, organisationId);

//   if (!org) {
//     return {
//       success: false,
//       message: "Organisation not found",
//     };
//   }

//   // Get module/template details
//   const template = await model.getTemplateDetails(
//     masterAuthDB,
//     organisationId,
//     templateId,
//   );

//   if (!template) {
//     return {
//       success: false,
//       message: "Template not found",
//     };
//   }

//   // Get template fields
//   // const fields = await model.getTemplateFields(masterAuthDB, templateId);
//   const fields = await model.getTemplateFields(
//     masterAuthDB,
//     organisationId,
//     templateId,
//   );

//   return {
//     success: true,
//     data: {
//       ...template,
//       fields,
//     },
//   };
// };











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
    // STEP 3: Separate Face Descriptor
    // --------------------------------------------------------

    const {
      dynamicPayload,
      faceDescriptor: rawFaceDescriptor,
    } = separateFaceDescriptor(payload);

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

      return {
        success: true,
        data: {
          table: template.table_name,
          templateName:
            template.template_name,
          displayName:
            template.display_name,
          fields,
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

      return {
        success: true,
        data: {
          ...template,
          fields,
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

