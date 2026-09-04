
import express from "express";

import * as controller from "../controllers/assignGates.controller.js";

import { auth } from "../../middleware/auth.js";

const router = express.Router();


/* =========================
   PUBLIC
   ========================= */

// // Anyone can fetch gates
// router.get("/gates", controller.getAssignGates);




/* Admin Only */

router.use(auth);

// Gate list — any authenticated user
router.get("/gates", controller.getAssignGates);

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

/* Assign Gates */

router.post("/assign-gates", controller.createAssignGate);

router.get("/assign-gates", controller.getAssignGates);

router.get("/assign-gates/:id", controller.getAssignGateById);

router.put("/assign-gates/:id", controller.updateAssignGate);

router.patch(
  "/assign-gates/:id/deactivate",
  controller.deactivateAssignGate,
);

router.patch(
  "/assign-gates/:id/activate",
  controller.activateAssignGate,
);

router.delete("/assign-gates/:id", controller.deleteAssignGate);

export default router;

