
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

  try {
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

export const getFlatsService = (organisationId) =>
  withClient(organisationId, (client, schema) =>
    Model.getFlats(client, schema)
  );

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

export const deleteFlatService = (organisationId, id) =>
  withClient(organisationId, async (client, schema) => {
    const result = await Model.deleteFlat(client, schema, id);
    if (!result) throw new Error("Flat not found");
    return result;
  });

// ---------------- SETTINGS ----------------

export const getMaintenanceConfigurationService = (organisationId) =>
  withClient(organisationId, async (client, schema) => {
    const [
      settings,
      bhkRates,
      floorCharges,
      specialCharges,
      lateRule
    ] = await Promise.all([
      Model.getMaintenanceSettings(client, schema),
      Model.getBhkRates(client, schema),
      Model.getFloorCharges(client, schema),
      Model.getSpecialCharges(client, schema),
      Model.getLateRule(client, schema)
    ]);

    return {
      settings,
      bhkRates,
      floorCharges,
      specialCharges,
      lateRule
    };
  });

export const saveMaintenanceSettingsService = (organisationId, data) =>
  withClient(organisationId, async (client, schema) => {
    const methods = ["PER_SQFT", "PER_BHK", "FLAT_AMOUNT"];

    if (!methods.includes(data.calculation_method)) {
      throw new Error("Invalid calculation method");
    }

    required(data.effective_from, "Effective from");

    const amount = validNumber(data.base_rate ?? 0, "Base rate");

    if (data.calculation_method === "PER_SQFT" && amount === 0) {
      throw new Error("Enter a rate greater than zero for Per Sq.ft");
    }

    if (data.calculation_method === "FLAT_AMOUNT" && amount === 0) {
      throw new Error("Enter a flat amount greater than zero");
    }

    return Model.saveMaintenanceSettings(client, schema, {
      ...data,
      base_rate: amount,
      applicable_for: validApplicableFor(data.applicable_for)
    });
  });

// ---------------- BHK RATES ----------------

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

    if (!["FIXED", "PERCENTAGE"].includes(data.late_fee_type || "FIXED")) {
      throw new Error("Late fee type must be FIXED or PERCENTAGE");
    }

    return Model.saveLateRule(client, schema, {
      due_day: dueDay,
      grace_days: graceDays,
      late_fee_type: data.late_fee_type || "FIXED",
      late_fee_value: validNumber(data.late_fee_value ?? 0, "Late fee")
    });
  });

// ---------------- CALCULATION ----------------

