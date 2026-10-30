
import masterAuthDB from "../config/masterAuthDB.js";
import apartmentDB from "../config/dborgap.js";
import eventDB from "../config/dborgevent.js";

import {
  createImportantInformationTable,
} from "../auth/utils/static_templates/important_information.js";

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

const migrateImportantInformation = async () => {
  const failures = [];

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

        await createImportantInformationTable(db, schema);

        const verification = await db.query(
          `SELECT EXISTS (
             SELECT 1
             FROM information_schema.tables
             WHERE table_schema = $1
               AND table_name = 'important_information'
           ) AS table_exists`,
          [schema]
        );

        if (!verification.rows[0].table_exists) {
          throw new Error(
            `Verification failed for ${schema}.important_information`
          );
        }

        console.log(
          `SUCCESS: ${schema}.important_information`
        );
      } catch (error) {
        failures.push({
          organisationId: organisation.id,
          schema,
          error: error.message,
        });

        console.error(
          `FAILED: ${schema}.important_information`,
          error.message
        );
      }
    }

    console.log("\nImportant Information migration completed.");
    console.log(`Successful: ${result.rows.length - failures.length - 0}`);
    console.log(`Failed: ${failures.length}`);

    if (failures.length > 0) {
      console.log("Migration failures:", failures);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("Important Information migration failed:", error);
    process.exitCode = 1;
  } finally {
    await Promise.allSettled([
      masterAuthDB.end(),
      apartmentDB.end(),
      eventDB.end(),
    ]);
  }
};

migrateImportantInformation();
