// import masterAuthDB from "../../config/masterAuthDB.js";
// import * as model from "../models/organisation.model.js";

// import hospitalDB from "../../config/dborghospital.js";
// import apartmentDB from "../../config/dborgap.js";
// import eventDB from "../../config/dborgevent.js"; // adjust if needed
// import { sendSecurityInvitation } from "../services/mail.service.js";
// import { createSystemTables } from "../utils/createSystemTables.js";
// import { createFixedTables } from "../utils/createFixedTables.js";
// import { createTemplateTables } from "../utils/static_templates/createTemplateTables.js";
// // import { createFixedDashboardTable } from "../utils/createFixedDashboardTable.js";


// /* ---------------------------
//    GET DB BY ORG TYPE
// ----------------------------*/
// const getDB = (orgType) => {
//   const type = (orgType || "").toUpperCase();

//   switch (type) {
//     case "HOSPITAL":
//       return hospitalDB;

//     case "APARTMENT":
//       return apartmentDB;

//     case "EVENT":
//       return eventDB;

//     default:
//       throw new Error(`Invalid org type: ${orgType}`);
//   }
// };

// /* ---------------------------
//    CREATE ORGANISATION
// ----------------------------*/
// export const registerOrganisation = async (organisationData, admin) => {
//   const { org_name, org_type } = organisationData;

//   if (!org_name || !org_type) {
//     return {
//       success: false,
//       message: "org_name, org_type required",
//     };
//   }

//   if (!admin?.first_name || !admin?.email) {
//     return {
//       success: false,
//       message: "Admin details required",
//     };
//   }

//   const client = await masterAuthDB.connect();

//   try {
//     await client.query("BEGIN");

//     // schema name
//     const lastId = await model.getLastOrgId(client);
//     const nextId = lastId + 1;
//     const schemaName = `org_${String(nextId).padStart(3, "0")}`;

//     // create org in master DB
//     const organisation = await model.createOrganisation(client, {
//       ...organisationData,
//       schema_name: schemaName,
//     });

//     // create admin

//     const adminUser = await model.createOrgAdmin(
//       client,
//       organisation.id,
//       admin,
//     );

//     console.log("✅ Admin created:", adminUser);

//     const securityUsers = await model.createOrgSecurityUsers(
//       client,
//       organisation.id,
//       organisationData.security_users || [],
//     );

//     await client.query("COMMIT");

//     await sendSecurityInvitation({
//       email: adminUser.email,
//       firstName: adminUser.first_name,
//       token: adminUser.invitation_token,
//     });
//     for (const user of securityUsers) {
//       await sendSecurityInvitation({
//         email: user.email,
//         firstName: user.first_name,
//         token: user.invitation_token,
//       });
//     }

//     const db = getDB(org_type);

//     const safeSchema = schemaName.replace(/[^a-zA-Z0-9_]/g, "");

//     await db.query(`CREATE SCHEMA IF NOT EXISTS "${safeSchema}"`);

//     // 2. system tables (NEW)
//     await createSystemTables(db, safeSchema);

//     // Create organisation-specific tables
//     await createTemplateTables(db, safeSchema, organisation.org_type);
// await createFixedTables(db, safeSchema, organisation.org_type);
// // await createFixedDashboardTable(db, safeSchema, organisation.org_type);


//     /* -----------------------------------
//        CREATE SCHEMA IN BUSINESS DB
//     ------------------------------------*/

//     return {
//       success: true,
//       message: "Organisation and schema created successfully",
//       data: organisation,
//     };
//   } catch (error) {
//     await client.query("ROLLBACK");
//     console.error(error);

//     return {
//       success: false,
//       message: "Organisation creation failed",
//     };
//   } finally {
//     client.release();
//   }
// };

// export const updateOrganisationService = async (id, organisationData) => {
//   const client = await masterAuthDB.connect();

//   try {
//     await client.query("BEGIN");

//     const org = await model.getOrganisationById(client, id);

//     if (!org) {
//       await client.query("ROLLBACK");

//       return {
//         success: false,
//         message: "Organisation not found",
//       };
//     }

