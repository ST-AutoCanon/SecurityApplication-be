// import express from "express";
// import uploadExcel from "../middleware/uploadExcel.js";
// import { auth } from "../../middleware/auth.js";

// import {
//   createMember,
//   getMembers,
//   getMemberById,
//   getMemberDetails,
//   updateMember,
//   deleteMember,
//   updateMemberStatus,
//   searchMembers,
//   paginationMembers,
//   membersByFlat,
//   membersByTower,
//   createFamily,
//   getFamily,
//   updateFamily,
//   deleteFamily,
//   createVehicle,
//   getVehicles,
//   updateVehicle,
//   deleteVehicle,
// } from "../controllers/apartmentMember.controller.js";

// import {
//   importApartmentExcel,
//   downloadApartmentTemplate,
// } from "../controllers/apartmentImport.controller.js";

// const router = express.Router();

// /**
//  * Authentication
//  */
// router.use(auth);

// /**
//  * Admin Only
//  */
// const adminOnly = (req, res, next) => {
//   if (req.user?.role !== "admin") {
//     return res.status(403).json({
//       success: false,
//       message: "Admin only",
//     });
//   }

//   next();
// };

// router.use(adminOnly);

// /**
//  * =====================================
//  * APARTMENT MEMBER ROUTES
//  * =====================================
//  */

// /**
//  * Download Excel Template
//  */
// router.get("/members/import/template", downloadApartmentTemplate);

// /**
//  * Import Excel
//  */
// router.post(
//   "/members/import",
//   uploadExcel.single("file"),
//   importApartmentExcel,
// );

// /**
//  * Create Member
//  */
// router.post("/members", createMember);

// /**
//  * Get All Members
//  */
// router.get("/members", getMembers);

// /**
//  * Search Members
//  */
// router.get("/members/search", searchMembers);

// /**
//  * Pagination
//  */
// router.get("/members/pagination", paginationMembers);

// /**
//  * Get Member By Id
//  */
// router.get("/members/:id", getMemberById);

// /**
//  * Get Complete Member Details
//  */
// router.get("/members/:id/details", getMemberDetails);

// /**
//  * Update Member
//  */
// router.put("/members/:id", updateMember);

// /**
//  * Delete Member
//  */
// router.delete("/members/:id", deleteMember);

// /**
//  * Update Member Status
//  */
// router.patch("/members/:id/status", updateMemberStatus);

// /**
//  * Members By Flat
//  */
// router.get("/members/flat/:flat", membersByFlat);

// /**
//  * Members By Tower
//  */
// router.get("/members/tower/:tower", membersByTower);

// /**
//  * =====================================
//  * FAMILY ROUTES
//  * =====================================
//  */

// /**
//  * Create Family Member
//  */
// router.post("/family", createFamily);

// /**
//  * Get Family Members
//  */
// router.get("/family/member/:memberId", getFamily);

// /**
//  * Update Family Member
//  */
// router.put("/family/:id", updateFamily);

// /**
//  * Delete Family Member
//  */
// router.delete("/family/:id/member/:memberId", deleteFamily);

// /**
//  * =====================================
//  * VEHICLE ROUTES
//  * =====================================
//  */

// /**
//  * Create Vehicle
//  */
// router.post("/vehicles", createVehicle);

// /**
//  * Get Vehicles
//  */
// router.get("/vehicles/member/:memberId", getVehicles);

// /**
//  * Update Vehicle
//  */
// router.put("/vehicles/:id", updateVehicle);

// /**
//  * Delete Vehicle
//  */
// router.delete("/vehicles/:id", deleteVehicle);

// export default router;

import express from "express";
import uploadExcel from "../middleware/uploadExcel.js";
import { auth } from "../../middleware/auth.js";

import {
  createMember,
  getMembers,
  getMemberById,
  getMemberDetails,
  updateMember,
  deleteMember,
  updateMemberStatus,
  searchMembers,
  paginationMembers,
  membersByFlat,
  membersByTower,
  createFamily,
  getFamily,
  getFamilyById,
  updateFamily,
  deleteFamily,
  familyCount,
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  vehicleCount,
  vehiclesByType,
} from "../controllers/apartmentMember.controller.js";

import {
  importApartmentExcel,
  downloadApartmentTemplate,
} from "../controllers/apartmentImport.controller.js";

const router = express.Router();

router.use(auth);

/**
 * Admin Only
 */
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

/* =====================================
   EXCEL IMPORT
===================================== */

router.get("/members/import/template", downloadApartmentTemplate);

router.post(
  "/members/import",
  uploadExcel.single("file"),
  importApartmentExcel,
);

/* =====================================
   APARTMENT MEMBER ROUTES
===================================== */

router.post("/members", createMember);

router.get("/members", getMembers);

router.get("/members/search", searchMembers);

router.get("/members/pagination", paginationMembers);

router.get("/members/flat/:flat", membersByFlat);

router.get("/members/tower/:tower", membersByTower);

router.get("/members/:id/details", getMemberDetails);

router.get("/members/:id", getMemberById);

router.put("/members/:id", updateMember);

router.patch("/members/:id/status", updateMemberStatus);

router.delete("/members/:id", deleteMember);

/* =====================================
   FAMILY ROUTES
===================================== */

router.post("/family", createFamily);

router.get("/family/member/:memberId", getFamily);

router.get("/family/member/:memberId/count", familyCount);

router.get("/family/:id", getFamilyById);

router.put("/family/:id", updateFamily);

router.delete("/family/:id/member/:memberId", deleteFamily);

/* =====================================
   VEHICLE ROUTES
===================================== */

router.post("/vehicles", createVehicle);

router.get("/vehicles/member/:memberId", getVehicles);

router.get("/vehicles/member/:memberId/count", vehicleCount);

router.get("/vehicles/member/:memberId/type/:type", vehiclesByType);

router.get("/vehicles/:id", getVehicleById);

router.put("/vehicles/:id", updateVehicle);

router.delete("/vehicles/:id", deleteVehicle);

export default router;