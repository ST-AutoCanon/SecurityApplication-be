import express from "express";
import * as controller from "../controllers/admin.controller.js";
import { auth } from "../../middleware/auth.js";

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

/* Create Security User */
// router.post(
//   "/organisation/:organisationId/security",
//   controller.createSecurityUser,
// );

router.post("/security", controller.createSecurityUser);

router.get("/security", controller.getSecurityUsers);

router.get("/security/:id", controller.getSecurityUserById);

router.put("/security/:id", controller.updateSecurityUser);

// Soft Delete
router.patch("/security/:id/deactivate", controller.deactivateSecurityUser);

router.patch("/security/:id/activate", controller.activateSecurityUser);

// Hard Delete
router.delete("/security/:id", controller.deleteSecurityUser);

router.get("/delivery-persons", controller.getAllDeliveryPersons);
// admin.routes.js

router.get("/business-data", controller.getAllBusinessData);

router.get("/business-data/:table/:id", controller.getBusinessDataById);

router.put("/business-data/:table/:id", controller.updateBusinessData);

router.patch(
  "/business-data/:table/:id/deactivate",
  controller.deactivateBusinessData,
);

router.patch(
  "/business-data/:table/:id/activate",
  controller.activateBusinessData,
);

router.delete("/business-data/:table/:id", controller.deleteBusinessData);

export default router;
