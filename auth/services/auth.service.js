import bcrypt from "bcryptjs";
import crypto from "crypto";

import {
  findMasterUserByEmail,
  findOrgAdminByEmail,
  findOrgUserByEmail,
  findUserByInvitationToken,
  updateUserPassword,
  findForgotPasswordUserByEmail,
  saveResetPasswordToken,
  findUserByResetPasswordToken,
  updatePasswordAfterReset,
} from "../models/masterUser.model.js";

import { sendForgotPasswordEmail } from "./mail.service.js";

/* ===========================
   LOGIN
=========================== */
export const loginService = async (email, password, organisation_id) => {
  // SUPER ADMIN
  if (!organisation_id) {
    const user = await findMasterUserByEmail(email);

    if (!user || user.role !== "super_admin") {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    return {
      success: true,
      data: { user },
    };
  }

  // ORG ADMIN
  const orgAdmin = await findOrgAdminByEmail(email, organisation_id);

  if (orgAdmin) {
    const isMatch = await bcrypt.compare(password, orgAdmin.password);

    if (!isMatch) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    return {
      success: true,
      data: {
        user: orgAdmin,
      },
    };
  }

  // SECURITY USER
  const orgUser = await findOrgUserByEmail(email, organisation_id);

  if (!orgUser) {
    return {
      success: false,
      message: "Invalid email or password",
    };
  }

  const isMatch = await bcrypt.compare(password, orgUser.password);

  if (!isMatch) {
    return {
      success: false,
      message: "Invalid email or password",
    };
  }

  return {
    success: true,
    data: {
      user: orgUser,
    },
  };
};

/* ===========================
   FIRST TIME PASSWORD
=========================== */
export const setPasswordService = async (token, password) => {
  const user = await findUserByInvitationToken(token);

  if (!user) {
    return {
      success: false,
      message: "Invalid invitation link",
    };
  }

  if (
    user.invitation_expires_at &&
    new Date(user.invitation_expires_at) < new Date()
  ) {
    return {
      success: false,
      message: "Invitation link has expired",
    };
  }

  if (user.invitation_accepted) {
    return {
      success: false,
      message: "Password already set",
    };
  }

  const hash = await bcrypt.hash(password, 10);

  await updateUserPassword(user.id, hash);

  return {
    success: true,
    message: "Password created successfully",
  };
};

/* ===========================
   FORGOT PASSWORD
=========================== */
export const forgotPasswordService = async (email, organisationId) => {
  const user = await findForgotPasswordUserByEmail(email, organisationId);

  // Never reveal whether email exists
  if (!user) {
    return {
      success: true,
      message: "If the email exists, a reset link has been sent.",
    };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await saveResetPasswordToken(user.id, token, expiresAt);

  await sendForgotPasswordEmail({
    email: user.email,
    firstName: user.first_name,
    token,
  });

  return {
    success: true,
    message: "Password reset link sent successfully.",
  };
};

/* ===========================
   RESET PASSWORD
=========================== */
export const resetPasswordService = async (token, password) => {
  const user = await findUserByResetPasswordToken(token);

  if (!user) {
    return {
      success: false,
      message: "Invalid or expired reset link.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await updatePasswordAfterReset(user.id, hashedPassword);

  return {
    success: true,
    message: "Password reset successfully.",
  };
};