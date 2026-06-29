import format from "pg-format";

import masterAuthDB from "../../config/masterAuthDB.js";

import apartmentDB from "../../config/dborgap.js";
import hospitalDB from "../../config/dborghospital.js";
import eventDB from "../../config/dborgevent.js";

import * as model from "../models/dynamicTable.model.js";

import { buildCreateTableQuery } from "../utils/createDynamicTable.js";
import { syncTemplateToBusinessDB } from "./syncTemplate.service.js";

/* -------------------------------------------------------------------------- */
/*                             GET BUSINESS DB                                */
/* -------------------------------------------------------------------------- */

const getDB = (orgType) => {
  switch ((orgType || "").toUpperCase()) {
    case "APARTMENT":
      return apartmentDB;

    case "HOSPITAL":
      return hospitalDB;

    case "EVENT":
      return eventDB;

    default:
      throw new Error(`Unsupported organisation type: ${orgType}`);
  }
};

/* -------------------------------------------------------------------------- */
/*                              GET TEMPLATES                                 */
/* -------------------------------------------------------------------------- */

export const getTemplatesService = async () => {
  const templates = await model.getTemplates();

  return {
    success: true,
    data: templates,
  };
};

/* -------------------------------------------------------------------------- */
/*                           GET TEMPLATE FIELDS                              */
/* -------------------------------------------------------------------------- */

export const getTemplateFieldsService = async (templateId) => {
  const client = await masterAuthDB.connect();

  try {
    const template = await model.getTemplateById(client, templateId);

    if (!template) {
      return {
        success: false,
        message: "Template not found",
      };
    }

    const fields = await model.getTemplateFields(client, templateId);

    return {
      success: true,
      data: fields,
    };
  } finally {
    client.release();
  }
};

/* -------------------------------------------------------------------------- */
/*                         CREATE DYNAMIC TABLE                               */
/* -------------------------------------------------------------------------- */

export const createDynamicTableService = async (payload) => {
  const client = await masterAuthDB.connect();

  try {
    await client.query("BEGIN");

    const organisation = await model.getOrganisation(
      client,
      payload.organisationId,
    );

    if (!organisation) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const template = await model.getTemplateById(client, payload.templateId);

    if (!template) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "Template not found",
      };
    }

    const duplicate = await model.getDynamicTableByName(
      client,
      payload.organisationId,
      payload.tableName,
    );

    if (duplicate) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "Table already exists",
      };
    }

    const templateFields = await model.getTemplateFields(
      client,
      payload.templateId,
    );

    const selectedFields = templateFields.filter((field) =>
      payload.fields.includes(field.field_key),
    );
    console.log(payload.fields);
    if (!selectedFields.length) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "No fields selected",
      };
    }

    const sql = buildCreateTableQuery({
      schemaName: organisation.schema_name,
      tableName: payload.tableName,
      fields: selectedFields,
    });

    const businessDB = getDB(organisation.org_type);

    await businessDB.query(sql);

    const dynamicTable = await model.createDynamicTable(client, {
      organisationId: organisation.id,
      templateId: payload.templateId,
      tableName: payload.tableName,
      displayName: payload.displayName,
      schemaName: organisation.schema_name,
      createdBy: payload.createdBy,
    });

    await model.createDynamicTableFields(
      client,
      dynamicTable.id,
      selectedFields,
    );

    await client.query("COMMIT");

    return {
      success: true,
      message: "Dynamic table created successfully",
      data: dynamicTable,
    };
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    return {
      success: false,
      message: error.message,
    };
  } finally {
    client.release();
  }
};

export const getDynamicTableConfigurationService = async (
  organisationId,
  templateId,
) => {
  const client = await masterAuthDB.connect();

  try {
    const config = await model.getDynamicTableConfiguration(
      client,
      organisationId,
      templateId,
    );

    if (!config.length) {
      return {
        success: true,
        exists: false,
      };
    }

    return {
      success: true,
      exists: true,
      displayName: config[0].display_name,
      selectedFields: config.map((row) => row.field_key),
    };
  } finally {
    client.release();
  }
};


