
import firstDB from "../../config/dborgap.js";
import masterAuthDB from "../../config/masterAuthDB.js";
import * as AdminModel from "../models/admin.model.js";
import * as Model from "../models/apartmentMaintenance.model.js";

const getSchemaName = async (organisationId) => {
  const client = await masterAuthDB.connect();

  try {
    const org = await AdminModel.getOrganisationSchema(
      client,
      organisationId
    );

    if (!org?.schema_name) {
      throw new Error("Organisation schema not found");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(org.schema_name)) {
      throw new Error("Invalid organisation schema");
    }

    return org.schema_name;
  } finally {
    client.release();
  }
};

const withClient = async (organisationId, callback) => {
  const schema = await getSchemaName(organisationId);
  const client = await firstDB.connect();

//   try {
//     return await callback(client, schema);
//   } finally {
//     client.release();
//   }
// };
try {
    const dbInfo = await client.query(`
      SELECT current_database() AS database_name
    `);

    const columns = await client.query(
      `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = $1
          AND table_name = 'apartment_maintenance_settings'
      `,
      [schema]
    );

    console.log("[Maintenance Runtime DB]", {
      organisationId,
      schema,
      database: dbInfo.rows[0].database_name,
      columns: columns.rows.map(row => row.column_name)
    });

    return await callback(client, schema);
  } finally {
    client.release();
  }
};

const required = (value, field) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(`${field} is required`);
  }
};

const validNumber = (value, field, allowZero = true) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || (!allowZero && number === 0)) {
    throw new Error(`${field} must be a valid ${allowZero ? "non-negative" : "positive"} number`);
  }
  return number;
};

const validApplicableFor = (value) => {
  const allowed = ["ALL", "OWNER", "TENANT"];
  const result = value || "ALL";
  if (!allowed.includes(result)) {
    throw new Error("applicable_for must be ALL, OWNER or TENANT");
  }
  return result;
};

const applicableToFlat = (applicableFor, ownershipType) => {
  if (applicableFor === "ALL") return true;
  return String(ownershipType || "").toUpperCase() === applicableFor;
};

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const normaliseOwnership = (value) => {
  const result = String(value || "OWNER").toUpperCase();
  if (!["OWNER", "TENANT"].includes(result)) {
    throw new Error("ownership_type must be OWNER or TENANT");
  }
  return result;
};

// ---------------- FLATS ----------------

export const getFlatsService = async (organisationId) => {
  if (!organisationId) {
    throw new Error("Organisation ID is required");
  }

  return await withClient(organisationId, async (db, schema) => {

    // Step 1: Synchronize residents into physical flat records
    await Model.syncApartmentFlatsFromMembers(db, schema);

    // Step 2: Fetch all active flats
    const flats = await Model.getFlats(db, schema);

    return flats;
  });
};
export const createFlatService = (organisationId, data) =>
  withClient(organisationId, async (client, schema) => {
    required(data.flat_number, "Flat number");

    if (data.area_sqft !== undefined && data.area_sqft !== null && data.area_sqft !== "") {
      validNumber(data.area_sqft, "Area", false);
    }

    return Model.createFlat(client, schema, {
      ...data,
      ownership_type: normaliseOwnership(data.ownership_type)
    });
  });

export const updateFlatService = (organisationId, id, data) =>
  withClient(organisationId, async (client, schema) => {
    required(data.flat_number, "Flat number");

    if (data.area_sqft !== undefined && data.area_sqft !== null && data.area_sqft !== "") {
      validNumber(data.area_sqft, "Area", false);
    }

    const result = await Model.updateFlat(client, schema, id, {
      ...data,
      ownership_type: normaliseOwnership(data.ownership_type)
    });

    if (!result) throw new Error("Flat not found");
    return result;
  });
export const updateFlatDetailsService = (
    organisationId,
    flatId,
    data
) =>
    withClient(organisationId, async (client, schema) => {

        if (!organisationId) {
            throw new Error("Organisation ID is required");
        }

        const id = Number(flatId);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("Invalid apartment flat ID");
        }

        required(data.bhk_type, "BHK type");

        const bhkType = String(data.bhk_type).trim();

        if (bhkType.length > 30) {
            throw new Error("BHK type cannot exceed 30 characters");
        }

        const area = validNumber(
            data.area_sqft,
            "Area",
            false
        );

        const updatedFlat = await Model.updateFlatDetails(
            client,
            schema,
            id,
            {
                bhk_type: bhkType,
                area_sqft: area
            }
        );

        if (!updatedFlat) {
            throw new Error(
                "Apartment flat not found or inactive"
            );
        }

        return updatedFlat;
    });
export const deleteFlatService = (organisationId, id) =>
  withClient(organisationId, async (client, schema) => {
    const result = await Model.deleteFlat(client, schema, id);
    if (!result) throw new Error("Flat not found");
    return result;
  });

// ---------------- SETTINGS ----------------

// export const getMaintenanceConfigurationService = (organisationId) =>
//   withClient(organisationId, async (client, schema) => {
//     const [
//       settings,
//       bhkRates,
//       floorCharges,
//       specialCharges,
//       lateRules
//     ] = await Promise.all([
//       Model.getMaintenanceSettings(client, schema),
//       Model.getBhkRates(client, schema),
//       Model.getFloorCharges(client, schema),
//       Model.getSpecialCharges(client, schema),
//       Model.getLateRules(client, schema)
//     ]);

//     return {
//       settings,
//       bhkRates,
//       floorCharges,
//       specialCharges,
//         late_rules: lateRules

//     };
//   });

export const getMaintenanceConfigurationService = (organisationId) =>
  withClient(organisationId, async (client, schema) => {

    const [
      settings,
      bhkRates,
      floorCharges,
      specialCharges,
      lateRules
    ] = await Promise.all([
      Model.getMaintenanceSettings(client, schema),
      Model.getBhkRates(client, schema),
      Model.getFloorCharges(client, schema),
      Model.getSpecialCharges(client, schema),
      Model.getLateRules(client, schema)
    ]);

    console.log("[Maintenance Configuration Loaded]", {
      schema,
      lateRulesCount: lateRules.length,
      lateRules
    });

    return {
      settings,
      bhkRates,
      floorCharges,
      specialCharges,

      // Support both frontend naming conventions
      lateRules,
      late_rules: lateRules
    };
  });
// export const replaceLateRulesService = (organisationId, data) =>
//   withClient(organisationId, async (client, schema) => {
//     const rules = Array.isArray(data.late_rules)
//       ? data.late_rules
//       : Array.isArray(data.rules)
//         ? data.rules
//         : [];

//     const dueDay = Number(data.due_day ?? 10);
//     const graceDays = Number(data.grace_days ?? 0);

//     if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) {
//       throw new Error("Due day must be between 1 and 28");
//     }

//     if (!Number.isInteger(graceDays) || graceDays < 0) {
//       throw new Error("Grace days must be zero or greater");
//     }

//     const savedRules = await Model.replaceLateRules(
//       client,
//       schema,
//       rules,
//       {
//         due_day: dueDay,
//         grace_days: graceDays
//       }
//     );

//     return {
//       success: true,
//       message: "Late payment rules saved successfully",
//       late_rules: savedRules
//     };
//   });


// export const getMaintenanceConfigurationService = (organisationId) =>
//   withClient(organisationId, async (client, schema) => {

//     // STEP 1: Ensure all maintenance tables and columns exist
//     await Model.createApartmentMaintenanceTables(client, schema);

//     // STEP 2: Fetch configuration after migration completes
//     const [
//       settings,
//       bhkRates,
//       floorCharges,
//       specialCharges,
//       lateRules
//     ] = await Promise.all([
//       Model.getMaintenanceSettings(client, schema),
//       Model.getBhkRates(client, schema),
//       Model.getFloorCharges(client, schema),
//       Model.getSpecialCharges(client, schema),
//       Model.getLateRules(client, schema)
//     ]);

//     return {
//       settings,
//       bhkRates,
//       floorCharges,
//       specialCharges,
//       lateRules
//     };
//   });

// export const saveMaintenanceSettingsService = (organisationId, data) =>
//   withClient(organisationId, async (client, schema) => {
//     const methods = ["PER_SQFT", "PER_BHK"];

//     if (!methods.includes(data.calculation_method)) {
//       throw new Error("Invalid calculation method");
//     }

//     required(data.effective_from, "Effective from");

