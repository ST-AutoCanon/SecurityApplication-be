import express from "express";

import { auth } from "../../middleware/auth.js";

import {
  getUserVisitorSummary,
  getUserVisitorRecords,
  getUserDashboardSummary,
  getUserAnnouncements,
} from "../controllers/UserdashboardController.js";
import {
  getUserImportantInformation,
} from "../controllers/importantInformation.controller.js";
import {
  getUserVendorServiceProviders,
} from "../controllers/vendorsServiceProviders.controller.js";

import {
  getMyFlatVisitors,
  getMyFlatVisitorStats,
} from "../controllers/userVisitor.controller.js";

const router = express.Router();
// // TEST
// router.get("/test", (req, res) => {
//   console.log("USER DASHBOARD ROUTE IS WORKING");

//   res.json({
//     success: true,
//     message: "User dashboard route is working",
//   });
// });


/*
 * ============================================================
 * USER AUTHENTICATION
 * ============================================================
 *
 * Only authentication is required here.
 *
 * DO NOT add adminOnly middleware.
 *
 * The organisation is taken from:
 *
 * req.user.organisation_id
 * req.user.org_type
 *
 * ============================================================
 */

router.use(auth);

/*
 * ============================================================
 * VISITOR SUMMARY
 *
 * GET
 * /api/user-dashboard/visitor-summary?period=daily
 *
 * Supported:
 * daily
 * weekly
 * monthly
 * ============================================================
 */

router.get(
  "/visitor-summary",
  getUserVisitorSummary
);
router.get(
  "/user-summary",
  getUserDashboardSummary
);
/*
 * ============================================================
 * VISITOR RECORDS
 *
 * GET
 * /api/user-dashboard/visitor-records
 *
 * Example:
 *
 * ?period=daily
 * &category=guest
 * &page=1
 * &limit=5
 *
 * ============================================================
 */

router.get(
  "/visitor-records",
  getUserVisitorRecords
);
// router.get(
//   "/",
//   auth,
//   getUserAnnouncements
// );
router.get(
  "/announcements",
  auth,
  getUserAnnouncements
);

router.get(
  "/important-information",
  auth,
  getUserImportantInformation
);

router.get(
  "/vendors-service-providers",
  auth,
  getUserVendorServiceProviders
);

router.get(
  "/my-flat-visitors",
  getMyFlatVisitors
);
router.get( "/visitor-stats", auth, getMyFlatVisitorStats );
export default router;