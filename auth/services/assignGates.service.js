
import masterAuthDB from "../../config/masterAuthDB.js";
import { getBusinessDB } from "../../db/dbRouter.js";

import * as model from "../models/assignGatesModel.js";
import { getOrganisationSchema } from "../models/admin.model.js";

// Get all assign gates
export const getAssignGatesService = async (
  organisationId,
  orgType,
) => {
  const businessDB = getBusinessDB(orgType.toLowerCase());

  const businessClient = await businessDB.connect();
  const authClient = await masterAuthDB.connect();

  try {
    const organisation = await getOrganisationSchema(
      authClient,
      organisationId,
    );

    if (!organisation) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const gates = await model.getAssignGates(
      businessClient,
      organisation.schema_name,
    );

    return {
      success: true,
      message: "Assign gates fetched successfully",
      data: gates,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  } finally {
    businessClient.release();
    authClient.release();
  }
};


// Get assign gate by ID
export const getAssignGateByIdService = async (
  organisationId,
  orgType,
  id,
) => {
  const businessDB = getBusinessDB(orgType.toLowerCase());

  const businessClient = await businessDB.connect();
  const authClient = await masterAuthDB.connect();

  try {
    const organisation = await getOrganisationSchema(
      authClient,
      organisationId,
    );

    if (!organisation) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const gate = await model.getAssignGateById(
      businessClient,
      organisation.schema_name,
      id,
    );

    if (!gate) {
      return {
        success: false,
        message: "Assign gate not found",
      };
    }

    return {
      success: true,
      message: "Assign gate fetched successfully",
      data: gate,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  } finally {
    businessClient.release();
    authClient.release();
  }
};


// Create assign gate
export const createAssignGateService = async (
  organisationId,
  orgType,
  name,
) => {
  const businessDB = getBusinessDB(orgType.toLowerCase());

  const businessClient = await businessDB.connect();
  const authClient = await masterAuthDB.connect();

  try {
    await businessClient.query("BEGIN");

    const organisation = await getOrganisationSchema(
      authClient,
      organisationId,
    );

    if (!organisation) {
      await businessClient.query("ROLLBACK");

      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const gate = await model.createAssignGate(
      businessClient,
      organisation.schema_name,
      name,
    );

    await businessClient.query("COMMIT");

    return {
      success: true,
      message: "Assign gate created successfully",
      data: gate,
    };
  } catch (error) {
    await businessClient.query("ROLLBACK");

    return {
      success: false,
      message: error.message,
    };
  } finally {
    businessClient.release();
    authClient.release();
  }
};


// Update assign gate
export const updateAssignGateService = async (
  organisationId,
  orgType,
  id,
  name,
) => {
  const businessDB = getBusinessDB(orgType.toLowerCase());

  const businessClient = await businessDB.connect();
  const authClient = await masterAuthDB.connect();

  try {
    await businessClient.query("BEGIN");

    const organisation = await getOrganisationSchema(
      authClient,
      organisationId,
    );

    if (!organisation) {
      await businessClient.query("ROLLBACK");

      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const gate = await model.updateAssignGate(
      businessClient,
      organisation.schema_name,
      id,
      name,
    );

    if (!gate) {
      await businessClient.query("ROLLBACK");

      return {
        success: false,
        message: "Assign gate not found",
      };
    }

    await businessClient.query("COMMIT");

    return {
      success: true,
      message: "Assign gate updated successfully",
      data: gate,
    };
  } catch (error) {
    await businessClient.query("ROLLBACK");

    return {
      success: false,
      message: error.message,
    };
  } finally {
    businessClient.release();
    authClient.release();
  }
};


// Deactivate assign gate
export const deactivateAssignGateService = async (
  organisationId,
  orgType,
  id,
) => {
  const businessDB = getBusinessDB(orgType.toLowerCase());

  const businessClient = await businessDB.connect();
  const authClient = await masterAuthDB.connect();

  try {
    await businessClient.query("BEGIN");

    const organisation = await getOrganisationSchema(
      authClient,
      organisationId,
    );

    if (!organisation) {
      await businessClient.query("ROLLBACK");

      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const gate = await model.deactivateAssignGate(
      businessClient,
      organisation.schema_name,
      id,
    );

    if (!gate) {
      await businessClient.query("ROLLBACK");

      return {
        success: false,
        message: "Assign gate not found",
      };
    }

    await businessClient.query("COMMIT");

    return {
      success: true,
      message: "Assign gate deactivated successfully",
      data: gate,
    };
  } catch (error) {
    await businessClient.query("ROLLBACK");

    return {
      success: false,
      message: error.message,
    };
  } finally {
    businessClient.release();
    authClient.release();
  }
};


// Activate assign gate
export const activateAssignGateService = async (
  organisationId,
  orgType,
  id,
) => {
  const businessDB = getBusinessDB(orgType.toLowerCase());

  const businessClient = await businessDB.connect();
  const authClient = await masterAuthDB.connect();

  try {
    await businessClient.query("BEGIN");

    const organisation = await getOrganisationSchema(
      authClient,
      organisationId,
    );

    if (!organisation) {
      await businessClient.query("ROLLBACK");

      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const gate = await model.activateAssignGate(
      businessClient,
      organisation.schema_name,
      id,
    );

    if (!gate) {
      await businessClient.query("ROLLBACK");

      return {
        success: false,
        message: "Assign gate not found",
      };
    }

    await businessClient.query("COMMIT");

    return {
      success: true,
      message: "Assign gate activated successfully",
      data: gate,
    };
  } catch (error) {
    await businessClient.query("ROLLBACK");

    return {
      success: false,
      message: error.message,
    };
  } finally {
    businessClient.release();
    authClient.release();
  }
};



// Delete assign gate
export const deleteAssignGateService = async (
  organisationId,
  orgType,
  id,
) => {
  const businessDB = getBusinessDB(orgType.toLowerCase());

  const businessClient = await businessDB.connect();
  const authClient = await masterAuthDB.connect();

  try {
    await businessClient.query("BEGIN");

    const organisation = await getOrganisationSchema(
      authClient,
      organisationId,
    );

    if (!organisation) {
      await businessClient.query("ROLLBACK");

      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const gate = await model.deleteAssignGate(
      businessClient,
      organisation.schema_name,
      id,
    );

    if (!gate) {
      await businessClient.query("ROLLBACK");

      return {
        success: false,
        message: "Assign gate not found",
      };
    }

    await businessClient.query("COMMIT");

    return {
      success: true,
      message: "Assign gate deleted successfully",
      data: gate,
    };
  } catch (error) {
    await businessClient.query("ROLLBACK");

    return {
      success: false,
      message: error.message,
    };
  } finally {
    businessClient.release();
    authClient.release();
  }
};