// import { getBusinessDB } from "../../db/dbRouter.js";
// import * as model from "../models/userVisitor.model.js";


// /*
// |--------------------------------------------------------------------------
// | ORGANISATION SCHEMA
// |--------------------------------------------------------------------------
// */

// const getOrganisationSchema = (organisationId) => {
//   return `org_${String(organisationId).padStart(3, "0")}`;
// };


// /*
// |--------------------------------------------------------------------------
// | GET VISITORS FOR LOGGED-IN USER'S FLAT
// |--------------------------------------------------------------------------
// */

// export const getMyFlatVisitors = async (req, res) => {
//   let client;

//   try {
//     const organisationId =
//       req.user?.organisation_id;

//     const orgType =
//       req.user?.org_type?.toLowerCase();

//     const userId =
//       req.user?.user_id ||
//       req.user?.id;

//     const period =
//       req.query.period || "daily";


//     console.log(
//       "=============================================="
//     );

//     console.log(
//       "MY FLAT VISITORS REQUEST"
//     );

//     console.log(
//       "Organisation ID:",
//       organisationId
//     );

//     console.log(
//       "Organisation Type:",
//       orgType
//     );

//     console.log(
//       "User ID:",
//       userId
//     );

//     console.log(
//       "Period:",
//       period
//     );


//     /*
//     |--------------------------------------------------------------------------
//     | VALIDATION
//     |--------------------------------------------------------------------------
//     */

//     if (!organisationId) {
//       return res.status(401).json({
//         success: false,
//         message:
//           "Organisation ID not found in authentication token",
//       });
//     }

//     if (!orgType) {
//       return res.status(401).json({
//         success: false,
//         message:
//           "Organisation type not found in authentication token",
//       });
//     }

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message:
//           "User ID not found in authentication token",
//       });
//     }


//     /*
//     |--------------------------------------------------------------------------
//     | VALIDATE PERIOD
//     |--------------------------------------------------------------------------
//     */

//     const allowedPeriods = [
//       "daily",
//       "weekly",
//       "monthly",
//     ];

//     if (!allowedPeriods.includes(period)) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid period. Use daily, weekly or monthly.",
//       });
//     }


//     /*
//     |--------------------------------------------------------------------------
//     | SCHEMA
//     |--------------------------------------------------------------------------
//     */

//     const schemaName =
//       getOrganisationSchema(
//         organisationId
//       );

//     console.log(
//       "Visitor Schema:",
//       schemaName
//     );


//     /*
//     |--------------------------------------------------------------------------
//     | BUSINESS DATABASE
//     |--------------------------------------------------------------------------
//     */

//     const businessDB =
//       getBusinessDB(orgType);

//     client =
//       await businessDB.connect();

//     console.log(
//       "Business DB connected"
//     );


//     /*
//     |--------------------------------------------------------------------------
//     | FIND LOGGED-IN USER'S FLAT
//     |--------------------------------------------------------------------------
//     */

//     const flat =
//       await model.getUserFlatDetails(
//         client,
//         schemaName,
//         userId
//       );

//     console.log(
//       "User flat details:",
//       flat
//     );
//     console.log("AUTH USER:", req.user);
// console.log("USER ID USED:", userId);
// console.log("SCHEMA:", schemaName);


//     if (!flat) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Apartment member / flat details not found",
//       });
//     }


//     /*
//     |--------------------------------------------------------------------------
//     | GET VISITORS
//     |--------------------------------------------------------------------------
//     */

//     const visitors =
//       await model.getVisitorsForFlat(
//         client,
//         schemaName,
//         flat.flat_number,
//         period
//       );


//     console.log(
//       "Apartment Number:",
//       flat.flat_number
//     );

//     console.log(
//       "Visitors Found:",
//       visitors.length
//     );


//     /*
//     |--------------------------------------------------------------------------
//     | RESPONSE
//     |--------------------------------------------------------------------------
//     */

//     return res.status(200).json({
//       success: true,

//       period,

//       flat: {
//         flat_number:
//           flat.flat_number,

//         block_tower:
//           flat.block_tower,

//         floor_number:
//           flat.floor_number,
//       },

//       total:
//         visitors.length,

//       data: visitors,
//     });

//   } catch (error) {

//     console.error(
//       "GET MY FLAT VISITORS ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to fetch visitors",
//       error: error.message,
//     });

//   } finally {

//     if (client) {
//       client.release();
//     }
//   }
// };

import { getBusinessDB } from "../../db/dbRouter.js";
import * as model from "../models/userVisitor.model.js";


/*
|--------------------------------------------------------------------------
| ORGANISATION SCHEMA
|--------------------------------------------------------------------------
*/

const getOrganisationSchema = (organisationId) => {
  return `org_${String(organisationId).padStart(3, "0")}`;
};


