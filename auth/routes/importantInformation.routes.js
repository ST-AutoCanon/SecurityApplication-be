// import express from "express";
// import { auth } from "../../middleware/auth.js";

// import {
//   createImportantInformation,
//   getAdminImportantInformation,
//   updateImportantInformation,
//   deleteImportantInformation,
//   toggleImportantInformationStatus,
// } from "../controllers/importantInformation.controller.js";


// const router = express.Router();

// /*
// |--------------------------------------------------------------------------
// | ADMIN IMPORTANT INFORMATION
// |--------------------------------------------------------------------------
// */

// router.use(auth);

// router.get(
//   "/",
//   getAdminImportantInformation
// );

// router.post(
//   "/",
//   createImportantInformation
// );

// router.put(
//   "/:id",
//   updateImportantInformation
// );

// router.delete(
//   "/:id",
//   deleteImportantInformation
// );

// router.patch(
//   "/:id/toggle-status",
//   toggleImportantInformationStatus
// );

// export default router;
import express from "express";

import {auth} from "../../middleware/auth.js";

import {
  createImportantInformation,
  getAdminImportantInformation,
  updateImportantInformation,
  deleteImportantInformation,
  toggleImportantInformation,
} from "../controllers/importantInformation.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

router.use(auth);

/*
|--------------------------------------------------------------------------
| ADMIN IMPORTANT INFORMATION
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getAdminImportantInformation
);

router.post(
  "/",
  createImportantInformation
);

router.put(
  "/:id",
  updateImportantInformation
);

router.delete(
  "/:id",
  deleteImportantInformation
);

router.patch(
  "/:id/toggle",
  toggleImportantInformation
);

export default router;

