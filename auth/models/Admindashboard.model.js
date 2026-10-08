import masterAuthDB from "../../config/masterAuthDB.js";
export const getOrganisationSchema = async (
  client,
  organisationId
) => {

  const result = await client.query(
    `
    SELECT schema_name,org_type
    FROM auth.organisations
    WHERE id = $1
    LIMIT 1
    `,
    [organisationId]
  );

  return result.rows[0];
};

export const getGateEntryOverview = async (
  businessClient,
  schemaName,
  period = "daily"
) => {
  /*
   * ============================================================
   * 1. VALIDATE PERIOD
   * ============================================================
   */

  const allowedPeriods = [
    "daily",
    "weekly",
    "monthly",
    "yearly",
  ];

  if (!allowedPeriods.includes(period)) {
    throw new Error(
      "Invalid period. Use daily, weekly, monthly or yearly."
    );
  }

  /*
   * ============================================================
   * 2. DATE RANGE
   *
   * Asia/Kolkata is used because your punch timestamps are
   * stored with +0530 and your application is operating in India.
   *
   * We use a half-open range:
   *
   * >= start
   * <  end
   *
   * This avoids problems at 23:59:59.999.
   * ============================================================
   */

  let dateCondition;

  switch (period) {
    case "daily":
      dateCondition = `
        punch_time >= (
          DATE_TRUNC(
            'day',
            CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
          )
          AT TIME ZONE 'Asia/Kolkata'
        )
        AND punch_time < (
          (
            DATE_TRUNC(
              'day',
              CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
            )
            + INTERVAL '1 day'
          )
          AT TIME ZONE 'Asia/Kolkata'
        )
      `;
      break;

    case "weekly":
      dateCondition = `
        punch_time >= (
          DATE_TRUNC(
            'week',
            CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
          )
          AT TIME ZONE 'Asia/Kolkata'
        )
        AND punch_time < (
          (
            DATE_TRUNC(
              'day',
              CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
            )
            + INTERVAL '1 day'
          )
          AT TIME ZONE 'Asia/Kolkata'
        )
      `;
      break;

    case "monthly":
      dateCondition = `
        punch_time >= (
          DATE_TRUNC(
            'month',
            CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
          )
          AT TIME ZONE 'Asia/Kolkata'
        )
        AND punch_time < (
          (
            DATE_TRUNC(
              'day',
              CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
            )
            + INTERVAL '1 day'
          )
          AT TIME ZONE 'Asia/Kolkata'
        )
      `;
      break;

    case "yearly":
      dateCondition = `
        punch_time >= (
          DATE_TRUNC(
            'year',
            CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
          )
          AT TIME ZONE 'Asia/Kolkata'
        )
        AND punch_time < (
          (
            DATE_TRUNC(
              'day',
              CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
            )
            + INTERVAL '1 day'
          )
          AT TIME ZONE 'Asia/Kolkata'
        )
      `;
      break;
  }

  /*
   * ============================================================
   * 3. GET ALL ACTIVE GATES
   *
   * assign_gates.name is the source of the gate name.
   * ============================================================
   */

  const gateQuery = `
    SELECT
      id,
      name,
      status
    FROM "${schemaName}".assign_gates
    WHERE
      status = true
    ORDER BY id ASC
  `;

  const gateResult =
    await businessClient.query(gateQuery);

  /*
   * ============================================================
   * 4. GET ENTRY COUNTS
   *
   * Count DISTINCT users instead of COUNT(*).
   *
   * Example:
   *
   * Rahul IN
   * Rahul OUT
   * Rahul IN
   *
   * Rahul = 1 person, not 3 people.
   *
   * table_name gives us the category:
   *
   * guest
   * visitor
   * maid
   * vendor
   * etc.
   * ============================================================
   */

  const entryQuery = `
    SELECT
      LOWER(TRIM(gate_name)) AS gate_key,

      LOWER(TRIM(table_name)) AS category,

      COUNT(
        DISTINCT CONCAT(
          LOWER(TRIM(table_name)),
          ':',
          user_id
        )
      ) AS people_count

    FROM "${schemaName}".punch_logs

    WHERE
      UPPER(TRIM(punch_type)) = 'IN'

      AND gate_name IS NOT NULL
      AND TRIM(gate_name) <> ''

      AND user_id IS NOT NULL

      AND ${dateCondition}

    GROUP BY
      LOWER(TRIM(gate_name)),
      LOWER(TRIM(table_name))

    ORDER BY
      LOWER(TRIM(gate_name)),
      LOWER(TRIM(table_name))
  `;

  const entryResult =
    await businessClient.query(entryQuery);

  /*
   * ============================================================
   * 5. GET CURRENT PEOPLE INSIDE PREMISES
   *
   * For every person:
   *
   * - find their latest punch
   * - if latest punch = IN
   *   => person is currently inside
   *
   * The gate shown is the gate from their latest punch.
   *
   * This handles:
   *
   * Main Gate IN
   * Main Gate OUT
   * North Gate IN
   *
   * correctly as:
   *
   * North Gate -> In Premises = 1
   * Main Gate  -> In Premises = 0
   * ============================================================
   */

  const insideQuery = `
    WITH latest_punch AS (
      SELECT
        user_id,
        table_name,
        punch_type,
        punch_time,
        gate_name,

        ROW_NUMBER() OVER (
          PARTITION BY
            LOWER(TRIM(table_name)),
            user_id

          ORDER BY
            punch_time DESC,
            id DESC
        ) AS rn

      FROM "${schemaName}".punch_logs

      WHERE
        user_id IS NOT NULL
        AND punch_time IS NOT NULL
    )

    SELECT
      LOWER(TRIM(gate_name)) AS gate_key,

      LOWER(TRIM(table_name)) AS category,

      COUNT(*) AS people_count

    FROM latest_punch

    WHERE
      rn = 1

      AND UPPER(TRIM(punch_type)) = 'IN'

      AND gate_name IS NOT NULL
      AND TRIM(gate_name) <> ''

    GROUP BY
      LOWER(TRIM(gate_name)),
      LOWER(TRIM(table_name))
  `;

  const insideResult =
    await businessClient.query(insideQuery);

  /*
   * ============================================================
   * 6. CREATE LOOKUP MAPS
   * ============================================================
   */

  const entryMap = new Map();

  entryResult.rows.forEach((row) => {
    const gateKey = row.gate_key;

    if (!entryMap.has(gateKey)) {
      entryMap.set(gateKey, []);
    }

    entryMap.get(gateKey).push({
      category: row.category,
      count: Number(row.people_count || 0),
    });
  });

  const insideMap = new Map();

  insideResult.rows.forEach((row) => {
    const gateKey = row.gate_key;

    if (!insideMap.has(gateKey)) {
      insideMap.set(gateKey, []);
    }

    insideMap.get(gateKey).push({
      category: row.category,
      count: Number(row.people_count || 0),
    });
  });

  /*
   * ============================================================
   * 7. NORMALIZE CATEGORY LABEL
   * ============================================================
   */

  const formatCategory = (value) => {
    const category = String(value || "")
      .trim()
      .toLowerCase();

    if (category.startsWith("vendor")) {
      return "Vendor";
    }

    if (
      category === "delivery" ||
      category === "deliveryperson" ||
      category === "delivery_person"
    ) {
      return "Delivery";
    }

    if (category === "maid") {
      return "Maid";
    }

    if (category === "guest") {
      return "Guest";
    }

    if (category === "visitor") {
      return "Visitor";
    }

    if (category === "security") {
      return "Security";
    }

    if (!category) {
      return "Other";
    }

    return category
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  /*
   * ============================================================
   * 8. BUILD FINAL GATE RESPONSE
   * ============================================================
   */

  const gates = gateResult.rows.map(
    (gate, index) => {
      const gateKey = String(
        gate.name || ""
      )
        .trim()
        .toLowerCase();

      const categories =
        entryMap.get(gateKey) || [];

      const insideCategories =
        insideMap.get(gateKey) || [];

      const enteredTotal =
        categories.reduce(
          (total, item) =>
            total + Number(item.count || 0),
          0
        );

      const inPremises =
        insideCategories.reduce(
          (total, item) =>
            total + Number(item.count || 0),
          0
        );

      return {
        id: gate.id,

        name: gate.name,

        gateNumber: `Gate ${index + 1}`,

        status:
          gate.status === true ||
          String(gate.status).toLowerCase() ===
            "true"
            ? "Open"
            : "Closed",

        enteredToday: enteredTotal,

        inPremises,

        categories: categories.map(
          (item) => ({
            category: formatCategory(
              item.category
            ),
            count: Number(
              item.count || 0
            ),
          })
        ),
      };
    }
  );

  /*
   * ============================================================
   * 9. RETURN
   * ============================================================
   */

  return {
    period,
    gates,
  };
};
export const getDashboardStats = async (
  client,
  schemaName,
  period = "daily"
) => {

  let dateCondition = "";

  switch (period) {

    case "daily":
      dateCondition = `
        punch_time >= CURRENT_DATE
        AND punch_time < CURRENT_DATE + INTERVAL '1 day'
      `;
      break;

    case "weekly":
      dateCondition = `
        punch_time >= DATE_TRUNC(
          'week',
          CURRENT_DATE
        )
        AND punch_time < CURRENT_DATE + INTERVAL '1 day'
      `;
      break;

    case "monthly":
      dateCondition = `
        punch_time >= DATE_TRUNC(
          'month',
          CURRENT_DATE
        )
        AND punch_time < CURRENT_DATE + INTERVAL '1 day'
      `;
      break;

    case "yearly":
      dateCondition = `
        punch_time >= DATE_TRUNC(
          'year',
          CURRENT_DATE
        )
        AND punch_time < CURRENT_DATE + INTERVAL '1 day'
      `;
      break;

    default:
      throw new Error(
        "Invalid period. Use daily, weekly, monthly or yearly."
      );
  }

  const result = await client.query(
    `
    SELECT
      COUNT(*) AS total_visitors,

      COUNT(*) FILTER (
        WHERE UPPER(TRIM(punch_type)) = 'IN'
      ) AS inside_visitors,

      COUNT(*) FILTER (
        WHERE LOWER(table_name) LIKE '%delivery%'
      ) AS deliveries

    FROM "${schemaName}".punch_logs

    WHERE
      punch_time IS NOT NULL

      AND ${dateCondition}
    `
  );

  return result.rows[0];
};
// export const getDashboardStats = async (client, schemaName) => {
//   const result = await client.query(
//     `
//     SELECT
//       COUNT(*) AS total_visitors,
//       COUNT(*) FILTER (WHERE punch_type = 'IN') AS inside_visitors,
//       COUNT(*) FILTER (
//     WHERE LOWER(table_name) LIKE '%delivery%'
// ) AS deliveries
//     FROM "${schemaName}".punch_logs
//   `);

//   return result.rows[0];
// };
export const getRecentVisitors = async (
  client,
  schemaName,
  search = "",
  purpose = "",
  period = "daily"
) => {
  // ============================================================
  // 1. DATE FILTER
  // ============================================================

  let dateCondition = "";

  switch (period) {
    case "weekly":
      dateCondition = `
        punch_time >= DATE_TRUNC(
          'week',
          CURRENT_DATE
        )
        AND punch_time < CURRENT_DATE + INTERVAL '1 day'
      `;
      break;

    case "monthly":
      dateCondition = `
        punch_time >= DATE_TRUNC(
          'month',
          CURRENT_DATE
        )
        AND punch_time < CURRENT_DATE + INTERVAL '1 day'
      `;
      break;
case "yearly":
    dateCondition = `
      punch_time >= DATE_TRUNC(
        'year',
        CURRENT_DATE
      )
      AND punch_time < CURRENT_DATE + INTERVAL '1 day'
    `;
    break;

    case "daily":
    default:
      dateCondition = `
        punch_time >= CURRENT_DATE
        AND punch_time < CURRENT_DATE + INTERVAL '1 day'
      `;
      break;
  }

  
  const normalizedPurpose = String(purpose || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  // ============================================================
  // 3. QUERY
  // ============================================================

  const query = `
    WITH filtered_logs AS (

      SELECT
        user_id,
        full_name,
        table_name,
        punch_type,
        punch_time

      FROM "${schemaName}".punch_logs

      WHERE
        ${dateCondition}

        AND punch_time IS NOT NULL

        AND user_id IS NOT NULL

        -- ======================================================
        -- SEARCH
        -- ======================================================

        AND (
          $1 = ''
          OR LOWER(full_name) LIKE LOWER('%' || $1 || '%')
          OR LOWER(table_name) LIKE LOWER('%' || $1 || '%')
        )

        -- ======================================================
        -- DYNAMIC PURPOSE FILTER
        --
        -- We normalize the database table_name in exactly the
        -- same way as the frontend/category key.
        --
        -- Example:
        --
        -- "Delivery Person"
        --       ↓
        -- "delivery_person"
        --
        -- "delivery_person"
        --       ↓
        -- "delivery_person"
        --
        -- "vendor_"
        --       ↓
        -- "vendor"
        -- ======================================================

        AND (
          $2 = ''
          OR REGEXP_REPLACE(
               REGEXP_REPLACE(
                 LOWER(TRIM(table_name)),
                 '[^a-z0-9]+',
                 '_',
                 'g'
               ),
               '^_+|_+$',
               '',
               'g'
             ) = $2
        )
    ),

    visits AS (

      SELECT
        i.user_id,
        i.full_name,
        i.table_name,

        DATE(i.punch_time) AS visit_date,

        i.punch_time AS time_in,

        (
          SELECT MIN(o.punch_time)

          FROM "${schemaName}".punch_logs o

          WHERE
            o.user_id = i.user_id

            -- ==================================================
            -- MATCH SAME CATEGORY
            -- ==================================================

            AND REGEXP_REPLACE(
                  REGEXP_REPLACE(
                    LOWER(TRIM(o.table_name)),
                    '[^a-z0-9]+',
                    '_',
                    'g'
                  ),
                  '^_+|_+$',
                  '',
                  'g'
                )
                =
                REGEXP_REPLACE(
                  REGEXP_REPLACE(
                    LOWER(TRIM(i.table_name)),
                    '[^a-z0-9]+',
                    '_',
                    'g'
                  ),
                  '^_+|_+$',
                  '',
                  'g'
                )

            AND UPPER(TRIM(o.punch_type)) = 'OUT'

            AND o.punch_time > i.punch_time

            -- ==================================================
            -- MAKE SURE THIS OUT BELONGS TO THIS IN
            -- ==================================================

            AND NOT EXISTS (

              SELECT 1

              FROM "${schemaName}".punch_logs next_in

              WHERE
                next_in.user_id = i.user_id

                AND REGEXP_REPLACE(
                      REGEXP_REPLACE(
                        LOWER(TRIM(next_in.table_name)),
                        '[^a-z0-9]+',
                        '_',
                        'g'
                      ),
                      '^_+|_+$',
                      '',
                      'g'
                    )
                    =
                    REGEXP_REPLACE(
                      REGEXP_REPLACE(
                        LOWER(TRIM(i.table_name)),
                        '[^a-z0-9]+',
                        '_',
                        'g'
                      ),
                      '^_+|_+$',
                      '',
                      'g'
                    )

                AND UPPER(TRIM(next_in.punch_type)) = 'IN'

                AND next_in.punch_time >
                    i.punch_time

                AND next_in.punch_time <
                    o.punch_time
            )
        ) AS time_out

      FROM filtered_logs i

      WHERE
        UPPER(TRIM(i.punch_type)) = 'IN'
    )

    SELECT
      user_id,
      full_name,
      table_name,
      visit_date,
      time_in,
      time_out

    FROM visits

    ORDER BY
      visit_date DESC,
      time_in DESC;
  `;

  // ============================================================
  // DEBUG LOGS
  // ============================================================

  console.log(
    "========================================"
  );

  console.log(
    "RECENT VISITORS"
  );

  console.log(
    "Schema:",
    schemaName
  );

  console.log(
    "Period:",
    period
  );

  console.log(
    "Search:",
    search
  );

  console.log(
    "Original Purpose:",
    purpose
  );

  console.log(
    "Normalized Purpose:",
    normalizedPurpose
  );

  console.log(
    "========================================"
  );

  // ============================================================
  // EXECUTE QUERY
  // ============================================================

  const result = await client.query(
    query,
    [
      String(search || "").trim(),
      normalizedPurpose,
    ]
  );

  // ============================================================
  // RESULT LOGS
  // ============================================================

  console.log(
    "Recent Visitors Result:",
    result.rows
  );

  console.log(
    "Recent Visitors Count:",
    result.rows.length
  );

  return result.rows;
};
export const getCategoryStats = async (client, organisationId) => {
  console.log("Organisation ID:", organisationId);

  const result = await client.query(
    `
    SELECT
      INITCAP(LOWER(display_name)) AS category,
      COUNT(*)::int AS total
    FROM auth.dynamic_tables
    WHERE organisation_id = $1
    GROUP BY LOWER(display_name)
    ORDER BY total DESC;
    `,
    [organisationId]
  );

  console.log("Rows:", result.rows);

  return result.rows;
};
export const getCategoryTrend = async (
  businessClient,
  authClient,
  organisationId,
  type,
  selectedCategory = "all"
) => {

  /*
   * =====================================================
   * 1. Get organisation schema
   * =====================================================
   */

  const orgResult = await authClient.query(
    `
      SELECT schema_name
      FROM auth.organisations
      WHERE id = $1
      LIMIT 1
    `,
    [organisationId]
  );

  if (!orgResult.rows.length) {
    throw new Error(
      "Organisation not found"
    );
  }

  const schemaName =
    orgResult.rows[0].schema_name;


  /*
   * =====================================================
   * 2. Get dynamic categories
   * =====================================================
   */

  const categoryResult =
    await authClient.query(
      `
        SELECT
          table_name,
          display_name,
          schema_name
        FROM auth.dynamic_tables
        WHERE organisation_id = $1
          AND schema_name = $2
        ORDER BY created_at ASC
      `,
      [
        organisationId,
        schemaName,
      ]
    );


  /*
   * =====================================================
   * 3. Create category lookup
   * =====================================================
   *
   * Example:
   *
   * vendor1 -> vendor
   * vendor  -> vendor
   * delivery -> delivery_person
   */

  const categoryMap = new Map();

  categoryResult.rows.forEach(
    (row) => {

      if (!row.table_name) {
        return;
      }

      let key =
        row.table_name
          .trim()
          .toLowerCase();

      /*
       * Same normalization as your
       * category cards.
       */

      if (key.startsWith("vendor")) {
        key = "vendor";
      }

      if (
        key === "delivery" ||
        key === "deliveryperson"
      ) {
        key = "delivery_person";
      }

      const label =
        row.display_name?.trim() ||
        row.table_name
          .replace(/_/g, " ")
          .replace(
            /\b\w/g,
            (char) =>
              char.toUpperCase()
          );

      /*
       * Multiple DB table definitions can
       * belong to the same category.
       */

      categoryMap.set(
        key,
        label
      );
    }
  );


  /*
   * =====================================================
   * 4. Time grouping
   * =====================================================
   */

  let timeExpression;
  let orderExpression;

  switch (type) {

    case "hourly":

      timeExpression = `
        TO_CHAR(
          DATE_TRUNC(
            'hour',
            punch_time
          ),
          'HH24:00'
        )
      `;

      orderExpression = `
        DATE_TRUNC(
          'hour',
          punch_time
        )
      `;

      break;


    case "daily":

      timeExpression = `
        TO_CHAR(
          DATE_TRUNC(
            'day',
            punch_time
          ),
          'DD Mon'
        )
      `;

      orderExpression = `
        DATE_TRUNC(
          'day',
          punch_time
        )
      `;

      break;


    case "weekly":

      timeExpression = `
        CONCAT(
          'Week ',
          EXTRACT(
            WEEK FROM punch_time
          )
        )
      `;

      orderExpression = `
        DATE_TRUNC(
          'week',
          punch_time
        )
      `;

      break;


    case "monthly":

      timeExpression = `
        TO_CHAR(
          DATE_TRUNC(
            'month',
            punch_time
          ),
          'Mon YYYY'
        )
      `;

      orderExpression = `
        DATE_TRUNC(
          'month',
          punch_time
        )
      `;

      break;

case "yearly":
    dateCondition = `
      punch_time >= DATE_TRUNC(
        'year',
        CURRENT_DATE
      )
      AND punch_time < CURRENT_DATE + INTERVAL '1 day'
    `;
    break;

    default:

      throw new Error(
        "Invalid trend type"
      );
  }


  /*
   * =====================================================
   * 5. Category filtering
   * =====================================================
   */

  let categoryCondition = "";
  let queryParams = [];

  if (
    selectedCategory &&
    selectedCategory !== "all"
  ) {

    /*
     * We cannot simply compare
     * table_name = selectedCategory
     * because your system can have:
     *
     * vendor
     * vendor1
     *
     * both representing Vendor.
     *
     * Therefore we retrieve activity first
     * and normalize it below.
     */

    queryParams = [];
  }


  /*
   * =====================================================
   * 6. Query actual punch_logs
   * =====================================================
   */

  const safeSchema =
    `"${schemaName.replace(
      /"/g,
      '""'
    )}"`;


  const query = `
    SELECT

      ${timeExpression} AS label,

      LOWER(table_name) AS table_key,

      COUNT(*) FILTER (
        WHERE UPPER(punch_type) = 'IN'
      )::int AS inside,

      COUNT(*) FILTER (
        WHERE UPPER(punch_type) = 'OUT'
      )::int AS outside

    FROM ${safeSchema}.punch_logs

    WHERE punch_type IS NOT NULL
    AND ${dateCondition}

    GROUP BY
      ${timeExpression},
      ${orderExpression},
      LOWER(table_name)

    ORDER BY
      ${orderExpression},
      LOWER(table_name);
  `;


  const result =
    await businessClient.query(
      query,
      queryParams
    );


  /*
   * =====================================================
   * 7. Transform results
   * =====================================================
   */

  const transformed = [];


  result.rows.forEach(
    (row) => {

      let categoryKey =
        row.table_key
          ?.trim()
          .toLowerCase();


      /*
       * Normalize category.
       */

      if (
        categoryKey?.startsWith(
          "vendor"
        )
      ) {
        categoryKey = "vendor";
      }


      if (
        categoryKey === "delivery" ||
        categoryKey ===
          "deliveryperson"
      ) {
        categoryKey =
          "delivery_person";
      }


      /*
       * Ignore categories that are not
       * registered for this organisation.
       */

      const categoryLabel =
        categoryMap.get(
          categoryKey
        );


      if (!categoryLabel) {
        return;
      }


      /*
       * Selected category filter.
       */

      if (
        selectedCategory !== "all" &&
        categoryKey !==
          selectedCategory
      ) {
        return;
      }


      /*
       * Find existing time bucket.
       */

      let existing =
        transformed.find(
          (item) =>
            item.label ===
            row.label
        );


      if (!existing) {

        existing = {
          label: row.label,
        };

        transformed.push(
          existing
        );
      }


      /*
       * Store:
       *
       * Guest_IN
       * Guest_OUT
       * Maid_IN
       * Maid_OUT
       * etc.
       */

      const safeCategory =
        categoryKey;


      existing[
        `${safeCategory}_IN`
      ] =
        Number(
          row.inside || 0
        );


      existing[
        `${safeCategory}_OUT`
      ] =
        Number(
          row.outside || 0
        );


      /*
       * Store display name too.
       */

      existing[
        `${safeCategory}_label`
      ] =
        categoryLabel;
    }
  );


  return transformed;
};


export const getCategoryCards = async (
  businessClient,
  authClient,
  organisationId,
  schemaName,
  period = "daily"
) => {
  // --------------------------------------------------
  // 1. Validate period
  // --------------------------------------------------

  const validPeriods = [
    "daily",
    "weekly",
    "monthly",
    "yearly",
  ];

  if (!validPeriods.includes(period)) {
    throw new Error(
      "Invalid period. Use daily, weekly, monthly or yearly."
    );
  }


  // --------------------------------------------------
  // 2. Get categories configured for organisation
  // --------------------------------------------------

  const tableResult = await authClient.query(
    `
      SELECT
        table_name,
        display_name,
        schema_name,
        created_at
      FROM auth.dynamic_tables
      WHERE organisation_id = $1
        AND schema_name = $2
      ORDER BY created_at ASC
    `,
    [
      organisationId,
      schemaName,
    ]
  );

  const tables = tableResult.rows;


  // --------------------------------------------------
  // 3. Build category lookup
  // --------------------------------------------------

  const categoryMap = new Map();

  for (const table of tables) {

    if (
      !table.table_name ||
      !table.schema_name
    ) {
      continue;
    }

    let key =
      table.table_name
        .trim()
        .toLowerCase();


    // ----------------------------------------------
    // Normalize categories
    // ----------------------------------------------

    if (key.startsWith("vendor")) {
      key = "vendor";
    }

    if (
      key === "delivery" ||
      key === "deliveryperson"
    ) {
      key = "delivery_person";
    }


    // ----------------------------------------------
    // Display label
    // ----------------------------------------------

    let label =
      table.display_name?.trim() ||
      table.table_name
        .replace(/_/g, " ")
        .replace(
          /\b\w/g,
          (char) => char.toUpperCase()
        );


    // ----------------------------------------------
    // Standard labels
    // ----------------------------------------------

    if (key === "guest") {
      label = "Guest";

    } else if (key === "vendor") {
      label = "Vendor";

    } else if (key === "maid") {
      label = "Maid";

    } else if (key === "visitor") {
      label = "Visitor";

    } else if (key === "worker") {
      label = "Worker";

    } else if (key === "security") {
      label = "Security";

    } else if (key === "delivery_person") {
      label = "Delivery Person";

    } else if (key === "organiser") {
      label = "Organiser";

    } else if (key === "service_provider") {
      label = "Service Provider";
    }


    // ----------------------------------------------
    // Combine duplicate definitions
    // ----------------------------------------------

    if (!categoryMap.has(key)) {

      categoryMap.set(key, {
        key,
        label,
        tableNames: [],
      });

    }

    categoryMap
      .get(key)
      .tableNames
      .push(
        table.table_name
      );
  }


  // --------------------------------------------------
  // 4. Safe schema
  // --------------------------------------------------

  const safeSchema =
    `"${schemaName.replace(/"/g, '""')}"`;


  // --------------------------------------------------
  // 5. Date filter
  // --------------------------------------------------

  let dateCondition = "";

  switch (period) {

    case "daily":

      dateCondition = `
        punch_time >= CURRENT_DATE
        AND punch_time < CURRENT_DATE + INTERVAL '1 day'
      `;

      break;


    case "weekly":

      dateCondition = `
        punch_time >= DATE_TRUNC(
          'week',
          CURRENT_DATE
        )
        AND punch_time < DATE_TRUNC(
          'week',
          CURRENT_DATE
        ) + INTERVAL '1 week'
      `;

      break;


    case "monthly":

      dateCondition = `
        punch_time >= DATE_TRUNC(
          'month',
          CURRENT_DATE
        )
        AND punch_time < DATE_TRUNC(
          'month',
          CURRENT_DATE
        ) + INTERVAL '1 month'
      `;

      break;
      case "yearly":

  dateCondition = `
    punch_time >= DATE_TRUNC(
      'year',
      CURRENT_DATE
    )

    AND

    punch_time < CURRENT_DATE + INTERVAL '1 day'
  `;

  break;
  }


  // --------------------------------------------------
  // 6. Get category activity from punch_logs
  // --------------------------------------------------
  //
  // We count DISTINCT user_id.
  //
  // Example:
  //
  // Person enters 3 times today
  // -> counted as 1 visitor
  //
  // Only IN punches are counted.
  //
  // --------------------------------------------------

  const query = `
    SELECT
      LOWER(table_name) AS table_name,
      COUNT(
        DISTINCT user_id
      ) FILTER (
        WHERE UPPER(punch_type) = 'IN'
      )::int AS count

    FROM ${safeSchema}.punch_logs

    WHERE
      punch_time IS NOT NULL

      AND user_id IS NOT NULL

      AND ${dateCondition}

    GROUP BY
      LOWER(table_name)

    ORDER BY
      LOWER(table_name);
  `;


  console.log(
    "Category Cards Period:",
    period
  );

  console.log(
    "Category Cards Query:",
    query
  );


  const result =
    await businessClient.query(
      query
    );


  // --------------------------------------------------
  // 7. Combine normalized categories
  // --------------------------------------------------

  const categoryCounts = new Map();


  result.rows.forEach((row) => {

    let key =
      row.table_name
        ?.trim()
        .toLowerCase();


    if (!key) {
      return;
    }


    // Normalize vendor1, vendor2 etc.
    if (
      key.startsWith("vendor")
    ) {
      key = "vendor";
    }


    // Normalize delivery
    if (
      key === "delivery" ||
      key === "deliveryperson"
    ) {
      key = "delivery_person";
    }


    const count =
      Number(row.count || 0);


    if (
      categoryCounts.has(key)
    ) {

      categoryCounts.set(
        key,
        categoryCounts.get(key) + count
      );

    } else {

      categoryCounts.set(
        key,
        count
      );

    }
  });


  // --------------------------------------------------
  // 8. Create final category response
  // --------------------------------------------------

  const categories =
    Array.from(
      categoryMap.values()
    ).map((category) => {

      const count =
        categoryCounts.get(
          category.key
        ) || 0;

      return {
        key: category.key,
        label: category.label,
        count,
      };
    });


  // --------------------------------------------------
  // 9. Total
  // --------------------------------------------------

  const total =
    categories.reduce(
      (sum, category) =>
        sum +
        Number(category.count || 0),
      0
    );


  // --------------------------------------------------
  // 10. Return
  // --------------------------------------------------

  return {
    period,
    total,
    categories,
  };
};
export const getInsideOutsideStats = async (
  businessClient,
  authClient,
  organisationId
) => {
  // Get organisation schema from master DB
  const orgResult = await authClient.query(
    `
      SELECT schema_name
      FROM auth.organisations
      WHERE id = $1
      LIMIT 1
    `,
    [organisationId]
  );

  if (!orgResult.rows.length) {
    throw new Error("Organisation not found");
  }

  const schemaName =
    orgResult.rows[0].schema_name;

  const safeSchema =
    `"${schemaName.replace(/"/g, '""')}"`;

  /*
   * Get the latest punch for every person.
   *
   * If latest punch = IN  -> currently inside
   * If latest punch = OUT -> currently outside
   */
  const query = `
    WITH latest_punch AS (
      SELECT
        user_id,
        full_name,
        table_name,
        punch_type,
        punch_time,

        ROW_NUMBER() OVER (
          PARTITION BY user_id
          ORDER BY punch_time DESC
        ) AS rn

      FROM ${safeSchema}.punch_logs

      WHERE user_id IS NOT NULL
    )

    SELECT
      COUNT(*) FILTER (
        WHERE UPPER(punch_type) = 'IN'
      )::int AS inside,

      COUNT(*) FILTER (
        WHERE UPPER(punch_type) = 'OUT'
      )::int AS outside

    FROM latest_punch

    WHERE rn = 1;
  `;

  const result =
    await businessClient.query(query);

  const row = result.rows[0] || {};

  return {
    inside: Number(row.inside || 0),
    outside: Number(row.outside || 0),
  };
};
export const getPeakVisitorHours = async (
  businessClient,
  authClient,
  organisationId,
  period = "hourly",
  category = "all"
) => {
  // --------------------------------------------------
  // 1. Get organisation schema
  // --------------------------------------------------

  const orgResult = await authClient.query(
    `
      SELECT schema_name
      FROM auth.organisations
      WHERE id = $1::integer
      LIMIT 1
    `,
    [organisationId]
  );

  if (!orgResult.rows.length) {
    throw new Error("Organisation not found");
  }

  const schemaName = orgResult.rows[0].schema_name;

  const safeSchema =
    `"${schemaName.replace(/"/g, '""')}"`;


  // --------------------------------------------------
  // 2. Decide grouping
  // --------------------------------------------------

  let labelExpression;
  let orderExpression;

  switch (period) {

    case "daily":

      labelExpression = `
        TO_CHAR(punch_time, 'Dy')
      `;

      orderExpression = `
        EXTRACT(ISODOW FROM punch_time)
      `;

      break;


    case "weekly":

      labelExpression = `
        'Week ' ||
        EXTRACT(WEEK FROM punch_time)::int
      `;

      orderExpression = `
        EXTRACT(WEEK FROM punch_time)
      `;

      break;


    case "monthly":

      labelExpression = `
        TO_CHAR(punch_time, 'Mon')
      `;

      orderExpression = `
        EXTRACT(MONTH FROM punch_time)
      `;

      break;
case "yearly":

  labelExpression = `
    TO_CHAR(
      DATE_TRUNC(
        'month',
        punch_time
      ),
      'Mon'
    )
  `;

  orderExpression = `
    EXTRACT(
      MONTH FROM punch_time
    )
  `;

  break;

    case "hourly":

    default:

      labelExpression = `
        TO_CHAR(
          DATE_TRUNC('hour', punch_time),
          'HH12 AM'
        )
      `;

      orderExpression = `
        EXTRACT(HOUR FROM punch_time)
      `;

      break;
  }


  // --------------------------------------------------
  // 3. Dynamic category filter
  // --------------------------------------------------

  let categoryFilter = "";
  let params = [];

  if (
    category &&
    category.toLowerCase() !== "all"
  ) {

    categoryFilter = `
      AND (
        LOWER(table_name) = LOWER($1::text)

        OR (
          LOWER($1::text) = 'vendor'
          AND LOWER(table_name) LIKE 'vendor%'
        )

        OR (
          LOWER($1::text) = 'delivery person'
          AND LOWER(table_name) IN (
            'delivery_person',
            'deliveryperson',
            'delivery'
          )
        )
      )
    `;

    params = [category];
  }


  // --------------------------------------------------
  // 4. Query punch logs
  // --------------------------------------------------

  const query = `
    SELECT

      ${labelExpression} AS label,

      COUNT(*) FILTER (
        WHERE UPPER(punch_type) = 'IN'
      )::int AS in_count,

      COUNT(*) FILTER (
        WHERE UPPER(punch_type) = 'OUT'
      )::int AS out_count

    FROM ${safeSchema}.punch_logs

    WHERE  ${dateCondition}


      ${categoryFilter}

    GROUP BY
      ${labelExpression},
      ${orderExpression}

    ORDER BY
      ${orderExpression};
  `;


  console.log(
    "Peak Visitor Query:",
    query
  );

  console.log(
    "Peak Visitor Params:",
    params
  );


  const result =
    await businessClient.query(
      query,
      params
    );


  // --------------------------------------------------
  // 5. Format response
  // --------------------------------------------------

  return result.rows.map((row) => ({
    label: row.label,
    IN: Number(row.in_count || 0),
    OUT: Number(row.out_count || 0),
  }));
};

// export const getEntriesOverview = async (
//   businessClient,
//   authClient,
//   organisationId,
//   period = "daily"
// ) => {
//   /*
//    * =====================================================
//    * 1. Get organisation schema
//    * =====================================================
//    */

//   const orgResult = await authClient.query(
//     `
//       SELECT schema_name
//       FROM auth.organisations
//       WHERE id = $1
//       LIMIT 1
//     `,
//     [organisationId]
//   );

//   if (!orgResult.rows.length) {
//     throw new Error("Organisation not found");
//   }

//   const schemaName = orgResult.rows[0].schema_name;

//   const safeSchema = `"${schemaName.replace(/"/g, '""')}"`;

//   /*
//    * =====================================================
//    * 2. Get dynamic categories
//    * =====================================================
//    */

//   const categoryResult = await authClient.query(
//     `
//       SELECT
//         table_name,
//         display_name,
//         schema_name
//       FROM auth.dynamic_tables
//       WHERE organisation_id = $1
//         AND schema_name = $2
//       ORDER BY created_at ASC
//     `,
//     [organisationId, schemaName]
//   );

//   /*
//    * =====================================================
//    * 3. Create category mapping
//    * =====================================================
//    */

//   const categoryMap = new Map();

//   categoryResult.rows.forEach((row) => {
//     if (!row.table_name) {
//       return;
//     }

//     const key = row.table_name
//       .trim()
//       .toLowerCase();

//     const label =
//       row.display_name?.trim() ||
//       row.table_name
//         .replace(/_/g, " ")
//         .replace(/\b\w/g, (char) =>
//           char.toUpperCase()
//         );

//     categoryMap.set(key, label);
//   });

//   /*
//    * =====================================================
//    * 4. Validate period
//    * =====================================================
//    */

//   if (!["daily", "weekly", "monthly","yearly"].includes(period)) {
//     throw new Error(
//       "Invalid entries overview period"
//     );
//   }

//   /*
//    * =====================================================
//    * 5. DAILY
//    * =====================================================
//    *
//    * Example:
//    *
//    * 03:39 PM
//    *      ↓
//    * DATE_TRUNC('hour')
//    *      ↓
//    * 03:00 PM
//    *      ↓
//    * 3 PM–4 PM
//    *
//    * We generate all 24 hours so even empty
//    * hours are displayed as 0.
//    */

//   if (period === "daily") {
//     const query = `
//       WITH hours AS (
//         SELECT
//           generate_series(
//             DATE_TRUNC('day', CURRENT_DATE),
//             DATE_TRUNC('day', CURRENT_DATE)
//               + INTERVAL '23 hours',
//             INTERVAL '1 hour'
//           ) AS hour_start
//       ),

//       entry_data AS (
//         SELECT
//           DATE_TRUNC(
//             'hour',
//             punch_time
//           ) AS hour_start,

//           LOWER(
//             TRIM(table_name)
//           ) AS category_key,

//           COUNT(*)::int AS total

//         FROM ${safeSchema}.punch_logs

//         WHERE
//           punch_type IS NOT NULL

//           AND UPPER(punch_type) = 'IN'

//           AND punch_time >= DATE_TRUNC(
//             'day',
//             CURRENT_DATE
//           )

//           AND punch_time < DATE_TRUNC(
//             'day',
//             CURRENT_DATE
//           ) + INTERVAL '1 day'

//         GROUP BY
//           DATE_TRUNC(
//             'hour',
//             punch_time
//           ),

//           LOWER(
//             TRIM(table_name)
//           )
//       )

//       SELECT
//         h.hour_start,

//         TO_CHAR(
//           h.hour_start,
//           'FMHH12 AM'
//         )
//         ||
//         '–'
//         ||
//         TO_CHAR(
//           h.hour_start + INTERVAL '1 hour',
//           'FMHH12 AM'
//         ) AS label,

//         e.category_key,

//         COALESCE(
//           e.total,
//           0
//         )::int AS total

//       FROM hours h

//       LEFT JOIN entry_data e
//         ON e.hour_start = h.hour_start

//       ORDER BY
//         h.hour_start,
//         e.category_key;
//     `;

//     console.log(
//       "Entries Overview Daily Query:",
//       query
//     );

//     const result =
//       await businessClient.query(query);

//     /*
//      * =================================================
//      * Transform daily result
//      * =================================================
//      */

//     const transformed = [];

//     /*
//      * Create all 24 hours first.
//      */

//     result.rows.forEach((row) => {
//       let existing = transformed.find(
//         (item) => item.label === row.label
//       );

//       if (!existing) {
//         existing = {
//           label: row.label,
//         };

//         transformed.push(existing);
//       }

//       /*
//        * Ignore null category generated by
//        * LEFT JOIN when there are no entries.
//        */

//       if (!row.category_key) {
//         return;
//       }

//       const categoryKey =
//         row.category_key
//           .trim()
//           .toLowerCase();

//       const categoryLabel =
//         categoryMap.get(categoryKey);

//       /*
//        * Ignore categories which are not
//        * registered for this organisation.
//        */

//       if (!categoryLabel) {
//         return;
//       }

//       existing[categoryLabel] =
//         Number(row.total || 0);
//     });

//     /*
//      * =================================================
//      * Fill missing categories with 0
//      * =================================================
//      */

//     transformed.forEach((item) => {
//       categoryMap.forEach((label) => {
//         if (item[label] === undefined) {
//           item[label] = 0;
//         }
//       });
//     });

//     return transformed;
//   }

//   /*
//    * =====================================================
//    * 6. WEEKLY / MONTHLY
//    * =====================================================
//    */

//   let labelExpression;
//   let orderExpression;
//   let dateCondition;

//   switch (period) {
//     case "weekly":

//       labelExpression = `
//         TO_CHAR(
//           DATE_TRUNC(
//             'day',
//             punch_time
//           ),
//           'Dy'
//         )
//       `;

//       orderExpression = `
//         DATE_TRUNC(
//           'day',
//           punch_time
//         )
//       `;

//       dateCondition = `
//         punch_time >= DATE_TRUNC(
//           'week',
//           CURRENT_DATE
//         )

//         AND

//         punch_time < DATE_TRUNC(
//           'week',
//           CURRENT_DATE
//         ) + INTERVAL '7 days'
//       `;

//       break;

//     case "monthly":

//       labelExpression = `
//         TO_CHAR(
//           DATE_TRUNC(
//             'day',
//             punch_time
//           ),
//           'DD Mon'
//         )
//       `;

//       orderExpression = `
//         DATE_TRUNC(
//           'day',
//           punch_time
//         )
//       `;

//       dateCondition = `
//         punch_time >= DATE_TRUNC(
//           'month',
//           CURRENT_DATE
//         )

//         AND

//         punch_time < DATE_TRUNC(
//           'month',
//           CURRENT_DATE
//         ) + INTERVAL '1 month'
//       `;

//       break;

//     default:
//       throw new Error(
//         "Invalid entries overview period"
//       );
//   }

//   /*
//    * =====================================================
//    * 7. Weekly / Monthly Query
//    * =====================================================
//    */

//   const query = `
//     SELECT

//       ${labelExpression} AS label,

//       LOWER(
//         TRIM(table_name)
//       ) AS category_key,

//       COUNT(*)::int AS total

//     FROM ${safeSchema}.punch_logs

//     WHERE
//       punch_type IS NOT NULL

//       AND UPPER(punch_type) = 'IN'

//       AND ${dateCondition}

//     GROUP BY
//       ${labelExpression},
//       ${orderExpression},
//       LOWER(
//         TRIM(table_name)
//       )

//     ORDER BY
//       ${orderExpression},
//       LOWER(
//         TRIM(table_name)
//       );
//   `;

//   console.log(
//     "Entries Overview Query:",
//     query
//   );

//   const result =
//     await businessClient.query(query);

//   /*
//    * =====================================================
//    * 8. Transform Weekly / Monthly Result
//    * =====================================================
//    */

//   const transformed = [];

//   result.rows.forEach((row) => {
//     const categoryKey =
//       row.category_key
//         ?.trim()
//         .toLowerCase();

//     const categoryLabel =
//       categoryMap.get(categoryKey);

//     /*
//      * Ignore categories not registered
//      * for this organisation.
//      */

//     if (!categoryLabel) {
//       return;
//     }

//     let existing =
//       transformed.find(
//         (item) =>
//           item.label === row.label
//       );

//     if (!existing) {
//       existing = {
//         label: row.label,
//       };

//       transformed.push(existing);
//     }

//     existing[categoryLabel] =
//       Number(row.total || 0);
//   });

//   /*
//    * =====================================================
//    * 9. Fill Missing Categories With 0
//    * =====================================================
//    */

//   transformed.forEach((item) => {
//     categoryMap.forEach((label) => {
//       if (item[label] === undefined) {
//         item[label] = 0;
//       }
//     });
//   });

//   return transformed;
// };

//////////////////////////////////////
// export const getEntriesOverview = async (
//   businessClient,
//   authClient,
//   organisationId,
//   period = "daily"
// ) => {
//   /*
//    * =====================================================
//    * 1. Get organisation schema
//    * =====================================================
//    */

//   const orgResult = await authClient.query(
//     `
//       SELECT schema_name
//       FROM auth.organisations
//       WHERE id = $1
//       LIMIT 1
//     `,
//     [organisationId]
//   );

//   if (!orgResult.rows.length) {
//     throw new Error("Organisation not found");
//   }

//   const schemaName = orgResult.rows[0].schema_name;

//   const safeSchema = `"${schemaName.replace(/"/g, '""')}"`;

//   /*
//    * =====================================================
//    * 2. Get dynamic categories
//    * =====================================================
//    */

//   const categoryResult = await authClient.query(
//     `
//       SELECT
//         table_name,
//         display_name,
//         schema_name
//       FROM auth.dynamic_tables
//       WHERE organisation_id = $1
//         AND schema_name = $2
//       ORDER BY created_at ASC
//     `,
//     [organisationId, schemaName]
//   );

//   /*
//    * =====================================================
//    * 3. Create category mapping
//    * =====================================================
//    */

//   const categoryMap = new Map();

//   categoryResult.rows.forEach((row) => {
//     if (!row.table_name) {
//       return;
//     }

//     const key = row.table_name
//       .trim()
//       .toLowerCase();

//     const label =
//       row.display_name?.trim() ||
//       row.table_name
//         .replace(/_/g, " ")
//         .replace(/\b\w/g, (char) =>
//           char.toUpperCase()
//         );

//     categoryMap.set(key, label);
//   });

//   /*
//    * =====================================================
//    * 4. Validate period
//    * =====================================================
//    */

//   if (
//     !["daily", "weekly", "monthly", "yearly"].includes(
//       period
//     )
//   ) {
//     throw new Error(
//       "Invalid entries overview period"
//     );
//   }

//   /*
//    * =====================================================
//    * 5. DAILY
//    * =====================================================
//    *
//    * Shows all 24 hours of the current day.
//    */

//   if (period === "daily") {
//     const query = `
//       WITH hours AS (
//         SELECT
//           generate_series(
//             DATE_TRUNC('day', CURRENT_DATE),
//             DATE_TRUNC('day', CURRENT_DATE)
//               + INTERVAL '23 hours',
//             INTERVAL '1 hour'
//           ) AS hour_start
//       ),

//       entry_data AS (
//         SELECT
//           DATE_TRUNC(
//             'hour',
//             punch_time
//           ) AS hour_start,

//           LOWER(
//             TRIM(table_name)
//           ) AS category_key,

//           COUNT(*)::int AS total

//         FROM ${safeSchema}.punch_logs

//         WHERE
//           punch_type IS NOT NULL

//           AND UPPER(punch_type) = 'IN'

//           AND punch_time >= DATE_TRUNC(
//             'day',
//             CURRENT_DATE
//           )

//           AND punch_time < DATE_TRUNC(
//             'day',
//             CURRENT_DATE
//           ) + INTERVAL '1 day'

//         GROUP BY
//           DATE_TRUNC(
//             'hour',
//             punch_time
//           ),

//           LOWER(
//             TRIM(table_name)
//           )
//       )

//       SELECT
//         h.hour_start,

//         TO_CHAR(
//           h.hour_start,
//           'FMHH12 AM'
//         )
//         ||
//         '–'
//         ||
//         TO_CHAR(
//           h.hour_start + INTERVAL '1 hour',
//           'FMHH12 AM'
//         ) AS label,

//         e.category_key,

//         COALESCE(
//           e.total,
//           0
//         )::int AS total

//       FROM hours h

//       LEFT JOIN entry_data e
//         ON e.hour_start = h.hour_start

//       ORDER BY
//         h.hour_start,
//         e.category_key;
//     `;

//     console.log(
//       "Entries Overview Daily Query:",
//       query
//     );

//     const result =
//       await businessClient.query(query);

//     /*
//      * =================================================
//      * Transform daily result
//      * =================================================
//      */

//     const transformed = [];

//     result.rows.forEach((row) => {
//       let existing = transformed.find(
//         (item) => item.label === row.label
//       );

//       if (!existing) {
//         existing = {
//           label: row.label,
//         };

//         transformed.push(existing);
//       }

//       if (!row.category_key) {
//         return;
//       }

//       const categoryKey =
//         row.category_key
//           .trim()
//           .toLowerCase();

//       const categoryLabel =
//         categoryMap.get(categoryKey);

//       if (!categoryLabel) {
//         return;
//       }

//       existing[categoryLabel] =
//         Number(row.total || 0);
//     });

//     /*
//      * Fill missing categories with 0
//      */

//     transformed.forEach((item) => {
//       categoryMap.forEach((label) => {
//         if (item[label] === undefined) {
//           item[label] = 0;
//         }
//       });
//     });

//     return transformed;
//   }

//   /*
//    * =====================================================
//    * 6. WEEKLY / MONTHLY / YEARLY
//    * =====================================================
//    */

//   let labelExpression;
//   let orderExpression;
//   let dateCondition;
//   let generateSeriesQuery = "";

//   switch (period) {
//     /*
//      * =================================================
//      * WEEKLY
//      * =================================================
//      *
//      * Current week:
//      * Monday -> Sunday
//      */

//     case "weekly":

//       labelExpression = `
//         TO_CHAR(
//           DATE_TRUNC(
//             'day',
//             punch_time
//           ),
//           'Dy'
//         )
//       `;

//       orderExpression = `
//         DATE_TRUNC(
//           'day',
//           punch_time
//         )
//       `;

//       dateCondition = `
//         punch_time >= DATE_TRUNC(
//           'week',
//           CURRENT_DATE
//         )

//         AND

//         punch_time < DATE_TRUNC(
//           'week',
//           CURRENT_DATE
//         ) + INTERVAL '7 days'
//       `;

//       break;

//     /*
//      * =================================================
//      * MONTHLY
//      * =================================================
//      *
//      * Current month:
//      * 1st -> last day
//      */

//     case "monthly":

//       labelExpression = `
//         TO_CHAR(
//           DATE_TRUNC(
//             'day',
//             punch_time
//           ),
//           'DD Mon'
//         )
//       `;

//       orderExpression = `
//         DATE_TRUNC(
//           'day',
//           punch_time
//         )
//       `;

//       dateCondition = `
//         punch_time >= DATE_TRUNC(
//           'month',
//           CURRENT_DATE
//         )

//         AND

//         punch_time < DATE_TRUNC(
//           'month',
//           CURRENT_DATE
//         ) + INTERVAL '1 month'
//       `;

//       break;

//     /*
//      * =================================================
//      * YEARLY
//      * =================================================
//      *
//      * Current year:
//      * January -> December
//      *
//      * We generate all 12 months so that months
//      * without entries are also returned as 0.
//      */

//     case "yearly":

//       labelExpression = `
//         TO_CHAR(
//           DATE_TRUNC(
//             'month',
//             punch_time
//           ),
//           'Mon'
//         )
//       `;

//       orderExpression = `
//         DATE_TRUNC(
//           'month',
//           punch_time
//         )
//       `;

//       dateCondition = `
//         punch_time >= DATE_TRUNC(
//           'year',
//           CURRENT_DATE
//         )

//         AND

//         punch_time < DATE_TRUNC(
//           'year',
//           CURRENT_DATE
//         ) + INTERVAL '1 year'
//       `;

//       break;

//     default:
//       throw new Error(
//         "Invalid entries overview period"
//       );
//   }

//   /*
//    * =====================================================
//    * 7. YEARLY QUERY
//    * =====================================================
//    *
//    * Generate all 12 months for yearly view.
//    *
//    * This ensures:
//    *
//    * Jan -> 0 if no entries
//    * Feb -> 0 if no entries
//    * ...
//    * Dec -> 0 if no entries
//    */

//   if (period === "yearly") {
//     const query = `
//       WITH months AS (
//         SELECT
//           generate_series(
//             DATE_TRUNC(
//               'year',
//               CURRENT_DATE
//             ),
//             DATE_TRUNC(
//               'year',
//               CURRENT_DATE
//             ) + INTERVAL '11 months',
//             INTERVAL '1 month'
//           ) AS month_start
//       ),

//       entry_data AS (
//         SELECT
//           DATE_TRUNC(
//             'month',
//             punch_time
//           ) AS month_start,

//           LOWER(
//             TRIM(table_name)
//           ) AS category_key,

//           COUNT(*)::int AS total

//         FROM ${safeSchema}.punch_logs

//         WHERE
//           punch_type IS NOT NULL

//           AND UPPER(punch_type) = 'IN'

//           AND ${dateCondition}

//         GROUP BY
//           DATE_TRUNC(
//             'month',
//             punch_time
//           ),

//           LOWER(
//             TRIM(table_name)
//           )
//       )

//       SELECT
//         m.month_start,

//         TO_CHAR(
//           m.month_start,
//           'Mon'
//         ) AS label,

//         e.category_key,

//         COALESCE(
//           e.total,
//           0
//         )::int AS total

//       FROM months m

//       LEFT JOIN entry_data e
//         ON e.month_start = m.month_start

//       ORDER BY
//         m.month_start,
//         e.category_key;
//     `;

//     console.log(
//       "Entries Overview Yearly Query:",
//       query
//     );

//     const result =
//       await businessClient.query(query);

//     /*
//      * =================================================
//      * Transform yearly result
//      * =================================================
//      */

//     const transformed = [];

//     result.rows.forEach((row) => {
//       let existing = transformed.find(
//         (item) => item.label === row.label
//       );

//       if (!existing) {
//         existing = {
//           label: row.label,
//         };

//         transformed.push(existing);
//       }

//       /*
//        * Ignore null category generated by
//        * LEFT JOIN when there are no entries.
//        */

//       if (!row.category_key) {
//         return;
//       }

//       const categoryKey =
//         row.category_key
//           .trim()
//           .toLowerCase();

//       const categoryLabel =
//         categoryMap.get(categoryKey);

//       /*
//        * Ignore categories which are not
//        * registered for this organisation.
//        */

//       if (!categoryLabel) {
//         return;
//       }

//       existing[categoryLabel] =
//         Number(row.total || 0);
//     });

//     /*
//      * =================================================
//      * Fill missing categories with 0
//      * =================================================
//      */

//     transformed.forEach((item) => {
//       categoryMap.forEach((label) => {
//         if (item[label] === undefined) {
//           item[label] = 0;
//         }
//       });
//     });

//     return transformed;
//   }

//   /*
//    * =====================================================
//    * 8. WEEKLY / MONTHLY QUERY
//    * =====================================================
//    */

//   const query = `
//     SELECT

//       ${labelExpression} AS label,

//       LOWER(
//         TRIM(table_name)
//       ) AS category_key,

//       COUNT(*)::int AS total

//     FROM ${safeSchema}.punch_logs

//     WHERE
//       punch_type IS NOT NULL

//       AND UPPER(punch_type) = 'IN'

//       AND ${dateCondition}

//     GROUP BY
//       ${labelExpression},
//       ${orderExpression},
//       LOWER(
//         TRIM(table_name)
//       )

//     ORDER BY
//       ${orderExpression},
//       LOWER(
//         TRIM(table_name)
//       );
//   `;

//   console.log(
//     "Entries Overview Query:",
//     query
//   );

//   const result =
//     await businessClient.query(query);

//   /*
//    * =====================================================
//    * 9. Transform Weekly / Monthly Result
//    * =====================================================
//    */

//   const transformed = [];

//   result.rows.forEach((row) => {
//     const categoryKey =
//       row.category_key
//         ?.trim()
//         .toLowerCase();

//     const categoryLabel =
//       categoryMap.get(categoryKey);

//     /*
//      * Ignore categories not registered
//      * for this organisation.
//      */

//     if (!categoryLabel) {
//       return;
//     }

//     let existing =
//       transformed.find(
//         (item) =>
//           item.label === row.label
//       );

//     if (!existing) {
//       existing = {
//         label: row.label,
//       };

//       transformed.push(existing);
//     }

//     existing[categoryLabel] =
//       Number(row.total || 0);
//   });

//   /*
//    * =====================================================
//    * 10. Fill Missing Categories With 0
//    * =====================================================
//    */

//   transformed.forEach((item) => {
//     categoryMap.forEach((label) => {
//       if (item[label] === undefined) {
//         item[label] = 0;
//       }
//     });
//   });

//   return transformed;
// };

export const getEntriesOverview = async (
  businessClient,
  authClient,
  organisationId,
  period = "daily",
  offset = 0
) => {
  // =====================================================
  // 0. DATABASE CLIENT VALIDATION
  // =====================================================

  /*
   * authClient is not being passed for this route in some
   * cases. Since this model already has access to
   * masterAuthDB, use it as a fallback.
   */
  const authDB = authClient || masterAuthDB;

  if (!authDB) {
    throw new Error(
      "Authentication database client is not available"
    );
  }

  if (!businessClient) {
    throw new Error(
      "Business database client is not available"
    );
  }

  console.log(
    "========== ENTRIES OVERVIEW =========="
  );
  console.log(
    "Auth Client:",
    !!authDB
  );
  console.log(
    "Business Client:",
    !!businessClient
  );
  console.log(
    "Organisation ID:",
    organisationId
  );
  console.log(
    "Period:",
    period
  );
  console.log(
    "Offset:",
    offset
  );
  console.log(
    "======================================"
  );

  // =====================================================
  // 1. VALIDATE PERIOD
  // =====================================================

  const allowedPeriods = [
    "daily",
    "weekly",
    "monthly",
    "yearly",
  ];

  if (!allowedPeriods.includes(period)) {
    throw new Error(
      "Invalid period. Use daily, weekly, monthly or yearly."
    );
  }

  // Only current period (0) and previous period (-1)
  // are allowed.
  offset = Number(offset);

  if (![0, -1].includes(offset)) {
    throw new Error(
      "Invalid offset. Use 0 for current or -1 for previous."
    );
  }

  // =====================================================
  // 2. GET ORGANISATION SCHEMA
  // =====================================================

  const orgResult = await authDB.query(
    `
      SELECT
        schema_name,
        org_type
      FROM auth.organisations
      WHERE id = $1
      LIMIT 1
    `,
    [organisationId]
  );

  if (!orgResult.rows.length) {
    throw new Error(
      "Organisation not found"
    );
  }

  const schemaName =
    orgResult.rows[0].schema_name;

  if (!schemaName) {
    throw new Error(
      "Organisation schema not found"
    );
  }

  const safeSchema =
    `"${schemaName.replace(/"/g, '""')}"`;

  console.log(
    "Entries Overview Schema:",
    schemaName
  );

  // =====================================================
  // 3. GET DYNAMIC CATEGORIES
  // =====================================================

  const categoryResult =
    await authDB.query(
      `
        SELECT
          table_name,
          display_name
        FROM auth.dynamic_tables
        WHERE organisation_id = $1
          AND schema_name = $2
        ORDER BY created_at ASC
      `,
      [
        organisationId,
        schemaName,
      ]
    );

  const categoryMap = new Map();

  categoryResult.rows.forEach(
    (row) => {
      if (!row.table_name) {
        return;
      }

      const tableName =
        String(row.table_name)
          .trim()
          .toLowerCase();

      let key = tableName;

      // vendor, vendor1, vendor2 -> vendor
      if (
        tableName.startsWith("vendor")
      ) {
        key = "vendor";
      }

      // delivery variations
      else if (
        tableName === "delivery" ||
        tableName === "deliveryperson" ||
        tableName === "delivery_person"
      ) {
        key = "delivery_person";
      }

      const label =
        row.display_name?.trim() ||
        row.table_name
          .replace(/_/g, " ")
          .replace(
            /\b\w/g,
            (char) =>
              char.toUpperCase()
          );

      if (!categoryMap.has(key)) {
        categoryMap.set(
          key,
          {
            key,
            display_name: label,
          }
        );
      }
    }
  );

  const uniqueCategories =
    Array.from(
      categoryMap.values()
    );

  console.log(
    "Entries Overview Categories:",
    uniqueCategories
  );

  // =====================================================
  // 4. NORMALIZE TABLE NAME
  // =====================================================

  const normalizeCategory = (
    value
  ) => {
    const tableName =
      String(value || "")
        .trim()
        .toLowerCase();

    if (!tableName) {
      return "";
    }

    // vendor, vendor1, vendor2 -> vendor
    if (
      tableName.startsWith("vendor")
    ) {
      return "vendor";
    }

    // delivery variations
    if (
      tableName === "delivery" ||
      tableName === "deliveryperson" ||
      tableName === "delivery_person"
    ) {
      return "delivery_person";
    }

    return tableName;
  };

  // =====================================================
  // 5. CREATE ROW WITH ALL CATEGORIES
  // =====================================================

  const createCategoryRow = (
    label,
    values
  ) => {
    const row = {
      label,
    };

    uniqueCategories.forEach(
      (category) => {
        row[category.key] =
          Number(
            values[category.key] || 0
          );
      }
    );

    return row;
  };

  // =====================================================
  // 6. DAILY
  // =====================================================

  if (period === "daily") {
    const query = `
      WITH selected_day AS (
        SELECT
          DATE_TRUNC(
            'day',
            CURRENT_DATE
            + ($1 * INTERVAL '1 day')
          ) AS start_time
      ),

      hours AS (
        SELECT
          generate_series(
            0,
            23
          ) AS hour
      ),

      entry_data AS (
        SELECT
          DATE_TRUNC(
            'hour',
            pl.punch_time
          ) AS hour_start,

          LOWER(
            TRIM(pl.table_name)
          ) AS table_name,

          COUNT(pl.id)::int AS total

        FROM ${safeSchema}.punch_logs pl

        CROSS JOIN selected_day sd

        WHERE
          UPPER(
            TRIM(pl.punch_type)
          ) = 'IN'

          AND pl.punch_time >=
              sd.start_time

          AND pl.punch_time <
              sd.start_time
              + INTERVAL '1 day'

        GROUP BY
          DATE_TRUNC(
            'hour',
            pl.punch_time
          ),

          LOWER(
            TRIM(pl.table_name)
          )
      )

      SELECT
        h.hour,

        e.table_name,

        COALESCE(
          e.total,
          0
        )::int AS total

      FROM hours h

      LEFT JOIN entry_data e
        ON EXTRACT(
             HOUR FROM e.hour_start
           ) = h.hour

      ORDER BY
        h.hour,
        e.table_name;
    `;

    console.log(
      "Entries Overview Daily Offset:",
      offset
    );

    const result =
      await businessClient.query(
        query,
        [offset]
      );

    const data = [];

    for (
      let hour = 0;
      hour < 24;
      hour++
    ) {
      const values = {};

      result.rows
        .filter(
          (row) =>
            Number(row.hour) ===
            hour
        )
        .forEach(
          (row) => {
            const key =
              normalizeCategory(
                row.table_name
              );

            if (!key) {
              return;
            }

            values[key] =
              (values[key] || 0) +
              Number(
                row.total || 0
              );
          }
        );

      data.push(
        createCategoryRow(
          `${String(hour).padStart(
            2,
            "0"
          )}:00`,
          values
        )
      );
    }

    return {
      period,
      offset,
      categories:
        uniqueCategories,
      data,
    };
  }

  // =====================================================
  // 7. WEEKLY
  // =====================================================

  if (period === "weekly") {
    const query = `
      WITH selected_week AS (
        SELECT
          DATE_TRUNC(
            'week',
            CURRENT_DATE
          )
          +
          ($1 * INTERVAL '7 days')
          AS start_date
      ),

      days AS (
        SELECT
          generate_series(
            0,
            6
          ) AS day_offset
      ),

      entry_data AS (
        SELECT
          FLOOR(
            EXTRACT(
              EPOCH FROM (
                DATE_TRUNC(
                  'day',
                  pl.punch_time
                )
                - sw.start_date
              )
            ) / 86400
          )::int AS day_offset,

          LOWER(
            TRIM(pl.table_name)
          ) AS table_name,

          COUNT(pl.id)::int AS total

        FROM ${safeSchema}.punch_logs pl

        CROSS JOIN selected_week sw

        WHERE
          UPPER(
            TRIM(pl.punch_type)
          ) = 'IN'

          AND pl.punch_time >=
              sw.start_date

          AND pl.punch_time <
              sw.start_date
              + INTERVAL '7 days'

        GROUP BY
          DATE_TRUNC(
            'day',
            pl.punch_time
          ),

          sw.start_date,

          LOWER(
            TRIM(pl.table_name)
          )
      )

      SELECT
        d.day_offset,

        e.table_name,

        COALESCE(
          e.total,
          0
        )::int AS total

      FROM days d

      LEFT JOIN entry_data e
        ON e.day_offset =
           d.day_offset

      ORDER BY
        d.day_offset,
        e.table_name;
    `;

    console.log(
      "Entries Overview Weekly Offset:",
      offset
    );

    const result =
      await businessClient.query(
        query,
        [offset]
      );

    const data = [];

    const today =
      new Date();

    const currentDay =
      today.getDay();

    const mondayOffset =
      currentDay === 0
        ? -6
        : 1 - currentDay;

    for (
      let day = 0;
      day < 7;
      day++
    ) {
      const values = {};

      result.rows
        .filter(
          (row) =>
            Number(
              row.day_offset
            ) === day
        )
        .forEach(
          (row) => {
            const key =
              normalizeCategory(
                row.table_name
              );

            if (!key) {
              return;
            }

            values[key] =
              (values[key] || 0) +
              Number(
                row.total || 0
              );
          }
        );

      const displayDate =
        new Date(today);

      displayDate.setDate(
        today.getDate() +
          mondayOffset +
          day +
          offset * 7
      );

      const label =
        displayDate.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          }
        );

      data.push(
        createCategoryRow(
          label,
          values
        )
      );
    }

    const hasData =
      data.some(
        (row) =>
          uniqueCategories.some(
            (category) =>
              Number(
                row[
                  category.key
                ] || 0
              ) > 0
          )
      );

    return {
      period,
      offset,
      categories:
        uniqueCategories,
      data: hasData
        ? data
        : [],
    };
  }

  // =====================================================
  // 8. MONTHLY
  // =====================================================

  if (period === "monthly") {
    const query = `
      WITH selected_month AS (
        SELECT
          DATE_TRUNC(
            'month',
            CURRENT_DATE
          )
          +
          ($1 * INTERVAL '1 month')
          AS start_date
      ),

      days AS (
        SELECT
          generate_series(
            0,
            (
              EXTRACT(
                DAY FROM (
                  DATE_TRUNC(
                    'month',
                    CURRENT_DATE
                  )
                  +
                  ($1 * INTERVAL '1 month')
                  +
                  INTERVAL '1 month'
                  -
                  INTERVAL '1 day'
                )
              )::int - 1
            )
          ) AS day_offset
      ),

      entry_data AS (
        SELECT
          FLOOR(
            EXTRACT(
              EPOCH FROM (
                DATE_TRUNC(
                  'day',
                  pl.punch_time
                )
                - sm.start_date
              )
            ) / 86400
          )::int AS day_offset,

          LOWER(
            TRIM(pl.table_name)
          ) AS table_name,

          COUNT(pl.id)::int AS total

        FROM ${safeSchema}.punch_logs pl

        CROSS JOIN selected_month sm

        WHERE
          UPPER(
            TRIM(pl.punch_type)
          ) = 'IN'

          AND pl.punch_time >=
              sm.start_date

          AND pl.punch_time <
              sm.start_date
              + INTERVAL '1 month'

        GROUP BY
          DATE_TRUNC(
            'day',
            pl.punch_time
          ),

          sm.start_date,

          LOWER(
            TRIM(pl.table_name)
          )
      )

      SELECT
        d.day_offset,

        e.table_name,

        COALESCE(
          e.total,
          0
        )::int AS total

      FROM days d

      LEFT JOIN entry_data e
        ON e.day_offset =
           d.day_offset

      ORDER BY
        d.day_offset,
        e.table_name;
    `;

    console.log(
      "Entries Overview Monthly Offset:",
      offset
    );

    const result =
      await businessClient.query(
        query,
        [offset]
      );

    const data = [];

    const selectedMonth =
      new Date();

    selectedMonth.setDate(1);

    selectedMonth.setMonth(
      selectedMonth.getMonth() +
        offset
    );

    const selectedYear =
      selectedMonth.getFullYear();

    const selectedMonthNumber =
      selectedMonth.getMonth();

    const daysInMonth =
      new Date(
        selectedYear,
        selectedMonthNumber + 1,
        0
      ).getDate();

    for (
      let day = 0;
      day < daysInMonth;
      day++
    ) {
      const values = {};

      result.rows
        .filter(
          (row) =>
            Number(
              row.day_offset
            ) === day
        )
        .forEach(
          (row) => {
            const key =
              normalizeCategory(
                row.table_name
              );

            if (!key) {
              return;
            }

            values[key] =
              (values[key] || 0) +
              Number(
                row.total || 0
              );
          }
        );

      const labelDate =
        new Date(
          selectedYear,
          selectedMonthNumber,
          day + 1
        );

      const label =
        labelDate.toLocaleDateString(
          "en-US",
          {
            day: "2-digit",
            month: "short",
          }
        );

      data.push(
        createCategoryRow(
          label,
          values
        )
      );
    }

    const hasData =
      data.some(
        (row) =>
          uniqueCategories.some(
            (category) =>
              Number(
                row[
                  category.key
                ] || 0
              ) > 0
          )
      );

    return {
      period,
      offset,
      categories:
        uniqueCategories,
      data: hasData
        ? data
        : [],
    };
  }

  // =====================================================
  // 9. YEARLY
  // =====================================================

  if (period === "yearly") {
    const query = `
      WITH selected_year AS (
        SELECT
          DATE_TRUNC(
            'year',
            CURRENT_DATE
          )
          +
          ($1 * INTERVAL '1 year')
          AS start_date
      ),

      months AS (
        SELECT
          generate_series(
            0,
            11
          ) AS month_offset
      ),

      entry_data AS (
        SELECT
          (
            EXTRACT(
              MONTH FROM
                AGE(
                  DATE_TRUNC(
                    'month',
                    pl.punch_time
                  ),
                  sy.start_date
                )
            )::int
          ) AS month_offset,

          LOWER(
            TRIM(pl.table_name)
          ) AS table_name,

          COUNT(pl.id)::int AS total

        FROM ${safeSchema}.punch_logs pl

        CROSS JOIN selected_year sy

        WHERE
          UPPER(
            TRIM(pl.punch_type)
          ) = 'IN'

          AND pl.punch_time >=
              sy.start_date

          AND pl.punch_time <
              sy.start_date
              + INTERVAL '1 year'

        GROUP BY
          DATE_TRUNC(
            'month',
            pl.punch_time
          ),

          sy.start_date,

          LOWER(
            TRIM(pl.table_name)
          )
      )

      SELECT
        m.month_offset,

        e.table_name,

        COALESCE(
          e.total,
          0
        )::int AS total

      FROM months m

      LEFT JOIN entry_data e
        ON e.month_offset =
           m.month_offset

      ORDER BY
        m.month_offset,
        e.table_name;
    `;

    console.log(
      "Entries Overview Yearly Offset:",
      offset
    );

    const result =
      await businessClient.query(
        query,
        [offset]
      );

    const data = [];

    const selectedYearDate =
      new Date();

    selectedYearDate.setFullYear(
      selectedYearDate.getFullYear() +
        offset
    );

    const selectedYear =
      selectedYearDate.getFullYear();

    for (
      let month = 0;
      month < 12;
      month++
    ) {
      const values = {};

      result.rows
        .filter(
          (row) =>
            Number(
              row.month_offset
            ) === month
        )
        .forEach(
          (row) => {
            const key =
              normalizeCategory(
                row.table_name
              );

            if (!key) {
              return;
            }

            values[key] =
              (values[key] || 0) +
              Number(
                row.total || 0
              );
          }
        );

      const labelDate =
        new Date(
          selectedYear,
          month,
          1
        );

      const label =
        labelDate.toLocaleDateString(
          "en-US",
          {
            month: "short",
          }
        );

      data.push(
        createCategoryRow(
          label,
          values
        )
      );
    }

    const hasData =
      data.some(
        (row) =>
          uniqueCategories.some(
            (category) =>
              Number(
                row[
                  category.key
                ] || 0
              ) > 0
          )
      );

    return {
      period,
      offset,
      categories:
        uniqueCategories,
      data: hasData
        ? data
        : [],
    };
  }

  throw new Error(
    "Invalid period. Use daily, weekly, monthly or yearly."
  );
};

