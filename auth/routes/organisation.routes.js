import express from "express";
import * as controller from "../controllers/organisation.controller.js";

const router = express.Router();

router.get("/organisations", controller.getOrganisations);
router.post("/:organisationId/security", controller.createSecurityUser);

export default router;
    