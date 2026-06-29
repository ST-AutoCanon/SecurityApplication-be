import express from "express";

import * as controller from "../controllers/dynamicTable.controller.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                               TEMPLATES                                    */
/* -------------------------------------------------------------------------- */

// Get all templates
router.get("/templates", controller.getTemplates);

// Get fields of a template
router.get("/templates/:templateId", controller.getTemplateFields);

/* -------------------------------------------------------------------------- */
/*                           DYNAMIC TABLES                                   */
/* -------------------------------------------------------------------------- */

// Create Dynamic Table
router.post("/", controller.createDynamicTable);

// Get existing dynamic table configuration
router.get("/configuration", controller.getDynamicTableConfiguration);

router.put("/", controller.updateDynamicTable);

export default router;
