import { getBusinessDB } from "../../db/dbRouter.js";
import masterAuthDB from "../../config/masterAuthDB.js";
import * as model from "../models/Userdashboard.model.js";

import {
  fetchUserVisitorSummary,
  fetchUserVisitorRecords,
  getUserDashboardSummaryService,
} from "../services/Userdashboard.service.js";

/*
 * ============================================================
 * GET USER VISITOR SUMMARY
 * ============================================================
 *
 * GET:
 *
 * /api/user-dashboard/visitor-summary?period=daily
 *
 * Response:
 *
 * {
 *   success: true,
 *   data: {
 *     period: "daily",
 *     total: 5,
 *     categories: [
 *       {
 *         key: "guest",
 *         label: "Guest",
 *         count: 2
 *       }
 *     ]
 *   }
 * }
 *
 * ============================================================
 */

export const getUserVisitorSummary = async (
  req,
  res
) => {
  const organisationId =
    req.user?.organisation_id;

  const orgType =
    req.user?.org_type?.toLowerCase();

  const period =
    req.query.period?.toLowerCase() ||
    "daily";

  let businessClient;
  let authClient;

  try {
    console.log(
      "================================="
    );

    console.log(
      "USER VISITOR SUMMARY REQUEST"
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
      "Period:",
      period
    );

    console.log(
      "================================="
    );

    /*
     * ----------------------------------------------------------
     * Validate organisation
     * ----------------------------------------------------------
     */

    if (!organisationId) {
      return res.status(400).json({
        success: false,
        message:
          "Organisation ID not found",
      });
    }

    /*
     * ----------------------------------------------------------
     * Validate organisation type
     * ----------------------------------------------------------
     */

    if (!orgType) {
      return res.status(400).json({
        success: false,
        message:
          "Organisation type not found",
      });
    }

    /*
     * ----------------------------------------------------------
     * Validate period
     * ----------------------------------------------------------
     */

    const allowedPeriods = [
      "daily",
      "weekly",
      "monthly",
    ];

    if (
      !allowedPeriods.includes(period)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid period. Use daily, weekly or monthly.",
      });
    }

    /*
     * ----------------------------------------------------------
     * Business DB
     * ----------------------------------------------------------
     *
     * apartment -> securityap
     * event     -> securityevents
     * hospital  -> securityhospital
     */

    const businessDB =
      getBusinessDB(orgType);

    businessClient =
      await businessDB.connect();

    /*
     * ----------------------------------------------------------
     * Master Auth DB
     * ----------------------------------------------------------
     *
     * Used for:
     *
     * - organisation schema
     * - dynamic tables
     * - display names
     */

    authClient =
      await masterAuthDB.connect();

    /*
     * ----------------------------------------------------------
     * Fetch summary
     * ----------------------------------------------------------
     */

    const data =
      await fetchUserVisitorSummary(
        businessClient,
        authClient,
        organisationId,
        userId,
        period
      );

    console.log(
      "User Visitor Summary:",
      data
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "getUserVisitorSummary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch visitor summary",
    });
  } finally {
    if (businessClient) {
      businessClient.release();
    }

    if (authClient) {
      authClient.release();
    }
  }
};

/*
 * ============================================================
 * GET USER VISITOR RECORDS
 * ============================================================
 *
 * GET:
 *
 * /api/user-dashboard/visitor-records
 *
 * Query:
 *
 * period=daily
 * category=guest
 * page=1
 * limit=5
 *
 * ============================================================
 */

