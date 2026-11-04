
// // import express from "express";
// // import * as Controller from "../controllers/apartmentMaintenance.controller.js";
// // import { auth } from "../../middleware/auth.js";
// // // import{} from "../controllers/apartmentMember.controller.js";

// // const router = express.Router();

// // const adminOnly = (req, res, next) => {
// //   if (req.user?.role !== "admin") {
// //     return res.status(403).json({
// //       success: false,
// //       message: "Admin only"
// //     });
// //   }

// //   next();
// // };

// // router.use(auth);
// // router.use(adminOnly);

// // // Flats
// // router.get("/flats", Controller.getFlats);
// // router.post("/flats", Controller.createFlat);
// // router.put("/flats/:id", Controller.updateFlat);
// // router.delete("/flats/:id", Controller.deleteFlat);

// // // Main maintenance configuration
// // router.get("/configuration", Controller.getConfiguration);
// // router.put("/settings", Controller.saveSettings);


// // // Main maintenance configuration
// // router.get("/", Controller.getConfiguration);

// // // router.get("/configuration", Controller.getConfiguration);
// // // router.put("/settings", Controller.saveSettings);


// // // BHK rates
// // router.post("/bhk-rates", Controller.saveBhkRate);
// // router.delete("/bhk-rates/:id", Controller.deleteBhkRate);

// // // Floor charges
// // router.post("/floor-charges", Controller.saveFloorCharge);
// // router.delete("/floor-charges/:id", Controller.deleteFloorCharge);

// // // Special charges
// // router.post("/special-charges", Controller.createSpecialCharge);
// // router.put("/special-charges/:id", Controller.updateSpecialCharge);
// // router.delete("/special-charges/:id", Controller.deleteSpecialCharge);

// // // Late payment rules
// // router.put("/late-rules", Controller.saveLateRule);

// // // Preview and bill generation
// // router.get("/preview", Controller.previewMaintenance);
// // router.post("/generate-bills", Controller.generateBills);
// // router.get("/bills", Controller.getBills);

// // export default router;

// import express from "express";
// import { auth } from "../../middleware/auth.js";

// import * as Controller from "../controllers/apartmentMaintenance.controller.js";

// const router = express.Router();

// // Authentication
// router.use(auth);

// // Admin authorization
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

// // Flats
// router.get("/flats", Controller.getFlats);
// router.post("/flats", Controller.createFlat);
// router.put("/flats/:id", Controller.updateFlat);
// router.delete("/flats/:id", Controller.deleteFlat);

// // Main maintenance configuration
//  router.get("/", Controller.getConfiguration);
// router.get("/configuration", Controller.getConfiguration);
// router.put("/settings", Controller.saveSettings);

// // BHK rates
// router.post("/bhk-rates", Controller.saveBhkRate);
// router.delete("/bhk-rates/:id", Controller.deleteBhkRate);

// // Floor charges
// router.post("/floor-charges", Controller.saveFloorCharge);
// router.delete("/floor-charges/:id", Controller.deleteFloorCharge);

// // Special charges
// router.post("/special-charges", Controller.createSpecialCharge);
// router.put("/special-charges/:id", Controller.updateSpecialCharge);
// router.delete("/special-charges/:id", Controller.deleteSpecialCharge);

// // Late payment rules
// router.put("/late-rules", Controller.saveLateRule);

// // Preview and bill generation
// router.get("/preview", Controller.previewMaintenance);
// router.post("/generate-bills", Controller.generateBills);
// router.get("/bills", Controller.getBills);

// export default router;


import express from "express";
import { auth } from "../../middleware/auth.js";
import * as Controller from "../controllers/apartmentMaintenance.controller.js";

const router = express.Router();

router.use(auth);

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin only"
    });
  }

  next();
};

router.use(adminOnly);

// Flats
router.get("/flats", Controller.getFlats);
router.post("/flats", Controller.createFlat);
router.put("/flats/:id", Controller.updateFlat);
router.delete("/flats/:id", Controller.deleteFlat);

// Configuration
router.get("/", Controller.getConfiguration);
router.get("/configuration", Controller.getConfiguration);
router.put("/settings", Controller.saveSettings);

// BHK rates
router.post("/bhk-rates", Controller.saveBhkRate);
router.delete("/bhk-rates/:id", Controller.deleteBhkRate);

// Floor charges
router.post("/floor-charges", Controller.saveFloorCharge);
router.delete("/floor-charges/:id", Controller.deleteFloorCharge);

// Special charges
router.post("/special-charges", Controller.createSpecialCharge);
router.put("/special-charges/:id", Controller.updateSpecialCharge);
router.delete("/special-charges/:id", Controller.deleteSpecialCharge);

// Late rules
router.put("/late-rules", Controller.saveLateRule);

// Preview and bills
router.get("/preview", Controller.previewMaintenance);
router.post("/generate-bills", Controller.generateBills);
router.get("/bills", Controller.getBills);

export default router;