//     // Preserve the date exactly as YYYY-MM-DD.
//     const effectiveFrom = String(data.effective_from).slice(0, 10);

//     if (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom)) {
//       throw new Error("Invalid effective date");
//     }

//     const fixedAmount = validNumber(
//       data.fixed_monthly_amount,
//       "Fixed monthly amount",
//       false
//     );

//     const ratePerSqft =
//       data.calculation_method === "PER_SQFT"
//         ? validNumber(data.rate_per_sqft, "Rate per Sq.ft", false)
//         : 0;

//     return Model.saveMaintenanceSettings(client, schema, {
//       ...data,
//       effective_from: effectiveFrom,
//       fixed_monthly_amount: fixedAmount,
//       rate_per_sqft: ratePerSqft,
//       base_rate: ratePerSqft,
//       applicable_for: validApplicableFor(data.applicable_for)
//     });8
//   });

// export const saveMaintenanceSettingsService = (organisationId, data) =>
//   withClient(organisationId, async (client, schema) => {
//     const methods = ["PER_SQFT", "PER_BHK", "FLAT_AMOUNT"];

//     if (!methods.includes(data.calculation_method)) {
//       throw new Error("Invalid calculation method");
//     }

//     required(data.effective_from, "Effective from");

//     const amount = validNumber(data.base_rate ?? 0, "Base rate");

//     if (data.calculation_method === "PER_SQFT" && amount === 0) {
//       throw new Error("Enter a rate greater than zero for Per Sq.ft");
//     }

//     if (data.calculation_method === "FLAT_AMOUNT" && amount === 0) {
//       throw new Error("Enter a flat amount greater than zero");
//     }

//     return Model.saveMaintenanceSettings(client, schema, {
//       ...data,
//       base_rate: amount,
//       applicable_for: validApplicableFor(data.applicable_for)
//     });
//   });

// ---------------- BHK RATES ----------------



export const saveMaintenanceSettingsService = (organisationId, data) =>
  withClient(organisationId, async (client, schema) => {
    const methods = ["PER_SQFT", "PER_BHK"];

    if (!methods.includes(data.calculation_method)) {
      throw new Error("Invalid calculation method");
    }

    required(data.effective_from, "Effective from");

    const effectiveFrom = String(data.effective_from).slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom)) {
      throw new Error("Invalid effective date");
    }

    const fixedAmount = validNumber(
      data.fixed_monthly_amount,
      "Fixed monthly amount",
      false
    );

    const ratePerSqft =
      data.calculation_method === "PER_SQFT"
        ? validNumber(data.rate_per_sqft, "Rate per Sq.ft", false)
        : 0;

    // Validate and normalize floor rules before saving anything.
    const floorCharges = Array.isArray(data.floor_charges)
      ? data.floor_charges.map((charge, index) => {
          const floorFrom = String(charge.floor_from ?? "").trim();
          const floorTo = String(charge.floor_to ?? "").trim();
          const monthlyAmount = Number(charge.monthly_amount);

          if (!floorFrom) {
            throw new Error(
              `From Floor is required for floor rule ${index + 1}`
            );
          }

          if (!floorTo) {
            throw new Error(
              `To Floor is required for floor rule ${index + 1}`
            );
          }

          if (
            charge.monthly_amount === "" ||
            !Number.isFinite(monthlyAmount) ||
            monthlyAmount < 0
          ) {
            throw new Error(
              `Enter a valid monthly charge for floor rule ${index + 1}`
            );
          }

          return {
            floor_from: floorFrom,
            floor_to: floorTo,
            monthly_amount: monthlyAmount,
            applicable_units: charge.applicable_units || "all",
            description: charge.description || null
          };
        })
      : [];

    // Save base maintenance settings.
    const savedSettings = await Model.saveMaintenanceSettings(
      client,
      schema,
      {
        ...data,
        effective_from: effectiveFrom,
        fixed_monthly_amount: fixedAmount,
        rate_per_sqft: ratePerSqft,
        base_rate: ratePerSqft,
        applicable_for: validApplicableFor(data.applicable_for)
      }
    );

    // IMPORTANT: Save floor charges separately.
    const savedFloorCharges = await Model.replaceFloorCharges(
      client,
      schema,
      floorCharges
    );


    let savedSpecialCharges = [];

if (Object.prototype.hasOwnProperty.call(data, "special_charges")) {
  const specialCharges = Array.isArray(data.special_charges)
    ? data.special_charges
    : [];

  const validatedCharges = specialCharges.map((charge, index) => {
    required(charge.charge_name, `Special charge name ${index + 1}`);

    const amount = validNumber(
      charge.amount,
      `Special charge amount ${index + 1}`,
      false
    );

    const chargeMode =
      String(charge.charge_mode || charge.charge_type).toUpperCase();

    if (!["ONE_TIME", "RECURRING"].includes(chargeMode)) {
      throw new Error(`Invalid charge type for special charge ${index + 1}`);
    }

    const frequency = String(charge.frequency || "monthly").toLowerCase();

    if (!["monthly", "quarterly", "half_yearly", "yearly", "custom"].includes(frequency)) {
      throw new Error(`Invalid frequency for special charge ${index + 1}`);
    }

    if (chargeMode === "ONE_TIME") {
      required(charge.effective_from, "Effective From for one-time charge");
    }

    const intervalMonths = Number(charge.interval_months || 1);

    if (chargeMode === "RECURRING" &&
        frequency === "custom" &&
        (!Number.isInteger(intervalMonths) || intervalMonths < 1)) {
      throw new Error("Custom interval must be at least one month");
    }

    return {
      charge_name: String(charge.charge_name).trim(),
      amount,
      charge_mode: chargeMode,
      applicable_for: validApplicableFor(
        String(charge.applicable_for || charge.applicable_units || "ALL").toUpperCase()
      ),
      effective_from: charge.effective_from || null,
      effective_to: charge.effective_to || null,
      frequency,
      interval_months: intervalMonths,
      payable_months: charge.payable_months || null,
      description: charge.description || null
    };
  });

  savedSpecialCharges = await Model.replaceSpecialCharges(
    client,
    schema,
    validatedCharges
  );
}

let savedLateRules = [];

if (
  Object.prototype.hasOwnProperty.call(data, "late_rules") &&
  Array.isArray(data.late_rules) &&
  data.late_rules.length > 0
) {
  const dueDay = Number(data.due_day ?? 10);
  const graceDays = Number(data.grace_days ?? 0);

  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) {
    throw new Error("Due day must be between 1 and 28");
  }

  if (!Number.isInteger(graceDays) || graceDays < 0) {
    throw new Error("Grace days must be zero or greater");
  }

  // IMPORTANT: Read rules directly from data.late_rules.
  const rules = data.late_rules.map((rule, index) => {
    required(
      rule.effective_from,
      `Effective From in slab ${index + 1}`
    );

    const from = Number(rule.delay_from_days);
    const to = Number(rule.delay_to_days);

    const feeValue = validNumber(
      rule.fee_value ?? rule.late_fee_value,
      `Late fee in slab ${index + 1}`,
      false
    );

    const feeType = String(
      rule.fee_type || rule.late_fee_type || "FIXED"
    ).toUpperCase();

    if (!Number.isInteger(from) || from < 1) {
      throw new Error(`Invalid From Days in slab ${index + 1}`);
    }

    if (!Number.isInteger(to) || to < from) {
      throw new Error(`Invalid To Days in slab ${index + 1}`);
    }

    if (!["FIXED", "PERCENTAGE"].includes(feeType)) {
      throw new Error(`Invalid fee type in slab ${index + 1}`);
    }

    const effectiveFrom = String(rule.effective_from).slice(0, 10);
    const effectiveTo = rule.effective_to
      ? String(rule.effective_to).slice(0, 10)
      : null;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom)) {
      throw new Error(`Invalid Effective From in slab ${index + 1}`);
    }

    if (
      effectiveTo &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveTo) ||
        effectiveTo < effectiveFrom)
    ) {
      throw new Error(`Invalid Effective To in slab ${index + 1}`);
    }

    return {
      delay_from_days: from,
      delay_to_days: to,
      late_fee_type: feeType,
      late_fee_value: feeValue,
      effective_from: effectiveFrom,
      effective_to: effectiveTo
    };
  });

  // Reject overlapping slabs with overlapping effective dates.
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const a = rules[i];
      const b = rules[j];

      const dayOverlap =
        a.delay_from_days <= b.delay_to_days &&
        b.delay_from_days <= a.delay_to_days;

      const aEnd = a.effective_to || "9999-12-31";
      const bEnd = b.effective_to || "9999-12-31";

      const dateOverlap =
        a.effective_from <= bEnd &&
        b.effective_from <= aEnd;

      if (dayOverlap && dateOverlap) {
        throw new Error(
          `Late-fee slabs ${i + 1} and ${j + 1} overlap`
        );
      }
    }
  }

  savedLateRules = await Model.replaceLateRules(
    client,
    schema,
    rules,
    {
      due_day: dueDay,
      grace_days: graceDays
    }
  );
}

    return {
      ...savedSettings,
      floor_charges: savedFloorCharges,
      special_charges: savedSpecialCharges,
        late_rules: savedLateRules

    };
  });

