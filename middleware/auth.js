// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// export const auth = (req, res, next) => {
//   // Read token from cookie
//   const token = req.cookies?.token; // requires cookie-parser middleware

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized: token missing",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded; // id, email, role, org_code
//     next();
//   } catch (err) {
//     return res.status(401).json({
//       success: false,
//       message: "Invalid token",
//     });
//   }
// };

// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// export const auth = (req, res, next) => {
//   // Read token from cookie
//   const token = req.cookies?.token; // requires cookie-parser middleware

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized: token missing",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded; // id, email, role, org_code
//     next();
//   } catch (err) {
//     return res.status(401).json({
//       success: false,
//       message: "Invalid token",
//     });
//   }
// };


import jwt from "jsonwebtoken";
import masterAuthDB from "../config/masterAuthDB.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key";

const REGISTRATION_EXPIRED_MESSAGE =
  "Your registration has expired. Please contact the administration to renew your access.";

export const auth = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: token missing",
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  req.user = decoded;

  // Super Admin must be able to log in and renew registrations.
  if (decoded.role === "super_admin") {
    return next();
  }

  if (!decoded.organisation_id) {
    return res.status(403).json({
      success: false,
      message: "Organisation information is missing.",
    });
  }

  try {
    const result = await masterAuthDB.query(
      `
      SELECT
        status,
        registration_end_date,
        (
          registration_end_date IS NOT NULL
          AND registration_end_date < CURRENT_DATE
        ) AS registration_expired
      FROM auth.organisations
      WHERE id = $1
      LIMIT 1
      `,
      [decoded.organisation_id],
    );

    const organisation = result.rows[0];

    if (!organisation) {
      return res.status(403).json({
        success: false,
        message: "Organisation not found.",
      });
    }

    if (organisation.registration_expired) {
      return res.status(403).json({
        success: false,
        code: "REGISTRATION_EXPIRED",
        message: REGISTRATION_EXPIRED_MESSAGE,
      });
    }

    if (organisation.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your organisation is inactive. Please contact the administration.",
      });
    }

    return next();
  } catch (err) {
    console.error("Organisation expiry validation error:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to validate organisation access.",
    });
  }
};
