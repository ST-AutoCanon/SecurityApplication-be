import masterAuthDB from "../../config/masterAuthDB.js";
import * as model from "../models/admin.model.js";
import { sendSecurityInvitation } from "./mail.service.js";
import {
  getOrganisationSchema,
  getDeliveryPersons,
  getTables,
  getTableData,
} from "../models/admin.model.js";

export const createSecurityUserService = async (
  organisationId,
  securityData,
) => {
  const client = await masterAuthDB.connect();

  try {
    await client.query("BEGIN");

    const organisation = await model.getOrganisationById(
      client,
      organisationId,
    );

    if (!organisation) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const existingUser = await model.getUserByOrgAndEmail(
      client,
      organisationId,
      securityData.email,
    );

    if (existingUser) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "Email already exists in this organisation",
      };
    }

    const user = await model.createSecurityUser(
      client,
      organisationId,
      securityData,
    );

    await client.query("COMMIT");

    await sendSecurityInvitation({
      email: user.email,
      firstName: user.first_name,
      token: user.invitation_token,
    });

    return {
      success: true,
      message: "Security user created successfully",
      data: user,
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

// admin.service.js

export const fetchAllDeliveryPersons = async (client) => {
  const schemas = await getOrganisationSchemas(client);

  let deliveryPersons = [];

  for (const schema of schemas) {
    try {
      const persons = await getDeliveryPersons(client, schema.schema_name);

      deliveryPersons.push(...persons);
    } catch (err) {
      // Ignore if delivery_person table doesn't exist
      console.log(`Skipping ${schema.schema_name}: ${err.message}`);
    }
  }

  return {
    columns: Object.keys(deliveryPersons[0] ?? {}),
    data: deliveryPersons,
  };
};

// export const fetchAllBusinessData = async (client) => {

//   const schemas = await getOrganisationSchemas(client);

//   const output = {};

//   for (const { schema_name } of schemas) {
//     const tables = await getTables(client, schema_name);

//     for (const { table_name } of tables) {
//       try {
//         const rows = await getTableData(client, schema_name, table_name);

//         if (!output[table_name]) {
//           output[table_name] = [];
//         }

//         output[table_name].push(...rows);
//       } catch (err) {
//         console.log(err.message);
//       }
//     }
//   }

//   const result = {};

//   for (const tableName in output) {
//     result[tableName] = {
//       columns: Object.keys(output[tableName][0] ?? {}),
//       rows: output[tableName],
//     };
//   }

//   return result;
// };
//////

export const fetchAllBusinessData = async (
  businessClient,
  authClient,
  organisationId,
) => {
  console.log("👉 organisationId:", organisationId);

  const org = await model.getOrganisationSchema(authClient, organisationId);

  console.log("👉 org result:", org);

  if (!org) {
    throw new Error("Organisation not found");
  }

  const schemaName = org.schema_name;

  console.log("👉 schemaName:", schemaName);

  const tables = await model.getTables(businessClient, schemaName);

  console.log("👉 tables:", tables);

  const output = {};

  for (const { table_name } of tables) {
    console.log("👉 table_name:", table_name);

    try {
      const rows = await model.getTableData(
        businessClient,
        schemaName,
        table_name,
      );

      console.log("👉 rows count:", rows.length);

      output[table_name] = {
        columns: rows.length ? Object.keys(rows[0]) : [],
        rows,
      };
    } catch (err) {
      console.log("❌ table error:", err.message);
    }
  }

  console.log("👉 FINAL OUTPUT:", output);

  return output;
};