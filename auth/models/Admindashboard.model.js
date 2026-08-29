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
export const getDashboardStats = async (client, schemaName) => {
  const result = await client.query(
    `
    SELECT
      COUNT(*) AS total_visitors,
      COUNT(*) FILTER (WHERE punch_type = 'IN') AS inside_visitors,
      COUNT(*) FILTER (
    WHERE LOWER(table_name) LIKE '%delivery%'
) AS deliveries
    FROM "${schemaName}".punch_logs
  `);

  return result.rows[0];
};
export const getRecentVisitors = async (
  client,
  schemaName,
  search = "",
  purpose = "",
  period = "daily"
) => {
  let dateCondition = "";

  switch (period) {
    case "weekly":
      dateCondition = `
        DATE(punch_time) >= DATE_TRUNC('week', CURRENT_DATE)::date
        AND DATE(punch_time) <= CURRENT_DATE
      `;
      break;

    case "monthly":
      dateCondition = `
        DATE(punch_time) >= DATE_TRUNC('month', CURRENT_DATE)::date
        AND DATE(punch_time) <= CURRENT_DATE
      `;
      break;

    case "daily":
    default:
      dateCondition = `
        DATE(punch_time) = CURRENT_DATE
      `;
      break;
  }

  const query = `
    SELECT
      user_id,
      full_name,
      table_name,
      DATE(punch_time) AS visit_date,

      MIN(
        CASE
          WHEN punch_type = 'IN'
          THEN punch_time
        END
      ) AS time_in,

      MAX(
        CASE
          WHEN punch_type = 'OUT'
          THEN punch_time
        END
      ) AS time_out

    FROM "${schemaName}".punch_logs

    WHERE
      ${dateCondition}

      AND
      (
        $1 = ''
        OR LOWER(full_name) LIKE LOWER('%' || $1 || '%')
        OR LOWER(table_name) LIKE LOWER('%' || $1 || '%')
      )

      AND
      (
        $2 = ''
        OR LOWER(table_name) = LOWER($2)
      )

    GROUP BY
      user_id,
      full_name,
      table_name,
      DATE(punch_time)

    ORDER BY
      visit_date DESC,
      time_in DESC;
  `;

  const result = await client.query(query, [
    search,
    purpose,
  ]);

  return result.rows;
};
// export const getRecentVisitors = async (
//   client,
//   schemaName,
//   search = "",
//   from = null,
//   to = null,
//   purpose = ""
// ) => {
//   const query = `
//     SELECT
//       user_id,
//       full_name,
//       table_name,
//       DATE(punch_time) AS visit_date,

//       MIN(
//         CASE
//           WHEN punch_type = 'IN'
//           THEN punch_time
//         END
//       ) AS time_in,

//       MAX(
//         CASE
//           WHEN punch_type = 'OUT'
//           THEN punch_time
//         END
//       ) AS time_out

//     FROM "${schemaName}".punch_logs

//     WHERE
//       (
//         $1 = ''
//         OR LOWER(full_name) LIKE LOWER('%' || $1 || '%')
//       )

//       AND
//       (
//         $2::date IS NULL
//         OR DATE(punch_time) >= $2
//       )

//       AND
//       (
//         $3::date IS NULL
//         OR DATE(punch_time) <= $3
//       )

//       AND
//       (
//         $4 = ''
//         OR LOWER(table_name) = LOWER($4)
//       )

//     GROUP BY
//       user_id,
//       full_name,
//       table_name,
//       DATE(punch_time)

//     ORDER BY
//       visit_date DESC,
//       time_in DESC;
//   `;

//   const result = await client.query(query, [
//     search,
//     from || null,
//     to || null,
//     purpose,
//   ]);

//   return result.rows;
// };
// export const getRecentVisitors = async (
//   client,
//   schemaName
// ) => {

//   const result = await client.query(
//     `
//     SELECT
//       id,
//       table_name,
//       user_id,
//       full_name,
//       distance,
//       punch_type,
//       punch_time
//     FROM "${schemaName}".punch_logs
//     ORDER BY punch_time DESC
//     LIMIT 10;
//     `
//   );

//   return result.rows;
// };
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
// export const getCategoryTrend = async (
//   client,
//   organisationId,
//   type
// ) => {

//   let groupBy = "";
//   let orderBy = "";

//   switch (type) {
//     case "daily":
//       groupBy = `TO_CHAR(created_at, 'DD Mon')`;
//       orderBy = `DATE(created_at)`;
//       break;