export const saveBhkRateService = (organisationId, data) =>
  withClient(organisationId, async (client, schema) => {
    required(data.bhk_type, "BHK type");
    const amount = validNumber(data.amount, "BHK amount");

    return Model.saveBhkRate(client, schema, {
      bhk_type: String(data.bhk_type).trim().toUpperCase(),
      amount
    });
  });

export const deleteBhkRateService = (organisationId, id) =>
  withClient(organisationId, async (client, schema) => {
    const result = await Model.deleteBhkRate(client, schema, id);
    if (!result) throw new Error("BHK rate not found");
    return result;
  });

// ---------------- FLOOR CHARGES ----------------

export const saveFloorChargeService = (organisationId, data) =>
  withClient(organisationId, async (client, schema) => {
    required(data.floor_number, "Floor number");

    if (!["FIXED", "PERCENTAGE"].includes(data.charge_type || "FIXED")) {
      throw new Error("Floor charge type must be FIXED or PERCENTAGE");
    }

    return Model.saveFloorCharge(client, schema, {
      ...data,
      amount: validNumber(data.amount, "Floor charge")
    });
  });

export const deleteFloorChargeService = (organisationId, id) =>
  withClient(organisationId, async (client, schema) => {
    const result = await Model.deleteFloorCharge(client, schema, id);
    if (!result) throw new Error("Floor charge not found");
    return result;
  });

// ---------------- SPECIAL CHARGES ----------------

export const createSpecialChargeService = (organisationId, data) =>
  withClient(organisationId, async (client, schema) => {
    required(data.charge_name, "Charge name");

    if (!["FIXED", "PER_SQFT", "PERCENTAGE"].includes(data.charge_type || "FIXED")) {
      throw new Error("Invalid special charge type");
    }

    return Model.createSpecialCharge(client, schema, {
      ...data,
      amount: validNumber(data.amount, "Special charge"),
      applicable_for: validApplicableFor(data.applicable_for)
    });
  });

export const updateSpecialChargeService = (organisationId, id, data) =>
  withClient(organisationId, async (client, schema) => {
    required(data.charge_name, "Charge name");

    const result = await Model.updateSpecialCharge(client, schema, id, {
      ...data,
      amount: validNumber(data.amount, "Special charge"),
      applicable_for: validApplicableFor(data.applicable_for)
    });

    if (!result) throw new Error("Special charge not found");
    return result;
  });

export const deleteSpecialChargeService = (organisationId, id) =>
  withClient(organisationId, async (client, schema) => {
    const result = await Model.deleteSpecialCharge(client, schema, id);
    if (!result) throw new Error("Special charge not found");
    return result;
  });

// ---------------- LATE RULE ----------------

// export const saveLateRuleService = (organisationId, data) =>
//   withClient(organisationId, async (client, schema) => {
//     const dueDay = Number(data.due_day);
//     const graceDays = Number(data.grace_days ?? 0);

//     if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) {
//       throw new Error("Due day must be between 1 and 28");
//     }

//     if (!Number.isInteger(graceDays) || graceDays < 0) {
//       throw new Error("Grace days must be zero or greater");
//     }

//     if (!["FIXED", "PERCENTAGE"].includes(data.late_fee_type || "FIXED")) {
//       throw new Error("Late fee type must be FIXED or PERCENTAGE");
//     }

//     return Model.saveLateRule(client, schema, {
//       due_day: dueDay,
//       grace_days: graceDays,
//       late_fee_type: data.late_fee_type || "FIXED",
//       late_fee_value: validNumber(data.late_fee_value ?? 0, "Late fee")
//     });
//   });

export const saveLateRuleService = (organisationId, data) =>
  withClient(organisationId, async (client, schema) => {
    const dueDay = Number(data.due_day);
    const graceDays = Number(data.grace_days ?? 0);

    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) {
      throw new Error("Due day must be between 1 and 28");
    }

    if (!Number.isInteger(graceDays) || graceDays < 0) {
      throw new Error("Grace days must be zero or greater");
    }

    const inputRules = Array.isArray(data.rules)
      ? data.rules
      : [data];

    if (!inputRules.length) {
      throw new Error("Add at least one late-fee slab");
    }

    const rules = inputRules.map((rule, index) => {
      const from = Number(rule.delay_from_days);
      const to = Number(rule.delay_to_days);
      const feeType = String(
        rule.late_fee_type || rule.fee_type || "FIXED"
      ).toUpperCase();

      if (!Number.isInteger(from) || from < 1) {
        throw new Error(`Invalid From Days in slab ${index + 1}`);
      }

      if (!Number.isInteger(to) || to < from) {
        throw new Error(`Invalid To Days in slab ${index + 1}`);
      }

      if (!["FIXED", "PERCENTAGE"].includes(feeType)) {
        throw new Error(`Invalid fee type in slab ${index + 1}`);
      }

      const feeValue = validNumber(
        rule.late_fee_value ?? rule.fee_value ?? 0,
        `Late fee in slab ${index + 1}`
      );

      required(rule.effective_from, `Effective From in slab ${index + 1}`);

      const effectiveFrom = String(rule.effective_from).slice(0, 10);
      const effectiveTo = rule.effective_to
        ? String(rule.effective_to).slice(0, 10)
        : null;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom)) {
        throw new Error(`Invalid Effective From in slab ${index + 1}`);
      }

      if (
        effectiveTo &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveTo) ||
          effectiveTo < effectiveFrom)
      ) {
        throw new Error(`Invalid Effective To in slab ${index + 1}`);
      }

      return {
        due_day: dueDay,
        grace_days: graceDays,
        delay_from_days: from,
        delay_to_days: to,
        late_fee_type: feeType,
        late_fee_value: feeValue,
        effective_from: effectiveFrom,
        effective_to: effectiveTo
      };
    });

    // Reject overlapping day slabs when their effective dates overlap.
    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const a = rules[i];
        const b = rules[j];

        const dayOverlap =
          a.delay_from_days <= b.delay_to_days &&
          b.delay_from_days <= a.delay_to_days;

        const aEnd = a.effective_to || "9999-12-31";
        const bEnd = b.effective_to || "9999-12-31";

        const dateOverlap =
          a.effective_from <= bEnd &&
          b.effective_from <= aEnd;

        if (dayOverlap && dateOverlap) {
          throw new Error(
            `Late-fee slabs ${i + 1} and ${j + 1} overlap`
          );
        }
      }
    }

    // This model method must replace all active slabs transactionally.
    return Model.replaceLateRules(client, schema, rules, {
      due_day: dueDay,
      grace_days: graceDays
    });
  });
export const replaceLateRulesService = (
  organisationId,
  data = {}
) =>
  withClient(organisationId, async (client, schema) => {
    // Accept the different payload formats used by the frontend.
    let rules = [];

    if (Array.isArray(data)) {
      rules = data;
    } else if (Array.isArray(data.rules)) {
      rules = data.rules;
    } else if (Array.isArray(data.late_rules)) {
      rules = data.late_rules;
    } else if (
      data.delay_from_days !== undefined ||
      data.delay_to_days !== undefined
    ) {
      rules = [data];
    } else {
      throw new Error("Late payment rules are required");
    }

    if (rules.length === 0) {
      throw new Error(
        "At least one late payment rule is required"
      );
    }

    const dueDay = Number(data.due_day ?? 10);
    const graceDays = Number(data.grace_days ?? 0);

    if (
      !Number.isInteger(dueDay) ||
      dueDay < 1 ||
      dueDay > 28
    ) {
      throw new Error("Due day must be between 1 and 28");
    }

    if (
      !Number.isInteger(graceDays) ||
      graceDays < 0
    ) {
      throw new Error("Grace days cannot be negative");
    }

    const savedRules = await Model.replaceLateRules(
      client,
      schema,
      rules,
      {
        due_day: dueDay,
        grace_days: graceDays
      }
    );

    return {
      success: true,
      message: "Late payment rules saved successfully",
      late_rules: savedRules,
      lateRules: savedRules
    };
  });
