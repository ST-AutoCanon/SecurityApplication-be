
// /*
// |--------------------------------------------------------------------------
// | GET USER FLAT
// |--------------------------------------------------------------------------
// */

// export const getUserFlatDetails = async (
//   client,
//   schemaName,
//   userId
// ) => {
//   const result = await client.query(
//     `
//     SELECT
//       id,
//       flat_number,
//       block_tower,
//       floor_number
//     FROM "${schemaName}".apartment_member
//     WHERE id = $1
//       AND is_active = TRUE
//     LIMIT 1
//     `,
//     [userId]
//   );

//   return result.rows[0] || null;
// };


// /*
// |--------------------------------------------------------------------------
// | GET VISITORS FOR USER'S FLAT
// |--------------------------------------------------------------------------
// */

// export const getVisitorsForFlat = async (
//   client,
//   schemaName,
//   apartmentNumber,
//   period = "daily"
// ) => {
//   let dateCondition = "";

//   switch (period) {
//     case "weekly":
//       dateCondition = `
//         p.punch_time >= DATE_TRUNC('week', CURRENT_DATE)
//         AND p.punch_time < CURRENT_DATE + INTERVAL '1 day'
//       `;
//       break;

//     case "monthly":
//       dateCondition = `
//         p.punch_time >= DATE_TRUNC('month', CURRENT_DATE)
//         AND p.punch_time < CURRENT_DATE + INTERVAL '1 day'
//       `;
//       break;

//     case "daily":
//     default:
//       dateCondition = `
//         p.punch_time >= CURRENT_DATE
//         AND p.punch_time < CURRENT_DATE + INTERVAL '1 day'
//       `;
//       break;
//   }

//   const result = await client.query(
//     `
//     SELECT
//       p.id,
//       p.user_id,
//       p.full_name,
//       p.table_name,
//       p.punch_type,
//       p.punch_time,
//       p.apartment_number,
//       p.vehicle_number,
//       p.gate_name
//     FROM "${schemaName}".punch_logs p
//     WHERE
//       p.apartment_number = $1
//       AND LOWER(p.table_name) IN (
//         'guest',
//         'visitor',
//         'maid',
//         'vendor',
//         'delivery',
//         'delivery_person',
//         'service_provider'
//       )
//       AND ${dateCondition}
//     ORDER BY p.punch_time DESC
//     `,
//     [apartmentNumber]
//   );

//   return result.rows;
// };
/*
|--------------------------------------------------------------------------
| GET USER FLAT
|--------------------------------------------------------------------------
*/

// export const getUserFlatDetails = async (
//   client,
//   schemaName,
//   userId
// ) => {
//   const result = await client.query(
//     `
//     SELECT
//       id,
//       flat_number,
//       block_tower,
//       floor_number
//     FROM "${schemaName}".apartment_member
//     WHERE user_id  = $1
//     LIMIT 1
//     `,
//     [userId]
//   );

//   return result.rows[0] || null;
// };
export const getUserFlatDetails = async ( client, schemaName, userId ) => { const result = await client.query( ` SELECT id, security_user_id, flat_number, block_tower, floor_number FROM "${schemaName}".apartment_member WHERE security_user_id = $1 LIMIT 1 `, [userId] ); return result.rows[0] || null; };
/*
|--------------------------------------------------------------------------
| GET VISITORS FOR USER'S FLAT
|--------------------------------------------------------------------------
*/


