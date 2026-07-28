import {
  importApartmentExcelService,
  createApartmentExcelTemplateService,
} from "../services/apartmentImport.service.js";

/**
 * =====================================
 * APARTMENT EXCEL IMPORT CONTROLLER
 * =====================================
 */

/**
 * Import Apartment Excel
 *
 * Excel Contains:
 * 1. Members
 * 2. Family
 * 3. Vehicles
 */
export const importApartmentExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,

        message: "Excel file is required",
      });
    }

    const organisationId = req.user.organisation_id;

    const result = await importApartmentExcelService(
      organisationId,
      req.file.path,
    );

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("Import Apartment Excel Error:", error);

    return res.status(500).json({
      success: false,

      message: "Server Error",
    });
  }
};

/**
 * Download Apartment Excel Template
 */
export const downloadApartmentTemplate = async (req, res) => {
  try {
    const filePath = await createApartmentExcelTemplateService();

    return res.download(filePath, "Apartment_Import_Template.xlsx");
  } catch (error) {
    console.error("Download Apartment Template Error:", error);

    return res.status(500).json({
      success: false,

      message: "Server Error",
    });
  }
};