// ---------------- CALCULATION ----------------

// const calculateFlatMaintenance = async (
//   client,
//   schema,
//   flat,
//   settings,
//   bhkRates,
//   floorCharges,
//   specialCharges,
//   billMonth
// ) => {
//   if (!applicableToFlat(settings.applicable_for, flat.ownership_type)) {
//     return null;
//   }

//   if (new Date(settings.effective_from) > new Date(billMonth)) {
//     throw new Error("Maintenance configuration is not effective for the selected month");
//   }

//   let baseAmount = 0;

//   switch (settings.calculation_method) {
//     case "PER_SQFT":
//       if (!flat.area_sqft || Number(flat.area_sqft) <= 0) {
//         throw new Error(`Area in sq.ft is missing for flat ${flat.flat_number}`);
//       }
//       baseAmount = Number(flat.area_sqft) * Number(settings.base_rate);
//       break;

//     case "PER_BHK": {
//       const rate = bhkRates.find(
//         (item) => item.bhk_type.toUpperCase() === String(flat.bhk_type || "").toUpperCase()
//       );

//       if (!rate) {
//         throw new Error(`BHK rate is missing for ${flat.bhk_type || "unknown"} flat ${flat.flat_number}`);
//       }

      
//       baseAmount = Number(rate.amount);
//       break;
//     }

//     case "FLAT_AMOUNT":
//       baseAmount = Number(settings.base_rate);
//       break;

//     default:
//       throw new Error("Unsupported maintenance calculation method");
//   }

//   baseAmount = roundMoney(baseAmount);

//   const floorRule = floorCharges.find(
//     (item) =>
//       item.is_active &&
//       String(item.floor_number).toLowerCase() === String(flat.floor_number || "").toLowerCase()
//   );

//   let floorAmount = 0;

//   if (floorRule) {
//     floorAmount =
//       floorRule.charge_type === "PERCENTAGE"
//         ? baseAmount * Number(floorRule.amount) / 100
//         : Number(floorRule.amount);
//   }

//   floorAmount = roundMoney(floorAmount);

//   let specialAmount = 0;

//   for (const charge of specialCharges) {
//     if (!charge.is_active) continue;
//     if (!applicableToFlat(charge.applicable_for, flat.ownership_type)) continue;

//     if (charge.effective_from && new Date(charge.effective_from) > new Date(billMonth)) {
//       continue;
//     }

//     let amount = 0;

//     if (charge.charge_type === "PER_SQFT") {
//       if (!flat.area_sqft || Number(flat.area_sqft) <= 0) {
//         throw new Error(`Area in sq.ft is missing for special charge on flat ${flat.flat_number}`);
//       }
//       amount = Number(flat.area_sqft) * Number(charge.amount);
//     } else if (charge.charge_type === "PERCENTAGE") {
//       amount = baseAmount * Number(charge.amount) / 100;
//     } else {
//       amount = Number(charge.amount);
//     }

//     specialAmount += amount;
//   }

//   specialAmount = roundMoney(specialAmount);

//   return {
//     flat_id: flat.id,
//     flat_number: flat.flat_number,
//     block_tower: flat.block_tower,
//     floor_number: flat.floor_number,
//     bhk_type: flat.bhk_type,
//     area_sqft: flat.area_sqft,
//     base_amount: baseAmount,
//     floor_charge: floorAmount,
//     special_charges: specialAmount,
//     late_fee: 0,
//     total_amount: roundMoney(baseAmount + floorAmount + specialAmount)
//   };
// };



const getFloorOrdinal = (value) => {
  const text = String(value ?? "").trim().toLowerCase();

  if (!text) return null;

  // Ground floor
  if (/^(g|ground)(\s*floor)?$/.test(text)) {
    return 0;
  }

  // Basement floors
  const basement = text.match(/^basement\s*(\d+)?$/);
  if (basement) {
    return -(Number(basement[1] || 1));
  }

  // Numeric values: 1, 1st floor, Floor 2, etc.
  const numeric = text.match(/-?\d+(?:\.\d+)?/);

  if (numeric) {
    return Number(numeric[0]);
  }

  const words = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10
  };

  for (const [word, number] of Object.entries(words)) {
    if (text.includes(word)) return number;
  }

  return null;
};

const matchesFloorRange = (flatFloor, rule) => {
  const current = getFloorOrdinal(flatFloor);

  const fromValue = rule.floor_from ?? rule.floor_number;
  const toValue = rule.floor_to ?? rule.floor_number;

  const from = getFloorOrdinal(fromValue);
  const to = getFloorOrdinal(toValue);

  // Numeric floor range, inclusive of both endpoints.
  if (current !== null && from !== null && to !== null) {
    const min = Math.min(from, to);
    const max = Math.max(from, to);

    return current >= min && current <= max;
  }

  // Fallback for custom textual floor names.
  const currentText = String(flatFloor ?? "").trim().toLowerCase();
  const fromText = String(fromValue ?? "").trim().toLowerCase();
  const toText = String(toValue ?? "").trim().toLowerCase();

  return currentText === fromText || currentText === toText;
};

const shouldApplySpecialCharge = (charge, selectedMonth) => {
  const start = String(charge.effective_from || "").slice(0, 7);
  const end = String(charge.effective_to || "").slice(0, 7);

  if (start && selectedMonth < start) return false;
  if (end && selectedMonth > end) return false;

  const mode = String(charge.charge_mode || "RECURRING").toUpperCase();

  if (mode === "ONE_TIME") {
    return !!start && selectedMonth === start;
  }

  const selectedYear = Number(selectedMonth.slice(0, 4));
  const selectedMonthNumber = Number(selectedMonth.slice(5, 7));

  if (charge.payable_months) {
    const payableMonths = String(charge.payable_months)
      .split(",")
      .map(Number)
      .filter((month) => Number.isInteger(month) && month >= 1 && month <= 12);

    if (payableMonths.length && !payableMonths.includes(selectedMonthNumber)) {
      return false;
    }
  }

  if (!start) return true;

  const startYear = Number(start.slice(0, 4));
  const startMonth = Number(start.slice(5, 7));

  const monthsElapsed =
    (selectedYear - startYear) * 12 +
    (selectedMonthNumber - startMonth);

  if (monthsElapsed < 0) return false;

  const frequency = String(charge.frequency || "monthly").toLowerCase();

  const interval = {
    monthly: 1,
    quarterly: 3,
    half_yearly: 6,
    yearly: 12,
    custom: Number(charge.interval_months || 1)
  }[frequency];

  return monthsElapsed % interval === 0;
};

const isSpecialChargeApplicableForMonth = (
  charge,
  billingMonth
) => {
  // billingMonth format: YYYY-MM
  const billMonth = String(billingMonth || "").slice(0, 7);

  const effectiveFrom = String(
    charge.effective_from || ""
  ).slice(0, 10);

  const effectiveTo = String(
    charge.effective_to || ""
  ).slice(0, 10);

  // A charge must have an effective start date.
  if (!effectiveFrom) return false;

  const startMonth = effectiveFrom.slice(0, 7);

  // Compare billing months, not individual days.
  if (billMonth < startMonth) return false;

  // Effective To is inclusive: its billing month is allowed.
  if (effectiveTo && billMonth > effectiveTo.slice(0, 7)) {
    return false;
  }

  const chargeMode = String(
    charge.charge_mode || "RECURRING"
  ).toUpperCase();

  // ONE TIME: apply only in the effective-from month.
  if (chargeMode === "ONE_TIME") {
    return billMonth === startMonth;
  }

  if (chargeMode !== "RECURRING") {
    return false;
  }

  const frequency = String(
    charge.frequency || "monthly"
  ).toLowerCase();

  const payableMonths = String(
    charge.payable_months || ""
  )
    .split(",")
    .map((value) => Number(value.trim()))
    .filter(
      (month) =>
        Number.isInteger(month) &&
        month >= 1 &&
        month <= 12
    );

  const [startYear, startMonthNumber] =
    startMonth.split("-").map(Number);

  const [billYear, billMonthNumber] =
    billMonth.split("-").map(Number);

  // Difference between effective-from month and billing month.
  const monthDifference =
    (billYear - startYear) * 12 +
    (billMonthNumber - startMonthNumber);

  if (monthDifference < 0) return false;

  // Monthly: every month.
  if (frequency === "monthly") {
    return true;
  }

  let intervalMonths;

  switch (frequency) {
    case "quarterly":
      intervalMonths = 3;
      break;

    case "half_yearly":
      intervalMonths = 6;
      break;

    case "yearly":
      intervalMonths = 12;
      break;

    case "custom":
      intervalMonths = Number(charge.interval_months);

      if (
        !Number.isInteger(intervalMonths) ||
        intervalMonths < 1
      ) {
        return false;
      }
      break;

    default:
      return false;
  }

  // Must match the recurrence interval anchored to Effective From.
  if (monthDifference % intervalMonths !== 0) {
    return false;
  }

  // If payable months are configured, the billing month
  // must also be one of those selected months.
  if (
    payableMonths.length > 0 &&
    !payableMonths.includes(billMonthNumber)
  ) {
    return false;
  }

  return true;
};

