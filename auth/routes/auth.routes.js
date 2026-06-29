import express from "express";
import jwt from "jsonwebtoken";
import {
  loginController,
  setPasswordController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/auth.controller.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Login
router.post("/login", loginController);
router.post("/set-password", setPasswordController);

router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

// Restore Session
router.get("/me", (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No active session",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    return res.json({
      success: true,
      data: {
        user: decoded,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;