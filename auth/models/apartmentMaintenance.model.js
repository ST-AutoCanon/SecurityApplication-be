
// const validateSchema = (schema) => {
//   if (!schema || !/^[a-zA-Z0-9_]+$/.test(schema)) {
//     throw new Error("Invalid organisation schema");
//   }
//   return `"${schema}"`;
// };

// export const query = async (client, schema, sql, values = []) => {
//   const s = validateSchema(schema);
//   return client.query(sql.replaceAll("{{schema}}", s), values);
// };

// // ---------------- FLATS ----------------

// export const getFlats = async (client, schema) => {
//   const result = await query(client, schema, `
//     SELECT *
//     FROM {{schema}}.apartment_flats
//     ORDER BY block_tower, floor_number, flat_number
//   `);
//   return result.rows;
// };

// export const getFlatById = async (client, schema, id) => {
//   const result = await query(client, schema, `
//     SELECT *
//     FROM {{schema}}.apartment_flats
//     WHERE id = $1
//     LIMIT 1
//   `, [id]);
//   return result.rows[0] || null;
// };

// export const createFlat = async (client, schema, data) => {
//   const result = await query(client, schema, `
//     INSERT INTO {{schema}}.apartment_flats
//       (apartment_name, block_tower, floor_number, flat_number,
//        bhk_type, area_sqft, ownership_type, occupancy_status, is_active)
//     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
//     RETURNING *
//   `, [
//     data.apartment_name || "",
//     data.block_tower || "",
//     data.floor_number || null,
//     data.flat_number,
//     data.bhk_type || null,
//     data.area_sqft || null,
//     data.ownership_type || "OWNER",
//     data.occupancy_status || "Occupied",
//     data.is_active !== false
//   ]);
//   return result.rows[0];
// };

// export const updateFlat = async (client, schema, id, data) => {
//   const result = await query(client, schema, `
//     UPDATE {{schema}}.apartment_flats
//     SET apartment_name = $1,
//         block_tower = $2,
//         floor_number = $3,
//         flat_number = $4,
//         bhk_type = $5,
//         area_sqft = $6,
//         ownership_type = $7,
//         occupancy_status = $8,
//         is_active = $9,
//         updated_at = CURRENT_TIMESTAMP
//     WHERE id = $10
//     RETURNING *
//   `, [
//     data.apartment_name || "",
//     data.block_tower || "",
//     data.floor_number || null,
//     data.flat_number,
//     data.bhk_type || null,
//     data.area_sqft || null,
//     data.ownership_type || "OWNER",
//     data.occupancy_status || "Occupied",
//     data.is_active !== false,
//     id
//   ]);
//   return result.rows[0] || null;
// };

// export const deleteFlat = async (client, schema, id) => {
//   const result = await query(client, schema, `
//     DELETE FROM {{schema}}.apartment_flats
//     WHERE id = $1
//     RETURNING id
//   `, [id]);
//   return result.rows[0] || null;
// };

// // ---------------- BASE SETTINGS ----------------

// export const getMaintenanceSettings = async (client, schema) => {
//   const result = await query(client, schema, `
//     SELECT *
//     FROM {{schema}}.apartment_maintenance_settings
//     WHERE is_active = TRUE
//     ORDER BY id DESC
//     LIMIT 1
//   `);
//   return result.rows[0] || null;
// };

// export const saveMaintenanceSettings = async (client, schema, data) => {
//   await query(client, schema, `
//     UPDATE {{schema}}.apartment_maintenance_settings
//     SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
//     WHERE is_active = TRUE
//   `);

//   const result = await query(client, schema, `
//     INSERT INTO {{schema}}.apartment_maintenance_settings
//       (calculation_method, base_rate, applicable_for,
//        effective_from, description, is_active)
//     VALUES ($1,$2,$3,$4,$5,TRUE)
//     RETURNING *
//   `, [
//     data.calculation_method,
//     data.base_rate ?? 0,
//     data.applicable_for || "ALL",
//     data.effective_from,
//     data.description || null
//   ]);
//   return result.rows[0];
// };

// // ---------------- BHK RATES ----------------

// export const getBhkRates = async (client, schema) => {
//   const result = await query(client, schema, `
//     SELECT *
//     FROM {{schema}}.apartment_maintenance_bhk_rates
//     ORDER BY bhk_type
//   `);
//   return result.rows;
// };

