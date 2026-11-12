
const validateSchema = (schema) => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
    throw new Error("Invalid organisation schema");
  }

  return `"${schema}"`;
};
export const query = async (client, schema, sql, values = []) => {
  const s = validateSchema(schema);
  return client.query(sql.replaceAll("{{schema}}", s), values);
};

// ---------------- FLATS ----------------

// const validateSchema = (schema) => {
//   if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
//     throw new Error("Invalid organisation schema");
//   }

//   return `"${schema}"`;
// };

// Synchronize apartment_member into apartment_flats


export const syncApartmentFlatsFromMembers = async (db, schema) => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
    throw new Error("Invalid organisation schema");
  }

  const schemaName = `"${schema}"`;

  // 1. Get unique, complete flats from apartment_member
  const sourceQuery = `
    SELECT
      MAX(NULLIF(BTRIM(am.apartment_name::text), '')) AS apartment_name,
      MAX(NULLIF(BTRIM(am.block_tower::text), '')) AS block_tower,
      MAX(NULLIF(BTRIM(am.floor_number::text), '')) AS floor_number,
      MAX(NULLIF(BTRIM(am.flat_number::text), '')) AS flat_number,

      CASE
        WHEN BOOL_OR(
          UPPER(BTRIM(COALESCE(am.ownership_type::text, ''))) = 'OWNER'
        ) THEN 'OWNER'
        WHEN BOOL_OR(
          UPPER(BTRIM(COALESCE(am.ownership_type::text, '')))
          IN ('TENANT', 'TEANANT')
        ) THEN 'TENANT'
        ELSE 'OWNER'
      END AS ownership_type,

      BOOL_OR(am.status IS TRUE) AS has_active_member

    FROM ${schemaName}.apartment_member am

    
      WHERE
  NULLIF(BTRIM(am.apartment_name::text), '') IS NOT NULL
  AND NULLIF(BTRIM(am.block_tower::text), '') IS NOT NULL
  AND NULLIF(BTRIM(am.flat_number::text), '') IS NOT NULL

    GROUP BY
      LOWER(BTRIM(COALESCE(am.apartment_name::text, ''))),
      LOWER(BTRIM(COALESCE(am.block_tower::text, ''))),
      LOWER(BTRIM(COALESCE(am.floor_number::text, ''))),
      LOWER(BTRIM(COALESCE(am.flat_number::text, '')))
  `;

  // 2. Insert flats that do not already exist
  await db.query(`
    INSERT INTO ${schemaName}.apartment_flats (
      apartment_name,
      block_tower,
      floor_number,
      flat_number,
      bhk_type,
      area_sqft,
      ownership_type,
      occupancy_status,
      is_active,
      created_at,
      updated_at
    )
    SELECT
      mf.apartment_name,
      mf.block_tower,
      mf.floor_number,
      mf.flat_number,
      NULL::text,
      NULL::numeric,
      mf.ownership_type,
      CASE
        WHEN mf.has_active_member THEN 'Occupied'
        ELSE 'Vacant'
      END,
      TRUE,
      NOW(),
      NOW()
    FROM (${sourceQuery}) mf
    WHERE NOT EXISTS (
      SELECT 1
      FROM ${schemaName}.apartment_flats f
      WHERE
        LOWER(BTRIM(COALESCE(f.apartment_name::text, ''))) =
        LOWER(BTRIM(COALESCE(mf.apartment_name::text, '')))

        AND LOWER(BTRIM(COALESCE(f.block_tower::text, ''))) =
        LOWER(BTRIM(COALESCE(mf.block_tower::text, '')))

        AND LOWER(BTRIM(COALESCE(f.floor_number::text, ''))) =
        LOWER(BTRIM(COALESCE(mf.floor_number::text, '')))

        AND LOWER(BTRIM(COALESCE(f.flat_number::text, ''))) =
        LOWER(BTRIM(COALESCE(mf.flat_number::text, '')))
    )
  `);

  // 3. Update occupancy only for existing flats.
  // Preserve manually entered BHK, area and ownership details.
  await db.query(`
    UPDATE ${schemaName}.apartment_flats f
    SET
      occupancy_status = CASE
        WHEN mf.has_active_member THEN 'Occupied'
        ELSE 'Vacant'
      END,
      updated_at = NOW()
    FROM (${sourceQuery}) mf
    WHERE
      LOWER(BTRIM(COALESCE(f.apartment_name::text, ''))) =
      LOWER(BTRIM(COALESCE(mf.apartment_name::text, '')))

      AND LOWER(BTRIM(COALESCE(f.block_tower::text, ''))) =
      LOWER(BTRIM(COALESCE(mf.block_tower::text, '')))

      AND LOWER(BTRIM(COALESCE(f.floor_number::text, ''))) =
      LOWER(BTRIM(COALESCE(mf.floor_number::text, '')))

      AND LOWER(BTRIM(COALESCE(f.flat_number::text, ''))) =
      LOWER(BTRIM(COALESCE(mf.flat_number::text, '')))
  `);

  return true;
};


