
import express from "express";
import * as controller from "../controllers/organisation.controller.js";
import { auth } from "../../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/* Auth First */
router.use(auth);

/* Super Admin Guard */
const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Super Admin only",
    });
  }

  next();
};

router.use(superAdminOnly);

/* Organisation Routes */
// router.post("/register", controller.registerOrg);
router.post("/register", upload.single("photo"), controller.registerOrg);


router.get("/", controller.getAllOrgs);

router.get("/codes", controller.getOrganisations);

router.get("/:id", controller.getOrgById);

// router.put("/:id", controller.updateOrg);

router.put("/:id", upload.single("photo"), controller.updateOrg);

router.delete("/:id", controller.deleteOrg);

export default router;