const calculateFlatMaintenance = async (
  client,
  schema,
  flat,
  settings,
  bhkRates = [],
  floorCharges = [],
  specialCharges = [],
  billMonth
) => {
  // 1. Check whether this maintenance configuration
  // applies to the flat's ownership type.
  if (
    !applicableToFlat(
      settings.applicable_for,
      flat.ownership_type
    )
  ) {
    return null;
  }

  // 2. Check effective date.
  const effectiveDate = String(settings.effective_from || "").slice(0, 10);
  const selectedMonth = `${billMonth}-01`;

  if (effectiveDate && effectiveDate > selectedMonth) {
    throw new Error(
      `Maintenance configuration is not effective for flat ${flat.flat_number} in ${billMonth}`
    );
  }

  // 3. Calculate base maintenance based on selected method.
//   const method = String(
//     settings.calculation_method || ""
//   ).toUpperCase();

//   const baseRate = Number(settings.base_rate || 0);

//   let baseAmount = 0;

  

//   switch (method) {
//   case "PER_BHK": {
//     if (!flat.bhk_type) {
//       throw new Error(
//         `BHK type is missing for flat ${flat.flat_number}`
//       );
//     }

//     const rate = bhkRates.find(
//       (item) =>
//         String(item.bhk_type || "").trim().toUpperCase() ===
//         String(flat.bhk_type).trim().toUpperCase()
//     );

//     if (!rate) {
//       throw new Error(
//         `BHK rate is missing for ${flat.bhk_type} flat ${flat.flat_number}`
//       );
//     }

//     baseAmount += Number(rate.amount || 0);
//     break;
//   }

//   case "PER_SQFT": {
//     const area = Number(flat.area_sqft || 0);
//     const ratePerSqft = Number(settings.rate_per_sqft || 0);

//     if (area <= 0) {
//       throw new Error(
//         `Area in sq.ft is missing for flat ${flat.flat_number}`
//       );
//     }

//     if (ratePerSqft <= 0) {
//       throw new Error("Please configure a valid Per Sq.ft rate");
//     }

//     baseAmount += area * ratePerSqft;
//     break;
//   }

//   case "FLAT_AMOUNT":
//     // Fixed amount only. Do not add BHK or area charges.
//     break;

//   default:
//     throw new Error(
//       `Unsupported maintenance calculation method: ${method}`
//     );
// }

 


// const fixedAmount = Number(settings.fixed_monthly_amount || 0);

// if (fixedAmount <= 0) {
//   throw new Error("Please configure a valid fixed monthly amount");
// }

//  baseAmount = fixedAmount;

// switch (method) {
//   case "PER_BHK": {
//     if (!flat.bhk_type) {
//       throw new Error(
//         `BHK type is missing for flat ${flat.flat_number}`
//       );
//     }

//     const rate = bhkRates.find(
//       (item) =>
//         String(item.bhk_type || "").trim().toUpperCase() ===
//         String(flat.bhk_type).trim().toUpperCase()
//     );

//     if (!rate) {
//       throw new Error(
//         `BHK rate is missing for ${flat.bhk_type} flat ${flat.flat_number}`
//       );
//     }

//     baseAmount += Number(rate.amount || 0);
//     break;
//   }

//   case "PER_SQFT": {
//     const area = Number(flat.area_sqft || 0);
//     const ratePerSqft = Number(settings.rate_per_sqft || 0);

//     if (area <= 0) {
//       throw new Error(
//         `Area in sq.ft is missing for flat ${flat.flat_number}`
//       );
//     }

//     if (ratePerSqft <= 0) {
//       throw new Error("Please configure a valid Per Sq.ft rate");
//     }

//     baseAmount += area * ratePerSqft;
//     break;
//   }

//   default:
//     throw new Error(
//       `Unsupported maintenance calculation method: ${method}`
//     );
// }

// baseAmount = roundMoney(baseAmount);
/////////////////////////////////////////////////////////////////////////////////

const method = String(
  settings.calculation_method || ""
).toUpperCase();

const fixedAmount = Number(
  settings.fixed_monthly_amount || 0
);

if (fixedAmount <= 0) {
  throw new Error(
    "Please configure a valid fixed monthly amount"
  );
}

let calculatedMethodAmount = 0;

switch (method) {
  case "PER_BHK": {
    if (!flat.bhk_type) {
      throw new Error(
        `BHK type is missing for flat ${flat.flat_number}`
      );
    }

    const rate = bhkRates.find(
      (item) =>
        String(item.bhk_type || "").trim().toUpperCase() ===
        String(flat.bhk_type).trim().toUpperCase()
    );

    if (!rate) {
      throw new Error(
        `BHK rate is missing for ${flat.bhk_type} flat ${flat.flat_number}`
      );
    }

    calculatedMethodAmount = Number(rate.amount || 0);
    break;
  }

  case "PER_SQFT": {
    const area = Number(flat.area_sqft || 0);
    const ratePerSqft = Number(settings.rate_per_sqft || 0);

    if (area <= 0) {
      throw new Error(
        `Area in sq.ft is missing for flat ${flat.flat_number}`
      );
    }

    if (ratePerSqft <= 0) {
      throw new Error(
        "Please configure a valid Per Sq.ft rate"
      );
    }

    calculatedMethodAmount = area * ratePerSqft;
    break;
  }

  case "FLAT_AMOUNT": {
    // Fixed monthly amount only.
    calculatedMethodAmount = 0;
    break;
  }

  default:
    throw new Error(
      `Unsupported maintenance calculation method: ${method}`
    );
}

let baseAmount = roundMoney(
  fixedAmount + calculatedMethodAmount
);

/////////////////////////////////////////////////////////////////

  // 4. Apply floor charge, if configured.
  // const floorRule = floorCharges.find(
  //   (item) =>
  //     item.is_active &&
  //     String(item.floor_number).trim().toLowerCase() ===
  //       String(flat.floor_number || "").trim().toLowerCase()
  // );

  // let floorAmount = 0;

  // if (floorRule) {
  //   floorAmount =
  //     String(floorRule.charge_type).toUpperCase() === "PERCENTAGE"
  //       ? (baseAmount * Number(floorRule.amount || 0)) / 100
  //       : Number(floorRule.amount || 0);
  // }

  // floorAmount = roundMoney(floorAmount);

// 4. Apply floor charge, if configured.
const floorRule = floorCharges.find(
  (item) =>
    item.is_active !== false &&
    matchesFloorRange(flat.floor_number, item)
);

let floorAmount = 0;

if (floorRule) {
  const chargeAmount = Number(
    floorRule.monthly_amount ?? floorRule.amount ?? 0
  );

  const chargeType = String(
    floorRule.charge_type || "FIXED"
  ).toUpperCase();

  if (chargeType === "PERCENTAGE") {
    floorAmount = (baseAmount * chargeAmount) / 100;
  } else {
    floorAmount = chargeAmount;
  }
}

floorAmount = roundMoney(floorAmount);

  // 5. Apply special charges, if configured.

  // 5. Apply special charges according to their schedules.
// 5. Apply special charges and retain an itemized breakdown.
let specialAmount = 0;
const specialChargeItems = [];

for (const charge of specialCharges) {
  if (charge.is_active === false) continue;

  if (!applicableToFlat(charge.applicable_for, flat.ownership_type)) {
    continue;
  }

  // Apply the same date and frequency rules used in Stage 2.
  if (!isSpecialChargeApplicableForMonth(charge, billMonth)) {
    continue;
  }

  let amount = 0;
  const chargeType = String(
    charge.charge_type || "FIXED"
  ).toUpperCase();

  if (chargeType === "PER_SQFT") {
    const area = Number(flat.area_sqft || 0);

    if (area <= 0) {
      throw new Error(
        `Area in sq.ft is missing for special charge "${charge.charge_name}" on flat ${flat.flat_number}`
      );
    }

    amount = area * Number(charge.amount || 0);
  } else if (chargeType === "PERCENTAGE") {
    amount = (baseAmount * Number(charge.amount || 0)) / 100;
  } else {
    amount = Number(charge.amount || 0);
  }

  amount = roundMoney(amount);
  specialAmount += amount;

  specialChargeItems.push({
    id: charge.id,
    charge_name: charge.charge_name,
    charge_mode: String(
      charge.charge_mode || "RECURRING"
    ).toUpperCase(),
    frequency: charge.frequency || "monthly",
    interval_months: charge.interval_months || null,
    payable_months: charge.payable_months || null,
    amount,
  });
}

specialAmount = roundMoney(specialAmount);



  // let specialAmount = 0;

  // for (const charge of specialCharges) {
  //   if (charge.is_active === false) continue;

  //   // Check whether this charge applies to this flat.
  //   if (
  //     !applicableToFlat(
  //       charge.applicable_for,
  //       flat.ownership_type
  //     )
  //   ) {
  //     continue;
  //   }

  //   // Check One Time / Recurring schedule and effective dates.
  //   const isApplicable = isSpecialChargeApplicableForMonth(
  //     charge,
  //     billMonth
  //   );

  //   if (!isApplicable) continue;

  //   let amount = 0;

  //   // charge_type represents calculation type, not charge mode.
  //   const chargeType = String(
  //     charge.charge_type || "FIXED"
  //   ).toUpperCase();

  //   if (chargeType === "PER_SQFT") {
  //     const area = Number(flat.area_sqft || 0);

  //     if (area <= 0) {
  //       throw new Error(
  //         `Area in sq.ft is missing for special charge "${charge.charge_name}" on flat ${flat.flat_number}`
  //       );
  //     }

  //     amount = area * Number(charge.amount || 0);

  //   } else if (chargeType === "PERCENTAGE") {
  //     amount =
  //       (baseAmount * Number(charge.amount || 0)) / 100;

  //   } else {
  //     // FIXED amount.
  //     amount = Number(charge.amount || 0);
  //   }

  //   specialAmount += amount;
  // }

  // specialAmount = roundMoney(specialAmount);
//////////////////////////////////
//   let specialAmount = 0;

//   for (const charge of specialCharges) {
//     if (!charge.is_active) continue;

//     if (
//       !applicableToFlat(
//         charge.applicable_for,
//         flat.ownership_type
//       )
//     ) {
//       continue;
//     }

//     if (!shouldApplySpecialCharge(charge, billMonth)) {
//     continue;
// }

//     const chargeEffectiveDate = String(
//       charge.effective_from || ""
//     ).slice(0, 10);

//     if (
//       chargeEffectiveDate &&
//       chargeEffectiveDate > selectedMonth
//     ) {
//       continue;
//     }

//     let amount = 0;

//     const chargeType = String(
//       charge.charge_type || ""
//     ).toUpperCase();

//     if (chargeType === "PER_SQFT") {
//       const area = Number(flat.area_sqft || 0);

//       if (area <= 0) {
//         throw new Error(
//           `Area in sq.ft is missing for special charge on flat ${flat.flat_number}`
//         );
//       }

//       amount = area * Number(charge.amount || 0);
//     } else if (chargeType === "PERCENTAGE") {
//       amount =
//         (baseAmount * Number(charge.amount || 0)) / 100;
//     } else {
//       amount = Number(charge.amount || 0);
//     }

//     specialAmount += amount;
//   }

//   specialAmount = roundMoney(specialAmount);

  // 6. Return calculated flat maintenance.
  // return {
  //   flat_id: flat.id,
  //   flat_number: flat.flat_number,
  //   block_tower: flat.block_tower,
  //   floor_number: flat.floor_number,
  //   bhk_type: flat.bhk_type,
  //   area_sqft: flat.area_sqft,

  //   calculation_method: method,

  //   base_amount: baseAmount,
  //   floor_charge: floorAmount,
  //   special_charges: specialAmount,
  //   late_fee: 0,

  //   total_amount: roundMoney(
  //     baseAmount + floorAmount + specialAmount
  //   )
  // };

  return {
  flat_id: flat.id,
  flat_number: flat.flat_number,
  block_tower: flat.block_tower,
  floor_number: flat.floor_number,
  bhk_type: flat.bhk_type,
  area_sqft: flat.area_sqft,

  calculation_method: method,

  fixed_monthly_amount: fixedAmount,
  calculated_method_amount: roundMoney(
    baseAmount - fixedAmount
  ),

  base_amount: baseAmount,
  floor_charge: floorAmount,
  special_charges: specialAmount,
  special_charge_items: specialChargeItems,
  late_fee: 0,

  total_amount: roundMoney(
    baseAmount + floorAmount + specialAmount
  )
};
};

