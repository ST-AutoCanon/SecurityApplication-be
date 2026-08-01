import express from "express";
import {
  getRegisteredFaces,
  verifyFace,
  confirmPunch,
} from "../controllers/punchData.controller.js";
import { auth } from "../../middleware/auth.js";

const router = express.Router();

// Require login
router.use(auth);

router.get("/registered-faces", getRegisteredFaces);

// Step 1 - Verify face only
router.post("/verify-face", verifyFace);

// Step 2 - Save punch after confirmation
router.post("/confirm-punch", confirmPunch);

export default router;