//     case "weekly":
//       groupBy = `CONCAT('Week ', EXTRACT(WEEK FROM created_at))`;
//       orderBy = `EXTRACT(WEEK FROM created_at)`;
//       break;

//     case "monthly":
//       groupBy = `TO_CHAR(created_at, 'Mon')`;
//       orderBy = `DATE_TRUNC('month', created_at)`;
//       break;

//     default:
//       groupBy = `TO_CHAR(created_at, 'DD Mon')`;
//       orderBy = `DATE(created_at)`;
//   }

//   const query = `
//     SELECT
//       ${groupBy} AS label,
//       INITCAP(LOWER(display_name)) AS category,
//       COUNT(*)::int AS total
//     FROM auth.dynamic_tables
//     WHERE organisation_id = $1
//     GROUP BY
//       ${groupBy},
//       ${orderBy},
//       INITCAP(LOWER(display_name))
//     ORDER BY
//       ${orderBy};
//   `;

//   // Execute SQL
//   const result = await client.query(query, [organisationId]);

//   // Transform data for Recharts
//   const transformed = [];

//   result.rows.forEach((row) => {
//     let existing = transformed.find((x) => x.label === row.label);

//     if (!existing) {
//       existing = {
//         label: row.label,
//         Guest: 0,
//         Maid: 0,
//         Visitor: 0,
//         Vendor: 0,
//         Worker: 0,
//         Security: 0,
//         "Delivery Person": 0,
//         Organiser: 0,
//         "Service Provider": 0,
//       };

//       transformed.push(existing);
//     }

//     existing[row.category] = Number(row.total);
//   });

//   // Return transformed data
//   return transformed;
// };

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
// export const getCategoryCards = async (
//   businessClient,
//   authClient,
//   organisationId,
//   schemaName
// ) => {
//   // Get all dynamic tables belonging to this organisation
//   const tableResult = await authClient.query(
//     `
//       SELECT
//         table_name,
//         display_name,
//         schema_name,
//         created_at
//       FROM auth.dynamic_tables
//       WHERE organisation_id = $1
//       ORDER BY created_at ASC
//     `,
//     [organisationId]
//   );

//   const tables = tableResult.rows;

//   // Use a Map so the same category can be combined
//   const categoryMap = new Map();

//   for (const table of tables) {
//     if (!table.table_name || !table.schema_name) {
//       continue;
//     }

//     // Only count tables belonging to this organisation schema
//     if (table.schema_name !== schemaName) {
//       continue;
//     }

//     /*
//      * Normalize category names.
//      *
//      * Examples:
//      * guest           -> guest
//      * Guest           -> guest
//      * vendor          -> vendor
//      * vendor1         -> vendor
//      * maid            -> maid
//      * delivery_person -> delivery_person
//      */
//     let key = table.table_name
//       .trim()
//       .toLowerCase();

//     // Normalize known naming variations
//     if (key.startsWith("vendor")) {
//       key = "vendor";
//     }

//     if (key === "delivery" || key === "deliveryperson") {
//       key = "delivery_person";
//     }

//     /*
//      * Make sure the table identifier is safely quoted.
//      */
//     const safeSchema =
//       `"${table.schema_name.replace(/"/g, '""')}"`;

//     const safeTable =
//       `"${table.table_name.replace(/"/g, '""')}"`;

//     /*
//      * Count actual records/persons
//      * from the category table.
//      */
//     const countQuery = `
//       SELECT COUNT(*)::int AS count
//       FROM ${safeSchema}.${safeTable}
//     `;

//     const countResult =
//       await businessClient.query(countQuery);

//     const count =
//       Number(countResult.rows[0]?.count || 0);

//     /*
//      * Generate a display label.
//      */
//     let label =
//       table.display_name?.trim() ||
//       table.table_name
//         .replace(/_/g, " ")
//         .replace(/\b\w/g, (char) =>
//           char.toUpperCase()
//         );

//     /*
//      * Normalize labels for known categories.
//      */
//     if (key === "guest") {
//       label = "Guest";
//     } else if (key === "vendor") {
//       label = "Vendor";
//     } else if (key === "maid") {
//       label = "Maid";
//     } else if (key === "visitor") {
//       label = "Visitor";
//     } else if (key === "worker") {
//       label = "Worker";
//     } else if (key === "security") {
//       label = "Security";
//     } else if (key === "delivery_person") {
//       label = "Delivery Person";
//     } else if (key === "organiser") {
//       label = "Organiser";
//     } else if (key === "service_provider") {
//       label = "Service Provider";
//     }

