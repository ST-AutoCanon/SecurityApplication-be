// import {
//   fetchRecentVisitors,
// } from "./Admindashboard.service.js";
import masterAuthDB from "../../config/masterAuthDB.js";
import { getBusinessDB } from "../../db/dbRouter.js";
import * as model from "../models/Userdashboard.model.js";
/*
 * ============================================================
 * NORMALIZE CATEGORY
 * ============================================================
 *
 * This keeps the same dynamic category behaviour used by
 * your Admin Dashboard.
 *
 * Examples:
 *
 * vendor
 * vendor_staff
 * vendor_person
 *
 * -> vendor
 *
 * delivery
 * deliveryperson
 * delivery_person
 *
 * -> delivery_person
 *
 * ============================================================
 */

const normalizeCategory = (
  value
) => {
  if (!value) {
    return "";
  }

  const normalized =
    String(value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

  /*
   * Vendor variants
   */

  if (
    normalized === "vendor" ||
    normalized.startsWith("vendor_") ||
    normalized.startsWith("vendor")
  ) {
    return "vendor";
  }

  /*
   * Delivery variants
   */

  if (
    normalized === "delivery" ||
    normalized === "deliveryperson" ||
    normalized === "delivery_person" ||
    normalized.startsWith("delivery_")
  ) {
    return "delivery_person";
  }

  return normalized;
};

/*
 * ============================================================
 * FORMAT CATEGORY LABEL
 * ============================================================
 */

const fallbackLabel = (
  value
) => {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

/*
 * ============================================================
 * GET ORGANISATION DYNAMIC CATEGORIES
 * ============================================================
 *
 * Reads categories from auth.dynamic_tables.
 *
 * This means:
 *
 * Guest
 * Maid
 * Vendor
 * Delivery Person
 * Visitor
 * Worker
 *
 * etc. are NOT hardcoded.
 *
 * ============================================================
 */

const fetchDynamicCategories = async (
  authClient,
  organisationId
) => {
  const result =
    await authClient.query(
      `
        SELECT
          table_name,
          display_name
        FROM auth.dynamic_tables
        WHERE organisation_id = $1
        ORDER BY id ASC
      `,
      [organisationId]
    );

  const categoryMap =
    new Map();

  for (
    const row of result.rows
  ) {
    const rawKey =
      row.table_name;

    const key =
      normalizeCategory(
        rawKey
      );

    if (!key) {
      continue;
    }

    /*
     * Prefer database display_name.
     */

    const label =
      row.display_name?.trim() ||
      fallbackLabel(
        rawKey
      );

    /*
     * If multiple dynamic tables normalize
     * to the same category, keep the first
     * meaningful display name.
     */

    if (!categoryMap.has(key)) {
      categoryMap.set(
        key,
        {
          key,
          label,
          count: 0,
        }
      );
    }
  }

  return Array.from(
    categoryMap.values()
  );
};


export const fetchRecentVisitors_user = async (
  client,
  organisationId,
  search,
  purpose,
  period,
  userId = null
) => {
  const authClient = await masterAuthDB.connect();

  try {
    const org = await model.getOrganisationSchema(
      authClient,
      organisationId
    );

    if (!org) {
      throw new Error("Organisation not found");
    }

    return await model.getRecentVisitors_user(
      client,
      org.schema_name,
      search,
      purpose,
      period,
      userId
    );
  } finally {
    authClient.release();
  }
};


/*
 * ============================================================
 * GET ALL RECENT VISITORS
 * ============================================================
 *
 * We reuse your existing session-building logic:
 *
 * fetchRecentVisitors()
 *
 * This is important because your existing function already
 * handles:
 *
 * - period
 * - visitor sessions
 * - Time In
 * - Time Out
 * - search
 *
 * ============================================================
 */

// const fetchAllVisitorSessions =
//   async (
//     businessClient,
//     organisationId,
//     period,
//     userId,
//     search = ""
//   ) => {
//     const data =
//       await fetchRecentVisitors_user(
//         businessClient,
//         organisationId,
//         search,
//         userId,
//         "",
//         period
//       );

//     return Array.isArray(data)
//       ? data
//       : [];
//   };

/*
 * ============================================================
 * VISITOR SUMMARY
 * ============================================================
 */

export const fetchUserVisitorSummary =
  async (
    businessClient,
    authClient,
    organisationId,
    userId,
    period
  ) => {
    /*
     * --------------------------------------------------------
     * Dynamic categories
     * --------------------------------------------------------
     */

    const categories =
      await fetchDynamicCategories(
        authClient,
        organisationId
      );

    /*
     * --------------------------------------------------------
     * Visitor sessions
     * --------------------------------------------------------
     */

    const visitors =
      await fetchAllVisitorSessions(
        businessClient,
        organisationId,
        userId,
        period
      );

    /*
     * --------------------------------------------------------
     * Count categories
     * --------------------------------------------------------
     */

    const counts =
      new Map();

    for (
      const visitor of visitors
    ) {
      const normalized =
        normalizeCategory(
          visitor.table_name
        );

      if (!normalized) {
        continue;
      }

      counts.set(
        normalized,
        (counts.get(normalized) || 0) +
          1
      );
    }

    /*
     * --------------------------------------------------------
     * Apply counts to dynamic categories
     * --------------------------------------------------------
     */

    const resultCategories =
      categories.map(
        (category) => ({
          ...category,
          count:
            counts.get(
              category.key
            ) || 0,
        })
      );

    /*
     * --------------------------------------------------------
     * Include categories that exist in
     * visitor records but aren't currently
     * present in dynamic_tables.
     *
     * This prevents records from disappearing.
     * --------------------------------------------------------
     */

    for (
      const [
        key,
        count,
      ] of counts.entries()
    ) {
      const exists =
        resultCategories.some(
          (category) =>
            category.key === key
        );

      if (!exists) {
        resultCategories.push({
          key,
          label: fallbackLabel(key),
          count,
        });
      }
    }

    /*
     * --------------------------------------------------------
     * Total
     * --------------------------------------------------------
     *
     * One item in fetchRecentVisitors represents
     * one visitor session.
     * --------------------------------------------------------
     */

    const total =
      visitors.length;

    return {
      period,
      total,
      categories:
        resultCategories,
    };
  };

/*
 * ============================================================
 * VISITOR RECORDS
 * ============================================================
 */

export const fetchUserVisitorRecords =
  async (
    businessClient,
    authClient,
    organisationId,
    period,
    userId,
    category = "",
    search = "",
    page = 1,
    limit = 5
  ) => {
    /*
     * --------------------------------------------------------
     * Get dynamic categories
     * --------------------------------------------------------
     */

    const categories =
      await fetchDynamicCategories(
        authClient,
        organisationId
      );

    /*
     * --------------------------------------------------------
     * Get ALL records for selected period.
     *
     * Your existing fetchRecentVisitors() is used so
     * Time In / Time Out session logic remains consistent
     * with the Admin Dashboard.
     * --------------------------------------------------------
     */

    let visitors =
      await fetchAllVisitorSessions(
        businessClient,
        organisationId,
        userId,
        period,
        search
      );

    /*
     * --------------------------------------------------------
     * Category filter
     * --------------------------------------------------------
     */

    const normalizedSelectedCategory =
      normalizeCategory(
        category
      );

    if (
      normalizedSelectedCategory
    ) {
      visitors =
        visitors.filter(
          (visitor) =>
            normalizeCategory(
              visitor.table_name
            ) ===
            normalizedSelectedCategory
        );
    }

    /*
     * --------------------------------------------------------
     * Search filter
     *
     * This is additionally applied here so it works
     * even if your existing fetchRecentVisitors search
     * implementation differs.
     * --------------------------------------------------------
     */

    const normalizedSearch =
      String(search || "")
        .trim()
        .toLowerCase();

    if (normalizedSearch) {
      visitors =
        visitors.filter(
          (visitor) => {
            const name =
              String(
                visitor.full_name ||
                  ""
              ).toLowerCase();

            const table =
              String(
                visitor.table_name ||
                  ""
              ).toLowerCase();

            return (
              name.includes(
                normalizedSearch
              ) ||
              table.includes(
                normalizedSearch
              )
            );
          }
        );
    }

    /*
     * --------------------------------------------------------
     * Total records
     * --------------------------------------------------------
     */

    const total =
      visitors.length;

    /*
     * --------------------------------------------------------
     * Pagination
     * --------------------------------------------------------
     */

    const safePage =
      Math.max(
        1,
        Number(page) || 1
      );

    const safeLimit =
      Math.max(
        1,
        Number(limit) || 5
      );

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          total / safeLimit
        )
      );

    /*
     * If requested page is beyond available
     * records, use last page.
     */

    const actualPage =
      Math.min(
        safePage,
        totalPages
      );

    const offset =
      (actualPage - 1) *
      safeLimit;

    const paginatedVisitors =
      visitors.slice(
        offset,
        offset + safeLimit
      );

    /*
     * --------------------------------------------------------
     * Add category label if necessary
     * --------------------------------------------------------
     *
     * The frontend can still use table_name, but this
     * mapping gives us a reliable dynamic label.
     * --------------------------------------------------------
     */

    const formattedVisitors =
      paginatedVisitors.map(
        (visitor) => {
          const key =
            normalizeCategory(
              visitor.table_name
            );

          const categoryInfo =
            categories.find(
              (category) =>
                category.key === key
            );

          return {
            ...visitor,

            category_key:
              key,

            category_label:
              categoryInfo?.label ||
              fallbackLabel(
                visitor.table_name
              ),
          };
        }
      );

    return {
      data: formattedVisitors,

      pagination: {
        page: actualPage,
        limit: safeLimit,
        total,
        totalPages,
      },
    };
  };
