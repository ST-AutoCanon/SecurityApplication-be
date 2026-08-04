import masterAuthDB from "../../config/masterAuthDB.js";
import { getDB } from "../../config/dbFactory.js";
import { getOrganisationById } from "../../auth/models/organisation.model.js";
import * as model from "../models/forms.model.js";

/**
 * LIST FORMS
 */
/**
 * GET FORM RESPONSES (ADMIN)
 */
export const getFormResponsesService = async (organisationId, formId) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);

    if (!org) {
      return { success: false, message: "Organisation not found" };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const form = await model.getFormById(db, schema, formId);
    if (!form) {
      return { success: false, message: "Form not found" };
    }

    const rows = await model.getFormResponses(db, schema, formId);

    const responses = rows.map((row) => {
      let values = row.response_json || {};

      // In case DB returns JSON as a string
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

    if (!org) {
      return { success: false, message: "Organisation not found" };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const rows = await model.getAllForms(db, schema);

    const data = rows.map((row) => ({
      id: String(row.id),
      title: row.title,
      description: row.description || "",
      fields: row.fields_json || [],
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/**
 * GET ONE FORM
 */
export const getFormByIdService = async (organisationId, formId) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);

    if (!org) {
      return { success: false, message: "Organisation not found" };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const row = await model.getFormById(db, schema, formId);

    if (!row) {
      return { success: false, message: "Form not found" };
    }

    return {
      success: true,
      data: {
        id: String(row.id),
        title: row.title,
        description: row.description || "",
        fields: row.fields_json || [],
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/**
 * CREATE FORM
 */
export const createFormService = async (organisationId, payload, userId) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);

    if (!org) {
      return { success: false, message: "Organisation not found" };
    }

    if (!payload.title?.trim()) {
      return { success: false, message: "Title is required" };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const row = await model.createForm(db, schema, {
      title: payload.title.trim(),
      description: payload.description || null,
      fields_json: payload.fields || [],
      created_by: userId || null,
    });

    return {
      success: true,
      message: "Form created successfully",
      data: {
        id: String(row.id),
        title: row.title,
        description: row.description || "",
        fields: row.fields_json || [],
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/**
 * UPDATE FORM
 */
export const updateFormService = async (organisationId, formId, payload) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);

    if (!org) {
      return { success: false, message: "Organisation not found" };
    }

    if (!payload.title?.trim()) {
      return { success: false, message: "Title is required" };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const row = await model.updateForm(db, schema, formId, {
      title: payload.title.trim(),
      description: payload.description || null,
      fields_json: payload.fields || [],
    });

    if (!row) {
      return { success: false, message: "Form not found" };
    }

    return {
      success: true,
      message: "Form updated successfully",
      data: {
        id: String(row.id),
        title: row.title,
        description: row.description || "",
        fields: row.fields_json || [],
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/**
 * DELETE FORM
 */
export const deleteFormService = async (organisationId, formId) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);

    if (!org) {
      return { success: false, message: "Organisation not found" };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const row = await model.deleteForm(db, schema, formId);

    if (!row) {
      return { success: false, message: "Form not found" };
    }

    return {
      success: true,
      message: "Form deleted successfully",
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
export const getPublicFormService = async (orgId, formId) => {
  try {
    console.log("getPublicFormService input:", { orgId, formId });

    const org = await getOrganisationById(masterAuthDB, Number(orgId));

    console.log("org result:", org);

    if (!org) {
      return { success: false, message: "Organisation not found" };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const row = await model.getFormById(db, schema, Number(formId));

    if (!row) {
      return { success: false, message: "Form not found" };
    }

    return {
      success: true,
      data: {
        id: String(row.id),
        title: row.title,
        description: row.description || "",
        fields: row.fields_json || [],
      },
    };
  } catch (err) {
    console.error("getPublicFormService error:", err);
    return { success: false, message: err.message };
  }
};

export const submitPublicFormService = async (orgId, formId, values) => {
  try {
    const org = await getOrganisationById(masterAuthDB, Number(orgId));

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const form = await model.getFormById(db, schema, Number(formId));

    if (!form) {
      return {
        success: false,
        message: "Form not found",
      };
    }

    // SAVE RESPONSE
    await model.insertFormResponse(
      db,
      schema,
      Number(formId),
      values
    );

    return {
      success: true,
      message: "Response submitted successfully",
    };
  } catch (err) {
    console.log(err);

    return {
      success: false,
      message: err.message,
    };
  }
};