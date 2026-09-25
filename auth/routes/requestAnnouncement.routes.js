import express from "express";
import { auth } from "../../middleware/auth.js";
import {
  getRequestAnnouncements,
} from "../controllers/requestAnnouncement.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| USER REQUEST ANNOUNCEMENTS
|--------------------------------------------------------------------------
| All authenticated apartment members can see announcements
| belonging to their organisation.
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  auth,
  getRequestAnnouncements
);

export default router;