const validateMonth = (month) => {
  if (!/^\d{4}-\d{2}$/.test(String(month || ""))) {
    throw new Error("Month must be in YYYY-MM format");
  }

  const [year, monthNumber] = month.split("-").map(Number);
  if (monthNumber < 1 || monthNumber > 12) {
    throw new Error("Invalid billing month");
  }

  return `${month}-01`;
};

// const buildMaintenancePreview = async (client, schema, month) => {
//   const billMonth = validateMonth(month);

//   const [
//     settings,
//     flats,
//     bhkRates,
//     floorCharges,
//     specialCharges,
//     lateRule
//   ] = await Promise.all([
//     Model.getMaintenanceSettings(client, schema),
//     Model.getFlats(client, schema),
//     Model.getBhkRates(client, schema),
//     Model.getFloorCharges(client, schema),
//     Model.getSpecialCharges(client, schema),
//     Model.getLateRule(client, schema)
//   ]);

//   if (!settings) {
//     throw new Error("Please configure base maintenance charges first");
//   }

//   const activeFlats = flats.filter(
//     (flat) => flat.is_active && flat.occupancy_status !== "Vacant"
//   );

//   const results = [];

//   for (const flat of activeFlats) {
//     const calculated = await calculateFlatMaintenance(
//       client,
//       schema,
//       flat,
//       settings,
//       bhkRates,
//       floorCharges,
//       specialCharges,
//       billMonth
//     );

//     if (calculated) results.push(calculated);
//   }

//   const [year, monthNumber] = billMonth.split("-").map(Number);
//   const dueDate = lateRule
//     ? `${year}-${String(monthNumber).padStart(2, "0")}-${String(lateRule.due_day).padStart(2, "0")}`
//     : null;

//   return {
//     bill_month: billMonth,
//     due_date: dueDate,
//     calculation_method: settings.calculation_method,
//     flats_count: results.length,
//     total_amount: roundMoney(results.reduce((sum, row) => sum + row.total_amount, 0)),
//     bills: results
//   };
// };



const validateDate = (value, field = "As Of Date") => {
  const date = String(value || "").slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`${field} must be in YYYY-MM-DD format`);
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new Error(`Invalid ${field}`);
  }

  return date;
};

const addDaysToDate = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const getDaysBetween = (fromDate, toDate) => {
  const from = new Date(`${fromDate}T00:00:00.000Z`);
  const to = new Date(`${toDate}T00:00:00.000Z`);

  return Math.max(
    0,
    Math.floor((to.getTime() - from.getTime()) / 86400000)
  );
};


