import XLSX from "xlsx-js-style";

/**
 * =====================================
 * APARTMENT EXCEL TEMPLATE
 * DATA + STYLE
 * =====================================
 */

/**
 * =========================
 * MEMBERS DATA
 * =========================
 */

export const membersTemplate = [
  {
    member_code: "M001",

    security_user_id: "",

    first_name: "John",

    last_name: "Smith",

    gender: "MALE",

    date_of_birth: "1990-01-01",

    mobile_number: "9876543210",

    alternate_mobile_number: "9876543211",

    email: "john@test.com",


    aadhaar_number: "123456789012",

    occupation: "Engineer",

    apartment_name: "Green Residency",

    block_tower: "A",

    floor_number: 2,

    flat_number: "201",

    ownership_type: "OWNER",

    move_in_date: "2025-01-01",

    family_member_count: 2,

    emergency_contact_name: "Mary",

    emergency_contact_relationship: "WIFE",

    emergency_contact_mobile: "9876543211",

    member_type: "RESIDENT",

    status: true,
  },
];

/**
 * =========================
 * FAMILY DATA
 * =========================
 */

export const familyTemplate = [
  {
    member_code: "M001",

    name: "Mary Smith",

    relationship: "WIFE",

    age: 30,

    mobile_number: "9876543211",
  },
];

/**
 * =========================
 * VEHICLE DATA
 * =========================
 */

export const vehiclesTemplate = [
  {
    member_code: "M001",

    vehicle_type: "CAR",

    vehicle_number: "KA01AB1234",

    vehicle_brand: "Hyundai",

    parking_slot: "P101",
  },
];



/**
 * =====================================
 * APPLY EXCEL STYLE
 * =====================================
 */

export const applyExcelStyle = (sheet) => {
  const range = XLSX.utils.decode_range(sheet["!ref"]);

  /**
   * =========================
   * HEADER STYLE
   * =========================
   */

  for (let col = range.s.c; col <= range.e.c; col++) {
    const address = XLSX.utils.encode_cell({
      r: 0,

      c: col,
    });

    const cell = sheet[address];

    if (cell) {
      cell.s = {
        fill: {
          patternType: "solid",

          fgColor: {
            rgb: "1F4E78",
          },
        },

        font: {
          bold: true,

          color: {
            rgb: "FFFFFF",
          },

          sz: 12,
        },

        alignment: {
          horizontal: "center",

          vertical: "center",

          wrapText: true,
        },

        border: {
          top: {
            style: "thin",

            color: {
              rgb: "FFFFFF",
            },
          },

          bottom: {
            style: "thin",

            color: {
              rgb: "FFFFFF",
            },
          },

          left: {
            style: "thin",

            color: {
              rgb: "FFFFFF",
            },
          },

          right: {
            style: "thin",

            color: {
              rgb: "FFFFFF",
            },
          },
        },
      };
    }
  }

  /**
   * =========================
   * BODY CELL STYLE
   * =========================
   */

  for (let row = 1; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const address = XLSX.utils.encode_cell({
        r: row,

        c: col,
      });

      const cell = sheet[address];

      if (cell) {
        cell.s = {
          alignment: {
            vertical: "center",

            wrapText: true,
          },

          border: {
            top: {
              style: "thin",

              color: {
                rgb: "D1D5DB",
              },
            },

            bottom: {
              style: "thin",

              color: {
                rgb: "D1D5DB",
              },
            },

            left: {
              style: "thin",

              color: {
                rgb: "D1D5DB",
              },
            },

            right: {
              style: "thin",

              color: {
                rgb: "D1D5DB",
              },
            },
          },
        };
      }
    }
  }

  /**
   * =========================
   * COLUMN WIDTH
   * =========================
   */

  sheet["!cols"] = [
    { wch: 15 }, // member_code

    { wch: 20 }, // security_user_id

    { wch: 18 }, // first_name

    { wch: 18 }, // last_name

    { wch: 12 }, // gender

    { wch: 18 }, // DOB

    { wch: 20 }, // mobile

    { wch: 25 }, // alternate mobile

    { wch: 35 }, // email

    { wch: 22 }, // aadhaar

    { wch: 22 }, // occupation

    { wch: 30 }, // apartment

    { wch: 15 }, // tower

    { wch: 15 }, // floor

    { wch: 18 }, // flat

    { wch: 20 }, // ownership

    { wch: 18 }, // move date

    { wch: 22 }, // family count

    { wch: 28 }, // emergency name

    { wch: 32 }, // emergency relation

    { wch: 25 }, // emergency mobile

    { wch: 18 }, // member type

    { wch: 12 }, // status
  ];

  /**
   * =========================
   * ROW HEIGHT
   * =========================
   */

  sheet["!rows"] = [
    {
      hpt: 35,
    },
  ];

  /**
   * FREEZE HEADER
   */

  sheet["!freeze"] = {
    xSplit: 0,

    ySplit: 1,
  };

  return sheet;
};
