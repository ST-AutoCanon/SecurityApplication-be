// import transporter from "../../config/mail.js";
// import { securityInviteTemplate } from "../../templates/securityInvite.template.js";
// import { forgotPasswordTemplate } from "../../templates/forgotPassword.template.js";

// export const sendSecurityInvitation = async ({
//   email,
//   firstName,
//   token,
// }) => {
//   const inviteLink = `${process.env.FRONTEND_URL}/set-password?token=${token}`;

//   await transporter.sendMail({
//     from: process.env.MAIL_FROM,
//     to: email,
//     subject: "Security Account Invitation",
//     html: securityInviteTemplate(firstName, inviteLink),
//   });
// };

// export const sendForgotPasswordEmail = async ({
//   email,
//   firstName,
//   token,
// }) => {
//   const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

//   await transporter.sendMail({
//     from: process.env.MAIL_FROM,
//     to: email,
//     subject: "Reset Your Password",
//     html: forgotPasswordTemplate(firstName, resetLink),
//   });
// };

import transporter from "../../config/mail.js";
import { securityInviteTemplate } from "../../templates/securityInvite.template.js";
import { forgotPasswordTemplate } from "../../templates/forgotPassword.template.js";

export const sendSecurityInvitation = async ({ email, firstName, token }) => {
  const inviteLink = `${process.env.FRONTEND_URL}/set-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Security Account Invitation",
    html: securityInviteTemplate(firstName, inviteLink),
  });
};

export const sendForgotPasswordEmail = async ({ email, firstName, token }) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Reset Your Password",
    html: forgotPasswordTemplate(firstName, resetLink),
  });
};