const calculateLateFee = ({
  amount,
  dueDate,
  graceDays = 0,
  asOfDate,
  rules = [],
  billingMonth
}) => {
  const maintenanceAmount = Number(amount || 0);

  const noFeeResult = {
    grace_end_date: null,
    overdue_days: 0,
    matched_late_rule: null,
    late_fee: 0
  };

  if (
    maintenanceAmount <= 0 ||
    !dueDate ||
    !Array.isArray(rules) ||
    rules.length === 0
  ) {
    return noFeeResult;
  }

  // Parse YYYY-MM-DD without server timezone differences.
  const parseDate = (value) => {
    const dateString = String(value).slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      throw new Error(`Invalid date: ${value}`);
    }

    const [year, month, day] = dateString.split("-").map(Number);

    return Date.UTC(year, month - 1, day);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);

    return [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0")
    ].join("-");
  };

  const dueTimestamp = parseDate(dueDate);
  const asOfTimestamp = parseDate(asOfDate);

  const graceEndTimestamp =
    dueTimestamp + Number(graceDays || 0) * 86400000;

  const graceEndDate = formatDate(graceEndTimestamp);

  // No late fee before or on the grace-period end date.
  if (asOfTimestamp <= graceEndTimestamp) {
    return {
      ...noFeeResult,
      grace_end_date: graceEndDate
    };
  }

  // Number of days overdue after the grace period.
  const overdueDays = Math.floor(
    (asOfTimestamp - graceEndTimestamp) / 86400000
  );

  const calculationDate = formatDate(asOfTimestamp);

  // Find the applicable late-fee slab.
  const applicableRule = rules.find((rule) => {
    const from = Number(rule.delay_from_days);
    const to = Number(rule.delay_to_days);

    const effectiveFrom = rule.effective_from
      ? String(rule.effective_from).slice(0, 10)
      : "0001-01-01";

    const effectiveTo = rule.effective_to
      ? String(rule.effective_to).slice(0, 10)
      : "9999-12-31";

    return (
      rule.is_active !== false &&
      overdueDays >= from &&
      overdueDays <= to &&
      calculationDate >= effectiveFrom &&
      calculationDate <= effectiveTo
    );
  });

  if (!applicableRule) {
    return {
      grace_end_date: graceEndDate,
      overdue_days: overdueDays,
      matched_late_rule: null,
      late_fee: 0
    };
  }

  const feeType = String(
    applicableRule.late_fee_type || "FIXED"
  ).toUpperCase();

  const feeValue = Number(
    applicableRule.late_fee_value || 0
  );

  let lateFee = 0;

  if (feeType === "FIXED") {
    lateFee = feeValue;
  } else if (feeType === "PERCENTAGE") {
    lateFee = (maintenanceAmount * feeValue) / 100;
  }

  return {
    grace_end_date: graceEndDate,
    overdue_days: overdueDays,

    matched_late_rule: {
      id: applicableRule.id,
      delay_from_days: applicableRule.delay_from_days,
      delay_to_days: applicableRule.delay_to_days,
      late_fee_type: feeType,
      late_fee_value: feeValue
    },

    late_fee: roundMoney(lateFee)
  };
};

// const calculateLateFee = ({
//   amount,
//   dueDate,
//   graceDays,
//   asOfDate,
//   rules,
//   billingMonth
// }) => {
//   const graceEndDate = addDaysToDate(dueDate, graceDays);
//   const overdueDays = getDaysBetween(graceEndDate, asOfDate);

//   if (overdueDays <= 0) {
//     return {
//       grace_end_date: graceEndDate,
//       overdue_days: 0,
//       matched_late_rule: null,
//       late_fee: 0
//     };
//   }

//   const billDate = `${billingMonth}-01`;

//   const applicableRules = rules.filter((rule) => {
//     const effectiveFrom = String(rule.effective_from || "").slice(0, 10);
//     const effectiveTo = rule.effective_to
//       ? String(rule.effective_to).slice(0, 10)
//       : null;

//     return (
//       (!effectiveFrom || billDate >= effectiveFrom) &&
//       (!effectiveTo || billDate <= effectiveTo) &&
//       overdueDays >= Number(rule.delay_from_days) &&
//       overdueDays <= Number(rule.delay_to_days)
//     );
//   });

//   // Only one matching slab is applied. Overlaps should be rejected on save.
//   const matchedRule = applicableRules[0] || null;

//   if (!matchedRule) {
//     return {
//       grace_end_date: graceEndDate,
//       overdue_days: overdueDays,
//       matched_late_rule: null,
//       late_fee: 0
//     };
//   }

//   const feeType = String(matchedRule.late_fee_type).toUpperCase();
//   const feeValue = Number(matchedRule.late_fee_value || 0);

//   const lateFee =
//     feeType === "PERCENTAGE"
//       ? (Number(amount) * feeValue) / 100
//       : feeValue;

//   return {
//     grace_end_date: graceEndDate,
//     overdue_days: overdueDays,
//     matched_late_rule: {
//       id: matchedRule.id,
//       delay_from_days: matchedRule.delay_from_days,
//       delay_to_days: matchedRule.delay_to_days,
//       late_fee_type: feeType,
//       late_fee_value: feeValue
//     },
//     late_fee: roundMoney(lateFee)
//   };
// };

// const calculateLateFee = ({
//   maintenanceAmount,
//   dueDay,
//   graceDays,
//   lateRules,
//   billingMonth,
//   calculationDate = new Date()
// }) => {
//   const amount = Number(maintenanceAmount || 0);

//   if (!amount || !lateRules?.length) {
//     return {
//       late_fee: 0,
//       delay_days: 0,
//       late_fee_type: null,
//       late_fee_description: "No late fee"
//     };
//   }

//   const [year, month] = billingMonth.split("-").map(Number);

//   // Due date for the selected billing month.
//   const lastDay = new Date(year, month, 0).getDate();

//   const dueDate = new Date(
//     year,
//     month - 1,
//     Math.min(Number(dueDay), lastDay)
//   );

//   const graceEndDate = new Date(dueDate);
//   graceEndDate.setDate(
//     graceEndDate.getDate() + Number(graceDays || 0)
//   );

//   const today = new Date(calculationDate);
//   today.setHours(0, 0, 0, 0);

//   graceEndDate.setHours(0, 0, 0, 0);

//   if (today <= graceEndDate) {
//     return {
//       late_fee: 0,
//       delay_days: 0,
//       late_fee_type: null,
//       late_fee_description: "Payment is within the due period"
//     };
//   }

//   const delayDays = Math.floor(
//     (today - graceEndDate) / (1000 * 60 * 60 * 24)
//   );

//   const applicableRule = lateRules.find((rule) => {
//     const from = Number(rule.delay_from_days);
//     const to = Number(rule.delay_to_days);

//     const effectiveFrom = String(rule.effective_from).slice(0, 10);
//     const effectiveTo = rule.effective_to
//       ? String(rule.effective_to).slice(0, 10)
//       : "9999-12-31";

//     const calculationDateString = [
//       today.getFullYear(),
//       String(today.getMonth() + 1).padStart(2, "0"),
//       String(today.getDate()).padStart(2, "0")
//     ].join("-");

//     return (
//       delayDays >= from &&
//       delayDays <= to &&
//       calculationDateString >= effectiveFrom &&
//       calculationDateString <= effectiveTo
//     );
//   });

//   if (!applicableRule) {
//     return {
//       late_fee: 0,
//       delay_days: delayDays,
//       late_fee_type: null,
//       late_fee_description: "No applicable late-fee slab"
//     };
//   }

//   const feeValue = Number(applicableRule.late_fee_value || 0);

//   const lateFee =
//     applicableRule.late_fee_type === "PERCENTAGE"
//       ? (amount * feeValue) / 100
//       : feeValue;

