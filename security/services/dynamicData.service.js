import * as model from "../models/dynamicData.model.js";
import masterAuthDB from "../../config/masterAuthDB.js";
import { getDB } from "../../config/dbFactory.js";
import { getOrganisationById } from "../../auth/models/organisation.model.js";
import { getTemplateFields, getTemplate } from "../models/dynamicData.model.js";
import { validatePayload } from "../../utils/dynamicField.validator.js";

export const createRecordService = async (
  organisationId,
  templateId,
  table,
  payload,
) => {
  try {
    // STEP 1: Get organisation
    const org = await getOrganisationById(masterAuthDB, organisationId);

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const schema = org.schema_name;

    // STEP 2: Get Business DB
    const db = getDB(org.org_type);

    // STEP 3: Verify template
    // const template = await getTemplate(masterAuthDB, templateId);
const template = await getTemplate(masterAuthDB, organisationId, templateId); 


    if (!template) {
      return {
        success: false,
        message: "Template not found",
      };
    }

    if (template.table_name !== table) {
      return {
        success: false,
        message: "Invalid table for this template",
      };
    }

    // STEP 4: Get template fields
const allowedFields = await getTemplateFields(
  masterAuthDB,
  organisationId,
  templateId,
);

console.log("Template ID:", templateId);
console.log("Allowed Fields:", allowedFields);
    console.log("Payload:", payload);
    
    // STEP 5: Validate payload
    const validation = validatePayload(allowedFields, payload);

    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
      };
    }

    // STEP 6: Insert record using cleaned payload
    const result = await model.insertDynamicRecord(
      db,
      schema,
      table,
      validation.data,
    );

    return {
      success: true,
      data: result,
    };
  } catch (err) {
    console.error("Create Record Error:", err);

    return {
      success: false,
      message: err.message,
    };
  }
};

export const getAllRecordsService = async (organisationId, table) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);

    console.log("ORG:", org);
    console.log("ORG TYPE:", org.org_type);
    console.log("SCHEMA:", org.schema_name);

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const db = getDB(org.org_type);

    const data = await model.getAllRecords(db, org.schema_name, table);

    return {
      success: true,
      data,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

export const getRecordByIdService = async (organisationId, table, id) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const db = getDB(org.org_type);

    const data = await model.getRecordById(db, org.schema_name, table, id);

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
    return {
      success: false,
      message: err.message,
    };
  }
};

export const updateRecordService = async (
  organisationId,
  table,
  id,
  payload,
) => {
  try {
    // STEP 1: Get organisation
    const org = await getOrganisationById(masterAuthDB, organisationId);

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    // STEP 2: Get Business DB
    const db = getDB(org.org_type);

    // STEP 3: Check record exists
    const existingRecord = await model.getRecordById(
      db,
      org.schema_name,
      table,
      id,
    );

    if (!existingRecord) {
      return {
        success: false,
        message: "Record not found",
      };
    }

    // STEP 4: Update record
    const updatedRecord = await model.updateDynamicRecord(
      db,
      org.schema_name,
      table,
      id,
      payload,
    );

    return {
      success: true,
      data: updatedRecord,
    };
  } catch (err) {
    console.error("Update Record Error:", err);

    return {
      success: false,
      message: err.message,
    };
  }
};

export const deleteRecordService = async (organisationId, table, id) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const db = getDB(org.org_type);

    const data = await model.deleteDynamicRecord(
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
    return {
      success: false,
      message: err.message,
    };
  }
};

export const getTemplateMetadataService = async (
  organisationId,
  templateId,
) => {
  // Check organisation exists
  const org = await getOrganisationById(masterAuthDB, organisationId);

  if (!org) {
    return {
      success: false,
      message: "Organisation not found",
    };
  }

  // Get template details for this organisation
  const template = await model.getTemplate(
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

  // Get template fields
  // const fields = await model.getTemplateFields(masterAuthDB, templateId);
const fields = await model.getTemplateFields(
  masterAuthDB,
  organisationId,
  templateId,
  );
  
  return {
    success: true,
    data: {
      table: template.table_name,
      templateName: template.template_name,
      displayName: template.display_name,
      fields,
    },
  };
};

export const getModulesService = async (organisationId) => {
  const org = await getOrganisationById(masterAuthDB, organisationId);

  if (!org) {
    return {
      success: false,
      message: "Organisation not found",
    };
  }

  const modules = await model.getModules(masterAuthDB, organisationId);

  return {
    success: true,
    data: modules,
  };
};

export const getModuleDetailsService = async (organisationId, templateId) => {
  // Check organisation exists
  const org = await getOrganisationById(masterAuthDB, organisationId);

  if (!org) {
    return {
      success: false,
      message: "Organisation not found",
    };
  }

  // Get module/template details
  const template = await model.getTemplateDetails(
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

  // Get template fields
  // const fields = await model.getTemplateFields(masterAuthDB, templateId);
const fields = await model.getTemplateFields(
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
};



