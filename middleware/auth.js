import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const auth = (req, res, next) => {
  // Read token from cookie
  const token = req.cookies?.token; // requires cookie-parser middleware

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // id, email, role, org_code
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};