//   return {
//     late_fee: Number(lateFee.toFixed(2)),
//     delay_days: delayDays,
//     late_fee_type: applicableRule.late_fee_type,
//     late_fee_description:
//       applicableRule.late_fee_type === "PERCENTAGE"
//         ? `${feeValue}% late fee`
//         : `₹${feeValue} fixed late fee`
//   };
// };
const buildMaintenancePreview = async (
  client,
  schema,
  month,
  flatId = null,
  requestedAsOfDate = null
) => {
  // validateMonth returns YYYY-MM-01.
  const billMonth = validateMonth(month);
  const billingMonth = billMonth.slice(0, 7);

  const asOfDate = validateDate(
    requestedAsOfDate ||
    new Date().toISOString().slice(0, 10)
  );

  const [
    settings,
    flats,
    bhkRates,
    floorCharges,
    specialCharges,
    lateRules
  ] = await Promise.all([
    Model.getMaintenanceSettings(client, schema),

    flatId
      ? Model.getFlatById(client, schema, flatId).then(
          (flat) => flat ? [flat] : []
        )
      : Model.getFlats(client, schema),

    Model.getBhkRates(client, schema),
    Model.getFloorCharges(client, schema),
    Model.getSpecialCharges(client, schema),
    Model.getLateRules(client, schema)
  ]);

  if (!settings) {
    throw new Error(
      "Please configure base maintenance charges first"
    );
  }

  if (flatId && flats.length === 0) {
    throw new Error("Flat not found");
  }

  // Only active, occupied flats are included.
  const activeFlats = flats.filter((flat) => {
    const occupancy = String(
      flat.occupancy_status || ""
    ).toUpperCase();

    return (
      flat.is_active !== false &&
      occupancy !== "VACANT"
    );
  });

  // Select the late-payment policy effective for this billing month.
  // const applicableRules = lateRules.filter((rule) => {
  //   const effectiveFrom = String(
  //     rule.effective_from || ""
  //   ).slice(0, 10);

  //   const effectiveTo = rule.effective_to
  //     ? String(rule.effective_to).slice(0, 10)
  //     : null;

  //   return (
  //     (!effectiveFrom || effectiveFrom <= billMonth) &&
  //     (!effectiveTo || effectiveTo >= billMonth)
  //   );
  // });

const applicableRules = lateRules.filter((rule) => {
  const effectiveFrom = String(
    rule.effective_from || ""
  ).slice(0, 10);

  const effectiveTo = rule.effective_to
    ? String(rule.effective_to).slice(0, 10)
    : null;

  return (
    rule.is_active !== false &&
    (!effectiveFrom || effectiveFrom <= asOfDate) &&
    (!effectiveTo || effectiveTo >= asOfDate)
  );
});

  // All slabs belonging to the same policy share due_day and grace_days.
  const policy = applicableRules[0] || null;

  const dueDay = policy ? Number(policy.due_day) : null;
  const graceDays = policy
    ? Number(policy.grace_days || 0)
    : 0;

  const dueDate = dueDay
    ? `${billingMonth}-${String(dueDay).padStart(2, "0")}`
    : null;

  const results = [];

  for (const flat of activeFlats) {
    const calculated = await calculateFlatMaintenance(
      client,
      schema,
      flat,
      settings,
      bhkRates,
      floorCharges,
      specialCharges,
      billingMonth
    );

    if (!calculated) continue;

    // Calculate late fee using the selected as-of date.
    const lateCalculation = dueDate
      ? calculateLateFee({
          amount: calculated.total_amount,
          dueDate,
          graceDays,
          asOfDate,
          rules: applicableRules,
          billingMonth
        })
      : {
          grace_end_date: null,
          overdue_days: 0,
          matched_late_rule: null,
          late_fee: 0
        };

    const finalTotal = roundMoney(
      Number(calculated.total_amount) +
      Number(lateCalculation.late_fee)
    );

    results.push({
      ...calculated,

      due_date: dueDate,
      grace_end_date: lateCalculation.grace_end_date,
      as_of_date: asOfDate,
      overdue_days: lateCalculation.overdue_days,

      matched_late_rule: lateCalculation.matched_late_rule,

      late_fee: lateCalculation.late_fee,
      total_amount: finalTotal
    });
  }

  return {
    bill_month: billMonth,
    due_date: dueDate,
    grace_days: graceDays,
    as_of_date: asOfDate,

    calculation_method: settings.calculation_method,

    flats_count: results.length,

    total_amount: roundMoney(
      results.reduce(
        (sum, row) => sum + Number(row.total_amount || 0),
        0
      )
    ),

    bills: results
  };
};


// const buildMaintenancePreview = async (
//   client,
//   schema,
//   month,
//   flatId = null,
//   requestedAsOfDate = null
// ) => {
//   const billMonth = validateMonth(month);
//   const asOfDate = validateDate(
//     requestedAsOfDate || new Date().toISOString().slice(0, 10)
//   );

// const buildMaintenancePreview = async (
//   client,
//   schema,
//   month,
//   flatId = null
// ) => {
//   const billMonth = validateMonth(month);

//   const [
//     settings,
//     flats,
//     bhkRates,
//     floorCharges,
//     specialCharges,
//     lateRule
//   ] = await Promise.all([
//     Model.getMaintenanceSettings(client, schema),

//     flatId
//       ? Model.getFlatById(client, schema, flatId).then((flat) =>
//           flat ? [flat] : []
//         )
//       : Model.getFlats(client, schema),

//     Model.getBhkRates(client, schema),
//     Model.getFloorCharges(client, schema),
//     Model.getSpecialCharges(client, schema),
//     Model.getLateRule(client, schema)
//   ]);

//   if (!settings) {
//     throw new Error("Please configure base maintenance charges first");
//   }

//   // When a particular flat was requested, verify it exists.
//   if (flatId && flats.length === 0) {
//     throw new Error("Flat not found");
//   }

//   const activeFlats = flats.filter((flat) => {
//     const occupancy = String(
//       flat.occupancy_status || ""
//     ).toUpperCase();

//     return (
//       flat.is_active === true &&
//       occupancy !== "VACANT"
//     );
//   });

//   const results = [];

//   for (const flat of activeFlats) {
//     console.log("[Maintenance Preview] Calculation method:", settings.calculation_method);
// console.log("[Maintenance Preview] Flat:", {
//   flat_id: flat.id,
//   flat_number: flat.flat_number,
//   bhk_type: flat.bhk_type,
//   area_sqft: flat.area_sqft
// });
//     const calculated = await calculateFlatMaintenance(
//       client,
//       schema,
//       flat,
//       settings,
//       bhkRates,
//       floorCharges,
//       specialCharges,
//       billMonth
//     );

//     if (calculated) {
//       results.push(calculated);
//     }
//   }

//   const [year, monthNumber] = billMonth.split("-").map(Number);

//   const dueDate = lateRule
//     ? `${year}-${String(monthNumber).padStart(2, "0")}-${String(
//         lateRule.due_day
//       ).padStart(2, "0")}`
//     : null;

//   return {
//     bill_month: billMonth,
//     due_date: dueDate,
//     calculation_method: settings.calculation_method,
//     flats_count: results.length,
//     total_amount: roundMoney(
//       results.reduce(
//         (sum, row) => sum + Number(row.total_amount),
//         0
//       )
//     ),
//     bills: results
//   };
// };
//  export const previewMaintenanceService = (
//   organisationId,
//   flatId,
//   month
// ) =>
//   withClient(organisationId, async (client, schema) => {
//     const parsedFlatId = Number(flatId);

//     if (
//       !Number.isInteger(parsedFlatId) ||
//       parsedFlatId <= 0
//     ) {
//       throw new Error("A valid flat_id is required");
//     }

//     return buildMaintenancePreview(
//       client,
//       schema,
//       month,
//       parsedFlatId
//     );
//   });
// ---------------- PREVIEW MAINTENANCE ----------------

// export const previewMaintenanceService = (
//   organisationId,
//   flatId,
//   month
// ) =>
//   withClient(organisationId, async (client, schema) => {
//     const parsedFlatId = Number(flatId);

//     if (
//       !Number.isInteger(parsedFlatId) ||
//       parsedFlatId <= 0
//     ) {
//       throw new Error("A valid flat_id is required");
//     }

//     return buildMaintenancePreview(
//       client,
//       schema,
//       month,
//       parsedFlatId
//     );
//   });


export const previewMaintenanceService = (
  organisationId,
  flatId,
  month,
  asOfDate
) =>
  withClient(organisationId, async (client, schema) => {
    const parsedFlatId = Number(flatId);

    if (!Number.isInteger(parsedFlatId) || parsedFlatId <= 0) {
      throw new Error("A valid flat_id is required");
    }

    return buildMaintenancePreview(
      client,
      schema,
      month,
      parsedFlatId,
      asOfDate
    );
  });

export const generateMaintenanceBillsService = async (organisationId, month) => {
  const billMonth = validateMonth(month);
  const schema = await getSchemaName(organisationId);
  const client = await firstDB.connect();

  try {
    await client.query("BEGIN");

    const preview = await buildMaintenancePreview(client, schema, month);
    const generated = [];

    for (const bill of preview.bills) {
      const saved = await Model.insertBill(client, schema, {
        ...bill,
        bill_month: billMonth,
        due_date: preview.due_date
      });

      if (saved) generated.push(saved);
    }

    await client.query("COMMIT");

    return {
      bill_month: billMonth,
      generated_count: generated.length,
      skipped_count: preview.bills.length - generated.length,
      total_amount: preview.total_amount,
      bills: generated
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getMaintenanceBillsService = (organisationId, month) =>
  withClient(organisationId, (client, schema) =>
    Model.getBills(client, schema, month ? validateMonth(month) : null)
  );
