import XLSX from "xlsx-js-style";
import path from "path";
import fs from "fs";

import firstDB from "../../config/dborgap.js";
import masterAuthDB from "../../config/masterAuthDB.js";

import * as AdminModel from "../../auth/models/admin.model.js";

import * as MemberModel from "../models/apartmentMember.model.js";
import * as FamilyModel from "../models/apartmentFamily.model.js";
import * as VehicleModel from "../models/apartmentVehicle.model.js";

import {
  membersTemplate,
  familyTemplate,
  vehiclesTemplate,
  applyExcelStyle,
} from "../templates/apartmentExcel.template.js";

/**
 * =====================================
 * GET ORGANISATION SCHEMA
 * =====================================
 */
const getSchemaName = async (organisationId) => {
  const client = await masterAuthDB.connect();

  try {
    const org = await AdminModel.getOrganisationSchema(client, organisationId);

    if (!org) {
      throw new Error("Organisation not found");
    }

    return org.schema_name;
  } finally {
    client.release();
  }
};

/**
 * =====================================
 * IMPORT APARTMENT EXCEL SERVICE
 * =====================================
 */
export const importApartmentExcelService = async (organisationId, filePath) => {
  const schemaName = await getSchemaName(organisationId);

  const client = await firstDB.connect();

  try {
    await client.query("BEGIN");

    const workbook = XLSX.readFile(filePath);

    const memberSheet = workbook.Sheets["Members"];

    const familySheet = workbook.Sheets["Family"];

    const vehicleSheet = workbook.Sheets["Vehicles"];

    if (!memberSheet) {
      throw new Error("Members sheet is missing");
    }

    const members = XLSX.utils.sheet_to_json(memberSheet);

    const families = familySheet ? XLSX.utils.sheet_to_json(familySheet) : [];

    const vehicles = vehicleSheet ? XLSX.utils.sheet_to_json(vehicleSheet) : [];

    const memberMap = {};

    let membersImported = 0;
    let familyImported = 0;
    let vehiclesImported = 0;

    /**
     * =====================================
     * CREATE MEMBERS
     * =====================================
     */
    for (const row of members) {
      const memberData = {
        security_user_id: row.security_user_id || null,

        member_code: row.member_code,

        first_name: row.first_name,

        last_name: row.last_name,

        gender: row.gender,

        date_of_birth: row.date_of_birth,

        mobile_number: row.mobile_number,

        alternate_mobile_number: row.alternate_mobile_number,

        email: row.email,

        profile_photo: row.profile_photo || null,

        aadhaar_number: row.aadhaar_number,

        occupation: row.occupation,

        apartment_name: row.apartment_name,

        block_tower: row.block_tower,

        floor_number: row.floor_number,

        flat_number: row.flat_number,

        ownership_type: row.ownership_type,

        move_in_date: row.move_in_date,

        family_member_count: row.family_member_count || 0,

        emergency_contact_name: row.emergency_contact_name,

        emergency_contact_relationship: row.emergency_contact_relationship,

        emergency_contact_mobile: row.emergency_contact_mobile,

        member_type: row.member_type || "RESIDENT",

        status: row.status ?? true,
      };

      const codeExist = await MemberModel.checkMemberCodeExists(
        client,
        schemaName,
        memberData.member_code,
      );

      if (codeExist) {
        throw new Error(
          `Member code '${memberData.member_code}' already exists`,
        );
      }

      const mobileExist = await MemberModel.checkMobileExists(
        client,
        schemaName,
        memberData.mobile_number,
      );

      if (mobileExist) {
        throw new Error(`Mobile '${memberData.mobile_number}' already exists`);
      }

      if (memberData.email) {
        const emailExist = await MemberModel.checkEmailExists(
          client,
          schemaName,
          memberData.email,
        );

        if (emailExist) {
          throw new Error(`Email '${memberData.email}' already exists`);
        }
      }

      const createdMember = await MemberModel.createApartmentMember(
        client,
        schemaName,
        memberData,
      );

      memberMap[row.member_code] = createdMember.id;

      membersImported++;
    }
    /**
     * =====================================
     * CREATE FAMILY MEMBERS
     * =====================================
     */
    for (const row of families) {
      const memberId = memberMap[row.member_code];

      if (!memberId) {
        continue;
      }

      const mobileExist = await FamilyModel.checkFamilyMobileExists(
        client,
        schemaName,
        row.mobile_number,
      );

      if (mobileExist) {
        throw new Error(`Family mobile '${row.mobile_number}' already exists`);
      }

      await FamilyModel.createApartmentFamilyMember(client, schemaName, {
        member_id: memberId,

        name: row.name,

        relationship: row.relationship,

        age: row.age,

        mobile_number: row.mobile_number,
      });

      await FamilyModel.updateFamilyMemberCount(client, schemaName, memberId);

      familyImported++;
    }

    /**
     * =====================================
     * CREATE VEHICLES
     * =====================================
     */
    for (const row of vehicles) {
      const memberId = memberMap[row.member_code];

      if (!memberId) {
        continue;
      }

      const vehicleExist = await VehicleModel.checkVehicleNumberExists(
        client,
        schemaName,
        row.vehicle_number,
      );

      if (vehicleExist) {
        throw new Error(`Vehicle '${row.vehicle_number}' already exists`);
      }

      await VehicleModel.createApartmentVehicle(client, schemaName, {
        member_id: memberId,

        vehicle_type: row.vehicle_type,

        vehicle_number: row.vehicle_number,

        vehicle_brand: row.vehicle_brand,

        parking_slot: row.parking_slot,
      });

      vehiclesImported++;
    }

    await client.query("COMMIT");

    return {
      success: true,

      message: "Excel imported successfully",

      data: {
        members_imported: membersImported,

        family_imported: familyImported,

        vehicles_imported: vehiclesImported,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");

    return {
      success: false,

      message: error.message,
    };
  } finally {
    client.release();
  }
};

/**
 * =====================================
 * CREATE EXCEL TEMPLATE SERVICE
 * =====================================
 */
// export const createApartmentExcelTemplateService = async () => {

//   const workbook = XLSX.utils.book_new();

//   /**
//    * MEMBERS SHEET
//    */
//   const members = [
//     {
//       member_code: "M001",

//       security_user_id: "",

//       first_name: "John",

//       last_name: "Smith",

//       gender: "MALE",

//       date_of_birth: "1990-01-01",

//       mobile_number: "9876543210",

//       alternate_mobile_number: "",

//       email: "john@test.com",

//       profile_photo: "",

//       aadhaar_number: "",

//       occupation: "Engineer",

//       apartment_name: "Green Residency",

//       block_tower: "A",

//       floor_number: 2,

//       flat_number: "201",

//       ownership_type: "OWNER",

//       move_in_date: "2025-01-01",

//       family_member_count: 2,

//       emergency_contact_name: "Mary",

//       emergency_contact_relationship: "WIFE",

//       emergency_contact_mobile: "9876543211",

//       member_type: "RESIDENT",

//       status: true,
//     },
//   ];

//   const memberSheet = XLSX.utils.json_to_sheet(members);

//   XLSX.utils.book_append_sheet(workbook, memberSheet, "Members");

//   /**
//    * FAMILY SHEET
//    */
//   const family = [
//     {
//       member_code: "M001",

//       name: "Mary Smith",

//       relationship: "WIFE",

//       age: 30,

//       mobile_number: "9876543211",
//     },
//   ];

//   const familySheet = XLSX.utils.json_to_sheet(family);

//   XLSX.utils.book_append_sheet(workbook, familySheet, "Family");

//   /**
//    * VEHICLE SHEET
//    */
//   const vehicles = [
//     {
//       member_code: "M001",

//       vehicle_type: "CAR",

//       vehicle_number: "KA01AB1234",

//       vehicle_brand: "Hyundai",

//       parking_slot: "P101",
//     },
//   ];

//   const vehicleSheet = XLSX.utils.json_to_sheet(vehicles);

//   XLSX.utils.book_append_sheet(workbook, vehicleSheet, "Vehicles");

//   /**
//    * CREATE UPLOAD DIRECTORY
//    */
//   const uploadDir = path.join(process.cwd(), "uploads", "excel");

//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, {
//       recursive: true,
//     });
//   }

//   const filePath = path.join(uploadDir, "Apartment_Import_Template.xlsx");

//   XLSX.writeFile(workbook, filePath);

//   return filePath;
// };

export const createApartmentExcelTemplateService = async () => {
  const workbook = XLSX.utils.book_new();

  let memberSheet = XLSX.utils.json_to_sheet(membersTemplate);

  let familySheet = XLSX.utils.json_to_sheet(familyTemplate);

  let vehicleSheet = XLSX.utils.json_to_sheet(vehiclesTemplate);

  memberSheet = applyExcelStyle(memberSheet);

  familySheet = applyExcelStyle(familySheet);

  vehicleSheet = applyExcelStyle(vehicleSheet);

  XLSX.utils.book_append_sheet(workbook, memberSheet, "Members");

  XLSX.utils.book_append_sheet(workbook, familySheet, "Family");

  XLSX.utils.book_append_sheet(workbook, vehicleSheet, "Vehicles");

  const uploadDir = path.join(process.cwd(), "uploads", "excel");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
      recursive: true,
    });
  }

  const filePath = path.join(uploadDir, "Apartment_Import_Template.xlsx");

  XLSX.writeFile(workbook, filePath);

  return filePath;
};
