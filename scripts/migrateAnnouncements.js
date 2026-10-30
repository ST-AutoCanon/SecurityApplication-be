
import masterAuthDB from "../config/masterAuthDB.js";
import apartmentDB from "../config/dborgap.js";
import eventDB from "../config/dborgevent.js";
import { createAnnouncementsTable } from
  "../auth/utils/static_templates/announcementTables.js";

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

const migrateAnnouncements = async () => {
  try {
    // Read the real schema names from the master database.
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

      // Prefer the schema saved in the master database.
      const schema =
        organisation.schema_name ||
        `org_${String(organisation.id).padStart(3, "0")}`;

      // Never interpolate an unvalidated identifier into SQL.
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
        throw new Error(
          `Invalid schema for organisation ${organisation.id}: ${schema}`
        );
      }

      const db = getBusinessDB(orgType);

      if (!db) {
        console.log(`Skipping unsupported type: ${orgType}`);
        continue;
      }

      console.log(
        `Migrating organisation ${organisation.id}: ` +
        `${orgType}, ${schema}`
      );

      // Create the schema if necessary, then create the table if missing.
      await db.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

      await createAnnouncementsTable(db, schema);

      // Verify the table exists in the correct database.
      const verification = await db.query(
        `SELECT EXISTS (
           SELECT 1
           FROM information_schema.tables
           WHERE table_schema = $1
             AND table_name = 'announcements'
         ) AS table_exists`,
        [schema]
      );

      if (!verification.rows[0].table_exists) {
        throw new Error(
          `Verification failed for ${schema}.announcements`
        );
      }

      console.log(`SUCCESS: ${schema}.announcements`);
    }

    console.log("Announcements migration completed.");
  } catch (error) {
    console.error("Announcements migration failed:", error);
    throw error;
  } finally {
    await Promise.allSettled([
      masterAuthDB.end(),
      apartmentDB.end(),
      eventDB.end(),
    ]);
  }
};

migrateAnnouncements().catch(() => {
  process.exitCode = 1;
});
