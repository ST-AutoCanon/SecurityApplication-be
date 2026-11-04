
// import * as Service from "../services/apartmentMaintenance.service.js";

// const getOrganisationId = (req) => {
//   const id = req.user?.organisation_id;
//   if (!id) throw new Error("Organisation ID not found in authenticated user");
//   return id;
// };

// const handle = (serviceMethod, successStatus = 200) =>
//   async (req, res) => {
//     try {
//       const organisationId = getOrganisationId(req);
//       const result = await serviceMethod(organisationId, req);

//       return res.status(successStatus).json({
//         success: true,
//         message: "Operation completed successfully",
//         data: result
//       });
//     } catch (error) {
//       console.error("[Apartment Maintenance]", error);

//       const clientError = [
//         "required",
//         "must be",
//         "Invalid",
//         "not found",
//         "missing",
//         "Please configure",
//         "not effective",
//         "Unsupported"
//       ].some((word) => error.message?.includes(word));

//       return res.status(clientError ? 400 : 500).json({
//         success: false,
//         message: error.message || "Apartment maintenance operation failed"
//       });
//     }
//   };

// // Flats
// export const getFlats = handle((orgId) =>
//   Service.getFlatsService(orgId)
// );

// export const createFlat = handle((orgId, req) =>
//   Service.createFlatService(orgId, req.body), 201
// );

// export const updateFlat = handle((orgId, req) =>
//   Service.updateFlatService(orgId, req.params.id, req.body)
// );

// export const deleteFlat = handle((orgId, req) =>
//   Service.deleteFlatService(orgId, req.params.id)
// );

// // Configuration
// export const getConfiguration = handle((orgId) =>
//   Service.getMaintenanceConfigurationService(orgId)
// );

// export const saveSettings = handle((orgId, req) =>
//   Service.saveMaintenanceSettingsService(orgId, req.body)
// );

// // BHK rates
// export const saveBhkRate = handle((orgId, req) =>
//   Service.saveBhkRateService(orgId, req.body)
// );

// export const deleteBhkRate = handle((orgId, req) =>
//   Service.deleteBhkRateService(orgId, req.params.id)
// );

// // Floor charges
// export const saveFloorCharge = handle((orgId, req) =>
//   Service.saveFloorChargeService(orgId, req.body)
// );

// export const deleteFloorCharge = handle((orgId, req) =>
//   Service.deleteFloorChargeService(orgId, req.params.id)
// );

// // Special charges
// export const createSpecialCharge = handle((orgId, req) =>
//   Service.createSpecialChargeService(orgId, req.body), 201
// );

// export const updateSpecialCharge = handle((orgId, req) =>
//   Service.updateSpecialChargeService(orgId, req.params.id, req.body)
// );

// export const deleteSpecialCharge = handle((orgId, req) =>
//   Service.deleteSpecialChargeService(orgId, req.params.id)
// );

// // Late rules
// export const saveLateRule = handle((orgId, req) =>
//   Service.saveLateRuleService(orgId, req.body)
// );

// // Preview and bills
// export const previewMaintenance = handle((orgId, req) =>
//   Service.previewMaintenanceService(orgId, req.query.month)
// );

// export const generateBills = handle((orgId, req) =>
//   Service.generateMaintenanceBillsService(orgId, req.body.month)
// );

// export const getBills = handle((orgId, req) =>
//   Service.getMaintenanceBillsService(orgId, req.query.month)
// );

import * as Service from "../services/apartmentMaintenance.service.js";

const getOrganisationId = (req) => {
  const id = req.user?.organisation_id;

  if (!id) {
    throw new Error(
      "Organisation ID not found in authenticated user"
    );
  }

  return id;
};

const handle = (serviceMethod, successStatus = 200) =>
  async (req, res) => {
    try {
      const organisationId = getOrganisationId(req);

      const result = await serviceMethod(
        organisationId,
        req
      );

      return res.status(successStatus).json({
        success: true,
        message: "Operation completed successfully",
        data: result
      });
    } catch (error) {
      console.error("[Apartment Maintenance]", error);

      const clientErrorMessages = [
        "required",
        "must be",
        "Invalid",
        "not found",
        "missing",
        "Please configure",
        "not effective",
        "Unsupported",
        "valid flat_id"
      ];

      const clientError = clientErrorMessages.some(
        (word) => error.message?.includes(word)
      );

      return res.status(clientError ? 400 : 500).json({
        success: false,
        message:
          error.message ||
          "Apartment maintenance operation failed"
      });
    }
  };

// ---------------- FLATS ----------------

export const getFlats = handle((orgId) =>
  Service.getFlatsService(orgId)
);

export const createFlat = handle(
  (orgId, req) =>
    Service.createFlatService(orgId, req.body),
  201
);

export const updateFlat = handle((orgId, req) =>
  Service.updateFlatService(
    orgId,
    req.params.id,
    req.body
  )
);

export const deleteFlat = handle((orgId, req) =>
  Service.deleteFlatService(orgId, req.params.id)
);

// ---------------- CONFIGURATION ----------------

export const getConfiguration = handle((orgId) =>
  Service.getMaintenanceConfigurationService(orgId)
);

export const saveSettings = handle((orgId, req) =>
  Service.saveMaintenanceSettingsService(
    orgId,
    req.body
  )
);

// ---------------- BHK RATES ----------------

export const saveBhkRate = handle((orgId, req) =>
  Service.saveBhkRateService(orgId, req.body)
);

export const deleteBhkRate = handle((orgId, req) =>
  Service.deleteBhkRateService(
    orgId,
    req.params.id
  )
);

// ---------------- FLOOR CHARGES ----------------

export const saveFloorCharge = handle((orgId, req) =>
  Service.saveFloorChargeService(orgId, req.body)
);

export const deleteFloorCharge = handle((orgId, req) =>
  Service.deleteFloorChargeService(
    orgId,
    req.params.id
  )
);

// ---------------- SPECIAL CHARGES ----------------

export const createSpecialCharge = handle(
  (orgId, req) =>
    Service.createSpecialChargeService(
      orgId,
      req.body
    ),
  201
);

export const updateSpecialCharge = handle(
  (orgId, req) =>
    Service.updateSpecialChargeService(
      orgId,
      req.params.id,
      req.body
    )
);

export const deleteSpecialCharge = handle(
  (orgId, req) =>
    Service.deleteSpecialChargeService(
      orgId,
      req.params.id
    )
);

// ---------------- LATE RULES ----------------

export const saveLateRule = handle((orgId, req) =>
  Service.saveLateRuleService(orgId, req.body)
);

// ---------------- PREVIEW AND BILLS ----------------

export const previewMaintenance = handle(
  (orgId, req) =>
    Service.previewMaintenanceService(
      orgId,
      req.query.flat_id,
      req.query.month
    )
);

export const generateBills = handle((orgId, req) =>
  Service.generateMaintenanceBillsService(
    orgId,
    req.body.month
  )
);

export const getBills = handle((orgId, req) =>
  Service.getMaintenanceBillsService(
    orgId,
    req.query.month
  )
);