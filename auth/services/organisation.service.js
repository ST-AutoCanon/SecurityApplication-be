import masterAuthDB from "../../config/masterAuthDB.js";
import * as model from "../models/organisation.model.js";

import hospitalDB from "../../config/dborghospital.js";
import apartmentDB from "../../config/dborgap.js";
import eventDB from "../../config/dborgevent.js"; // adjust if needed
import { createTemplateTables } from "../../utils/createTemplateTables.js";
import { sendSecurityInvitation } from "../services/mail.service.js";
import { createSystemTables } from "../utils/createSystemTables.js";
/* ---------------------------
   GET DB BY ORG TYPE
----------------------------*/
const getDB = (orgType) => {
  const type = (orgType || "").toUpperCase();

  switch (type) {
    case "HOSPITAL":
      return hospitalDB;

    case "APARTMENT":
      return apartmentDB;

    case "EVENT":
      return eventDB;

    default:
      throw new Error(`Invalid org type: ${orgType}`);
  }
};

/* ---------------------------
   CREATE ORGANISATION
----------------------------*/
export const registerOrganisation = async (organisationData, admin) => {
  const { org_name, org_type } = organisationData;

  if (!org_name || !org_type) {
    return {
      success: false,
      message: "org_name, org_type required",
    };
  }

  if (!admin?.first_name || !admin?.email) {
    return {
      success: false,
      message: "Admin details required",
    };
  }

  const client = await masterAuthDB.connect();

  try {
    await client.query("BEGIN");

    // schema name
    const lastId = await model.getLastOrgId(client);
    const nextId = lastId + 1;
    const schemaName = `org_${String(nextId).padStart(3, "0")}`;

    // create org in master DB
    const organisation = await model.createOrganisation(client, {
      ...organisationData,
      schema_name: schemaName,
    });

    // create admin

    const adminUser = await model.createOrgAdmin(
      client,
      organisation.id,
      admin,
    );

    console.log("✅ Admin created:", adminUser);

    const securityUsers = await model.createOrgSecurityUsers(
      client,
      organisation.id,
      organisationData.security_users || [],
    );

    await client.query("COMMIT");


    await sendSecurityInvitation({
  email: adminUser.email,
  firstName: adminUser.first_name,
  token: adminUser.invitation_token,
});
    for (const user of securityUsers) {
      await sendSecurityInvitation({
        email: user.email,
        firstName: user.first_name,
        token: user.invitation_token,
      });
    }

    const db = getDB(org_type);

    const safeSchema = schemaName.replace(/[^a-zA-Z0-9_]/g, "");

    await db.query(`CREATE SCHEMA IF NOT EXISTS "${safeSchema}"`);

    // 2. system tables (NEW)
    await createSystemTables(db, safeSchema);

    /* -----------------------------------
       CREATE SCHEMA IN BUSINESS DB
    ------------------------------------*/

    return {
      success: true,
      message: "Organisation and schema created successfully",
      data: organisation,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);

    return {
      success: false,
      message: "Organisation creation failed",
    };
  } finally {
    client.release();
  }
};

export const updateOrganisationService = async (id, organisationData) => {
  const client = await masterAuthDB.connect();

  try {
    await client.query("BEGIN");

    const org = await model.getOrganisationById(client, id);

    if (!org) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "Organisation not found",
      };
    }

    // if (organisationData.admin?.email) {
    //   const existingUser = await model.getUserByOrgAndEmail(
    //     client,
    //     id,
    //     organisationData.admin.email,
    //   );

    //   if (existingUser) {
    //     await client.query("ROLLBACK");

    //     return {
    //       success: false,
    //       message: "Admin email already exists in this organisation",
    //     };
    //   }
    // }

    const organisation = await model.updateOrganisation(
      client,
      id,
      organisationData,
    );

    await client.query("COMMIT");

    return {
      success: true,
      message: "Organisation updated successfully",
      data: organisation,
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

/* Get All Organisations */
export const listOrganisations = async () => {
  const organisations = await model.getOrganisations();

  return {
    success: true,
    data: organisations,
  };
};

/* Get Single Organisation */
export const getSingleOrganisation = async (id) => {
  const client = await masterAuthDB.connect();

  try {
    const organisation = await model.getOrganisationById(client, id);

    if (!organisation) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    return {
      success: true,
      data: organisation,
    };
  } catch (error) {
    console.error("Get Organisation Error:", error);

    return {
      success: false,
      message: "Failed to fetch organisation",
    };
  } finally {
    client.release();
  }
};

export const deleteOrganisationService = async (id) => {
  const client = await masterAuthDB.connect();

  try {
    await client.query("BEGIN");

    const organisation = await model.getOrganisationForDelete(client, id);

    if (!organisation) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "Organisation not found",
      };
    }

    // Delete users
    await model.deleteOrganisationUsers(client, organisation.id);

    // Delete organisation
    const deletedOrg = await model.deleteOrganisationById(
      client,
      organisation.id,
    );

    await client.query("COMMIT");

    /* -----------------------------------
       DROP SCHEMA AFTER COMMIT
    ------------------------------------ */

    try {
      const db = getDB(organisation.org_type);

      const safeSchema = organisation.schema_name.replace(/[^a-zA-Z0-9_]/g, "");

      await db.query(`
        DROP SCHEMA IF EXISTS "${safeSchema}" CASCADE
      `);
    } catch (schemaError) {
      console.error("Schema deletion failed:", schemaError);
    }

    return {
      success: true,
      message: "Organisation deleted successfully",
      data: deletedOrg,
    };
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Delete Organisation Error:", error);

    return {
      success: false,
      message: error.message,
    };
  } finally {
    client.release();
  }
};

/* Get Org Codes */
export const fetchAllOrganisations = async () => {
  const data = await model.getAllOrganisations();

  return {
    success: true,
    data,
  };
};

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

    const users = await model.createOrgSecurityUsers(client, organisationId, [
      securityData,
    ]);

    await client.query("COMMIT");

    await sendSecurityInvitation({
      email: users[0].email,
      firstName: users[0].first_name,
      token: users[0].invitation_token,
    });

    return {
      success: true,
      message: "Security user created successfully",
      data: users[0],
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