// export const saveBhkRate = async (client, schema, data) => {
//   const result = await query(client, schema, `
//     INSERT INTO {{schema}}.apartment_maintenance_bhk_rates
//       (bhk_type, amount)
//     VALUES ($1,$2)
//     ON CONFLICT (bhk_type)
//     DO UPDATE SET amount = EXCLUDED.amount,
//                   updated_at = CURRENT_TIMESTAMP
//     RETURNING *
//   `, [data.bhk_type, data.amount]);
//   return result.rows[0];
// };

// export const deleteBhkRate = async (client, schema, id) => {
//   const result = await query(client, schema, `
//     DELETE FROM {{schema}}.apartment_maintenance_bhk_rates
//     WHERE id = $1 RETURNING id
//   `, [id]);
//   return result.rows[0] || null;
// };

// // ---------------- FLOOR CHARGES ----------------

// export const getFloorCharges = async (client, schema) => {
//   const result = await query(client, schema, `
//     SELECT *
//     FROM {{schema}}.apartment_maintenance_floor_charges
//     ORDER BY floor_number
//   `);
//   return result.rows;
// };

// export const saveFloorCharge = async (client, schema, data) => {
//   const result = await query(client, schema, `
//     INSERT INTO {{schema}}.apartment_maintenance_floor_charges
//       (floor_number, charge_type, amount, description, is_active)
//     VALUES ($1,$2,$3,$4,$5)
//     ON CONFLICT (floor_number)
//     DO UPDATE SET charge_type = EXCLUDED.charge_type,
//                   amount = EXCLUDED.amount,
//                   description = EXCLUDED.description,
//                   is_active = EXCLUDED.is_active,
//                   updated_at = CURRENT_TIMESTAMP
//     RETURNING *
//   `, [
//     data.floor_number,
//     data.charge_type || "FIXED",
//     data.amount,
//     data.description || null,
//     data.is_active !== false
//   ]);
//   return result.rows[0];
// };

// export const deleteFloorCharge = async (client, schema, id) => {
//   const result = await query(client, schema, `
//     DELETE FROM {{schema}}.apartment_maintenance_floor_charges
//     WHERE id = $1 RETURNING id
//   `, [id]);
//   return result.rows[0] || null;
// };

// // ---------------- SPECIAL CHARGES ----------------

// export const getSpecialCharges = async (client, schema) => {
//   const result = await query(client, schema, `
//     SELECT *
//     FROM {{schema}}.apartment_maintenance_special_charges
//     ORDER BY id DESC
//   `);
//   return result.rows;
// };

// export const createSpecialCharge = async (client, schema, data) => {
//   const result = await query(client, schema, `
//     INSERT INTO {{schema}}.apartment_maintenance_special_charges
//       (charge_name, charge_type, amount, applicable_for,
//        effective_from, description, is_active)
//     VALUES ($1,$2,$3,$4,$5,$6,$7)
//     RETURNING *
//   `, [
//     data.charge_name,
//     data.charge_type || "FIXED",
//     data.amount,
//     data.applicable_for || "ALL",
//     data.effective_from || null,
//     data.description || null,
//     data.is_active !== false
//   ]);
//   return result.rows[0];
// };

// export const updateSpecialCharge = async (client, schema, id, data) => {
//   const result = await query(client, schema, `
//     UPDATE {{schema}}.apartment_maintenance_special_charges
//     SET charge_name = $1, charge_type = $2, amount = $3,
//         applicable_for = $4, effective_from = $5,
//         description = $6, is_active = $7,
//         updated_at = CURRENT_TIMESTAMP
//     WHERE id = $8
//     RETURNING *
//   `, [
//     data.charge_name,
//     data.charge_type || "FIXED",
//     data.amount,
//     data.applicable_for || "ALL",
//     data.effective_from || null,
//     data.description || null,
//     data.is_active !== false,
//     id
//   ]);
//   return result.rows[0] || null;
// };

// export const deleteSpecialCharge = async (client, schema, id) => {
//   const result = await query(client, schema, `
//     DELETE FROM {{schema}}.apartment_maintenance_special_charges
//     WHERE id = $1 RETURNING id
//   `, [id]);
//   return result.rows[0] || null;
// };

// // ---------------- LATE PAYMENT RULE ----------------

// export const getLateRule = async (client, schema) => {
//   const result = await query(client, schema, `
//     SELECT *
//     FROM {{schema}}.apartment_maintenance_late_rules
//     WHERE is_active = TRUE
//     ORDER BY id DESC
//     LIMIT 1
//   `);
//   return result.rows[0] || null;
// };

