
import { createApartmentMemberTable } from "./apartment/apartmentMember.js";
import { createApartmentMemberVehicleTable } from "./apartment/apartment_member_vehicle.js";
import { createApartmentMemberFamilyTable } from "./apartment/apartment_member_family.js";
import { createAnnouncementsTable } from "./announcementTables.js";
import { createVendorsServiceProvidersTable } from "./vendors_service_providers.js";
import { createImportantInformationTable } from "./important_information.js";

export const createTemplateTables = async (db, schema, orgType) => {
  // console.log("Template tables file:", import.meta.url);
  // console.log(
  //   "Important Information exports:",
  //   Object.keys(importantInformation)
  // );

  // const createImportantInformationTable =
  //   importantInformation.createImportantInformationTable;

  // if (typeof createImportantInformationTable !== "function") {
  //   throw new Error(
  //     "createImportantInformationTable is not exported correctly from " +
  //     "./important_information.js"
  //   );
  // }

  switch (orgType?.toUpperCase()) {
    case "APARTMENT":
      await createApartmentMemberTable(db, schema);
      await createApartmentMemberVehicleTable(db, schema);
      await createApartmentMemberFamilyTable(db, schema);
      await createAnnouncementsTable(db, schema);
      await createImportantInformationTable(db, schema);
      await createVendorsServiceProvidersTable(db, schema);
      break;

    case "HOSPITAL":
      // Future hospital template tables
      break;

    case "EVENT":
      await createAnnouncementsTable(db, schema);
      await createImportantInformationTable(db, schema);
      break;

    default:
      console.warn("No static template tables for org type:", orgType);
      break;
  }
};
