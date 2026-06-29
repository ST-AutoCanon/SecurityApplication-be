import {
  loginService,
  setPasswordService,
  forgotPasswordService,
  resetPasswordService,
} from "../services/auth.service.js";
import { apiResponse } from "../utils/helpers.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const loginController = async (req, res) => {
  try {
    const { email, password, organisation_id } = req.body;

    console.log("Login attempt:", {
      email,
      organisation_id,
    });

    console.log("EMAIL:", email);
    console.log("ORG ID:", organisation_id);

    const result = await loginService(email, password, organisation_id);
    if (!result.success) {
      return res.status(400).json(apiResponse(false, result.message));
    }

    const user = result.data.user;
    console.log("user :", user);
    const token = jwt.sign(
      {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        organisation_id: user.organisation_id || null,
        org_type: user.org_type,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000,
    });

    return res.json(
      apiResponse(true, "Login successful", {
        token,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          organisation_id: user.organisation_id,
          org_type: user.org_type,
        },
      }),
    );
  } catch (err) {
    console.error("Login Error:", err);

    return res.status(500).json(apiResponse(false, "Internal server error"));
  }
};

export const setPasswordController = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required",
      });
    }

    const result = await setPasswordService(token, password);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, organisation_id } = req.body;

    if (!email || !organisation_id) {
      return res
        .status(400)
        .json(apiResponse(false, "Email and organisation_id are required"));
    }

    const result = await forgotPasswordService(email, organisation_id);

    return res
      .status(result.success ? 200 : 400)
      .json(apiResponse(result.success, result.message));
  } catch (err) {
    console.error("Forgot Password Error:", err);

    return res.status(500).json(apiResponse(false, "Internal server error"));
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json(apiResponse(false, "Token and password are required"));
    }

    const result = await resetPasswordService(token, password);

    return res
      .status(result.success ? 200 : 400)
      .json(apiResponse(result.success, result.message));
  } catch (err) {
    console.error("Reset Password Error:", err);

    return res.status(500).json(apiResponse(false, "Internal server error"));
  }
};