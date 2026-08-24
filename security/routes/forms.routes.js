

import express from "express";
import nodemailer from "nodemailer";
import {
  getForms,
  getForm,
  createForm,
  updateForm,
  deleteForm,
  getPublicForm,
  submitPublicForm,
  getFormResponses,
} from "../controllers/forms.controller.js";
import { auth } from "../../middleware/auth.js";

const router = express.Router();

// ===================== FILE UPLOAD =====================
router.post("/upload-image", async (req, res) => {
  try {
    const { upload } = await import("../middleware/upload.js");
    const uploadSingle = upload.single("image");

    uploadSingle(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Image upload failed",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      const forwardedProto = req.get("x-forwarded-proto") || req.protocol;
      const forwardedHost = req.get("x-forwarded-host") || req.get("host");
      const baseUrl = (process.env.PUBLIC_URL || `${forwardedProto}://${forwardedHost}`)
        .replace(/\/+$/, "");

      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        url: `${baseUrl}/uploads/${req.file.filename}`,
        filename: req.file.filename,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
    });
  }
});

router.post("/public/:orgId/:formId/upload-image", async (req, res) => {
  try {
    const { upload } = await import("../middleware/upload.js");
    const uploadSingle = upload.single("image");

    uploadSingle(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Image upload failed",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      const forwardedProto = req.get("x-forwarded-proto") || req.protocol;
      const forwardedHost = req.get("x-forwarded-host") || req.get("host");
      const baseUrl = (process.env.PUBLIC_URL || `${forwardedProto}://${forwardedHost}`)
        .replace(/\/+$/, "");

      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        url: `${baseUrl}/uploads/${req.file.filename}`,
        filename: req.file.filename,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
    });
  }
});

// ===================== EMAIL TRANSPORTER =====================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD?.replace(/\s+/g, ""), // remove spaces from app password
  },
});

// ===================== PUBLIC (no login) =====================
router.get("/public/:orgId/:formId", getPublicForm);
router.post("/public/:orgId/:formId/submit", submitPublicForm);

// ===================== PROTECTED =====================
router.use(auth);

router.get("/", getForms);
router.get("/:id", getForm);
router.post("/", createForm);
router.put("/:id", updateForm);
router.get("/:id/responses", getFormResponses);
router.delete("/:id", deleteForm);

// ===================== SEND FORM EMAIL =====================
// router.post("/:id/send-email", async (req, res) => {
//   try {
//     const { email, formUrl, formTitle } = req.body;

//     if (!email || !formUrl) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and formUrl are required",
//       });
//     }

//     await transporter.sendMail({
//       from: `"Form Builder" <${process.env.MAIL_USER}>`,
//       to: email,
//       subject: `Please fill this form: ${formTitle || "Untitled Form"}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
//           <h2 style="color: #7c3aed;">Hello,</h2>
//           <p>You have been invited to fill out a form:</p>
//           <p style="font-size: 18px; font-weight: bold;">${formTitle || "Untitled Form"}</p>
          
//           <a href="${formUrl}" 
//              style="display: inline-block; margin: 20px 0; padding: 14px 28px; 
//                     background-color: #7c3aed; color: white; text-decoration: none; 
//                     border-radius: 8px; font-weight: bold;">
//             Open Form
//           </a>
          
//           <p style="color: #666; font-size: 14px;">
//             Or copy and paste this link into your browser:<br>
//             <a href="${formUrl}">${formUrl}</a>
//           </p>
          
//           <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
//           <p style="color: #999; font-size: 12px;">
//             This is an automated message. Please do not reply.
//           </p>
//         </div>
//       `,
//     });

//     res.json({
//       success: true,
//       message: "Email sent successfully",
//     });
//   } catch (error) {
//     console.error("Send email error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to send email",
//     });
//   }
// });
router.post("/:id/send-email", async (req, res) => {
  try {
    let { emails, email, formUrl, formTitle } = req.body;

    // Support both single email and array of emails
    if (!emails && email) {
      emails = [email];
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0 || !formUrl) {
      return res.status(400).json({
        success: false,
        message: "At least one email and formUrl are required",
      });
    }

    // Remove empty / invalid entries
    emails = emails
      .map((e) => e.trim())
      .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid email addresses provided",
      });
    }

    // Send to all emails
    await transporter.sendMail({
      from: `"Form Builder" <${process.env.MAIL_USER}>`,
      to: emails.join(", "), // or use bcc: emails.join(", ") if you prefer
      subject: `Please fill this form: ${formTitle || "Untitled Form"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
          <h2 style="color: #7c3aed;">Hello,</h2>
          <p>You have been invited to fill out a form:</p>
          <p style="font-size: 18px; font-weight: bold;">${formTitle || "Untitled Form"}</p>
          
          <a href="${formUrl}" 
             style="display: inline-block; margin: 20px 0; padding: 14px 28px; 
                    background-color: #7c3aed; color: white; text-decoration: none; 
                    border-radius: 8px; font-weight: bold;">
            Open Form
          </a>
          
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${formUrl}">${formUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px;">
            This is an automated message. Please do not reply.
          </p>
        </div>
      `,
    });

    res.json({
      success: true,
      message: `Email sent successfully to ${emails.length} recipient(s)`,
    });
  } catch (error) {
    console.error("Send email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
});

export default router;