export const updateDynamicTableService = async (payload) => {
  const client = await masterAuthDB.connect();

  try {
    await client.query("BEGIN");

    // -------------------------------------------------
    // 1. Validate organisation
    // -------------------------------------------------
    const organisation = await model.getOrganisation(
      client,
      payload.organisationId,
    );

    if (!organisation) {
      await client.query("ROLLBACK");
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    // -------------------------------------------------
    // 2. Get template + table
    // -------------------------------------------------
    const templateFields = await model.getTemplateFields(
      client,
      payload.templateId,
    );

    const existingTable = await model.getDynamicTableByName(
      client,
      payload.organisationId,
      payload.tableName,
    );

    if (!existingTable) {
      await client.query("ROLLBACK");
      return {
        success: false,
        message: "Dynamic table not found",
      };
    }

    // -------------------------------------------------
    // 3. Resolve selected field objects
    // -------------------------------------------------
    const selectedFields = templateFields.filter((field) =>
      payload.fields.includes(field.field_key),
    );

    if (!selectedFields.length) {
      await client.query("ROLLBACK");
      return {
        success: false,
        message: "No valid fields selected",
      };
    }

    const selectedFieldKeys = selectedFields.map((f) => f.field_key);

    // -------------------------------------------------
    // 4. Get business DB + existing columns
    // -------------------------------------------------
    const businessDB = getDB(organisation.org_type);

    const existingColumns = await model.getExistingTableColumns(
      businessDB,
      organisation.schema_name,
      payload.tableName,
    );

    const SYSTEM_COLUMNS = new Set(["id"]);

    const existingSet = new Set(existingColumns);

    const selectedSet = new Set(selectedFieldKeys);

    // -------------------------------------------------
    // 5. Git-style DIFF ENGINE
    // -------------------------------------------------

    const toAdd = selectedFieldKeys.filter((f) => !existingSet.has(f));

    const toRemove = existingColumns.filter(
      (col) => !SYSTEM_COLUMNS.has(col) && !selectedSet.has(col),
    );

    // -------------------------------------------------
    // 6. If no changes → exit early
    // -------------------------------------------------
    if (toAdd.length === 0 && toRemove.length === 0) {
      await client.query("COMMIT");

      return {
        success: true,
        message: "No schema changes required",
        addedFields: [],
        removedFields: [],
      };
    }

    // -------------------------------------------------
    // 7. Helpers
    // -------------------------------------------------
    const isSafeName = (name) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);

    const ALLOWED_TYPES = new Set([
      "text",
      "integer",
      "boolean",
      "timestamp",
      "varchar",
      "jsonb",
      "array",
      "date",
      "bigint",
      "numeric",
      "double precision",
      "double precision[]",
    ]);

    const addedFields = [];
    const removedFields = [];

    // -------------------------------------------------
    // 8. ADD new columns (only new ones)
    // -------------------------------------------------
    for (const fieldKey of toAdd) {
      const field = templateFields.find((f) => f.field_key === fieldKey);

      if (!field) continue;

      if (!isSafeName(field.field_key)) {
        throw new Error(`Invalid field name: ${field.field_key}`);
      }

      const type = field.sql_type.trim().toLowerCase();

      const validType =
        ALLOWED_TYPES.has(type) || /^varchar\(\d+\)$/i.test(type);

      if (!validType) {
        throw new Error(`Invalid SQL type: ${field.sql_type}`);
      }

      const alterQuery = format(
        `ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS %I %s`,
        organisation.schema_name,
        payload.tableName,
        field.field_key,
        field.sql_type,
      );

      await businessDB.query(alterQuery);

      addedFields.push(field.field_key);
    }

    // -------------------------------------------------
    // 9. REMOVE columns (only removed ones)
    // -------------------------------------------------
    for (const column of toRemove) {
      if (!isSafeName(column)) {
        throw new Error(`Invalid column name: ${column}`);
      }

      const dropQuery = format(
        `ALTER TABLE %I.%I DROP COLUMN IF EXISTS %I`,
        organisation.schema_name,
        payload.tableName,
        column,
      );

      await businessDB.query(dropQuery);

      removedFields.push(column);
    }

    // -------------------------------------------------
    // 10. UPDATE METADATA (TRUE DIFF FIX)
    // -------------------------------------------------

    // ❌ OLD WRONG LOGIC (removed completely)
    // deleteDynamicTableFields(...actuallyRemoved)
    // createDynamicTableFields(...selectedFields)

    // ✅ NEW CORRECT LOGIC

    // delete only removed mappings
    await model.deleteDynamicTableFields(client, existingTable.id, toRemove);

    // insert only new mappings
    const newFieldObjects = templateFields.filter((f) =>
      toAdd.includes(f.field_key),
    );

    if (newFieldObjects.length > 0) {
      await model.createDynamicTableFields(
        client,
        existingTable.id,
        newFieldObjects,
      );
    }

    // -------------------------------------------------
    // 11. Commit
    // -------------------------------------------------
    await client.query("COMMIT");

    // -------------------------------------------------
    // 12. Sync Business DB
    // -------------------------------------------------
    await syncTemplateToBusinessDB(payload.organisationId, payload.templateId);

    return {
      success: true,
      message: "Dynamic table updated successfully",
      addedFields,
      removedFields,
      skippedFields: payload.fields.filter((f) => !addedFields.includes(f)),
    };
  } catch (error) {
    await client.query("ROLLBACK");

    return {
      success: false,
      message: error.message,
    };
  } finally {
    client.release();
  }
};

export const fetchAllBusinessData = async (client) => {
  const schemas = await getOrganisationSchemas(client);

  const output = {};

  for (const { schema_name } of schemas) {
    const tables = await getTables(client, schema_name);

    for (const { table_name } of tables) {
      try {
        const rows = await getTableData(client, schema_name, table_name);

        if (!output[table_name]) {
          output[table_name] = [];
        }

        output[table_name].push(...rows);
      } catch (err) {
        console.log(err.message);
      }
    }
  }

  const result = {};

  for (const tableName in output) {
    result[tableName] = {
      columns: Object.keys(output[tableName][0] ?? {}),
      rows: output[tableName],
    };
  }

  return result;
};