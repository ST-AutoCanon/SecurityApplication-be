import { getBusinessDB } from "../../db/dbRouter.js";
import * as model from "../models/vendorsServiceProviders.model.js";


/*
|--------------------------------------------------------------------------
| ORGANISATION SCHEMA
|--------------------------------------------------------------------------
*/

const getOrganisationSchema = (organisationId) => {
  return `org_${String(organisationId).padStart(3, "0")}`;
};


/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

export const createVendorServiceProvider = async (
  req,
  res
) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    if (!organisationId) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation ID not found in authentication token",
      });
    }

    if (!orgType) {
      return res.status(400).json({
        success: false,
        message:
          "Organisation type not found in authentication token",
      });
    }

    const {
      category,
      name,
      description = "",
      services = "",
      rating = 0,
      reviewCount = 0,
      phone = "",
    } = req.body;

    if (!category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vendor / service provider name is required",
      });
    }

    const schemaName =
      getOrganisationSchema(organisationId);

    console.log(
      "======================================"
    );
    console.log(
      "CREATE VENDOR / SERVICE PROVIDER"
    );
    console.log(
      "Organisation ID:",
      organisationId
    );
    console.log(
      "Organisation Type:",
      orgType
    );
    console.log(
      "Schema:",
      schemaName
    );

    const businessDB =
      getBusinessDB(orgType);

    client = await businessDB.connect();

    const createdBy =
      req.user?.user_id ||
      req.user?.id ||
      null;

    const data =
      await model.createVendorServiceProvider(
        client,
        schemaName,
        organisationId,
        category.trim(),
        name.trim(),
        description.trim(),
        services.trim(),
        Number(rating) || 0,
        Number(reviewCount) || 0,
        phone.trim(),
        createdBy
      );

    return res.status(201).json({
      success: true,
      message:
        "Vendor / service provider created successfully",
      data,
    });

  } catch (error) {
    console.error(
      "CREATE VENDOR SERVICE PROVIDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create vendor / service provider",
      error: error.message,
    });

  } finally {
    if (client) {
      client.release();
    }
  }
};


/*
|--------------------------------------------------------------------------
| ADMIN LIST
|--------------------------------------------------------------------------
*/

export const getAdminVendorServiceProviders = async (
  req,
  res
) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    if (!organisationId || !orgType) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication information missing",
      });
    }

    const schemaName =
      getOrganisationSchema(organisationId);

    const businessDB =
      getBusinessDB(orgType);

    client = await businessDB.connect();

    const data =
      await model.getAdminVendorServiceProviders(
        client,
        schemaName,
        organisationId
      );

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(
      "GET ADMIN VENDOR SERVICE PROVIDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch vendor / service providers",
      error: error.message,
    });

  } finally {
    if (client) {
      client.release();
    }
  }
};


/*
|--------------------------------------------------------------------------
| USER LIST
|--------------------------------------------------------------------------
*/

export const getUserVendorServiceProviders = async (
  req,
  res
) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    console.log(
      "======================================"
    );
    console.log(
      "USER VENDORS / SERVICE PROVIDERS"
    );
    console.log(
      "Organisation ID:",
      organisationId
    );
    console.log(
      "Organisation Type:",
      orgType
    );

    if (!organisationId) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation ID not found in authentication token",
      });
    }

    if (!orgType) {
      return res.status(400).json({
        success: false,
        message:
          "Organisation type not found in authentication token",
      });
    }

    const schemaName =
      getOrganisationSchema(organisationId);

    console.log(
      "Vendor Schema:",
      schemaName
    );

    const businessDB =
      getBusinessDB(orgType);

    client = await businessDB.connect();

    console.log("Business DB connected");

    const data =
      await model.getUserVendorServiceProviders(
        client,
        schemaName,
        organisationId
      );

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(
      "GET USER VENDOR SERVICE PROVIDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch vendor / service providers",
      error: error.message,
    });

  } finally {
    if (client) {
      client.release();
    }
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/

export const updateVendorServiceProvider = async (
  req,
  res
) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    const { id } = req.params;

    const {
      category,
      name,
      description = "",
      services = "",
      rating = 0,
      reviewCount = 0,
      phone = "",
    } = req.body;

    if (!organisationId || !orgType) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication information missing",
      });
    }

    if (!category?.trim() || !name?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Category and name are required",
      });
    }

    const schemaName =
      getOrganisationSchema(organisationId);

    const businessDB =
      getBusinessDB(orgType);

    client = await businessDB.connect();

    const data =
      await model.updateVendorServiceProvider(
        client,
        schemaName,
        organisationId,
        id,
        category.trim(),
        name.trim(),
        description.trim(),
        services.trim(),
        Number(rating) || 0,
        Number(reviewCount) || 0,
        phone.trim()
      );

    if (!data) {
      return res.status(404).json({
        success: false,
        message:
          "Vendor / service provider not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Vendor / service provider updated successfully",
      data,
    });

  } catch (error) {
    console.error(
      "UPDATE VENDOR SERVICE PROVIDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update vendor / service provider",
      error: error.message,
    });

  } finally {
    if (client) {
      client.release();
    }
  }
};


/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

export const deleteVendorServiceProvider = async (
  req,
  res
) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    const { id } = req.params;

    const schemaName =
      getOrganisationSchema(organisationId);

    const businessDB =
      getBusinessDB(orgType);

    client = await businessDB.connect();

    const data =
      await model.deleteVendorServiceProvider(
        client,
        schemaName,
        organisationId,
        id
      );

    if (!data) {
      return res.status(404).json({
        success: false,
        message:
          "Vendor / service provider not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Vendor / service provider deleted successfully",
    });

  } catch (error) {
    console.error(
      "DELETE VENDOR SERVICE PROVIDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete vendor / service provider",
      error: error.message,
    });

  } finally {
    if (client) {
      client.release();
    }
  }
};


/*
|--------------------------------------------------------------------------
| TOGGLE ACTIVE / INACTIVE
|--------------------------------------------------------------------------
*/

export const toggleVendorServiceProvider = async (
  req,
  res
) => {
  let client;

  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    const { id } = req.params;

    const schemaName =
      getOrganisationSchema(organisationId);

    const businessDB =
      getBusinessDB(orgType);

    client = await businessDB.connect();

    const data =
      await model.toggleVendorServiceProvider(
        client,
        schemaName,
        organisationId,
        id
      );

    if (!data) {
      return res.status(404).json({
        success: false,
        message:
          "Vendor / service provider not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Status updated successfully",
      data,
    });

  } catch (error) {
    console.error(
      "TOGGLE VENDOR SERVICE PROVIDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update status",
      error: error.message,
    });

  } finally {
    if (client) {
      client.release();
    }
  }
};