//     /*
//      * Combine duplicate category definitions.
//      */
//     if (categoryMap.has(key)) {
//       const existing = categoryMap.get(key);

//       existing.count += count;
//     } else {
//       categoryMap.set(key, {
//         key,
//         label,
//         count,
//       });
//     }
//   }

//   /*
//    * Convert Map to array
//    */
//   const categories =
//     Array.from(categoryMap.values());

//   /*
//    * Calculate total across all categories.
//    */
//   const total = categories.reduce(
//     (sum, category) =>
//       sum + Number(category.count || 0),
//     0
//   );

//   return {
//     total,
//     categories,
//   };
// };
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
  ];

  if (!validPeriods.includes(period)) {
    throw new Error(
      "Invalid period. Use daily, weekly or monthly."
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

    WHERE 1 = 1

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
export const getEntriesOverview = async (
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
    throw new Error(
      "Organisation not found"
    );
  }

  const schemaName =
    orgResult.rows[0].schema_name;

  const safeSchema =
    `"${schemaName.replace(/"/g, '""')}"`;


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
 * 3. Create category mapping
 * =====================================================
 *
 * Database controls the category names.
 *
 * Example:
 *
 * table_name   = visitor
 * display_name = Visitors
 *
 * table_name   = vendor
 * display_name = Vendor
 *
 * table_name   = maid
 * display_name = Maid
 *
 * No hardcoded dashboard categories are used.
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
   * 4. Decide time grouping
   * =====================================================
   *
   * Daily
   * -------
   * Today grouped by hour
   *
   * Weekly
   * -------
   * Current week grouped by day
   *
   * Monthly
   * -------
   * Current month grouped by day
   *
   */

  let labelExpression;
  let orderExpression;
  let dateCondition;


  switch (period) {

    /*
     * ---------------------------------------------
     * DAILY
     * ---------------------------------------------
     */

    case "daily":

      labelExpression = `
        TO_CHAR(
          DATE_TRUNC(
            'hour',
            punch_time
          ),
          'HH12 AM'
        )
      `;

      orderExpression = `
        DATE_TRUNC(
          'hour',
          punch_time
        )
      `;

      dateCondition = `
        DATE(punch_time) = CURRENT_DATE
      `;

      break;


    /*
     * ---------------------------------------------
     * WEEKLY
     * ---------------------------------------------
     */

    case "weekly":

      labelExpression = `
        TO_CHAR(
          DATE_TRUNC(
            'day',
            punch_time
          ),
          'Dy'
        )
      `;

      orderExpression = `
        DATE_TRUNC(
          'day',
          punch_time
        )
      `;

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


    /*
     * ---------------------------------------------
     * MONTHLY
     * ---------------------------------------------
     */

    case "monthly":

      labelExpression = `
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


    default:

      throw new Error(
        "Invalid entries overview period"
      );
  }


  /*
   * =====================================================
   * 5. Query punch logs
   * =====================================================
   *
   * We count only IN entries.
   *
   * The graph represents Entries Overview,
   * so every successful IN punch becomes
   * an entry.
   *
   */

  const query = `
    SELECT

      ${labelExpression} AS label,

      LOWER(
        TRIM(table_name)
      ) AS category_key,

      COUNT(*)::int AS total

    FROM ${safeSchema}.punch_logs

    WHERE
      punch_type IS NOT NULL

      AND UPPER(punch_type) = 'IN'

      AND ${dateCondition}

    GROUP BY
      ${labelExpression},
      ${orderExpression},
      LOWER(
        TRIM(table_name)
      )

    ORDER BY
      ${orderExpression},
      LOWER(
        TRIM(table_name)
      );
  `;


  console.log(
    "Entries Overview Query:",
    query
  );


  const result =
    await businessClient.query(
      query
    );


  /*
   * =====================================================
   * 6. Transform result for Recharts
   * =====================================================
   */

  const transformed = [];


  result.rows.forEach(
    (row) => {

      let categoryKey =
        row.category_key
          ?.trim()
          .toLowerCase();


      /*
       * Normalize vendor variations
       */

     

      /*
       * Find category label
       */

      const categoryLabel =
        categoryMap.get(
          categoryKey
        );


      /*
       * Ignore categories that are
       * not registered for organisation
       */

      if (!categoryLabel) {
        return;
      }


      /*
       * Find time bucket
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
       * Add category count
       *
       * Example:
       *
       * {
       *   label: "12 PM",
       *   Visitors: 12,
       *   Guests: 8,
       *   Members: 4
       * }
       */

      existing[
        categoryLabel
      ] =
        Number(
          row.total || 0
        );
    }
  );


  /*
   * =====================================================
   * 7. Fill missing categories with 0
   * =====================================================
   *
   * This is important for Recharts.
   *
   * If a category has no entry during
   * a particular time period, we still
   * return 0.
   *
   */

  transformed.forEach(
    (item) => {

      categoryMap.forEach(
        (label) => {

          if (
            item[label] === undefined
          ) {
            item[label] = 0;
          }

        }
      );

    }
  );


  /*
   * =====================================================
   * 8. Return result
   * =====================================================
   */

  return transformed;
};
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
  // 1. GET DYNAMIC TABLES FOR CURRENT ORGANISATION
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
  // 2. DATE CONDITION
  // ============================================================

  let dateCondition;

  switch (period) {

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
  // 3. BUILD DYNAMIC UNION QUERY
  // ============================================================

  const queries = [];

  for (const table of dynamicTables) {

    const tableName = table.table_name;

    const displayName =
      table.display_name || table.table_name;


    // ----------------------------------------------------------
    // Basic identifier validation
    // ----------------------------------------------------------

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
            'mobile_number',
            'status'
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


    // ----------------------------------------------------------
    // Optional columns
    // ----------------------------------------------------------

    const mobileColumn = columns.includes("mobile_number")
      ? `"mobile_number"`
      : "NULL";

    const statusColumn = columns.includes("status")
      ? `"status"`
      : "NULL";


    // ----------------------------------------------------------
    // Dynamic query
    // ----------------------------------------------------------

    queries.push(`
      SELECT
        pl.user_id AS id,

        ${schemaName}.${tableName}."full_name"
          AS full_name,

        ${mobileColumn}
          AS mobile_number,

        '${displayName.replace(/'/g, "''")}'
          AS role,

        MIN(
          CASE
            WHEN pl.punch_type = 'IN'
            THEN pl.punch_time
          END
        ) AS working_time,

        CASE
          WHEN
            MAX(pl.punch_time) =
            MAX(
              CASE
                WHEN pl.punch_type = 'IN'
                THEN pl.punch_time
              END
            )
          THEN 'On Duty'

          ELSE 'Off Duty'
        END AS status

      FROM "${schemaName}".punch_logs pl

      INNER JOIN "${schemaName}"."${tableName}" 
        ON "${tableName}".id = pl.user_id

      WHERE
        pl.category = $1

        AND ${dateCondition}

      GROUP BY
        pl.user_id,
        ${schemaName}.${tableName}."full_name",
        ${mobileColumn}

    `);
  }


  // ============================================================
  // 4. NOTHING TO QUERY
  // ============================================================

  if (!queries.length) {
    return [];
  }


  // ============================================================
  // 5. EXECUTE UNION
  // ============================================================

  const finalQuery = `
    ${queries.join("\nUNION ALL\n")}

    ORDER BY working_time DESC;
  `;


  // ============================================================
  // 6. RUN QUERY
  // ============================================================

  const results = [];

  for (const table of dynamicTables) {

    const tableName = table.table_name;

    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      continue;
    }

    const query = `
      SELECT
        pl.user_id AS id,
        t.full_name,
        ${
          table.table_name
            ? `t.mobile_number`
            : `NULL`
        } AS mobile_number,
        $1 AS role,

        MIN(
          CASE
            WHEN pl.punch_type = 'IN'
            THEN pl.punch_time
          END
        ) AS working_time,

        CASE
          WHEN MAX(pl.punch_time) =
               MAX(
                 CASE
                   WHEN pl.punch_type = 'IN'
                   THEN pl.punch_time
                 END
               )
          THEN 'On Duty'
          ELSE 'Off Duty'
        END AS status

      FROM "${schemaName}".punch_logs pl

      INNER JOIN "${schemaName}"."${tableName}" t
        ON t.id = pl.user_id

      WHERE
        LOWER(pl.table_name) = LOWER($2)

        AND ${dateCondition}

      GROUP BY
        pl.user_id,
        t.full_name,
        t.mobile_number
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
  // 7. SORT FINAL RESULT
  // ============================================================

  results.sort(
    (a, b) =>
      new Date(b.working_time) -
      new Date(a.working_time)
  );

  return results;
};