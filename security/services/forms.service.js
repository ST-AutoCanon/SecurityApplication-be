// import masterAuthDB from "../../config/masterAuthDB.js";
// import { getDB } from "../../config/dbFactory.js";
// import { getOrganisationById } from "../../auth/models/organisation.model.js";
// import * as model from "../models/forms.model.js";

// /**
//  * LIST FORMS
//  */
// /**
//  * GET FORM RESPONSES (ADMIN)
//  */
// export const getFormResponsesService = async (organisationId, formId) => {
//   try {
//     const org = await getOrganisationById(masterAuthDB, organisationId);

//     if (!org) {
//       return { success: false, message: "Organisation not found" };
//     }

//     const db = getDB(org.org_type);
//     const schema = org.schema_name;

//     const form = await model.getFormById(db, schema, formId);
//     if (!form) {
//       return { success: false, message: "Form not found" };
//     }

//     const rows = await model.getFormResponses(db, schema, formId);

//     const responses = rows.map((row) => {
//       let values = row.response_json || {};

//       // In case DB returns JSON as a string
//       if (typeof values === "string") {
//         try {
//           values = JSON.parse(values);
//         } catch {
//           values = {};
//         }
//       }

//       return {
//         id: String(row.id),
//         formId: String(row.form_id),
//         values,
//       };
//     });

//     return {
//       success: true,
//       data: {
//         form: {
//           id: String(form.id),
//           title: form.title,
//           description: form.description || "",
//           fields: form.fields_json || [],
//           layoutColumns: form.layout_columns || 2,
//         },
//         responses,
//       },
//     };
//   } catch (err) {
//     return { success: false, message: err.message };
//   }
// };
// export const getAllFormsService = async (organisationId) => {
//   try {
//     const org = await getOrganisationById(masterAuthDB, organisationId);

//     if (!org) {
//       return { success: false, message: "Organisation not found" };
//     }

//     const db = getDB(org.org_type);
//     const schema = org.schema_name;

//     const rows = await model.getAllForms(db, schema);

//     const data = rows.map((row) => ({
//       id: String(row.id),
//       title: row.title,
//       description: row.description || "",
//       fields: row.fields_json || [],
//       layoutColumns: row.layout_columns || 2,
//       createdBy: row.created_by,
//       createdAt: row.created_at,
//       updatedAt: row.updated_at,
//       assignedMemberIds: (row.assigned_member_ids || []).map(String),
//     }));

//     return { success: true, data };
//   } catch (err) {
//     return { success: false, message: err.message };
//   }
// };

// /**
//  * GET ONE FORM
//  */
// export const getFormByIdService = async (organisationId, formId) => {
//   try {
//     const org = await getOrganisationById(masterAuthDB, organisationId);

//     if (!org) {
//       return { success: false, message: "Organisation not found" };
//     }

//     const db = getDB(org.org_type);
//     const schema = org.schema_name;

//     const row = await model.getFormById(db, schema, formId);

//     if (!row) {
//       return { success: false, message: "Form not found" };
//     }

//     return {
//       success: true,
//       data: {
//         id: String(row.id),
//         title: row.title,
//         description: row.description || "",
//         fields: row.fields_json || [],
//         layoutColumns: row.layout_columns || 2,
//         createdBy: row.created_by,
//         createdAt: row.created_at,
//         updatedAt: row.updated_at,
//       },
//     };
//   } catch (err) {
//     return { success: false, message: err.message };
//   }
// };

// export const getAssignedFormsService = async (
//   organisationId,
//   securityUserId,
//   email,
// ) => {
//   try {
//     const org = await getOrganisationById(masterAuthDB, organisationId);
//     if (!org) return { success: false, message: "Organisation not found" };

//     const db = getDB(org.org_type);
//     const rows = await model.getFormsAssignedToUser(
//       db,
//       org.schema_name,
//       securityUserId,
//       email,
//     );

//     return {
//       success: true,
//       data: rows.map((row) => ({
//         id: String(row.id),
//         title: row.title,
//         description: row.description || "",
//         fields: row.fields_json || [],
//         layoutColumns: row.layout_columns || 2,
//         createdAt: row.created_at,
//         updatedAt: row.updated_at,
//       })),
//     };
//   } catch (err) {
//     return { success: false, message: err.message };
//   }
// };