/////////////////////////////////////////////////
export const getEntriesByCategory = async (
  businessClient,
  authClient,
  organisationId,
  period = "daily"
) => {
  /*
   * =====================================================
   * 1. Get organisation schema
   * =====================================================
   */

  const orgResult = await authClient.query(
    `
      SELECT schema_name
      FROM auth.organisations
      WHERE id = $1
      LIMIT 1
    `,
    [organisationId]
  );

  if (!orgResult.rows.length) {
    throw new Error("Organisation not found");
  }

  const schemaName = orgResult.rows[0].schema_name;

  const safeSchema =
    `"${schemaName.replace(/"/g, '""')}"`;

  /*
   * =====================================================
   * 2. Get dynamic categories
   * =====================================================
   */

  const categoryResult = await authClient.query(
    `
      SELECT
        table_name,
        display_name
      FROM auth.dynamic_tables
      WHERE organisation_id = $1
        AND schema_name = $2
      ORDER BY created_at ASC
    `,
    [organisationId, schemaName]
  );

  /*
   * =====================================================
   * 3. Create category mapping
   * =====================================================
   *
   * Database controls the category names.
   *
   * table_name -> display_name
   *
   * visitor -> Visitor
   * vendor  -> Vendor
   * maid    -> Maid
   * guest   -> Guest
   */

  const categoryMap = new Map();

  categoryResult.rows.forEach((row) => {
    if (!row.table_name) {
      return;
    }

    const key = row.table_name
      .trim()
      .toLowerCase();

    const label =
      row.display_name?.trim() ||
      row.table_name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        );

    categoryMap.set(key, label);
  });

  /*
   * =====================================================
   * 4. Decide date condition
   * =====================================================
   */

  let dateCondition;

  switch (period) {
    case "daily":

      dateCondition = `
        DATE(punch_time) = CURRENT_DATE
      `;

      break;

    case "weekly":

      dateCondition = `
        punch_time >= DATE_TRUNC(
          'week',
          CURRENT_DATE
        )

        AND

        punch_time < DATE_TRUNC(
          'week',
          CURRENT_DATE
        ) + INTERVAL '7 days'
      `;

      break;

    case "monthly":

      dateCondition = `
        punch_time >= DATE_TRUNC(
          'month',
          CURRENT_DATE
        )

        AND

        punch_time < DATE_TRUNC(
          'month',
          CURRENT_DATE
        ) + INTERVAL '1 month'
      `;

      break;

      case "yearly":

  dateCondition = `
    punch_time >= DATE_TRUNC(
      'year',
      CURRENT_DATE
    )

    AND

    punch_time < CURRENT_DATE + INTERVAL '1 day'
  `;

  break;
    default:

      throw new Error(
        "Invalid entries by category period"
      );
  }

  /*
   * =====================================================
   * 5. Query entries
   * =====================================================
   *
   * Count only successful IN punches.
   */

  const query = `
    SELECT
      LOWER(TRIM(table_name)) AS category_key,
      COUNT(*)::int AS total

    FROM ${safeSchema}.punch_logs

    WHERE
      punch_type IS NOT NULL

      AND UPPER(TRIM(punch_type)) = 'IN'

      AND ${dateCondition}

    GROUP BY
      LOWER(TRIM(table_name))

    ORDER BY
      COUNT(*) DESC;
  `;

  console.log(
    "Entries By Category Query:",
    query
  );

  const result = await businessClient.query(query);

  /*
   * =====================================================
   * 6. Transform using database categories
   * =====================================================
   */

  const transformed = [];

  result.rows.forEach((row) => {
    const categoryKey =
      row.category_key
        ?.trim()
        .toLowerCase();

    const categoryLabel =
      categoryMap.get(categoryKey);

    /*
     * Ignore categories that are not registered
     * for this organisation.
     */

    if (!categoryLabel) {
      return;
    }

    transformed.push({
      category: categoryLabel,
      count: Number(row.total || 0),
    });
  });

  /*
   * =====================================================
   * 7. Return
   * =====================================================
   */

  return transformed;
};
export const getSecurityGuards = async (
  client,
  schemaName,
  period = "daily"
) => {

  let dateCondition;

  /*
  |--------------------------------------------------------------------------
  | DAILY
  |--------------------------------------------------------------------------
  */

  if (period === "daily") {
    dateCondition = `
      DATE(punch_time) = CURRENT_DATE
    `;
  }

  /*
  |--------------------------------------------------------------------------
  | WEEKLY
  |--------------------------------------------------------------------------
  */

  else if (period === "weekly") {
    dateCondition = `
      DATE(punch_time) >=
        DATE_TRUNC(
          'week',
          CURRENT_DATE
        )::date

      AND

      DATE(punch_time) <= CURRENT_DATE
    `;
  }

  /*
  |--------------------------------------------------------------------------
  | MONTHLY
  |--------------------------------------------------------------------------
  */

  else if (period === "monthly") {
    dateCondition = `
      DATE(punch_time) >=
        DATE_TRUNC(
          'month',
          CURRENT_DATE
        )::date

      AND

      DATE(punch_time) <= CURRENT_DATE
    `;
  }

  else if (period === "yearly") {

  dateCondition = `
    DATE(punch_time) >=
      DATE_TRUNC(
        'year',
        CURRENT_DATE
      )::date

    AND

    DATE(punch_time) <= CURRENT_DATE
  `;
}
  /*
  |--------------------------------------------------------------------------
  | INVALID PERIOD
  |--------------------------------------------------------------------------
  */

  else {
    throw new Error(
      "Invalid period"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | QUERY
  |--------------------------------------------------------------------------
  |
  | We first find the latest punch for every security guard
  | within the selected period.
  |
  | If their latest punch is IN -> they are considered logged in.
  |
  */

  const query = `
    SELECT
      user_id,
      full_name,
      punch_time AS login_time

    FROM (
      SELECT
        user_id,
        full_name,
        punch_type,
        punch_time,

        ROW_NUMBER() OVER (
          PARTITION BY user_id
          ORDER BY punch_time DESC
        ) AS rn

      FROM "${schemaName}".punch_logs

      WHERE
        LOWER(table_name) = 'security'

        AND

        ${dateCondition}
    ) latest

    WHERE
      rn = 1

      AND

      UPPER(punch_type) = 'IN'

    ORDER BY
      login_time ASC;
  `;


  const result =
    await client.query(query);


  return result.rows;
};
export const getEventContributions = async (
  client,
  authClient,
  organisationId,
  schemaName,
  period = "daily"
) => {

  // ============================================================
  // 1. DATE CONDITION
  // ============================================================

  let dateCondition;

  switch (period) {

    case "yearly":

  dateCondition = `
    DATE(pl.punch_time) >=
      DATE_TRUNC(
        'year',
        CURRENT_DATE
      )::date

    AND

    DATE(pl.punch_time) <= CURRENT_DATE
  `;

  break;
    case "weekly":
      dateCondition = `
        DATE(pl.punch_time) >= DATE_TRUNC('week', CURRENT_DATE)::date
        AND DATE(pl.punch_time) <= CURRENT_DATE
      `;
      break;

    case "monthly":
      dateCondition = `
        DATE(pl.punch_time) >= DATE_TRUNC('month', CURRENT_DATE)::date
        AND DATE(pl.punch_time) <= CURRENT_DATE
      `;
      break;

    case "daily":
    default:
      dateCondition = `
        DATE(pl.punch_time) = CURRENT_DATE
      `;
      break;
  }


  // ============================================================
  // 2. GET DYNAMIC TABLES
  // ============================================================

  const dynamicTablesQuery = `
    SELECT
      table_name,
      display_name,
      schema_name
    FROM auth.dynamic_tables
    WHERE organisation_id = $1
      AND schema_name = $2
    ORDER BY id;
  `;

  const dynamicTablesResult = await authClient.query(
    dynamicTablesQuery,
    [organisationId, schemaName]
  );

  const dynamicTables = dynamicTablesResult.rows;

  if (!dynamicTables.length) {
    return [];
  }


  // ============================================================
  // 3. FETCH EVENT CONTRIBUTORS
  // ============================================================

  const results = [];

  for (const table of dynamicTables) {

    const tableName = table.table_name;

    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      continue;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(schemaName)) {
      throw new Error("Invalid schema name");
    }


    // ----------------------------------------------------------
    // Check available columns
    // ----------------------------------------------------------

    const columnsResult = await client.query(
      `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = $1
          AND table_name = $2
          AND column_name IN (
            'id',
            'full_name',
            'mobile_number'
          )
      `,
      [schemaName, tableName]
    );

    const columns = columnsResult.rows.map(
      row => row.column_name
    );

    if (!columns.includes("id")) {
      continue;
    }

    if (!columns.includes("full_name")) {
      continue;
    }


    const hasMobile =
      columns.includes("mobile_number");


    const mobileColumn = hasMobile
      ? `t."mobile_number"`
      : `NULL`;


    // ==========================================================
    // 4. LATEST PUNCH PER USER
    // ==========================================================
    //
    // IMPORTANT:
    // This is now the SAME logic used by getSecurityGuards().
    //
    // ==========================================================

    const query = `
      SELECT
        latest.user_id AS id,
        t.full_name,
        ${mobileColumn} AS mobile_number,

        $1 AS role,

        latest.punch_time AS working_time,

        CASE
          WHEN UPPER(latest.punch_type) = 'IN'
          THEN 'On Duty'
          ELSE 'Off Duty'
        END AS status

      FROM (
        SELECT
          pl.user_id,
          pl.punch_type,
          pl.punch_time,

          ROW_NUMBER() OVER (
            PARTITION BY pl.user_id
            ORDER BY pl.punch_time DESC
          ) AS rn

        FROM "${schemaName}".punch_logs pl

        WHERE
          LOWER(pl.table_name) = LOWER($2)

          AND ${dateCondition}
      ) latest

      INNER JOIN "${schemaName}"."${tableName}" t
        ON t.id = latest.user_id

      WHERE
        latest.rn = 1

      ORDER BY
        latest.punch_time DESC;
    `;


    try {

      const result = await client.query(
        query,
        [
          table.display_name || table.table_name,
          table.table_name
        ]
      );

      results.push(...result.rows);

    } catch (err) {

      console.error(
        `Skipping dynamic table ${tableName}:`,
        err.message
      );

    }
  }


  // ============================================================
  // 5. SORT FINAL RESULT
  // ============================================================

  results.sort(
    (a, b) =>
      new Date(b.working_time) -
      new Date(a.working_time)
  );


  return results;
};


