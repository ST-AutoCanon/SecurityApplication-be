import masterAuthDB from "../../config/masterAuthDB.js";
import * as model from "../models/dynamicTable.model.js";
import { getBusinessDB } from "../../db/dbRouter.js";

const isSafeName = (name) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);

export const syncTemplateToBusinessDB = async (organisationId, templateId) => {
  const client = await masterAuthDB.connect();

  try {
    const organisation = await model.getOrganisation(client, organisationId);

    if (!organisation) {
      throw new Error("Organisation not found");
    }

    const templateFields = await model.getTemplateFields(client, templateId);

    const tables = await model.getDynamicTablesByTemplate?.(client, templateId);

    if (!tables || tables.length === 0) {
      return {
        success: true,
        message: "No dynamic tables to sync",
      };
    }

    const businessDB = getBusinessDB(organisation.org_type);

    const results = [];

    for (const table of tables) {
      const existingColumns = await model.getExistingTableColumns(
        businessDB,
        organisation.schema_name,
        table.table_name,
      );

      const existingSet = new Set(existingColumns);

      const newFields = templateFields.filter(
        (f) => !existingSet.has(f.field_key),
      );

      if (newFields.length === 0) continue;

      for (const field of newFields) {
        if (!isSafeName(field.field_key)) continue;

        await businessDB.query(`
          ALTER TABLE ${organisation.schema_name}.${table.table_name}
          ADD COLUMN IF NOT EXISTS ${field.field_key} ${field.sql_type};
        `);
      }

      results.push({
        table: table.table_name,
        added: newFields.map((f) => f.field_key),
      });
    }

    return {
      success: true,
      message: "Sync completed",
      results,
    };
  } catch (error) {
    console.error("SYNC ERROR:", error);
    return {
      success: false,
      message: error.message,
    };
  } finally {
    client.release();
  }
};