// /**
//  * CREATE FORM
//  */
// export const createFormService = async (organisationId, payload, userId) => {
//   try {
//     const org = await getOrganisationById(masterAuthDB, organisationId);

//     if (!org) {
//       return { success: false, message: "Organisation not found" };
//     }

//     if (!payload.title?.trim()) {
//       return { success: false, message: "Title is required" };
//     }

//     const db = getDB(org.org_type);
//     const schema = org.schema_name;

//     const client = await db.connect();
//     let row;
//     try {
//       await client.query("BEGIN");
//       row = await model.createForm(client, schema, {
//         title: payload.title.trim(),
//         description: payload.description || null,
//         fields_json: payload.fields || [],
//         layout_columns: payload.layoutColumns || 2,
//         created_by: userId || null,
//       });
//       await client.query("COMMIT");
//     } catch (err) {
//       await client.query("ROLLBACK");
//       throw err;
//     } finally {
//       client.release();
//     }

//     return {
//       success: true,
//       message: "Form created successfully",
//       data: {
//         id: String(row.id),
//         title: row.title,
//         description: row.description || "",
//         fields: row.fields_json || [],
//         layoutColumns: row.layout_columns || 2,
//         createdBy: row.created_by,
//         createdAt: row.created_at,
//         updatedAt: row.updated_at,
//         assignedMemberIds: normalizeMemberIds(payload.assignedMemberIds).map(
//           String,
//         ),
//       },
//     };
//   } catch (err) {
//     return { success: false, message: err.message };
//   }
// };

// /**
//  * UPDATE FORM
//  */
// export const updateFormService = async (
//   organisationId,
//   formId,
//   payload,
//   userId,
// ) => {
//   try {
//     const org = await getOrganisationById(masterAuthDB, organisationId);

//     if (!org) {
//       return { success: false, message: "Organisation not found" };
//     }

//     if (!payload.title?.trim()) {
//       return { success: false, message: "Title is required" };
//     }

//     const db = getDB(org.org_type);
//     const schema = org.schema_name;

//     const client = await db.connect();
//     let row;
//     try {
//       await client.query("BEGIN");
//       row = await model.updateForm(client, schema, formId, {
//         title: payload.title.trim(),
//         description: payload.description || null,
//         fields_json: payload.fields || [],
//         layout_columns: payload.layoutColumns || 2,
//       });

//       await client.query("COMMIT");
//     } catch (err) {
//       await client.query("ROLLBACK");
//       throw err;
//     } finally {
//       client.release();
//     }

//     if (!row) {
//       return { success: false, message: "Form not found" };
//     }

//     return {
//       success: true,
//       message: "Form updated successfully",
//       data: {
//         id: String(row.id),
//         title: row.title,
//         description: row.description || "",
//         fields: row.fields_json || [],
//         layoutColumns: row.layout_columns || 2,
//         createdBy: row.created_by,
//         createdAt: row.created_at,
//         updatedAt: row.updated_at,
//         assignedMemberIds: (row.assigned_member_ids || []).map(String),
//       },
//     };
//   } catch (err) {
//     return { success: false, message: err.message };
//   }
// };

// export const assignFormMembersService = async (
//   organisationId,
//   formId,
//   memberIds,
//   userId,
// ) => {
//   try {
//     const org = await getOrganisationById(masterAuthDB, organisationId);
//     if (!org) return { success: false, message: "Organisation not found" };

//     const db = getDB(org.org_type);
//     const schema = org.schema_name;
//     const client = await db.connect();
//     const normalizedMemberIds = normalizeMemberIds(memberIds);

//     try {
//       await client.query("BEGIN");
//       const form = await model.getFormById(client, schema, formId);
//       if (!form) {
//         await client.query("ROLLBACK");
//         return { success: false, message: "Form not found" };
//       }

//       await model.replaceFormAssignments(
//         client,
//         schema,
//         formId,
//         normalizedMemberIds,
//         userId,
//       );
//       await client.query("COMMIT");
//     } catch (err) {
//       await client.query("ROLLBACK");
//       throw err;
//     } finally {
//       client.release();
//     }

//     return {
//       success: true,
//       message: "Members assigned successfully",
//       data: { assignedMemberIds: normalizedMemberIds.map(String) },
//     };
//   } catch (err) {
//     return { success: false, message: err.message };
//   }
// };

// /**
//  * DELETE FORM
//  */
// export const deleteFormService = async (organisationId, formId) => {
//   try {
//     const org = await getOrganisationById(masterAuthDB, organisationId);

