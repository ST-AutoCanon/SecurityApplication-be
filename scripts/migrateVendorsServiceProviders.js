
import masterAuthDB from "../config/masterAuthDB.js";
import apartmentDB from "../config/dborgap.js";
import eventDB from "../config/dborgevent.js";

import {
  createVendorsServiceProvidersTable,
} from "../auth/utils/static_templates/vendors_service_providers.js";

const getBusinessDB = (orgType) => {
  switch (String(orgType).toUpperCase()) {
    case "APARTMENT":
      return apartmentDB;

    case "EVENT":
      return eventDB;

    default:
      return null;
  }
};

const migrateVendorsServiceProviders = async () => {
  const failures = [];
  let successCount = 0;

  try {
    const result = await masterAuthDB.query(`
      SELECT id, org_type, schema_name
      FROM auth.organisations
      WHERE UPPER(org_type::text) IN ('APARTMENT', 'EVENT')
      ORDER BY id
    `);

    console.log(
      `Found ${result.rows.length} Apartment/Event organisations.`
    );

    for (const organisation of result.rows) {
      const orgType = String(organisation.org_type).toUpperCase();

      const schema =
        organisation.schema_name ||
        `org_${String(organisation.id).padStart(3, "0")}`;

      try {
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
          throw new Error(`Invalid schema: ${schema}`);
        }

        const db = getBusinessDB(orgType);

        if (!db) {
          console.log(`Skipping unsupported type: ${orgType}`);
          continue;
        }

        console.log(
          `Migrating organisation ${organisation.id}: ${schema}`
        );

        await db.query(
          `CREATE SCHEMA IF NOT EXISTS "${schema}"`
        );

        await createVendorsServiceProvidersTable(db, schema);

        const verification = await db.query(
          `SELECT EXISTS (
             SELECT 1
             FROM information_schema.tables
             WHERE table_schema = $1
               AND table_name = 'vendors_service_providers'
           ) AS table_exists`,
          [schema]
        );

        if (!verification.rows[0].table_exists) {
          throw new Error(
            `Verification failed for ${schema}.vendors_service_providers`
          );
        }

        console.log(
          `SUCCESS: ${schema}.vendors_service_providers`
        );

        successCount++;
      } catch (error) {
        failures.push({
          organisationId: organisation.id,
          schema,
          error: error.message,
        });

        console.error(
          `FAILED: ${schema}.vendors_service_providers`,
          error.message
        );
      }
    }

    console.log("\nVendors & Service Providers migration completed.");
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failures.length}`);

    if (failures.length > 0) {
      console.log("Migration failures:", failures);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(
      "Vendors & Service Providers migration failed:",
      error
    );
    process.exitCode = 1;
  } finally {
    await Promise.allSettled([
      masterAuthDB.end(),
      apartmentDB.end(),
      eventDB.end(),
    ]);
  }
};

migrateVendorsServiceProviders();