//     // if (organisationData.admin?.email) {
//     //   const existingUser = await model.getUserByOrgAndEmail(
//     //     client,
//     //     id,
//     //     organisationData.admin.email,
//     //   );

//     //   if (existingUser) {
//     //     await client.query("ROLLBACK");

//     //     return {
//     //       success: false,
//     //       message: "Admin email already exists in this organisation",
//     //     };
//     //   }
//     // }

//     const organisation = await model.updateOrganisation(
//       client,
//       id,
//       organisationData,
//     );

//     await client.query("COMMIT");

//     return {
//       success: true,
//       message: "Organisation updated successfully",
//       data: organisation,
//     };
//   } catch (error) {
//     await client.query("ROLLBACK");

//     return {
//       success: false,
//       message: error.message,
//     };
//   } finally {
//     client.release();
//   }
// };

// /* Get All Organisations */
// export const listOrganisations = async () => {
//   const organisations = await model.getOrganisations();

//   return {
//     success: true,
//     data: organisations,
//   };
// };

// /* Get Single Organisation */
// export const getSingleOrganisation = async (id) => {
//   const client = await masterAuthDB.connect();

//   try {
//     const organisation = await model.getOrganisationById(client, id);

//     if (!organisation) {
//       return {
//         success: false,
//         message: "Organisation not found",
//       };
//     }

//     return {
//       success: true,
//       data: organisation,
//     };
//   } catch (error) {
//     console.error("Get Organisation Error:", error);

//     return {
//       success: false,
//       message: "Failed to fetch organisation",
//     };
//   } finally {
//     client.release();
//   }
// };

// export const deleteOrganisationService = async (id) => {
//   const client = await masterAuthDB.connect();

//   try {
//     await client.query("BEGIN");

//     const organisation = await model.getOrganisationForDelete(client, id);

//     if (!organisation) {
//       await client.query("ROLLBACK");

//       return {
//         success: false,
//         message: "Organisation not found",
//       };
//     }

//     // Delete users
//     await model.deleteOrganisationUsers(client, organisation.id);

//     // Delete organisation
//     const deletedOrg = await model.deleteOrganisationById(
//       client,
//       organisation.id,
//     );

//     await client.query("COMMIT");

//     /* -----------------------------------
//        DROP SCHEMA AFTER COMMIT
//     ------------------------------------ */

//     try {
//       const db = getDB(organisation.org_type);

//       const safeSchema = organisation.schema_name.replace(/[^a-zA-Z0-9_]/g, "");

//       await db.query(`
//         DROP SCHEMA IF EXISTS "${safeSchema}" CASCADE
//       `);
//     } catch (schemaError) {
//       console.error("Schema deletion failed:", schemaError);
//     }

//     return {
//       success: true,
//       message: "Organisation deleted successfully",
//       data: deletedOrg,
//     };
//   } catch (error) {
//     await client.query("ROLLBACK");

//     console.error("Delete Organisation Error:", error);

//     return {
//       success: false,
//       message: error.message,
//     };
//   } finally {
//     client.release();
//   }
// };

// /* Get Org Codes */
// export const fetchAllOrganisations = async () => {
//   const data = await model.getAllOrganisations();

//   return {
//     success: true,
//     data,
//   };
// };

// export const createSecurityUserService = async (
//   organisationId,
//   securityData,
// ) => {
//   const client = await masterAuthDB.connect();

//   try {
//     await client.query("BEGIN");

//     const organisation = await model.getOrganisationById(
//       client,
//       organisationId,
//     );

//     if (!organisation) {
//       await client.query("ROLLBACK");

//       return {
//         success: false,
//         message: "Organisation not found",
//       };
//     }

//     const existingUser = await model.getUserByOrgAndEmail(
//       client,
//       organisationId,
//       securityData.email,
//     );

//     if (existingUser) {
//       await client.query("ROLLBACK");

//       return {
//         success: false,
//         message: "Email already exists in this organisation",
//       };
//     }

//     const users = await model.createOrgSecurityUsers(client, organisationId, [
//       securityData,
//     ]);