//     if (!org) {
//       return { success: false, message: "Organisation not found" };
//     }

//     const db = getDB(org.org_type);
//     const schema = org.schema_name;

//     const row = await model.deleteForm(db, schema, formId);

//     if (!row) {
//       return { success: false, message: "Form not found" };
//     }

//     return {
//       success: true,
//       message: "Form deleted successfully",
//     };
//   } catch (err) {
//     return { success: false, message: err.message };
//   }
// };
// export const getPublicFormService = async (orgId, formId) => {
//   try {
//     console.log("getPublicFormService input:", { orgId, formId });

//     const org = await getOrganisationById(masterAuthDB, Number(orgId));

//     console.log("org result:", org);

//     if (!org) {
//       return { success: false, message: "Organisation not found" };
//     }

//     const db = getDB(org.org_type);
//     const schema = org.schema_name;

//     const row = await model.getFormById(db, schema, Number(formId));

//     if (!row) {
//       return { success: false, message: "Form not found" };
//     }

//     return {
//       success: true,
//       data: {
//         id: String(row.id),
//         title: row.title,
//         description: row.description || "",
//         fields: row.fields_json || [],
//         layoutColumns: row.layout_columns || 2,
//       },
//     };
//   } catch (err) {
//     console.error("getPublicFormService error:", err);
//     return { success: false, message: err.message };
//   }
// };

// export const submitPublicFormService = async (orgId, formId, values) => {
//   try {
//     const org = await getOrganisationById(masterAuthDB, Number(orgId));

//     if (!org) {
//       return {
//         success: false,
//         message: "Organisation not found",
//       };
//     }

//     const db = getDB(org.org_type);
//     const schema = org.schema_name;

//     const form = await model.getFormById(db, schema, Number(formId));

//     if (!form) {
//       return {
//         success: false,
//         message: "Form not found",
//       };
//     }

//     // SAVE RESPONSE
//     await model.insertFormResponse(
//       db,
//       schema,
//       Number(formId),
//       values
//     );

//     return {
//       success: true,
//       message: "Response submitted successfully",
//     };
//   } catch (err) {
//     console.log(err);

//     return {
//       success: false,
//       message: err.message,
//     };
//   }
// };
// export const getMembersForAssignmentService = async (organisationId) => {
//   try {
//     const org = await getOrganisationById(masterAuthDB, organisationId);
//     if (!org) return { success: false, message: "Organisation not found" };

//     const db = getDB(org.org_type);
//     const schema = org.schema_name;

//     const rows = await model.getActiveMembers(db, schema);

//     const data = rows.map((m) => ({
//       id: String(m.id),
//       name: [m.first_name, m.last_name].filter(Boolean).join(" "),
//       email: m.email || null,
//       mobile: m.mobile_number || null,
//       flat: [m.block_tower, m.floor_number, m.flat_number]
//         .filter(Boolean)
//         .join(" / ") || null,
//       memberCode: m.member_code,
//       memberType: m.member_type,
//     }));

//     return { success: true, data };
//   } catch (err) {
//     return { success: false, message: err.message };
//   }
// };

// const normalizeMemberIds = (memberIds) =>
//   [...new Set(Array.isArray(memberIds) ? memberIds : [])]
//     .map(Number)
//     .filter((memberId) => Number.isInteger(memberId) && memberId > 0);

import masterAuthDB from "../../config/masterAuthDB.js";
import { getDB } from "../../config/dbFactory.js";
import { getOrganisationById } from "../../auth/models/organisation.model.js";
import * as model from "../models/forms.model.js";

const normalizeMemberIds = (memberIds) =>
  [...new Set(Array.isArray(memberIds) ? memberIds : [])]
    .map(Number)
    .filter((memberId) => Number.isInteger(memberId) && memberId > 0);

/**
 * GET FORM RESPONSES (ADMIN) — final only
 */
