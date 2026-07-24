import { createApartmentMemberTable } from "./apartment/apartmentMember.js";
import { createApartmentMemberVehicleTable } from "./apartment/apartment_member_vehicle.js";
import { createApartmentMemberFamilyTable } from "./apartment/apartment_member_family.js";

export const createTemplateTables = async (db, schema, orgType) => {
  switch (orgType.toUpperCase()) {
    case "APARTMENT":
      await createApartmentMemberTable(db, schema);
      await createApartmentMemberVehicleTable(db, schema);
      await createApartmentMemberFamilyTable(db, schema);
      break;

    case "HOSPITAL":
      // Future hospital template tables
      break;

    case "EVENT":
      // Future event template tables
      break;

    default:
      break;
  }
};