// export const saveLateRule = async (client, schema, data) => {
//   await query(client, schema, `
//     UPDATE {{schema}}.apartment_maintenance_late_rules
//     SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
//     WHERE is_active = TRUE
//   `);

//   const result = await query(client, schema, `
//     INSERT INTO {{schema}}.apartment_maintenance_late_rules
//       (due_day, grace_days, late_fee_type, late_fee_value, is_active)
//     VALUES ($1,$2,$3,$4,TRUE)
//     RETURNING *
//   `, [
//     data.due_day,
//     data.grace_days ?? 0,
//     data.late_fee_type || "FIXED",
//     data.late_fee_value ?? 0
//   ]);
//   return result.rows[0];
// };

// // ---------------- BILLS ----------------

// export const getBills = async (client, schema, month) => {
//   const result = await query(client, schema, `
//     SELECT b.*, f.apartment_name, f.block_tower, f.flat_number,
//            f.floor_number, f.bhk_type, f.area_sqft
//     FROM {{schema}}.apartment_maintenance_bills b
//     JOIN {{schema}}.apartment_flats f ON f.id = b.flat_id
//     WHERE ($1::date IS NULL OR b.bill_month = $1::date)
//     ORDER BY f.block_tower, f.flat_number
//   `, [month || null]);
//   return result.rows;
// };

// export const insertBill = async (client, schema, bill) => {
//   const result = await query(client, schema, `
//     INSERT INTO {{schema}}.apartment_maintenance_bills
//       (flat_id, bill_month, base_amount, floor_charge,
//        special_charges, late_fee, total_amount, due_date, status)
//     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'PENDING')
//     ON CONFLICT (flat_id, bill_month)
//     DO UPDATE SET base_amount = EXCLUDED.base_amount,
//       floor_charge = EXCLUDED.floor_charge,
//       special_charges = EXCLUDED.special_charges,
//       late_fee = EXCLUDED.late_fee,
//       total_amount = EXCLUDED.total_amount,
//       due_date = EXCLUDED.due_date,
//       updated_at = CURRENT_TIMESTAMP
//     WHERE apartment_maintenance_bills.status = 'PENDING'
//     RETURNING *
//   `, [
//     bill.flat_id,
//     bill.bill_month,
//     bill.base_amount,
//     bill.floor_charge,
//     bill.special_charges,
//     bill.late_fee || 0,
//     bill.total_amount,
//     bill.due_date
//   ]);
//   return result.rows[0] || null;
// };



const validateSchema = (schema) => {
  if (!schema || !/^[a-zA-Z0-9_]+$/.test(schema)) {
    throw new Error("Invalid organisation schema");
  }
  return `"${schema}"`;
};

export const query = async (client, schema, sql, values = []) => {
  const s = validateSchema(schema);
  return client.query(sql.replaceAll("{{schema}}", s), values);
};

// ---------------- FLATS ----------------

export const getFlats = async (client, schema) => {
  const result = await query(client, schema, `
    SELECT *
    FROM {{schema}}.apartment_flats
    WHERE COALESCE(is_active, TRUE) = TRUE
    ORDER BY block_tower, floor_number, flat_number
  `);
  return result.rows;
};

export const getFlatById = async (client, schema, id) => {
  const result = await query(client, schema, `
    SELECT *
    FROM {{schema}}.apartment_flats
    WHERE id = $1
    LIMIT 1
  `, [id]);
  return result.rows[0] || null;
};

export const createFlat = async (client, schema, data) => {
  const result = await query(client, schema, `
    INSERT INTO {{schema}}.apartment_flats
      (apartment_name, block_tower, floor_number, flat_number,
       bhk_type, area_sqft, ownership_type, occupancy_status, is_active)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `, [
    data.apartment_name || "",
    data.block_tower || "",
    data.floor_number || null,
    data.flat_number,
    data.bhk_type || null,
    data.area_sqft || null,
    data.ownership_type || "OWNER",
    data.occupancy_status || "Occupied",
    data.is_active !== false
  ]);
  return result.rows[0];
};

export const updateFlat = async (client, schema, id, data) => {
  const result = await query(client, schema, `
    UPDATE {{schema}}.apartment_flats
    SET apartment_name = $1,
        block_tower = $2,
        floor_number = $3,
        flat_number = $4,
        bhk_type = $5,
        area_sqft = $6,
        ownership_type = $7,
        occupancy_status = $8,
        is_active = $9,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $10
    RETURNING *
  `, [
    data.apartment_name || "",
    data.block_tower || "",
    data.floor_number || null,
    data.flat_number,
    data.bhk_type || null,
    data.area_sqft || null,
    data.ownership_type || "OWNER",
    data.occupancy_status || "Occupied",
    data.is_active !== false,
    id
  ]);
  return result.rows[0] || null;
};