export const getFormResponsesService = async (organisationId, formId) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);
    if (!org) return { success: false, message: "Organisation not found" };

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const form = await model.getFormById(db, schema, formId);
    if (!form) return { success: false, message: "Form not found" };

    const rows = await model.getFormResponses(db, schema, formId);

    const responses = rows.map((row) => {
      let values = row.response_json || {};
      if (typeof values === "string") {
        try {
          values = JSON.parse(values);
        } catch {
          values = {};
        }
      }
      return {
        id: String(row.id),
        formId: String(row.form_id),
        values,
        submittedBy: row.submitted_by != null ? String(row.submitted_by) : null,
        submittedAt: row.submitted_at || null,
      };
    });

    return {
      success: true,
      data: {
        form: {
          id: String(form.id),
          title: form.title,
          description: form.description || "",
          fields: form.fields_json || [],
          layoutColumns: form.layout_columns || 2,
        },
        responses,
      },
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const getAllFormsService = async (organisationId) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);
    if (!org) return { success: false, message: "Organisation not found" };

    const db = getDB(org.org_type);
    const schema = org.schema_name;
    const rows = await model.getAllForms(db, schema);

    const data = rows.map((row) => ({
      id: String(row.id),
      title: row.title,
      description: row.description || "",
      fields: row.fields_json || [],
      layoutColumns: row.layout_columns || 2,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      assignedMemberIds: (row.assigned_member_ids || []).map(String),
    }));

    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const getFormByIdService = async (organisationId, formId) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);
    if (!org) return { success: false, message: "Organisation not found" };

    const db = getDB(org.org_type);
    const schema = org.schema_name;
    const row = await model.getFormById(db, schema, formId);
    if (!row) return { success: false, message: "Form not found" };

    return {
      success: true,
      data: {
        id: String(row.id),
        title: row.title,
        description: row.description || "",
        fields: row.fields_json || [],
        layoutColumns: row.layout_columns || 2,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        assignedMemberIds: (row.assigned_member_ids || []).map(String),
      },
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const getAssignedFormsService = async (
  organisationId,
  securityUserId,
  email,
) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);
    if (!org) return { success: false, message: "Organisation not found" };

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const memberId = await model.getMemberIdByUser(
      db,
      schema,
      securityUserId,
      email,
    );

    const rows = await model.getFormsAssignedToUser(
      db,
      schema,
      securityUserId,
      email,
    );

    const data = await Promise.all(
      rows.map(async (row) => {
        let alreadySubmitted = false;
        let isDraft = false;
        let submittedValues = null;

        if (memberId) {
          const prev = await model.getResponseByMember(
            db,
            schema,
            row.id,
            memberId,
          );
          if (prev) {
            alreadySubmitted = prev.is_draft === false;
            isDraft = prev.is_draft === true;
            submittedValues =
              typeof prev.response_json === "string"
                ? JSON.parse(prev.response_json)
                : prev.response_json;
          }
        }

        return {
          id: String(row.id),
          title: row.title,
          description: row.description || "",
          fields: row.fields_json || [],
          layoutColumns: row.layout_columns || 2,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          alreadySubmitted,
          isDraft,
          submittedValues,
        };
      }),
    );

    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const createFormService = async (organisationId, payload, userId) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);
    if (!org) return { success: false, message: "Organisation not found" };
    if (!payload.title?.trim()) {
      return { success: false, message: "Title is required" };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;
    const client = await db.connect();
    let row;
    try {
      await client.query("BEGIN");
      row = await model.createForm(client, schema, {
        title: payload.title.trim(),
        description: payload.description || null,
        fields_json: payload.fields || [],
        layout_columns: payload.layoutColumns || 2,
        created_by: userId || null,
      });
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    return {
      success: true,
      message: "Form created successfully",
      data: {
        id: String(row.id),
        title: row.title,
        description: row.description || "",
        fields: row.fields_json || [],
        layoutColumns: row.layout_columns || 2,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        assignedMemberIds: normalizeMemberIds(payload.assignedMemberIds).map(
          String,
        ),
      },
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const updateFormService = async (
  organisationId,
  formId,
  payload,
  userId,
) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);
    if (!org) return { success: false, message: "Organisation not found" };
    if (!payload.title?.trim()) {
      return { success: false, message: "Title is required" };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;
    const client = await db.connect();
    let row;
    try {
      await client.query("BEGIN");
      row = await model.updateForm(client, schema, formId, {
        title: payload.title.trim(),
        description: payload.description || null,
        fields_json: payload.fields || [],
        layout_columns: payload.layoutColumns || 2,
      });
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    if (!row) return { success: false, message: "Form not found" };

    return {
      success: true,
      message: "Form updated successfully",
      data: {
        id: String(row.id),
        title: row.title,
        description: row.description || "",
        fields: row.fields_json || [],
        layoutColumns: row.layout_columns || 2,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        assignedMemberIds: (row.assigned_member_ids || []).map(String),
      },
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const assignFormMembersService = async (
  organisationId,
  formId,
  memberIds,
  userId,
) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);
    if (!org) return { success: false, message: "Organisation not found" };

    const db = getDB(org.org_type);
    const schema = org.schema_name;
    const client = await db.connect();
    const normalizedMemberIds = normalizeMemberIds(memberIds);

    try {
      await client.query("BEGIN");
      const form = await model.getFormById(client, schema, formId);
      if (!form) {
        await client.query("ROLLBACK");
        return { success: false, message: "Form not found" };
      }
      await model.replaceFormAssignments(
        client,
        schema,
        formId,
        normalizedMemberIds,
        userId,
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    return {
      success: true,
      message: "Members assigned successfully",
      data: { assignedMemberIds: normalizedMemberIds.map(String) },
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const deleteFormService = async (organisationId, formId) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);
    if (!org) return { success: false, message: "Organisation not found" };

    const db = getDB(org.org_type);
    const schema = org.schema_name;
    const row = await model.deleteForm(db, schema, formId);
    if (!row) return { success: false, message: "Form not found" };

    return { success: true, message: "Form deleted successfully" };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const getPublicFormService = async (orgId, formId) => {
  try {
    const org = await getOrganisationById(masterAuthDB, Number(orgId));
    if (!org) return { success: false, message: "Organisation not found" };

    const db = getDB(org.org_type);
    const schema = org.schema_name;
    const row = await model.getFormById(db, schema, Number(formId));
    if (!row) return { success: false, message: "Form not found" };

    return {
      success: true,
      data: {
        id: String(row.id),
        title: row.title,
        description: row.description || "",
        fields: row.fields_json || [],
        layoutColumns: row.layout_columns || 2,
      },
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/** Public / anonymous — always final, no draft */
export const submitPublicFormService = async (orgId, formId, values) => {
  try {
    const org = await getOrganisationById(masterAuthDB, Number(orgId));
    if (!org) return { success: false, message: "Organisation not found" };

    const db = getDB(org.org_type);
    const schema = org.schema_name;
    const form = await model.getFormById(db, schema, Number(formId));
    if (!form) return { success: false, message: "Form not found" };

    await model.insertFormResponse(db, schema, Number(formId), values);

    return {
      success: true,
      message: "Response submitted successfully",
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/**
 * Assigned user: save draft OR final submit
 */
export const submitAssignedFormService = async (
  organisationId,
  formId,
  values,
  securityUserId,
  email,
  isDraft = false,
) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);
    if (!org) return { success: false, message: "Organisation not found" };

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const form = await model.getFormById(db, schema, Number(formId));
    if (!form) return { success: false, message: "Form not found" };

    const memberId = await model.getMemberIdByUser(
      db,
      schema,
      securityUserId,
      email,
    );
    if (!memberId) {
      return { success: false, message: "Member not found for this user" };
    }

    const row = await model.upsertFormResponse(
      db,
      schema,
      Number(formId),
      values,
      memberId,
      isDraft,
    );

    return {
      success: true,
      message: isDraft
        ? "Draft saved successfully"
        : "Response submitted successfully",
      data: {
        isDraft: row.is_draft,
        values:
          typeof row.response_json === "string"
            ? JSON.parse(row.response_json)
            : row.response_json,
      },
    };
  } catch (err) {
    if (err.code === "ALREADY_SUBMITTED" || err.code === "23505") {
      return {
        success: false,
        message: "You have already submitted this form",
        alreadySubmitted: true,
      };
    }
    return { success: false, message: err.message };
  }
};

export const getMembersForAssignmentService = async (organisationId) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);
    if (!org) return { success: false, message: "Organisation not found" };

    const db = getDB(org.org_type);
    const schema = org.schema_name;
    const rows = await model.getActiveMembers(db, schema);

    const data = rows.map((m) => ({
      id: String(m.id),
      name: [m.first_name, m.last_name].filter(Boolean).join(" "),
      email: m.email || null,
      mobile: m.mobile_number || null,
      flat:
        [m.block_tower, m.floor_number, m.flat_number]
          .filter(Boolean)
          .join(" / ") || null,
      memberCode: m.member_code,
      memberType: m.member_type,
    }));

    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};