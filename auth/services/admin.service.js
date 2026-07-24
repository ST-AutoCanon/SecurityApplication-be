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

    sendSecurityInvitation({
      email: user.email,
      firstName: user.first_name,
      token: user.invitation_token,
    }).catch((err) => {
      console.error("Failed to send invitation:", err);
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

export const fetchAllBusinessData = async (
  businessClient,
  authClient,
  organisationId,
) => {
  // console.log("👉 organisationId:", organisationId);

  const org = await model.getOrganisationSchema(authClient, organisationId);

  // console.log("👉 org result:", org);

  if (!org) {
    throw new Error("Organisation not found");
  }

  const schemaName = org.schema_name;

  // console.log("👉 schemaName:", schemaName);

  const tables = await model.getTables(businessClient, schemaName);

  // console.log("👉 tables:", tables);

  const output = {};

  for (const { table_name } of tables) {
    // console.log("👉 table_name:", table_name);

    try {
      const rows = await model.getTableData(
        businessClient,
        schemaName,
        table_name,
      );

      // console.log("👉 rows count:", rows.length);

      output[table_name] = {
        columns: rows.length ? Object.keys(rows[0]) : [],
        rows,
      };
    } catch (err) {
      console.log("❌ table error:", err.message);
    }
  }

  // console.log("👉 FINAL OUTPUT:", output);

  return output;
};

export const getSecurityUsersService = async (organisationId) => {
  const client = await masterAuthDB.connect();

  try {
    const organisation = await model.getOrganisationById(
      client,
      organisationId,
    );

    if (!organisation) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const users = await model.getSecurityUsers(client, organisationId);

    return {
      success: true,
      message: "Security users fetched successfully",
      data: users,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  } finally {
    client.release();
  }
};

export const getSecurityUserByIdService = async (organisationId, userId) => {
  const client = await masterAuthDB.connect();

  try {
    const user = await model.getSecurityUserById(
      client,
      organisationId,
      userId,
    );

    if (!user) {
      return {
        success: false,
        message: "Security user not found",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  } finally {
    client.release();
  }
};

export const updateSecurityUserService = async (
  organisationId,
  userId,
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

    const updatedUser = await model.updateSecurityUser(
      client,
      organisationId,
      userId,
      securityData,
    );

    if (!updatedUser) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "Security user not found",
      };
    }

    await client.query("COMMIT");

    return {
      success: true,
      message: "Security user updated successfully",
      data: updatedUser,
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

export const deleteSecurityUserService = async (organisationId, userId) => {
  const client = await masterAuthDB.connect();

  try {
    await client.query("BEGIN");

    const deletedUser = await model.deleteSecurityUser(
      client,
      organisationId,
      userId,
    );

    if (!deletedUser) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "Security user not found",
      };
    }

    await client.query("COMMIT");

    return {
      success: true,
      message: "Security user deleted successfully",
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

export const deactivateSecurityUserService = async (organisationId, userId) => {
  const client = await masterAuthDB.connect();

  try {
    await client.query("BEGIN");

    // Check organisation exists
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

    // Deactivate user
    const user = await model.deactivateSecurityUser(
      client,
      organisationId,
      userId,
    );

    if (!user) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "Security user not found",
      };
    }

    await client.query("COMMIT");

    return {
      success: true,
      message: "Security user deactivated successfully",
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

export const activateSecurityUserService = async (organisationId, userId) => {
  const client = await masterAuthDB.connect();

  try {
    await client.query("BEGIN");

    // Check organisation exists
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

    // Activate user
    const user = await model.activateSecurityUser(
      client,
      organisationId,
      userId,
    );

    if (!user) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "Security user not found",
      };
    }

    await client.query("COMMIT");

    return {
      success: true,
      message: "Security user activated successfully",
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