export const deleteFlat = async (client, schema, id) => {
  const result = await query(client, schema, `
    DELETE FROM {{schema}}.apartment_flats
    WHERE id = $1
    RETURNING id
  `, [id]);
  return result.rows[0] || null;
};

// ---------------- BASE SETTINGS ----------------

export const getMaintenanceSettings = async (client, schema) => {
  const result = await query(client, schema, `
    SELECT *
    FROM {{schema}}.apartment_maintenance_settings
    WHERE is_active = TRUE
    ORDER BY id DESC
    LIMIT 1
  `);
  return result.rows[0] || null;
};

export const saveMaintenanceSettings = async (client, schema, data) => {
  await query(client, schema, `
    UPDATE {{schema}}.apartment_maintenance_settings
    SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
    WHERE is_active = TRUE
  `);

  const result = await query(client, schema, `
    INSERT INTO {{schema}}.apartment_maintenance_settings
      (calculation_method, base_rate, applicable_for,
       effective_from, description, is_active)
    VALUES ($1,$2,$3,$4,$5,TRUE)
    RETURNING *
  `, [
    data.calculation_method,
    data.base_rate ?? 0,
    data.applicable_for || "ALL",
    data.effective_from,
    data.description || null
  ]);

  return result.rows[0];
};

// ---------------- BHK RATES ----------------

export const getBhkRates = async (client, schema) => {
  const result = await query(client, schema, `
    SELECT *
    FROM {{schema}}.apartment_maintenance_bhk_rates
    ORDER BY bhk_type
  `);
  return result.rows;
};

export const saveBhkRate = async (client, schema, data) => {
  const result = await query(client, schema, `
    INSERT INTO {{schema}}.apartment_maintenance_bhk_rates
      (bhk_type, amount, min_area, max_area)
    VALUES ($1,$2,$3,$4)
    ON CONFLICT (bhk_type)
    DO UPDATE SET
      amount = EXCLUDED.amount,
      min_area = EXCLUDED.min_area,
      max_area = EXCLUDED.max_area,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `, [
    data.bhk_type,
    data.amount,
    data.min_area ?? null,
    data.max_area ?? null
  ]);
  return result.rows[0];
};

export const deleteBhkRate = async (client, schema, id) => {
  const result = await query(client, schema, `
    DELETE FROM {{schema}}.apartment_maintenance_bhk_rates
    WHERE id = $1 RETURNING id
  `, [id]);
  return result.rows[0] || null;
};

// ---------------- FLOOR CHARGES ----------------

export const getFloorCharges = async (client, schema) => {
  const result = await query(client, schema, `
    SELECT *
    FROM {{schema}}.apartment_maintenance_floor_charges
    WHERE is_active = TRUE
    ORDER BY id
  `);
  return result.rows;
};

export const saveFloorCharge = async (client, schema, data) => {
  const result = await query(client, schema, `
    INSERT INTO {{schema}}.apartment_maintenance_floor_charges
      (floor_number, floor_from, floor_to, charge_type,
       amount, monthly_amount, applicable_units, description, is_active)
    VALUES ($1,$2,$3,'FIXED',$4,$4,$5,$6,TRUE)
    RETURNING *
  `, [
    String(data.floor_from ?? data.floor_number ?? ""),
    data.floor_from ?? null,
    data.floor_to ?? null,
    data.monthly_amount ?? data.amount ?? 0,
    data.applicable_units || "all",
    data.description || null
  ]);
  return result.rows[0];
};

export const deleteFloorCharge = async (client, schema, id) => {
  const result = await query(client, schema, `
    DELETE FROM {{schema}}.apartment_maintenance_floor_charges
    WHERE id = $1 RETURNING id
  `, [id]);
  return result.rows[0] || null;
};

// ---------------- SPECIAL CHARGES ----------------

export const getSpecialCharges = async (client, schema) => {
  const result = await query(client, schema, `
    SELECT *
    FROM {{schema}}.apartment_maintenance_special_charges
    ORDER BY id DESC
  `);
  return result.rows;
};