// Fetch flats for maintenance preview
export const getFlats = async (db, schema) => {
  const schemaName = validateSchema(schema);

  const result = await db.query(`
    SELECT
      id,
      apartment_name,
      block_tower,
      floor_number,
      flat_number,
      bhk_type,
      area_sqft,
      ownership_type,
      occupancy_status,
      is_active
    FROM ${schemaName}.apartment_flats
    WHERE is_active = TRUE
    ORDER BY
      block_tower NULLS LAST,
      floor_number NULLS LAST,
      flat_number
  `);

  return result.rows;
};

export const updateFlatDetails = async (
    client,
    schema,
    flatId,
    data
) => {
    const result = await query(
        client,
        schema,
        `
            UPDATE {{schema}}.apartment_flats
            SET
                bhk_type = $1,
                area_sqft = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
              AND is_active = TRUE
            RETURNING
                id,
                apartment_name,
                block_tower,
                floor_number,
                flat_number,
                bhk_type,
                area_sqft,
                ownership_type,
                occupancy_status,
                is_active
        `,
        [
            data.bhk_type,
            data.area_sqft,
            flatId
        ]
    );

    return result.rows[0] || null;
};
// export const getFlats = async (db, schema) => {
//   const result = await db.query(
//     `
//       SELECT
//         id,
//         apartment_name,
//         block_tower,
//         floor_number,
//         flat_number,
//         bhk_type,
//         area_sqft,
//         ownership_type,
//         occupancy_status,
//         is_active
//       FROM "${schema}".apartment_flats
//       WHERE is_active = TRUE
//       ORDER BY
//         block_tower,
//         floor_number,
//         flat_number
//     `
//   );

//   return result.rows;
// };
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

// ---------------- BHK RATES ----------------

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
//       (bhk_type, amount, min_area, max_area)
//     VALUES ($1,$2,$3,$4)
//     ON CONFLICT (bhk_type)
//     DO UPDATE SET
//       amount = EXCLUDED.amount,
//       min_area = EXCLUDED.min_area,
//       max_area = EXCLUDED.max_area,
//       updated_at = CURRENT_TIMESTAMP
//     RETURNING *
//   `, [
//     data.bhk_type,
//     data.amount,
//     data.min_area ?? null,
//     data.max_area ?? null
//   ]);
//   return result.rows[0];
// };

// export const deleteBhkRate = async (client, schema, id) => {
//   const result = await query(client, schema, `
//     DELETE FROM {{schema}}.apartment_maintenance_bhk_rates
//     WHERE id = $1 RETURNING id
//   `, [id]);
//   return result.rows[0] || null;
// };


export const saveMaintenanceSettings = async (client, schema, data) => {
  await query(client, schema, `
    UPDATE {{schema}}.apartment_maintenance_settings
    SET
      is_active = FALSE,
      updated_at = CURRENT_TIMESTAMP
    WHERE is_active = TRUE
  `);

  await query(client, schema, `
  ALTER TABLE {{schema}}.apartment_maintenance_settings
  ADD COLUMN IF NOT EXISTS fixed_monthly_amount NUMERIC(12,2) DEFAULT 0
`);

await query(client, schema, `
  ALTER TABLE {{schema}}.apartment_maintenance_settings
  ADD COLUMN IF NOT EXISTS rate_per_sqft NUMERIC(12,2) DEFAULT 0
`);
  const result = await query(client, schema, `
    INSERT INTO {{schema}}.apartment_maintenance_settings
      (
        calculation_method,
        base_rate,
        fixed_monthly_amount,
        rate_per_sqft,
        applicable_for,
        effective_from,
        description,
        is_active
      )
    VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE)
    RETURNING *
  `, [
    data.calculation_method,
    data.base_rate ?? 0,
    data.fixed_monthly_amount,
    data.rate_per_sqft ?? 0,
    data.applicable_for || "ALL",
    data.effective_from,
    data.description || null
  ]);

  return result.rows[0];
};