//   import masterAuthDB from "../../config/masterAuthDB.js";
// import { getBusinessDB } from "../../config/businessDB.js";
// import * as model from "../models/UserDashboard.model.js";

export const getUserDashboardSummaryService = async (
  organisationId,
  orgType,
  userId
) => {
  let businessClient;
  let authClient;

  try {
    /*
     * ----------------------------------------------------------
     * Validate authentication information
     * ----------------------------------------------------------
     */

    if (!organisationId) {
      return {
        success: false,
        message: "Organisation ID not found",
      };
    }

    if (!orgType) {
      return {
        success: false,
        message: "Organisation type not found",
      };
    }

    if (!userId) {
      return {
        success: false,
        message: "User ID not found",
      };
    }

    /*
     * ----------------------------------------------------------
     * Business DB
     * ----------------------------------------------------------
     */

    const businessDB =
      getBusinessDB(
        String(orgType).toLowerCase()
      );

    businessClient =
      await businessDB.connect();

    /*
     * ----------------------------------------------------------
     * Master Auth DB
     * ----------------------------------------------------------
     */

    authClient =
      await masterAuthDB.connect();

    /*
     * ----------------------------------------------------------
     * Get organisation schema
     * ----------------------------------------------------------
     */

    const org =
      await model.getOrganisationSchema(
        authClient,
        organisationId
      );

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    console.log(
      "User Dashboard Schema:",
      org.schema_name
    );

    /*
     * ----------------------------------------------------------
     * Get dashboard summary
     * ----------------------------------------------------------
     */

    const data =
      await model.getUserDashboardSummary(
        businessClient,
        org.schema_name,
        userId
      );

    if (!data) {
      return {
        success: false,
        message:
          "Resident details not found",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(
      "User Dashboard Summary Service Error:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Failed to fetch user dashboard summary",
    };
  } finally {
    if (businessClient) {
      businessClient.release();
    }

    if (authClient) {
      authClient.release();
    }
  }
};