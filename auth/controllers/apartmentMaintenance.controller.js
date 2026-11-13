
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


export const updateFlatDetails = async (req, res) => {
    try {
        const organisationId = req.user?.organisation_id;
        const flatId = Number(req.params.flatId);

        if (!organisationId) {
            return res.status(401).json({
                success: false,
                message: "Organisation ID not found"
            });
        }

        if (!Number.isInteger(flatId) || flatId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid apartment flat ID"
            });
        }

        const { bhk_type, area_sqft } = req.body;

        const flat = await Service.updateFlatDetailsService(
            organisationId,
            flatId,
            {
                bhk_type,
                area_sqft
            }
        );

        return res.status(200).json({
            success: true,
            message: "Apartment flat details updated successfully",
            flat
        });

    } catch (error) {
        console.error(
            "[Apartment Maintenance] Update flat details:",
            error
        );

        return res.status(400).json({
            success: false,
            message: error.message ||
                "Unable to update apartment flat details"
        });
    }
};

export const getFlats = async (req, res) => {
  try {
    const organisationId = req.user?.organisation_id;

    if (!organisationId) {
      return res.status(401).json({
        success: false,
        message: "Organisation ID not found",
      });
    }

    const result = await Service.getFlatsService(organisationId);

    return res.status(200).json({
      success: true,
      message: "Apartment flats fetched successfully",
      flats: result,
    });

  } catch (error) {
    console.error("[Apartment Maintenance] Get Flats Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch apartment flats",
    });
  }
};
// export const getFlats = handle((orgId) =>
//   Service.getFlatsService(orgId)
// );

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

// export const saveLateRule = handle((orgId, req) =>
//   Service.saveLateRuleService(orgId, req.body)
// );


// export const replaceLateRules = async (
//   client,
//   schema,
//   rules = [],
//   policy = {}
// ) => {
//   // Validate all slabs before changing existing records.
//   for (const rule of rules) {
//     const from = Number(rule.delay_from_days);
//     const to = Number(rule.delay_to_days);
//     const fee = Number(rule.fee_value ?? rule.late_fee_value);

//     if (!Number.isInteger(from) || from < 1) {
//       throw new Error("Invalid late-fee starting day");
//     }

//     if (!Number.isInteger(to) || to < from) {
//       throw new Error("Invalid late-fee ending day");
//     }

//     if (!Number.isFinite(fee) || fee < 0) {
//       throw new Error("Invalid late-fee amount");
//     }

//     if (!rule.effective_from) {
//       throw new Error("Effective from date is required");
//     }

//     if (
//       rule.effective_to &&
//       rule.effective_to < rule.effective_from
//     ) {
//       throw new Error("Effective to date cannot be before effective from date");
//     }
//   }

//   // Reject overlapping slabs when their effective periods overlap.
//   for (let i = 0; i < rules.length; i++) {
//     for (let j = i + 1; j < rules.length; j++) {
//       const a = rules[i];
//       const b = rules[j];

//       const daysOverlap =
//         Number(a.delay_from_days) <= Number(b.delay_to_days) &&
//         Number(b.delay_from_days) <= Number(a.delay_to_days);

//       const aEnd = a.effective_to || "9999-12-31";
//       const bEnd = b.effective_to || "9999-12-31";

//       const datesOverlap =
//         a.effective_from <= bEnd &&
//         b.effective_from <= aEnd;

//       if (daysOverlap && datesOverlap) {
//         throw new Error(
//           `Late-fee slabs overlap: ${a.delay_from_days}-${a.delay_to_days} and ${b.delay_from_days}-${b.delay_to_days}`
//         );
//       }
//     }
//   }

//   const dueDay = Number(policy.due_day ?? 10);
//   const graceDays = Number(policy.grace_days ?? 0);

//   if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) {
//     throw new Error("Due day must be between 1 and 28");
//   }

//   if (!Number.isInteger(graceDays) || graceDays < 0) {
//     throw new Error("Grace days cannot be negative");
//   }

//   // Deactivate old slabs, preserving their historical records.
//   await query(client, schema, `
//     UPDATE {{schema}}.apartment_maintenance_late_rules
//     SET is_active = FALSE,
//         updated_at = CURRENT_TIMESTAMP
//     WHERE is_active = TRUE
//   `);

//   const savedRows = [];

//   for (const rule of rules) {
//     const result = await query(client, schema, `
//       INSERT INTO {{schema}}.apartment_maintenance_late_rules (
//         due_day,
//         grace_days,
//         late_fee_type,
//         late_fee_value,
//         delay_from_days,
//         delay_to_days,
//         effective_from,
//         effective_to,
//         is_active
//       )
//       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE)
//       RETURNING *
//     `, [
//       dueDay,
//       graceDays,
//       String(rule.fee_type || "fixed").toUpperCase() === "PERCENTAGE"
//         ? "PERCENTAGE"
//         : "FIXED",
//       Number(rule.fee_value ?? rule.late_fee_value ?? 0),
//       Number(rule.delay_from_days),
//       Number(rule.delay_to_days),
//       rule.effective_from,
//       rule.effective_to || null
//     ]);

//     savedRows.push(result.rows[0]);
//   }

//   return savedRows;
// };
// export const replaceLateRules = async (req, res) => {
//   try {
//     const organisationId = req.user?.organisation_id;

//     if (!organisationId) {
//       return res.status(401).json({
//         success: false,
//         message: "Organisation ID not found"
//       });
//     }

//     const result = await Service.replaceLateRulesService(
//       organisationId,
//       req.body
//     );

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error("[Replace Late Rules]", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Unable to save late payment rules"
//     });
//   }
// };
// ---------------- LATE RULES ----------------

export const replaceLateRules = handle(
  (orgId, req) =>
    Service.replaceLateRulesService(
      orgId,
      req.body
    )
);
// ---------------- PREVIEW AND BILLS ----------------

// export const previewMaintenance = handle(
//   (orgId, req) =>
//     Service.previewMaintenanceService(
//       orgId,
//       req.query.flat_id,
//       req.query.month
//     )
// );


// export const previewMaintenance = handle(
//   (orgId, req) =>
//     Service.previewMaintenanceService(
//       orgId,
//       req.query.flat_id,
//       req.query.billing_month || req.query.month,
//       req.query.as_of_date
//     )
// );

export const previewMaintenance = handle((orgId, req) =>
  Service.previewMaintenanceService(
    orgId,
    req.query.flat_id,
    req.query.billing_month || req.query.month,
    req.query.as_of_date
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