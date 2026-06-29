import express from "express";
import {
  getRegisteredFaces,
  facePunch,
} from "../controllers/punchData.controller.js";
import { auth } from "../../middleware/auth.js";

const router = express.Router();

// Require login
router.use(auth);

router.get("/registered-faces", getRegisteredFaces);
router.post("/face-punch", facePunch);

export default router;