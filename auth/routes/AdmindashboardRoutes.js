import express from "express";
import { auth } from "../../middleware/auth.js";
import { getRecentVisitors } from "../controllers/AdmindashboardController.js";
import { getDashboard } from "../controllers/AdmindashboardController.js";
import { getCategoryStats } from "../controllers/AdmindashboardController.js";
import { getCategoryTrend } from "../controllers/AdmindashboardController.js";

import { exportRecentVisitors } from "../controllers/AdmindashboardController.js";
import { exportRecentVisitorsPDF } from "../controllers/AdmindashboardController.js";

import { getCategoryCards } from "../controllers/AdmindashboardController.js";
import {
  getInsideOutsideStats,
} from "../controllers/AdmindashboardController.js";
import {
  getPeakVisitorHours,
} from "../controllers/AdmindashboardController.js";
import {
  getEntriesOverview,
} from "../controllers/AdmindashboardController.js";

import {
  entriesByCategory,
} from "../controllers/AdmindashboardController.js";

import {
  getSecurityGuards,
} from "../controllers/AdmindashboardController.js";


import {
  getEventContributions,
} from "../controllers/AdmindashboardController.js";

const router = express.Router();

router.use(auth);
/* Admin Only */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin only",
    });
  }

  next();
};

router.use(adminOnly);


router.get("/category-stats", getCategoryStats);

router.get("/recent-visitors", getRecentVisitors);
router.get("/", getDashboard);
router.get("/category-trend", getCategoryTrend);
router.get("/recent-visitors/export", exportRecentVisitors);
router.get(
  "/recent-visitors/export/pdf",
  exportRecentVisitorsPDF
);
router.get(
  "/category-cards",
  getCategoryCards
);
router.get(
  "/inside-outside",
  getInsideOutsideStats
);

router.get(
  "/peak-visitor-hours",
  getPeakVisitorHours
);

router.get(
  "/entries-overview",
  getEntriesOverview
);
router.get(
  "/entries-by-category",
  entriesByCategory
);
router.get("/security-guards", getSecurityGuards);
router.get("/event-contributions", getEventContributions);
export default router;