//     await client.query("COMMIT");

//     await sendSecurityInvitation({
//       email: users[0].email,
//       firstName: users[0].first_name,
//       token: users[0].invitation_token,
//     });

//     return {
//       success: true,
//       message: "Security user created successfully",
//       data: users[0],
//     };
//   } catch (error) {
//     await client.query("ROLLBACK");

//     return {
//       success: false,
//       message: error.message,
//     };
//   } finally {
//     client.release();
//   }
// };
import masterAuthDB from "../../config/masterAuthDB.js";
import * as model from "../models/organisation.model.js";

import hospitalDB from "../../config/dborghospital.js";
import apartmentDB from "../../config/dborgap.js";
import eventDB from "../../config/dborgevent.js"; // adjust if needed
import { sendSecurityInvitation } from "../services/mail.service.js";
import { createSystemTables } from "../utils/createSystemTables.js";
import { createFixedTables } from "../utils/createFixedTables.js";
import { createTemplateTables } from "../utils/static_templates/createTemplateTables.js";
//import { createFixedDashboardTable } from "../utils/createFixedDashboardTable.js";
import { createAnnouncementsTable } from "../utils/static_templates/announcementTables.js";

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
// export const registerOrganisation = async (organisationData, admin) => {
//   const { org_name, org_type } = organisationData;

//   if (!org_name || !org_type) {
//     return {
//       success: false,
//       message: "org_name, org_type required",
//     };
//   }

//   if (!admin?.first_name || !admin?.email) {
//     return {
//       success: false,
//       message: "Admin details required",
//     };
//   }

//   const client = await masterAuthDB.connect();

//   try {
//     await client.query("BEGIN");

//     // schema name
//     const lastId = await model.getLastOrgId(client);
//     const nextId = lastId + 1;
//     const schemaName = `org_${String(nextId).padStart(3, "0")}`;

//     // create org in master DB
//     const organisation = await model.createOrganisation(client, {
//       ...organisationData,
//       schema_name: schemaName,
//     });

//     // create admin

//     const adminUser = await model.createOrgAdmin(
//       client,
//       organisation.id,
//       admin,
//     );

//     console.log("✅ Admin created:", adminUser);

//     const securityUsers = await model.createOrgSecurityUsers(
//       client,
//       organisation.id,
//       organisationData.security_users || [],
//     );

//     await client.query("COMMIT");

//     await sendSecurityInvitation({
//       email: adminUser.email,
//       firstName: adminUser.first_name,
//       token: adminUser.invitation_token,
//     });
//     for (const user of securityUsers) {
//       await sendSecurityInvitation({
//         email: user.email,
//         firstName: user.first_name,
//         token: user.invitation_token,
//       });
//     }

//     const db = getDB(org_type);

//     const safeSchema = schemaName.replace(/[^a-zA-Z0-9_]/g, "");

//     await db.query(`CREATE SCHEMA IF NOT EXISTS "${safeSchema}"`);

//     // 2. system tables (NEW)
//     await createSystemTables(db, safeSchema);

//     // Create organisation-specific tables
//     await createTemplateTables(db, safeSchema, organisation.org_type);
// await createFixedTables(db, safeSchema, organisation.org_type);
// //await createFixedDashboardTable(db, safeSchema, organisation.org_type);


//     /* -----------------------------------
//        CREATE SCHEMA IN BUSINESS DB
//     ------------------------------------*/

//     return {
//       success: true,
//       message: "Organisation and schema created successfully",
//       data: organisation,
//     };
//   } catch (error) {
//     await client.query("ROLLBACK");
//     console.error(error);

