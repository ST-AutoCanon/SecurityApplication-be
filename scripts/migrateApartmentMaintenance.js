
import {
  migrateExistingApartmentMaintenanceTables,
} from "../auth/services/organisation.service.js";

const runMigration = async () => {
  try {
    console.log(
      "\n========== APARTMENT MAINTENANCE MIGRATION ==========\n"
    );

    const result =
      await migrateExistingApartmentMaintenanceTables();

    console.log(
      "\n========== MIGRATION RESULT ==========\n"
    );

    console.log(JSON.stringify(result, null, 2));

    if (!result.success) {
      process.exitCode = 1;
    } else {
      console.log("\nAll apartment organisations migrated successfully.");
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  }
};

runMigration();
