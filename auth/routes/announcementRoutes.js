import express from "express";
import { auth } from "../../middleware/auth.js";

import {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} from "../controllers/announcementController.js";


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






// ============================================================
// ADMIN - CREATE ANNOUNCEMENT
// ============================================================

router.post(
  "/",
  auth,
  createAnnouncement
);


// ============================================================
// GET ANNOUNCEMENTS
// ============================================================

router.get(
  "/",
  auth,
  getAnnouncements
);


// ============================================================
// ADMIN - DELETE ANNOUNCEMENT
// ============================================================

router.delete(
  "/:id",
  auth,
  deleteAnnouncement
);




export default router;