export const getBhkRates = async (client, schema) => {
  const result = await query(
    client,
    schema,
    `
      SELECT *
      FROM {{schema}}.apartment_maintenance_bhk_rates
      ORDER BY bhk_type
    `
  );

  return result.rows;
};


export const saveBhkRate = async (client, schema, data) => {
  const result = await query(
    client,
    schema,
    `
      INSERT INTO {{schema}}.apartment_maintenance_bhk_rates
        (bhk_type, amount)
      VALUES ($1, $2)

      ON CONFLICT (bhk_type)
      DO UPDATE SET
        amount = EXCLUDED.amount,
        updated_at = CURRENT_TIMESTAMP

      RETURNING *
    `,
    [
      data.bhk_type,
      data.amount ?? data.monthly_amount
    ]
  );

  return result.rows[0];
};


export const deleteBhkRate = async (client, schema, id) => {
  const result = await query(
    client,
    schema,
    `
      DELETE FROM {{schema}}.apartment_maintenance_bhk_rates
      WHERE id = $1
      RETURNING id
    `,
    [id]
  );

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

// Replace all configured floor charges with the latest UI values.
export const replaceFloorCharges = async (client, schema, charges = []) => {
  // Remove previous rules so deleted or edited rules do not remain active.console.log("========== FLOOR CHARGE DEBUG ==========");
console.log("Schema received:", schema);

const check = await client.query(`
    SELECT current_database() AS database_name,
           current_schema() AS current_schema
`);

console.log("Database details:", check.rows[0]);

const columns = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = $1
      AND table_name = 'apartment_maintenance_floor_charges'
    ORDER BY ordinal_position
`, [schema]);

console.log(
    "Floor charge table columns:",
    columns.rows.map(row => row.column_name)
);

console.log("========================================");


  await query(
    client,
    schema,
    `
      DELETE FROM {{schema}}.apartment_maintenance_floor_charges
    `
  );

  const savedRows = [];

  for (const charge of charges) {
    const result = await query(
      client,
      schema,
      `
        INSERT INTO {{schema}}.apartment_maintenance_floor_charges
          (
            floor_number,
            floor_from,
            floor_to,
            charge_type,
            amount,
            monthly_amount,
            applicable_units,
            description,
            is_active
          )
        VALUES ($1, $2, $3, 'FIXED', $4, $4, $5, $6, TRUE)
        RETURNING *
      `,
      [
        String(charge.floor_from),
        String(charge.floor_from),
        String(charge.floor_to),
        Number(charge.monthly_amount),
        charge.applicable_units || "all",
        charge.description || null
      ]
    );

    savedRows.push(result.rows[0]);
  }

  return savedRows;
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
// export const replaceSpecialCharges = async (
//   client,
//   schema,
//   charges = []
// ) => {
//   await query(client, schema, `
//     DELETE FROM {{schema}}.apartment_maintenance_special_charges
//   `);

//   const savedRows = [];

//   for (const charge of charges) {
//     const result = await query(client, schema, `
//       INSERT INTO {{schema}}.apartment_maintenance_special_charges
//       (
//         charge_name,
//         charge_type,
//         charge_mode,
//         amount,
//         applicable_for,
//         effective_from,
//         effective_to,
//         frequency,
//         interval_months,
//         payable_months,
//         description,
//         is_active
//       )
//       VALUES (
//         $1, 'FIXED', $2, $3, $4,
//         $5, $6, $7, $8, $9, $10, TRUE
//       )
//       RETURNING *
//     `, [
//       charge.charge_name,
//       charge.charge_mode,
//       charge.amount,
//       charge.applicable_for,
//       charge.effective_from || null,
//       charge.effective_to || null,
//       charge.frequency || "monthly",
//       charge.interval_months || 1,
//       charge.payable_months || null,
//       charge.description || null
//     ]);

//     savedRows.push(result.rows[0]);
//   }

//   return savedRows;
// };



export const replaceSpecialCharges = async (
  client,
  schema,
  charges = []
) => {
  await query(client, schema, `
    DELETE FROM {{schema}}.apartment_maintenance_special_charges
  `);

  const savedRows = [];

  for (const charge of charges) {
    const chargeMode =
      String(
        charge.charge_mode ||
        (charge.charge_type === "one_time"
          ? "ONE_TIME"
          : "RECURRING")
      ).toUpperCase();

    const isOneTime = chargeMode === "ONE_TIME";

    const applicableFor = String(
      charge.applicable_for ||
      charge.applicable_units ||
      "ALL"
    ).toUpperCase();

    if (!["ALL", "OWNER", "TENANT"].includes(applicableFor)) {
      throw new Error(
        `Invalid applicable_for value: ${applicableFor}`
      );
    }

    const result = await query(client, schema, `
      INSERT INTO {{schema}}.apartment_maintenance_special_charges
      (
        charge_name,
        charge_type,
        charge_mode,
        amount,
        applicable_for,
        effective_from,
        effective_to,
        frequency,
        interval_months,
        payable_months,
        description,
        is_active
      )
      VALUES (
        $1, 'FIXED', $2, $3, $4,
        $5, $6, $7, $8, $9, $10, TRUE
      )
      RETURNING *
    `, [
      charge.charge_name,
      chargeMode,
      Number(charge.amount),
      applicableFor,
      charge.effective_from || null,
      charge.effective_to || null,
      isOneTime ? null : (charge.frequency || "monthly"),
      isOneTime ? null : (Number(charge.interval_months) || 1),
      charge.payable_months || null,
      charge.description || null
    ]);

    savedRows.push(result.rows[0]);
  }

  return savedRows;
};

export const createSpecialCharge = async (client, schema, data) => {
  const chargeMode =
    String(data.charge_mode || "RECURRING").toUpperCase();

  const isOneTime = chargeMode === "ONE_TIME";

  const result = await query(client, schema, `
    INSERT INTO {{schema}}.apartment_maintenance_special_charges
    (
      charge_name,
      charge_type,
      charge_mode,
      amount,
      applicable_for,
      effective_from,
      effective_to,
      frequency,
      interval_months,
      payable_months,
      description,
      is_active
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE
    )
    RETURNING *
  `, [
    data.charge_name,
    data.charge_type || "FIXED",
    chargeMode,
    data.amount,
    data.applicable_for || "ALL",
    data.effective_from || null,
    data.effective_to || null,
    isOneTime ? null : (data.frequency || "monthly"),
    isOneTime ? null : (data.interval_months || 1),
    data.payable_months || null,
    data.description || null
  ]);

  return result.rows[0];
};

// export const createSpecialCharge = async (client, schema, data) => {
//   const result = await query(client, schema, `
//     INSERT INTO {{schema}}.apartment_maintenance_special_charges
//       (charge_name, charge_type, amount, applicable_for,
//        effective_from, effective_to, frequency, interval_months,
//        payable_months, description, is_active)
//     VALUES ($1,$2,$3,'ALL',$4,$5,$6,$7,$8,$9,TRUE)
//     RETURNING *
//   `, [
//     data.charge_name,
//     data.charge_type || "FIXED",
//     data.amount,
//     data.effective_from || null,
//     data.effective_to || null,
//     data.frequency || "monthly",
//     data.interval_months || 1,
//     data.payable_months || null,
//     data.description || null
//   ]);
//   return result.rows[0];
// };

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

 // ---------------- LATE PAYMENT RULES ----------------

export const getLateRules = async (client, schema) => {
  const columns = await query(
    client,
    schema,
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = $1
        AND table_name = 'apartment_maintenance_late_rules'
    `,
    [schema]
  );

  const columnNames = columns.rows.map(row => row.column_name);

  if (!columnNames.includes("is_active")) {
    throw new Error(
      "is_active column is missing in apartment_maintenance_late_rules"
    );
  }

  const orderColumn = columnNames.includes("delay_from_days")
    ? "delay_from_days"
    : "id";

  const result = await query(
    client,
    schema,
    `
      SELECT *
      FROM {{schema}}.apartment_maintenance_late_rules
      WHERE is_active = TRUE
      ORDER BY ${orderColumn}, id
    `
  );

  return result.rows;
};


// Backward-compatible method
export const getLateRule = async (client, schema) => {
  const rules = await getLateRules(client, schema);
  return rules[0] || null;
};


// Replace all active late-payment rules
export const replaceLateRules = async (
  client,
  schema,
  rules = [],
  policy = {}
) => {
  if (!Array.isArray(rules)) {
    throw new Error("Late payment rules must be an array");
  }

  // Validate policy
  const dueDay = Number(policy.due_day ?? 10);
  const graceDays = Number(policy.grace_days ?? 0);

  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) {
    throw new Error("Due day must be between 1 and 28");
  }

  if (!Number.isInteger(graceDays) || graceDays < 0) {
    throw new Error("Grace days cannot be negative");
  }

  // Validate every rule before modifying existing records.
  const normalizedRules = rules.map((rule, index) => {
    const from = Number(rule.delay_from_days);
    const to = Number(rule.delay_to_days);

    const fee = Number(
      rule.fee_value ?? rule.late_fee_value
    );

    const feeType = String(
      rule.fee_type || rule.late_fee_type || "FIXED"
    ).toUpperCase();

    const effectiveFrom = rule.effective_from
      ? String(rule.effective_from).slice(0, 10)
      : "";

    const effectiveTo = rule.effective_to
      ? String(rule.effective_to).slice(0, 10)
      : null;

    if (!Number.isInteger(from) || from < 1) {
      throw new Error(
        `Invalid starting day in late rule ${index + 1}`
      );
    }

    if (!Number.isInteger(to) || to < from) {
      throw new Error(
        `Invalid ending day in late rule ${index + 1}`
      );
    }

    if (!Number.isFinite(fee) || fee < 0) {
      throw new Error(
        `Invalid fee amount in late rule ${index + 1}`
      );
    }

    if (!["FIXED", "PERCENTAGE"].includes(feeType)) {
      throw new Error(
        `Invalid fee type in late rule ${index + 1}`
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom)) {
      throw new Error(
        `Valid effective from date is required in late rule ${index + 1}`
      );
    }

    if (
      effectiveTo &&
      !/^\d{4}-\d{2}-\d{2}$/.test(effectiveTo)
    ) {
      throw new Error(
        `Invalid effective to date in late rule ${index + 1}`
      );
    }

    if (effectiveTo && effectiveTo < effectiveFrom) {
      throw new Error(
        `Effective to date cannot be before effective from date in late rule ${index + 1}`
      );
    }

    return {
      delay_from_days: from,
      delay_to_days: to,
      late_fee_type: feeType,
      late_fee_value: fee,
      effective_from: effectiveFrom,
      effective_to: effectiveTo
    };
  });

  // Reject overlapping slabs when their effective periods overlap.
  for (let i = 0; i < normalizedRules.length; i++) {
    for (let j = i + 1; j < normalizedRules.length; j++) {
      const a = normalizedRules[i];
      const b = normalizedRules[j];

      const daysOverlap =
        a.delay_from_days <= b.delay_to_days &&
        b.delay_from_days <= a.delay_to_days;

      const aEnd = a.effective_to || "9999-12-31";
      const bEnd = b.effective_to || "9999-12-31";

      const datesOverlap =
        a.effective_from <= bEnd &&
        b.effective_from <= aEnd;

      if (daysOverlap && datesOverlap) {
        throw new Error(
          `Late-fee slabs overlap: ${a.delay_from_days}-${a.delay_to_days} and ${b.delay_from_days}-${b.delay_to_days}`
        );
      }
    }
  }

  // Deactivate old active rules.
  await query(
    client,
    schema,
    `
      UPDATE {{schema}}.apartment_maintenance_late_rules
      SET
        is_active = FALSE,
        updated_at = CURRENT_TIMESTAMP
      WHERE is_active = TRUE
    `
  );

  const savedRows = [];

  // Insert new rules.
  for (const rule of normalizedRules) {
    const result = await query(
      client,
      schema,
      `
        INSERT INTO {{schema}}.apartment_maintenance_late_rules (
          due_day,
          grace_days,
          late_fee_type,
          late_fee_value,
          delay_from_days,
          delay_to_days,
          effective_from,
          effective_to,
          is_active
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE)
        RETURNING *
      `,
      [
        dueDay,
        graceDays,
        rule.late_fee_type,
        rule.late_fee_value,
        rule.delay_from_days,
        rule.delay_to_days,
        rule.effective_from,
        rule.effective_to
      ]
    );

    savedRows.push(result.rows[0]);
  }

  return savedRows;
};


// Backward-compatible single-rule save
export const saveLateRule = async (client, schema, data) => {
  const rules = [
    {
      delay_from_days: data.delay_from_days ?? 1,
      delay_to_days: data.delay_to_days ?? 999,
      fee_type: data.fee_type || "FIXED",
      fee_value: data.fee_value ?? data.late_fee_value ?? 0,
      effective_from:
        data.effective_from ||
        new Date().toISOString().slice(0, 10),
      effective_to: data.effective_to || null
    }
  ];

  const saved = await replaceLateRules(
    client,
    schema,
    rules,
    {
      due_day: data.due_day ?? 10,
      grace_days: data.grace_days ?? 0
    }
  );

  // return saved[0] || null;
  return saved;
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