export const getVisitorsForFlat = async (
  client,
  schemaName,
  apartmentNumber,
  period = "daily",
  search = ""
) => {
  let dateCondition = "";

  switch (period) {
    case "weekly":
      dateCondition = `
        p.punch_time >= DATE_TRUNC('week', CURRENT_DATE)
        AND p.punch_time < CURRENT_DATE + INTERVAL '1 day'
      `;
      break;

    case "monthly":
      dateCondition = `
        p.punch_time >= DATE_TRUNC('month', CURRENT_DATE)
        AND p.punch_time < CURRENT_DATE + INTERVAL '1 day'
      `;
      break;

    case "daily":
    default:
      dateCondition = `
        p.punch_time >= CURRENT_DATE
        AND p.punch_time < CURRENT_DATE + INTERVAL '1 day'
      `;
      break;
  }

  const values = [apartmentNumber];
  let searchCondition = "";

  if (search?.trim()) {
    values.push(`%${search.trim()}%`);

    searchCondition = `
      AND (
        p.full_name ILIKE $${values.length}
        OR p.table_name ILIKE $${values.length}
        OR p.vehicle_number ILIKE $${values.length}
      )
    `;
  }

  const result = await client.query(
    `
    SELECT
      p.id,
      p.user_id,
      p.full_name,
      p.table_name,
      p.punch_type,
      p.punch_time,
      p.apartment_number,
      p.vehicle_number,
      p.gate_name

    FROM "${schemaName}".punch_logs p

    WHERE p.apartment_number = $1

      AND LOWER(TRIM(p.table_name)) IN (
        'guest',
        'visitor',
        'maid',
        'vendor',
        'delivery',
        'delivery_person',
        'service_provider'
      )

      AND ${dateCondition}

      ${searchCondition}

    ORDER BY p.punch_time DESC
    `,
    values
  );

  /*
   * ---------------------------------------------------------
   * Convert raw punch_logs into frontend-friendly records
   * ---------------------------------------------------------
   */

  return result.rows.map((row) => {
    const punchTime = row.punch_time
      ? new Date(row.punch_time)
      : null;

    return {
      id: row.id,
      user_id: row.user_id,
      full_name: row.full_name,
      mobile_number: null,

      table_name: row.table_name,
      purpose: row.table_name,

      /*
       * Keep the date as YYYY-MM-DD.
       * This prevents the browser from shifting
       * the date because of timezone conversion.
       */
      visit_date: punchTime
        ? punchTime.toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          })
        : null,

      /*
       * Return the complete timestamp.
       * Frontend formatTime() will convert it
       * to 12-hour AM/PM format.
       */
      time_in: punchTime
        ? punchTime.toISOString()
        : null,

      /*
       * Currently punch_logs gives us individual
       * punch records. We don't have a paired OUT
       * record here, so keep time_out null.
       */
      time_out: null,

      punch_type: row.punch_type,
      vehicle_number: row.vehicle_number,
      gate_name: row.gate_name,
    };
  });
};
// export const getVisitorsForFlat = async (
//   client,
//   schemaName,
//   apartmentNumber,
//   period = "daily"
// ) => {
//   let dateCondition = "";

//   switch (period) {
//     case "weekly":
//       dateCondition = `
//         p.punch_time >= DATE_TRUNC('week', CURRENT_DATE)
//         AND p.punch_time < CURRENT_DATE + INTERVAL '1 day'
//       `;
//       break;

//     case "monthly":
//       dateCondition = `
//         p.punch_time >= DATE_TRUNC('month', CURRENT_DATE)
//         AND p.punch_time < CURRENT_DATE + INTERVAL '1 day'
//       `;
//       break;

//     case "daily":
//     default:
//       dateCondition = `
//         p.punch_time >= CURRENT_DATE
//         AND p.punch_time < CURRENT_DATE + INTERVAL '1 day'
//       `;
//       break;
//   }

//   const result = await client.query(
//     `
//     SELECT
//       p.id,
//       p.user_id,
//       p.full_name,
//       p.table_name,
//       p.punch_type,
//       p.punch_time,
//       p.apartment_number,
//       p.vehicle_number,
//       p.gate_name
//     FROM "${schemaName}".punch_logs p
//     WHERE
//       p.apartment_number = $1
//       AND LOWER(p.table_name) IN (
//         'guest',
//         'visitor',
//         'maid',
//         'vendor',
//         'delivery',
//         'delivery_person',
//         'service_provider'
//       )
//       AND ${dateCondition}
//     ORDER BY p.punch_time DESC
//     `,
//     [apartmentNumber]
//   );

//   return result.rows;
// };
/* |-------------------------------------------------------------------------- | GET VISITOR STATS FOR USER'S FLAT |-------------------------------------------------------------------------- | | Counts only IN records. | | Today = today's visitor entries | This Week = current week's visitor entries | This Month = current month's visitor entries | | This prevents IN + OUT from being counted as two visitors. |-------------------------------------------------------------------------- */ export const getVisitorStatsForFlat = async ( client, schemaName, apartmentNumber ) => { const result = await client.query( ` SELECT COUNT(*) FILTER ( WHERE p.punch_time >= CURRENT_DATE AND p.punch_time < CURRENT_DATE + INTERVAL '1 day' ) AS today, COUNT(*) FILTER ( WHERE p.punch_time >= DATE_TRUNC('week', CURRENT_DATE) AND p.punch_time < CURRENT_DATE + INTERVAL '1 day' ) AS this_week, COUNT(*) FILTER ( WHERE p.punch_time >= DATE_TRUNC('month', CURRENT_DATE) AND p.punch_time < CURRENT_DATE + INTERVAL '1 day' ) AS this_month FROM "${schemaName}".punch_logs p WHERE p.apartment_number = $1 AND LOWER(TRIM(p.punch_type)) = 'in' AND LOWER(TRIM(p.table_name)) IN ( 'guest', 'visitor', 'maid', 'vendor', 'delivery', 'delivery_person', 'service_provider' ) `, [apartmentNumber] ); const row = result.rows[0] || {}; return { today: Number(row.today) || 0, thisWeek: Number(row.this_week) || 0, thisMonth: Number(row.this_month) || 0, }; };