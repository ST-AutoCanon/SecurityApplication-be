import express from "express";

import {auth} from "../../middleware/auth.js";

import {
  createVendorServiceProvider,
  getAdminVendorServiceProviders,
  updateVendorServiceProvider,
  deleteVendorServiceProvider,
  toggleVendorServiceProvider,
} from "../controllers/vendorsServiceProviders.controller.js";

const router = express.Router();

router.use(auth);

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getAdminVendorServiceProviders
);

router.post(
  "/",
  createVendorServiceProvider
);

router.put(
  "/:id",
  updateVendorServiceProvider
);

router.delete(
  "/:id",
  deleteVendorServiceProvider
);

router.patch(
  "/:id/toggle",
  toggleVendorServiceProvider
);

export default router;