//     return {
//       success: false,
//       message: "Organisation creation failed",
//     };
//   } finally {
//     client.release();
//   }
// };

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

  const type = org_type.toUpperCase();

  if (!["APARTMENT", "EVENT", "HOSPITAL"].includes(type)) {
    return {
      success: false,
      message: `Invalid org type: ${org_type}`,
    };
  }

  const client = await masterAuthDB.connect();

  let businessDB;
  let schemaName;
  let schemaCreated = false;
  let transactionOpen = false;
  let committed = false;

  try {
    await client.query("BEGIN");
    transactionOpen = true;

    const lastId = await model.getLastOrgId(client);
    const nextId = lastId + 1;
    schemaName = `org_${String(nextId).padStart(3, "0")}`;

    const organisation = await model.createOrganisation(client, {
      ...organisationData,
      org_type: type,
      schema_name: schemaName,
    });

    const adminUser = await model.createOrgAdmin(
      client,
      organisation.id,
      admin,
    );

    const securityUsers = await model.createOrgSecurityUsers(
      client,
      organisation.id,
      organisationData.security_users || [],
    );

    businessDB = getDB(type);

    // Create the schema in the correct business database.
    await businessDB.query(
      `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`
    );
    schemaCreated = true;

    // Create required system and organisation template tables.
    await createSystemTables(businessDB, schemaName);

    await createTemplateTables(
      businessDB,
      schemaName,
      type,
    );

    await createFixedTables(
      businessDB,
      schemaName,
      type,
    );

    // Verify the announcements table for supported organisation types.
    if (["APARTMENT", "EVENT"].includes(type)) {
      const check = await businessDB.query(
        `SELECT to_regclass($1) AS table_name`,
        [`${schemaName}.announcements`],
      );

      if (!check.rows[0]?.table_name) {
        throw new Error(
          `Announcements table was not created in ${schemaName}`
        );
      }
    }

    // Commit only after business schema provisioning succeeds.
    await client.query("COMMIT");
    transactionOpen = false;
    committed = true;

    // Send invitations only after successful provisioning.
    try {
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
    } catch (mailError) {
      // The organisation is already created; email can be retried separately.
      console.error("Organisation created, but invitation email failed:", mailError);
    }

    return {
      success: true,
      message: "Organisation and schema created successfully",
      data: organisation,
    };
  } catch (error) {
    console.error("Organisation creation/provisioning failed:", error);

    if (transactionOpen) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Master database rollback failed:", rollbackError);
      }
    }

    // Best-effort cleanup if provisioning failed before commit.
    if (schemaCreated && !committed && businessDB && schemaName) {
      try {
        await businessDB.query(
          `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`
        );
      } catch (cleanupError) {
        console.error("Failed to clean up organisation schema:", cleanupError);
      }
    }

    return {
      success: false,
      message: "Organisation creation or table provisioning failed",
      error: error.message,
    };
  } finally {
    client.release();
  }
};

/**
 * Repair missing announcements tables in existing organisations.
 *
 * Run this as a one-time, controlled migration.
 * Does not recreate other tables or delete announcement data.
 */
export const migrateExistingAnnouncementTables = async () => {
  const organisations = await model.getOrganisations();
  const results = [];

  for (const organisation of organisations) {
    const type = (organisation.org_type || "").toUpperCase();

    if (!["APARTMENT", "EVENT"].includes(type)) {
      continue;
    }

    const schema = organisation.schema_name;

    if (!schema || !/^[a-zA-Z0-9_]+$/.test(schema)) {
      results.push({
        organisationId: organisation.id,
        success: false,
        message: "Missing or invalid schema name",
      });
      continue;
    }

    try {
      const db = getDB(type);

      await db.query(
        `CREATE SCHEMA IF NOT EXISTS "${schema}"`
      );

      await createAnnouncementsTable(db, schema);

      const check = await db.query(
        `SELECT to_regclass($1) AS table_name`,
        [`${schema}.announcements`],
      );

      if (!check.rows[0]?.table_name) {
        throw new Error(
          `Announcements table missing after creation in ${schema}`
        );
      }

      console.log(
        `[Announcements Migration] Verified ${schema}.announcements`
      );

      results.push({
        organisationId: organisation.id,
        schema,
        success: true,
      });
    } catch (error) {
      console.error(
        `[Announcements Migration] Failed for ${schema}:`,
        error,
      );

      results.push({
        organisationId: organisation.id,
        schema,
        success: false,
        message: error.message,
      });
    }
  }

  return {
    success: results.every((item) => item.success),
    results,
  };
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