export const createSpecialCharge = async (client, schema, data) => {
  const result = await query(client, schema, `
    INSERT INTO {{schema}}.apartment_maintenance_special_charges
      (charge_name, charge_type, amount, applicable_for,
       effective_from, effective_to, frequency, interval_months,
       payable_months, description, is_active)
    VALUES ($1,$2,$3,'ALL',$4,$5,$6,$7,$8,$9,TRUE)
    RETURNING *
  `, [
    data.charge_name,
    data.charge_type || "FIXED",
    data.amount,
    data.effective_from || null,
    data.effective_to || null,
    data.frequency || "monthly",
    data.interval_months || 1,
    data.payable_months || null,
    data.description || null
  ]);
  return result.rows[0];
};

export const updateSpecialCharge = async (client, schema, id, data) => {
  const result = await query(client, schema, `
    UPDATE {{schema}}.apartment_maintenance_special_charges
    SET charge_name = $1,
        amount = $2,
        effective_from = $3,
        effective_to = $4,
        frequency = $5,
        interval_months = $6,
        payable_months = $7,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *
  `, [
    data.charge_name,
    data.amount,
    data.effective_from || null,
    data.effective_to || null,
    data.frequency || "monthly",
    data.interval_months || 1,
    data.payable_months || null,
    id
  ]);
  return result.rows[0] || null;
};

export const deleteSpecialCharge = async (client, schema, id) => {
  const result = await query(client, schema, `
    DELETE FROM {{schema}}.apartment_maintenance_special_charges
    WHERE id = $1 RETURNING id
  `, [id]);
  return result.rows[0] || null;
};

// ---------------- LATE PAYMENT RULES ----------------

export const getLateRules = async (client, schema) => {
  const result = await query(client, schema, `
    SELECT *
    FROM {{schema}}.apartment_maintenance_late_rules
    WHERE is_active = TRUE
    ORDER BY delay_from_days, id
  `);
  return result.rows;
};

// Backward-compatible method
export const getLateRule = async (client, schema) => {
  const rules = await getLateRules(client, schema);
  return rules[0] || null;
};

export const saveLateRule = async (client, schema, data) => {
  await query(client, schema, `
    UPDATE {{schema}}.apartment_maintenance_late_rules
    SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
    WHERE is_active = TRUE
  `);

  const result = await query(client, schema, `
    INSERT INTO {{schema}}.apartment_maintenance_late_rules
      (due_day, grace_days, late_fee_type, late_fee_value,
       delay_from_days, delay_to_days, is_active)
    VALUES ($1,$2,$3,$4,$5,$6,TRUE)
    RETURNING *
  `, [
    data.due_day || 10,
    data.grace_days || 0,
    data.fee_type === "percentage" ? "PERCENTAGE" : "FIXED",
    data.fee_value ?? data.late_fee_value ?? 0,
    data.delay_from_days ?? 1,
    data.delay_to_days ?? 999
  ]);
  return result.rows[0];
};

// ---------------- BILLS ----------------

export const getBills = async (client, schema, month) => {
  const result = await query(client, schema, `
    SELECT b.*, f.apartment_name, f.block_tower, f.flat_number,
           f.floor_number, f.bhk_type, f.area_sqft
    FROM {{schema}}.apartment_maintenance_bills b
    JOIN {{schema}}.apartment_flats f ON f.id = b.flat_id
    WHERE ($1::date IS NULL OR b.bill_month = $1::date)
    ORDER BY f.block_tower, f.flat_number
  `, [month || null]);
  return result.rows;
};

export const insertBill = async (client, schema, bill) => {
  const result = await query(client, schema, `
    INSERT INTO {{schema}}.apartment_maintenance_bills
      (flat_id, bill_month, base_amount, floor_charge,
       special_charges, late_fee, total_amount, due_date, status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'PENDING')
    ON CONFLICT (flat_id, bill_month)
    DO UPDATE SET
      base_amount = EXCLUDED.base_amount,
      floor_charge = EXCLUDED.floor_charge,
      special_charges = EXCLUDED.special_charges,
      late_fee = EXCLUDED.late_fee,
      total_amount = EXCLUDED.total_amount,
      due_date = EXCLUDED.due_date,
      updated_at = CURRENT_TIMESTAMP
    WHERE {{schema}}.apartment_maintenance_bills.status = 'PENDING'
    RETURNING *
  `, [
    bill.flat_id,
    bill.bill_month,
    bill.base_amount,
    bill.floor_charge,
    bill.special_charges,
    bill.late_fee || 0,
    bill.total_amount,
    bill.due_date
  ]);
  return result.rows[0] || null;
};