export const getUserVisitorRecords = async (
  req,
  res
) => {
  const organisationId =
    req.user?.organisation_id;

  const orgType =
    req.user?.org_type?.toLowerCase();

  const period =
    req.query.period?.toLowerCase() ||
    "daily";

  const category =
    req.query.category || "";

  const search =
    req.query.search || "";

const userId =
  req.user?.user_id;
  /*
   * ----------------------------------------------------------
   * Pagination
   * ----------------------------------------------------------
   */

  let page =
    parseInt(req.query.page, 10) || 1;

  let limit =
    parseInt(req.query.limit, 10) || 5;

  /*
   * Prevent invalid pagination values
   */

  if (page < 1) {
    page = 1;
  }

  if (limit < 1) {
    limit = 5;
  }

  /*
   * Prevent unnecessarily large requests
   */

  if (limit > 100) {
    limit = 100;
  }

  let businessClient;
  let authClient;

  try {
    console.log(
      "================================="
    );

    console.log(
      "USER VISITOR RECORDS REQUEST"
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
      "Period:",
      period
    );

    console.log(
      "Category:",
      category
    );

    console.log(
      "Search:",
      search
    );

    console.log(
      "Page:",
      page
    );

    console.log(
      "Limit:",
      limit
    );

    console.log(
      "================================="
    );

    /*
     * ----------------------------------------------------------
     * Validate organisation
     * ----------------------------------------------------------
     */

    if (!organisationId) {
      return res.status(400).json({
        success: false,
        message:
          "Organisation ID not found",
      });
    }
if (!userId) {
  return res.status(401).json({
    success: false,
    message: "User ID not found in authentication token",
  });
}
    /*
     * ----------------------------------------------------------
     * Validate organisation type
     * ----------------------------------------------------------
     */

    if (!orgType) {
      return res.status(400).json({
        success: false,
        message:
          "Organisation type not found",
      });
    }

    /*
     * ----------------------------------------------------------
     * Validate period
     * ----------------------------------------------------------
     */

    const allowedPeriods = [
      "daily",
      "weekly",
      "monthly",
    ];

    if (
      !allowedPeriods.includes(period)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid period. Use daily, weekly or monthly.",
      });
    }

    /*
     * ----------------------------------------------------------
     * Get Business DB
     * ----------------------------------------------------------
     */

    const businessDB =
      getBusinessDB(orgType);

    businessClient =
      await businessDB.connect();

    /*
     * ----------------------------------------------------------
     * Master DB
     * ----------------------------------------------------------
     */

    authClient =
      await masterAuthDB.connect();

    /*
     * ----------------------------------------------------------
     * Fetch records
     * ----------------------------------------------------------
     */

    const result =
      await fetchUserVisitorRecords(
        businessClient,
        authClient,
        organisationId,
        period,
        category,
        search,
        page,
        limit,
        userId,
      );

    console.log(
      "User Visitor Records:",
      result.data?.length || 0
    );

    console.log(
      "Total Visitor Records:",
      result.pagination?.total || 0
    );

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error(
      "getUserVisitorRecords error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch visitor records",
    });
  } finally {
    if (businessClient) {
      businessClient.release();
    }

    if (authClient) {
      authClient.release();
    }
  }
};

export const getUserDashboardSummary = async (
  req,
  res
) => {
  try {
    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type;

    const userId =
      req.user?.user_id;

    console.log(
      "================================="
    );

    console.log(
      "USER DASHBOARD SUMMARY REQUEST"
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
      "User ID:",
      userId
    );

    console.log(
      "User Role:",
      req.user?.role
    );

    console.log(
      "================================="
    );

    /*
     * ----------------------------------------------------------
     * Validate authentication data
     * ----------------------------------------------------------
     */

    if (!organisationId) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation ID not found in authentication token",
      });
    }

    if (!orgType) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation type not found in authentication token",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User ID not found in authentication token",
      });
    }

    /*
     * ----------------------------------------------------------
     * Service
     * ----------------------------------------------------------
     */

    const result =
      await getUserDashboardSummaryService(
        organisationId,
        orgType,
        userId
      );

    return res
      .status(result.success ? 200 : 404)
      .json(result);
  } catch (error) {
    console.error(
      "Get User Dashboard Summary Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// import { getBusinessDB } from "../../db/dbRouter.js";
// import * as model from "../models/announcement.model.js";

/*
|--------------------------------------------------------------------------
| GET ORGANISATION SCHEMA
|--------------------------------------------------------------------------
*/

const getOrganisationSchema = (organisationId) => {
  return `org_${String(organisationId).padStart(3, "0")}`;
};

/*
|--------------------------------------------------------------------------
| GET USER ANNOUNCEMENTS
|--------------------------------------------------------------------------
*/

export const getUserAnnouncements = async (
  req,
  res
) => {
  let client;

  try {
    console.log("=================================");
    console.log("GET USER ANNOUNCEMENTS");
    console.log("=================================");

    const organisationId =
      req.user?.organisation_id;

    const orgType =
      req.user?.org_type?.toLowerCase();

    console.log(
      "Organisation ID:",
      organisationId
    );

    console.log(
      "Organisation Type:",
      orgType
    );

    console.log(
      "User:",
      req.user
    );

    /*
    |--------------------------------------------------------------------------
    | VALIDATE AUTHENTICATION DATA
    |--------------------------------------------------------------------------
    */

    if (!organisationId) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation ID not found in authentication token",
      });
    }

    if (!orgType) {
      return res.status(401).json({
        success: false,
        message:
          "Organisation type not found in authentication token",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ORGANISATION SCHEMA
    |--------------------------------------------------------------------------
    */

    const schemaName =
      getOrganisationSchema(
        organisationId
      );

    console.log(
      "Announcement Schema:",
      schemaName
    );

    /*
    |--------------------------------------------------------------------------
    | BUSINESS DATABASE
    |--------------------------------------------------------------------------
    */

    const businessDB =
      getBusinessDB(orgType);

    client =
      await businessDB.connect();

    console.log(
      "Business DB connected"
    );

    /*
    |--------------------------------------------------------------------------
    | GET ANNOUNCEMENTS
    |--------------------------------------------------------------------------
    */

    const announcements =
      await model.getUserAnnouncements(
        client,
        schemaName,
        organisationId
      );

    console.log(
      "Announcements found:",
      announcements.length
    );

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error(
      "GET USER ANNOUNCEMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch announcements",
      error: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};