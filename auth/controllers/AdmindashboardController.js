import { getBusinessDB } from "../../db/dbRouter.js";
import { fetchRecentVisitors } from "../services/Admindashboard.service.js";
import { fetchDashboard } from "../services/Admindashboard.service.js";
import { fetchCategoryStats } from "../services/Admindashboard.service.js";
import { fetchCategoryTrend } from "../services/Admindashboard.service.js";


import masterAuthDB from "../../config/masterAuthDB.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { fetchCategoryCards } from "../services/Admindashboard.service.js";
import { fetchInsideOutsideStats } from "../services/Admindashboard.service.js";
import {
  fetchPeakVisitorHours,
} from "../services/Admindashboard.service.js";
import {
  fetchEntriesOverview,
} from "../services/Admindashboard.service.js";

import {
  fetchEntriesCategory,
} from "../services/Admindashboard.service.js";

import {
  fetchSecurityGuards,
} from "../services/Admindashboard.service.js";
import {
  fetchEventContributions,
} from "../services/Admindashboard.service.js";



export const getDashboard = async (req, res) => {
  const organisationId = req.user.organisation_id;
  const orgType = req.user.org_type.toLowerCase();

  const businessDB = getBusinessDB(orgType);
  const client = await businessDB.connect();

  try {
    const data = await fetchDashboard(client, organisationId);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    client.release();
  }
};
export const getRecentVisitors = async (req, res) => {
  const organisationId = req.user.organisation_id;
  const orgType = req.user.org_type?.toLowerCase();

  const {
    search = "",
    purpose = "",
    period = "daily",
  } = req.query;

  const businessDB = getBusinessDB(orgType);
  const client = await businessDB.connect();

  try {
    const data = await fetchRecentVisitors(
      client,
      organisationId,
      search,
      purpose,
      period
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("getRecentVisitors error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    client.release();
  }
};
export const getCategoryStats = async (req, res) => {
  const organisationId = req.user.organisation_id;
    console.log("Organisation ID:", organisationId); 

  const orgType = req.user.org_type?.toLowerCase();

  const businessDB = getBusinessDB(orgType);

  const businessClient = await businessDB.connect();
  const authClient = await masterAuthDB.connect();

  try {
    const data = await fetchCategoryStats(
      authClient,
      organisationId,
    );

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    businessClient.release();
    authClient.release();
  }
};

export const getCategoryTrend = async (req, res) => {
  const organisationId = req.user.organisation_id;

  const orgType =
    req.user.org_type?.toLowerCase();

  const type =
    req.query.type || "daily";

  const category =
    req.query.category || "all";

  let businessClient;
  let authClient;

  try {
    console.log("=================================");
    console.log("CATEGORY TREND REQUEST");
    console.log("Organisation ID:", organisationId);
    console.log("Organisation Type:", orgType);
    console.log("Period:", type);
    console.log("Category:", category);
    console.log("=================================");

    /*
     * Select correct business database
     *
     * apartment -> securityap
     * event     -> securityevents
     * hospital  -> securityhospital
     */
    const businessDB =
      getBusinessDB(orgType);

    businessClient =
      await businessDB.connect();

    /*
     * Master DB
     *
     * Used for:
     * - organisation schema
     * - dynamic categories
     */
    authClient =
      await masterAuthDB.connect();

    const data =
      await fetchCategoryTrend(
        businessClient,
        authClient,
        organisationId,
        type,
        category
      );

    return res.json({
      success: true,
      data,
    });

  } catch (err) {
    console.error(
      "Category Trend Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });

  } finally {
    if (businessClient) {
      businessClient.release();
    }

    if (authClient) {
      authClient.release();
    }
  }
};


export const getCategoryCards = async (req, res) => {
  const organisationId =
    req.user.organisation_id;

  const orgType =
    req.user.org_type?.toLowerCase();

  const period =
    req.query.period?.toLowerCase() || "daily";


  console.log(
    "Category Cards Organisation ID:",
    organisationId
  );

  console.log(
    "Category Cards Period:",
    period
  );


  if (
    ![
      "daily",
      "weekly",
      "monthly",
    ].includes(period)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid period. Use daily, weekly or monthly.",
    });
  }


  let businessClient;
  let authClient;

  try {

    const businessDB =
      getBusinessDB(orgType);

    businessClient =
      await businessDB.connect();

    authClient =
      await masterAuthDB.connect();


    const data =
      await fetchCategoryCards(
        businessClient,
        authClient,
        organisationId,
        period
      );


    console.log(
      "Category Cards Data:",
      data
    );


    return res.json({
      success: true,
      period,
      data,
    });


  } catch (err) {

    console.error(
      "getCategoryCards error:",
      err
    );


    return res.status(500).json({
      success: false,
      message: err.message,
    });


  } finally {

    if (businessClient) {
      businessClient.release();
    }

    if (authClient) {
      authClient.release();
    }
  }
};
// export const exportRecentVisitors = async (req, res) => {
//   const organisationId = req.user.organisation_id;
//   const orgType = req.user.org_type?.toLowerCase();

//   // const {
//   //   search = "",
//   //   from = null,
//   //   to = null,
//   //   purpose = "",
//   // } = req.query;
// const {
//   search = "",
//   purpose = "",
//   period = "daily",
// } = req.query;
//   const businessDB = getBusinessDB(orgType);
//   const client = await businessDB.connect();

//   try {
//     // const data = await fetchRecentVisitors(
//     //   client,
//     //   organisationId,
//     //   search,
//     //   from,
//     //   to,
//     //   purpose
//     // );

//     const data = await fetchRecentVisitors(
//   client,
//   organisationId,
//   search,
//   purpose,
//   period
// );
//     const workbook = new ExcelJS.Workbook();

//     workbook.creator = "Security Application";
//     workbook.created = new Date();

//     const worksheet = workbook.addWorksheet("Visitor History");

//     worksheet.columns = [
//       {
//         header: "Visitor Name",
//         key: "full_name",
//         width: 30,
//       },
//       {
//         header: "Date",
//         key: "visit_date",
//         width: 18,
//       },
//       {
//         header: "Purpose",
//         key: "table_name",
//         width: 22,
//       },
//       {
//         header: "Time In",
//         key: "time_in",
//         width: 20,
//       },
//       {
//         header: "Time Out",
//         key: "time_out",
//         width: 20,
//       },
//     ];

//     data.forEach((visitor) => {
//       worksheet.addRow({
//         full_name: visitor.full_name,
//         visit_date: visitor.visit_date
//           ? new Date(visitor.visit_date)
//           : null,
//         table_name: visitor.table_name
//           ? visitor.table_name.replace(/_/g, " ")
//           : "",
//         time_in: visitor.time_in
//           ? new Date(visitor.time_in)
//           : null,
//         time_out: visitor.time_out
//           ? new Date(visitor.time_out)
//           : "Inside",
//       });
//     });

//     // Header styling
//     const headerRow = worksheet.getRow(1);

//     headerRow.font = {
//       bold: true,
//       color: {
//         argb: "FFFFFFFF",
//       },
//     };

//     headerRow.fill = {
//       type: "pattern",
//       pattern: "solid",
//       fgColor: {
//         argb: "2563EB",
//       },
//     };

//     headerRow.alignment = {
//       vertical: "middle",
//       horizontal: "center",
//     };

//     headerRow.height = 25;

//     // Date formatting
//     worksheet.getColumn("visit_date").numFmt =
//       "dd-mmm-yyyy";

//     // Time formatting
//     worksheet.getColumn("time_in").numFmt =
//       "hh:mm:ss AM/PM";

//     worksheet.getColumn("time_out").numFmt =
//       "hh:mm:ss AM/PM";

//     // Borders
//     worksheet.eachRow((row, rowNumber) => {
//       if (rowNumber > 1) {
//         row.eachCell((cell) => {
//           cell.border = {
//             top: {
//               style: "thin",
//               color: {
//                 argb: "D1D5DB",
//               },
//             },
//             bottom: {
//               style: "thin",
//               color: {
//                 argb: "D1D5DB",
//               },
//             },
//             left: {
//               style: "thin",
//               color: {
//                 argb: "D1D5DB",
//               },
//             },
//             right: {
//               style: "thin",
//               color: {
//                 argb: "D1D5DB",
//               },
//             },
//           };

//           cell.alignment = {
//             vertical: "middle",
//           };
//         });
//       }
//     });

//     // Freeze header
//     worksheet.views = [
//       {
//         state: "frozen",
//         ySplit: 1,
//       },
//     ];

//     // Auto filter
//     worksheet.autoFilter = {
//       from: "A1",
//       to: "E1",
//     };

//     const fileName = `Visitor_History_${new Date()
//       .toISOString()
//       .slice(0, 10)}.xlsx`;

//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );

//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${fileName}"`
//     );

//     await workbook.xlsx.write(res);

//     res.end();
//   } catch (err) {
//     console.error("Excel export error:", err);

//     if (!res.headersSent) {
//       res.status(500).json({
//         success: false,
//         message: "Failed to export visitor records",
//       });
//     }
//   } finally {
//     client.release();
//   }
// };

export const exportRecentVisitors = async (req, res) => {
  const organisationId =
    req.user.organisation_id;

  const orgType =
    req.user.org_type?.toLowerCase();

  const {
    search = "",
    purpose = "",
    period = "daily",
  } = req.query;

  const businessDB =
    getBusinessDB(orgType);

  const client =
    await businessDB.connect();

  try {
    // ============================================================
    // 1. GET RECENT VISITORS
    // ============================================================

    const data =
      await fetchRecentVisitors(
        client,
        organisationId,
        search,
        purpose,
        period
      );

    console.log(
      "Excel Export Records:",
      data.length
    );

    // ============================================================
    // 2. CREATE WORKBOOK
    // ============================================================

    const workbook =
      new ExcelJS.Workbook();

    workbook.creator =
      "Security Application";

    workbook.created =
      new Date();

    const worksheet =
      workbook.addWorksheet(
        "Visitor History"
      );

    // ============================================================
    // 3. COLUMNS
    // ============================================================

    worksheet.columns = [
      {
        header: "Visitor Name",
        key: "full_name",
        width: 30,
      },
      {
        header: "Date",
        key: "visit_date",
        width: 18,
      },
      {
        header: "Purpose",
        key: "table_name",
        width: 22,
      },
      {
        header: "Time In",
        key: "time_in",
        width: 20,
      },
      {
        header: "Time Out",
        key: "time_out",
        width: 20,
      },
    ];

    // ============================================================
    // 4. FORMAT TIME WITHOUT TIMEZONE CONVERSION
    // ============================================================

    const formatTime = (value) => {
      if (!value) {
        return "";
      }

      const date =
        value instanceof Date
          ? value
          : new Date(value);

      if (isNaN(date.getTime())) {
        return "";
      }

      /*
       * IMPORTANT:
       *
       * Use local getters here.
       *
       * The server timezone should ideally be Asia/Kolkata.
       *
       * We convert to 12-hour format manually so Excel
       * does not perform another timezone conversion.
       */

      let hours =
        date.getHours();

      const minutes =
        date.getMinutes();

      const seconds =
        date.getSeconds();

      const ampm =
        hours >= 12
          ? "PM"
          : "AM";

      hours =
        hours % 12 || 12;

      return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0") +
        " " +
        ampm
      );
    };

    // ============================================================
    // 5. FORMAT DATE
    // ============================================================

    const formatDate = (value) => {
      if (!value) {
        return "";
      }

      const date =
        value instanceof Date
          ? value
          : new Date(value);

      if (isNaN(date.getTime())) {
        return "";
      }

      const day =
        String(
          date.getDate()
        ).padStart(2, "0");

      const month =
        String(
          date.getMonth() + 1
        ).padStart(2, "0");

      const year =
        date.getFullYear();

      return `${day}-${month}-${year}`;
    };

    // ============================================================
    // 6. ADD DATA
    // ============================================================

    data.forEach(
      (visitor) => {

        worksheet.addRow({
          full_name:
            visitor.full_name || "",

          visit_date:
            formatDate(
              visitor.visit_date
            ),

          table_name:
            visitor.table_name
              ? visitor.table_name
                  .replace(
                    /_/g,
                    " "
                  )
                  .replace(
                    /\b\w/g,
                    (char) =>
                      char.toUpperCase()
                  )
              : "",

          time_in:
            formatTime(
              visitor.time_in
            ),

          time_out:
            visitor.time_out
              ? formatTime(
                  visitor.time_out
                )
              : "Inside",
        });
      }
    );

    // ============================================================
    // 7. HEADER STYLING
    // ============================================================

    const headerRow =
      worksheet.getRow(1);

    headerRow.font = {
      bold: true,
      color: {
        argb: "FFFFFFFF",
      },
    };

    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "2563EB",
      },
    };

    headerRow.alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    headerRow.height = 25;

    // ============================================================
    // 8. BORDERS
    // ============================================================

    worksheet.eachRow(
      (row, rowNumber) => {

        if (rowNumber > 1) {

          row.eachCell(
            (cell) => {

              cell.border = {
                top: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },

                bottom: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },

                left: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },

                right: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },
              };

              cell.alignment = {
                vertical: "middle",
              };
            }
          );
        }
      }
    );

    // ============================================================
    // 9. FREEZE HEADER
    // ============================================================

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    // ============================================================
    // 10. FILTER
    // ============================================================

    worksheet.autoFilter = {
      from: "A1",
      to: "E1",
    };

    // ============================================================
    // 11. FILE NAME
    // ============================================================

    const fileName =
      `Visitor_History_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

    // ============================================================
    // 12. RESPONSE HEADERS
    // ============================================================

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    // ============================================================
    // 13. WRITE EXCEL
    // ============================================================

    await workbook.xlsx.write(
      res
    );

    res.end();

  } catch (err) {

    console.error(
      "Excel export error:",
      err
    );

    if (!res.headersSent) {

      res.status(500).json({
        success: false,
        message:
          "Failed to export visitor records",
      });
    }

  } finally {

    client.release();
  }
};
export const exportRecentVisitorsPDF = async (req, res) => {
  const organisationId = req.user.organisation_id;
  const orgType = req.user.org_type?.toLowerCase();

  // const {
  //   search = "",
  //   from = null,
  //   to = null,
  //   purpose = "",
  // } = req.query;
const {
  search = "",
  purpose = "",
  period = "daily",
} = req.query;

  const businessDB = getBusinessDB(orgType);
  const client = await businessDB.connect();

  try {
    // const data = await fetchRecentVisitors(
    //   client,
    //   organisationId,
    //   search,
    //   from,
    //   to,
    //   purpose
    // );

    const data = await fetchRecentVisitors(
  client,
  organisationId,
  search,
  purpose,
  period
);
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 30,
    });

    const fileName = `Visitor_History_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    doc.pipe(res);

    // Title
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Visitor History", {
        align: "center",
      });

    doc.moveDown(0.5);

    // Export information
    doc
      .fontSize(9)
      .font("Helvetica")
      .text(
        `Generated: ${new Date().toLocaleString("en-IN")}`,
        {
          align: "center",
        }
      );

    if (search) {
      doc.text(`Search: ${search}`, {
        align: "center",
      });
    }

    // if (from || to) {
    //   doc.text(
    //     `Date Range: ${from || "All"} to ${to || "All"}`,
    //     {
    //       align: "center",
    //     }
    //   );
    // }

    if (purpose) {
      doc.text(`Purpose: ${purpose}`, {
        align: "center",
      });
    }

    doc.moveDown(1);

    // Total records
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(`Total Records: ${data.length}`);

    doc.moveDown(0.5);

    const startX = 30;
    const tableTop = doc.y;

    const columns = [
      {
        title: "Visitor Name",
        x: startX,
        width: 180,
      },
      {
        title: "Date",
        x: startX + 180,
        width: 100,
      },
      {
        title: "Purpose",
        x: startX + 280,
        width: 120,
      },
      {
        title: "Time In",
        x: startX + 400,
        width: 120,
      },
      {
        title: "Time Out",
        x: startX + 520,
        width: 120,
      },
    ];

    // Header
    doc
      .font("Helvetica-Bold")
      .fontSize(9);

    columns.forEach((column) => {
      doc.text(
        column.title,
        column.x,
        tableTop,
        {
          width: column.width,
          align: "left",
        }
      );
    });

    doc.moveTo(
      startX,
      tableTop + 18
    )
      .lineTo(
        startX + 640,
        tableTop + 18
      )
      .stroke();

    let y = tableTop + 28;

    doc.font("Helvetica").fontSize(8);

    data.forEach((visitor) => {
      if (y > 540) {
        doc.addPage();

        y = 40;

        doc
          .font("Helvetica-Bold")
          .fontSize(9);

        columns.forEach((column) => {
          doc.text(
            column.title,
            column.x,
            y,
            {
              width: column.width,
            }
          );
        });

        doc.moveTo(30, y + 18)
          .lineTo(670, y + 18)
          .stroke();

        y += 28;

        doc
          .font("Helvetica")
          .fontSize(8);
      }

      const date = visitor.visit_date
        ? new Date(
            visitor.visit_date
          ).toLocaleDateString("en-IN")
        : "--";

      const timeIn = visitor.time_in
        ? new Date(
            visitor.time_in
          ).toLocaleTimeString(
            "en-IN",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }
          )
        : "--";

      const timeOut = visitor.time_out
        ? new Date(
            visitor.time_out
          ).toLocaleTimeString(
            "en-IN",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }
          )
        : "Inside";

      const purposeName = visitor.table_name
        ? visitor.table_name.replace(
            /_/g,
            " "
          )
        : "--";

      doc.text(
        visitor.full_name || "--",
        columns[0].x,
        y,
        {
          width: columns[0].width,
        }
      );

      doc.text(
        date,
        columns[1].x,
        y,
        {
          width: columns[1].width,
        }
      );

      doc.text(
        purposeName,
        columns[2].x,
        y,
        {
          width: columns[2].width,
        }
      );

      doc.text(
        timeIn,
        columns[3].x,
        y,
        {
          width: columns[3].width,
        }
      );

      doc.text(
        timeOut,
        columns[4].x,
        y,
        {
          width: columns[4].width,
        }
      );

      doc.moveTo(
        startX,
        y + 15
      )
        .lineTo(
          startX + 640,
          y + 15
        )
        .stroke();

      y += 25;
    });

    doc.end();

  } catch (err) {
    console.error(
      "PDF export error:",
      err
    );

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message:
          "Failed to export visitor records",
      });
    }
  } finally {
    client.release();
  }
};
export const getInsideOutsideStats = async (
  req,
  res
) => {
  const organisationId =
    req.user.organisation_id;

  const orgType =
    req.user.org_type?.toLowerCase();

  let businessClient;
  let authClient;

  try {
    console.log(
      "Inside/Outside Request:",
      {
        organisationId,
        orgType,
      }
    );

    /*
     * Select correct database:
     *
     * apartment -> securityap
     * event     -> securityevents
     * hospital  -> securityhospital
     */
    const businessDB =
      getBusinessDB(orgType);

    businessClient =
      await businessDB.connect();

    /*
     * Master DB
     */
    authClient =
      await masterAuthDB.connect();

    const stats =
      await fetchInsideOutsideStats(
        businessClient,
        authClient,
        organisationId
      );

    return res.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error(
      "Inside/Outside Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  } finally {

    if (businessClient) {
      businessClient.release();
    }

    if (authClient) {
      authClient.release();
    }
  }
};
export const getPeakVisitorHours = async (
  req,
  res
) => {
  let businessClient;
  let authClient;

  try {
    const organisationId =
      req.user.organisation_id;

    const orgType =
      req.user.org_type?.toLowerCase();

    const period =
      req.query.period || "hourly";

    const category =
      req.query.category || "all";

    console.log(
      "Peak Visitor Request:",
      {
        organisationId,
        orgType,
        period,
        category,
      }
    );

    const businessDB =
      getBusinessDB(orgType);

    businessClient =
      await businessDB.connect();

    authClient =
      await masterAuthDB.connect();

    const data =
      await fetchPeakVisitorHours(
        businessClient,
        authClient,
        organisationId,
        period,
        category
      );

    return res.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(
      "Peak Visitor Hours Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  } finally {
    if (businessClient) {
      businessClient.release();
    }

    if (authClient) {
      authClient.release();
    }
  }
};
export const getEntriesOverview = async (
  req,
  res
) => {
  let businessClient;
  let authClient;

  try {
    const organisationId =
      req.user.organisation_id;

    const orgType =
      req.user.org_type?.toLowerCase();

    const period =
      req.query.period || "daily";

    console.log(
      "================================="
    );

    console.log(
      "ENTRIES OVERVIEW REQUEST"
    );

    console.log(
      "Organisation ID:",
      organisationId
    );

    console.log(
      "Organisation Type:",
      orgType
    );

    console.log(
      "Period:",
      period
    );

    console.log(
      "================================="
    );

    /*
     * Validate period
     */

    if (
      !["daily", "weekly", "monthly"].includes(
        period
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid period. Use daily, weekly or monthly.",
      });
    }

    /*
     * Get correct business DB
     */

    const businessDB =
      getBusinessDB(orgType);

    businessClient =
      await businessDB.connect();

    /*
     * Master DB
     */

    authClient =
      await masterAuthDB.connect();

    /*
     * Fetch graph data
     */

    const data =
      await fetchEntriesOverview(
        businessClient,
        authClient,
        organisationId,
        period
      );

    return res.json({
      success: true,
      period,
      data,
    });

  } catch (error) {

    console.error(
      "Entries Overview Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  } finally {

    if (businessClient) {
      businessClient.release();
    }

    if (authClient) {
      authClient.release();
    }
  }
};

export const entriesByCategory = async (req, res) => {
  let businessClient;
  let authClient;

  try {
    const period =
      req.query.period?.toLowerCase() || "daily";

    const organisationId =
      req.user?.organisation_id ||
      req.user?.organisationId;

    console.log("=================================");
    console.log("ENTRIES BY CATEGORY REQUEST");
    console.log("Organisation ID:", organisationId);
    console.log("Period:", period);
    console.log("=================================");

    if (!organisationId) {
      return res.status(400).json({
        success: false,
        message: "Organisation ID not found",
      });
    }

    /*
     * Validate period
     */
    if (
      !["daily", "weekly", "monthly"].includes(period)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid period. Use daily, weekly or monthly.",
      });
    }

    /*
     * Get organisation information
     */
    authClient = await masterAuthDB.connect();

    const orgResult = await authClient.query(
      `
        SELECT
          org_type,
          schema_name
        FROM auth.organisations
        WHERE id = $1
        LIMIT 1
      `,
      [organisationId]
    );

    if (!orgResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Organisation not found",
      });
    }

    const organisationType =
      orgResult.rows[0].org_type?.toLowerCase();

    console.log(
      "Organisation Type:",
      organisationType
    );

    /*
     * Get correct business database
     */
    const businessDB =
      getBusinessDB(organisationType);

    businessClient =
      await businessDB.connect();

    /*
     * Fetch category data
     */
    const data =
      await fetchEntriesCategory(
        businessClient,
        authClient,
        organisationId,
        period
      );

    console.log(
      "Entries By Category Data:",
      data
    );

    return res.json({
      success: true,
      period,
      data,
    });

  } catch (error) {
    console.error(
      "Entries By Category Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch entries by category",
    });

  } finally {

    if (businessClient) {
      businessClient.release();
    }

    if (authClient) {
      authClient.release();
    }
  }
};
export const getSecurityGuards = async (req, res) => {
  const organisationId =
    req.user?.organisation_id;

  const orgType =
    req.user?.org_type?.toLowerCase();

  const {
    period = "daily",
  } = req.query;

  console.log(
    "Security Guards Request:",
    {
      organisationId,
      orgType,
      period,
    }
  );

  if (!organisationId) {
    return res.status(400).json({
      success: false,
      message: "Organisation ID not found",
    });
  }

  if (!orgType) {
    return res.status(400).json({
      success: false,
      message: "Organisation type not found",
    });
  }

  const allowedPeriods = [
    "daily",
    "weekly",
    "monthly",
  ];

  if (!allowedPeriods.includes(period)) {
    return res.status(400).json({
      success: false,
      message: "Invalid period",
    });
  }

  let businessDB;

  try {
    businessDB = getBusinessDB(orgType);
  } catch (error) {
    console.error(
      "Invalid organisation type:",
      orgType
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  const client =
    await businessDB.connect();

  try {
    const data =
      await fetchSecurityGuards(
        client,
        organisationId,
        period
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "getSecurityGuards error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch security guards",
    });
  } finally {
    client.release();
  }
};

export const getEventContributions = async (req, res) => {
  const organisationId = req.user.organisation_id;
  const orgType = req.user.org_type?.toLowerCase();

  const {
    period = "daily",
  } = req.query;

  const businessDB = getBusinessDB(orgType);
  const client = await businessDB.connect();

  try {
    const data = await fetchEventContributions(
      client,
      organisationId,
      period
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("getEventContributions error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    client.release();
  }
};