const calculateFlatMaintenance = async (
  client,
  schema,
  flat,
  settings,
  bhkRates,
  floorCharges,
  specialCharges,
  billMonth
) => {
  if (!applicableToFlat(settings.applicable_for, flat.ownership_type)) {
    return null;
  }

  if (new Date(settings.effective_from) > new Date(billMonth)) {
    throw new Error("Maintenance configuration is not effective for the selected month");
  }

  let baseAmount = 0;

  switch (settings.calculation_method) {
    case "PER_SQFT":
      if (!flat.area_sqft || Number(flat.area_sqft) <= 0) {
        throw new Error(`Area in sq.ft is missing for flat ${flat.flat_number}`);
      }
      baseAmount = Number(flat.area_sqft) * Number(settings.base_rate);
      break;

    case "PER_BHK": {
      const rate = bhkRates.find(
        (item) => item.bhk_type.toUpperCase() === String(flat.bhk_type || "").toUpperCase()
      );

      if (!rate) {
        throw new Error(`BHK rate is missing for ${flat.bhk_type || "unknown"} flat ${flat.flat_number}`);
      }

      
      baseAmount = Number(rate.amount);
      break;
    }

    case "FLAT_AMOUNT":
      baseAmount = Number(settings.base_rate);
      break;

    default:
      throw new Error("Unsupported maintenance calculation method");
  }

  baseAmount = roundMoney(baseAmount);

  const floorRule = floorCharges.find(
    (item) =>
      item.is_active &&
      String(item.floor_number).toLowerCase() === String(flat.floor_number || "").toLowerCase()
  );

  let floorAmount = 0;

  if (floorRule) {
    floorAmount =
      floorRule.charge_type === "PERCENTAGE"
        ? baseAmount * Number(floorRule.amount) / 100
        : Number(floorRule.amount);
  }

  floorAmount = roundMoney(floorAmount);

  let specialAmount = 0;

  for (const charge of specialCharges) {
    if (!charge.is_active) continue;
    if (!applicableToFlat(charge.applicable_for, flat.ownership_type)) continue;

    if (charge.effective_from && new Date(charge.effective_from) > new Date(billMonth)) {
      continue;
    }

    let amount = 0;

    if (charge.charge_type === "PER_SQFT") {
      if (!flat.area_sqft || Number(flat.area_sqft) <= 0) {
        throw new Error(`Area in sq.ft is missing for special charge on flat ${flat.flat_number}`);
      }
      amount = Number(flat.area_sqft) * Number(charge.amount);
    } else if (charge.charge_type === "PERCENTAGE") {
      amount = baseAmount * Number(charge.amount) / 100;
    } else {
      amount = Number(charge.amount);
    }

    specialAmount += amount;
  }

  specialAmount = roundMoney(specialAmount);

  return {
    flat_id: flat.id,
    flat_number: flat.flat_number,
    block_tower: flat.block_tower,
    floor_number: flat.floor_number,
    bhk_type: flat.bhk_type,
    area_sqft: flat.area_sqft,
    base_amount: baseAmount,
    floor_charge: floorAmount,
    special_charges: specialAmount,
    late_fee: 0,
    total_amount: roundMoney(baseAmount + floorAmount + specialAmount)
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
const buildMaintenancePreview = async (
  client,
  schema,
  month,
  flatId = null
) => {
  const billMonth = validateMonth(month);

  const [
    settings,
    flats,
    bhkRates,
    floorCharges,
    specialCharges,
    lateRule
  ] = await Promise.all([
    Model.getMaintenanceSettings(client, schema),

    flatId
      ? Model.getFlatById(client, schema, flatId).then((flat) =>
          flat ? [flat] : []
        )
      : Model.getFlats(client, schema),

    Model.getBhkRates(client, schema),
    Model.getFloorCharges(client, schema),
    Model.getSpecialCharges(client, schema),
    Model.getLateRule(client, schema)
  ]);

  if (!settings) {
    throw new Error("Please configure base maintenance charges first");
  }

  // When a particular flat was requested, verify it exists.
  if (flatId && flats.length === 0) {
    throw new Error("Flat not found");
  }

  const activeFlats = flats.filter((flat) => {
    const occupancy = String(
      flat.occupancy_status || ""
    ).toUpperCase();

    return (
      flat.is_active === true &&
      occupancy !== "VACANT"
    );
  });

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
      billMonth
    );

    if (calculated) {
      results.push(calculated);
    }
  }

  const [year, monthNumber] = billMonth.split("-").map(Number);

  const dueDate = lateRule
    ? `${year}-${String(monthNumber).padStart(2, "0")}-${String(
        lateRule.due_day
      ).padStart(2, "0")}`
    : null;

  return {
    bill_month: billMonth,
    due_date: dueDate,
    calculation_method: settings.calculation_method,
    flats_count: results.length,
    total_amount: roundMoney(
      results.reduce(
        (sum, row) => sum + Number(row.total_amount),
        0
      )
    ),
    bills: results
  };
};
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

export const previewMaintenanceService = (
  organisationId,
  flatId,
  month
) =>
  withClient(organisationId, async (client, schema) => {
    const parsedFlatId = Number(flatId);

    if (
      !Number.isInteger(parsedFlatId) ||
      parsedFlatId <= 0
    ) {
      throw new Error("A valid flat_id is required");
    }

    return buildMaintenancePreview(
      client,
      schema,
      month,
      parsedFlatId
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