/*
|--------------------------------------------------------------------------
| GET VISITORS FOR LOGGED-IN USER'S FLAT
|--------------------------------------------------------------------------
*/

export const getMyFlatVisitors = async (req, res) => {
  let client;

  try {
    const organisationId = req.user?.organisation_id;
    const orgType = req.user?.org_type?.toLowerCase();
    const userId =
      req.user?.user_id || req.user?.id;

    const period =
      req.query.period || "daily";

    const search =
      req.query.search || "";

    console.log(
      "Organisation ID:",
      organisationId
    );

    console.log(
      "Organisation Type:",
      orgType
    );

    console.log(
      "User ID:",
      userId
    );

    console.log(
      "Period:",
      period
    );

    console.log(
      "Search:",
      search
    );

    if (!organisationId) {
      return res.status(401).json({
        success: false,
        message: "Organisation ID missing",
      });
    }

    if (!orgType) {
      return res.status(401).json({
        success: false,
        message: "Organisation type missing",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID missing",
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

    const schemaName =
      getOrganisationSchema(
        organisationId
      );

    const businessDB =
      getBusinessDB(orgType);

    client = await businessDB.connect();

    /*
     * ------------------------------------------------------
     * GET LOGGED-IN USER'S FLAT
     * ------------------------------------------------------
     */

    const flat =
      await model.getUserFlatDetails(
        client,
        schemaName,
        userId
      );

    console.log(
      "User flat details:",
      flat
    );

    if (!flat) {
      return res.status(404).json({
        success: false,
        message:
          "Apartment member / flat details not found",
      });
    }

    /*
     * ------------------------------------------------------
     * GET VISITORS FOR THAT FLAT
     * ------------------------------------------------------
     */

    const visitors =
      await model.getVisitorsForFlat(
        client,
        schemaName,
        flat.flat_number,
        period,
        search
      );

    console.log(
      "Apartment Number:",
      flat.flat_number
    );

    console.log(
      "Visitors Found:",
      visitors.length
    );

    return res.status(200).json({
      success: true,

      period,

      flat: {
        flat_number:
          flat.flat_number,

        block_tower:
          flat.block_tower,

        floor_number:
          flat.floor_number,
      },

      total: visitors.length,

      data: visitors,
    });
  } catch (error) {
    console.error(
      "GET MY FLAT VISITORS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch visitors",
      error: error.message,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};
// export const getMyFlatVisitors = async (req, res) => {
//   let client;

//   try {
//     /*
//     |--------------------------------------------------------------------------
//     | AUTH DETAILS
//     |--------------------------------------------------------------------------
//     */

//     const organisationId = req.user?.organisation_id;

//     const orgType =
//       req.user?.org_type?.toLowerCase();

//     const userId =
//       req.user?.user_id ??
//       req.user?.id;

//     const period =
//       req.query.period || "daily";


//     /*
//     |--------------------------------------------------------------------------
//     | DEBUG AUTH
//     |--------------------------------------------------------------------------
//     */

//     console.log(
//       "=============================================="
//     );

//     console.log(
//       "MY FLAT VISITORS REQUEST"
//     );

//     console.log(
//       "AUTH USER:",
//       req.user
//     );

//     console.log(
//       "Organisation ID:",
//       organisationId
//     );

//     console.log(
//       "Organisation Type:",
//       orgType
//     );

//     console.log(
//       "User ID:",
//       userId
//     );

//     console.log(
//       "User ID Type:",
//       typeof userId
//     );

//     console.log(
//       "Period:",
//       period
//     );


//     /*
//     |--------------------------------------------------------------------------
//     | VALIDATION
//     |--------------------------------------------------------------------------
//     */

//     if (!organisationId) {
//       return res.status(401).json({
//         success: false,
//         message:
//           "Organisation ID not found in authentication token",
//       });
//     }

//     if (!orgType) {
//       return res.status(401).json({
//         success: false,
//         message:
//           "Organisation type not found in authentication token",
//       });
//     }

//     if (userId === undefined || userId === null) {
//       return res.status(401).json({
//         success: false,
//         message:
//           "User ID not found in authentication token",
//       });
//     }


//     /*
//     |--------------------------------------------------------------------------
//     | VALIDATE PERIOD
//     |--------------------------------------------------------------------------
//     */

//     const allowedPeriods = [
//       "daily",
//       "weekly",
//       "monthly",
//     ];

//     if (!allowedPeriods.includes(period)) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid period. Use daily, weekly or monthly.",
//       });
//     }


//     /*
//     |--------------------------------------------------------------------------
//     | SCHEMA
//     |--------------------------------------------------------------------------
//     */

//     const schemaName =
//       getOrganisationSchema(
//         organisationId
//       );

//     console.log(
//       "Visitor Schema:",
//       schemaName
//     );


//     /*
//     |--------------------------------------------------------------------------
//     | BUSINESS DATABASE
//     |--------------------------------------------------------------------------
//     */

//     const businessDB =
//       getBusinessDB(orgType);

//     client =
//       await businessDB.connect();

//     console.log(
//       "Business DB connected"
//     );


//     /*
//     |--------------------------------------------------------------------------
//     | FIND LOGGED-IN USER'S FLAT
//     |--------------------------------------------------------------------------
//     */

//     const flat =
//       await model.getUserFlatDetails(
//         client,
//         schemaName,
//         userId
//       );

//     console.log(
//       "User flat details:",
//       flat
//     );


//     /*
//     |--------------------------------------------------------------------------
//     | FLAT NOT FOUND
//     |--------------------------------------------------------------------------
//     */

//     if (!flat) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Apartment member / flat details not found",

//         debug: {
//           userId,
//           schemaName,
//         },
//       });
//     }


//     /*
//     |--------------------------------------------------------------------------
//     | GET VISITORS FOR FLAT
//     |--------------------------------------------------------------------------
//     */

//     const visitors =
//       await model.getVisitorsForFlat(
//         client,
//         schemaName,
//         flat.flat_number,
//         period
//       );


//     console.log(
//       "Apartment Number:",
//       flat.flat_number
//     );

//     console.log(
//       "Visitors Found:",
//       visitors.length
//     );


//     /*
//     |--------------------------------------------------------------------------
//     | RESPONSE
//     |--------------------------------------------------------------------------
//     */

//     return res.status(200).json({
//       success: true,

//       period,

//       flat: {
//         flat_number:
//           flat.flat_number,

//         block_tower:
//           flat.block_tower,

//         floor_number:
//           flat.floor_number,
//       },

//       total:
//         visitors.length,

//       data:
//         visitors,
//     });

//   } catch (error) {

//     console.error(
//       "GET MY FLAT VISITORS ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to fetch visitors",
//       error:
//         error.message,
//     });

//   } finally {

//     if (client) {
//       client.release();
//     }
//   }
// };
/* |-------------------------------------------------------------------------- | GET VISITOR STATS FOR LOGGED-IN USER'S FLAT |-------------------------------------------------------------------------- */ export const getMyFlatVisitorStats = async ( req, res ) => { let client; try { const organisationId = req.user?.organisation_id; const orgType = req.user?.org_type?.toLowerCase(); const userId = req.user?.user_id ?? req.user?.id; console.log( "==============================================" ); console.log( "MY FLAT VISITOR STATS REQUEST" ); console.log( "AUTH USER:", req.user ); console.log( "Organisation ID:", organisationId ); console.log( "Organisation Type:", orgType ); console.log( "User ID:", userId ); /* |-------------------------------------------------------------------------- | VALIDATION |-------------------------------------------------------------------------- */ if (!organisationId) { return res.status(401).json({ success: false, message: "Organisation ID not found in authentication token", }); } if (!orgType) { return res.status(401).json({ success: false, message: "Organisation type not found in authentication token", }); } if ( userId === undefined || userId === null ) { return res.status(401).json({ success: false, message: "User ID not found in authentication token", }); } /* |-------------------------------------------------------------------------- | SCHEMA |-------------------------------------------------------------------------- */ const schemaName = getOrganisationSchema( organisationId ); /* |-------------------------------------------------------------------------- | BUSINESS DATABASE |-------------------------------------------------------------------------- */ const businessDB = getBusinessDB(orgType); client = await businessDB.connect(); console.log( "Business DB connected" ); /* |-------------------------------------------------------------------------- | GET USER FLAT |-------------------------------------------------------------------------- */ const flat = await model.getUserFlatDetails( client, schemaName, userId ); console.log( "User flat details:", flat ); if (!flat) { return res.status(404).json({ success: false, message: "Apartment member / flat details not found", }); } /* |-------------------------------------------------------------------------- | GET STATS |-------------------------------------------------------------------------- */ const stats = await model.getVisitorStatsForFlat( client, schemaName, flat.flat_number ); console.log( "Apartment Number:", flat.flat_number ); console.log( "Visitor Stats:", stats ); /* |-------------------------------------------------------------------------- | RESPONSE |-------------------------------------------------------------------------- */ return res.status(200).json({ success: true, flat: { flat_number: flat.flat_number, block_tower: flat.block_tower, floor_number: flat.floor_number, }, data: { today: stats.today, thisWeek: stats.thisWeek, thisMonth: stats.thisMonth, /* * Approval functionality is not * currently connected to this * visitor stats query. */ pendingApproval: 0, }, }); } catch (error) { console.error( "GET MY FLAT VISITOR STATS ERROR:", error ); return res.status(500).json({ success: false, message: "Failed to fetch visitor stats", error: error.message, }); } finally { if (client) { client.release(); } } };