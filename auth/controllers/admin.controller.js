import * as service from "../services/admin.service.js";
import {
  fetchAllDeliveryPersons,
  fetchAllBusinessData,
} from "../services/admin.service.js";

import { getBusinessDB } from "../../db/dbRouter.js";

import masterAuthDB from "../../config/masterAuthDB.js";
export const createSecurityUser = async (req, res) => {
  try {
    const organisationId = req.user.organisation_id;

    if (!organisationId) {
      return res.status(403).json({
        success: false,
        message: "Organisation not found for logged in admin",
      });
    }

    const result = await service.createSecurityUserService(
      organisationId,
      req.body,
    );

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("Create Security User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// admin.controller.js

export const getAllDeliveryPersons = async (req, res) => {
  const client = await firstDB.connect();

  try {
    const data = await fetchAllDeliveryPersons(client);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    client.release();
  }
};


export const getAllBusinessData = async (req, res) => {
  const organisationId = req.user.organisation_id;
  const orgType = req.user.org_type?.toLowerCase();

  const businessDB = getBusinessDB(orgType);

  const businessClient = await businessDB.connect();
  const authClient = await masterAuthDB.connect();

  try {
    console.log("Org Type:", orgType);
    console.log("Organisation ID:", organisationId);

    const data = await fetchAllBusinessData(
      businessClient,
      authClient,
      organisationId,
    );

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    businessClient.release();
    authClient.release();
  }
};