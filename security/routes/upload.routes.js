

// import express from "express";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { auth } from "../../middleware/auth.js"; // adjust if your auth path is different

// const router = express.Router();

// // Protect all upload routes
// router.use(auth);

// // ===================== CREATE UPLOAD FOLDER =====================
// const uploadDir = path.join(process.cwd(), "security", "uploads", "campaigns");

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // ===================== MULTER CONFIG =====================
// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (_req, file, cb) => {
//     const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
//     cb(null, `campaign-img-${unique}${ext}`);
//   },
// });

// const fileFilter = (_req, file, cb) => {
//   const allowed = [
//     "image/jpeg",
//     "image/jpg",
//     "image/png",
//     "image/gif",
//     "image/webp",
//   ];
//   if (allowed.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"), false);
//   }
// };

// const upload = multer({
//   storage,
//   limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
//   fileFilter,
// });

// // ===================== UPLOAD IMAGE =====================
// router.post("/image", upload.single("image"), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "No image uploaded",
//       });
//     }

//     const forwardedProto = req.get("x-forwarded-proto") || req.protocol;
//     const forwardedHost = req.get("x-forwarded-host") || req.get("host");

//     const baseUrl = (process.env.PUBLIC_URL || `${forwardedProto}://${forwardedHost}`)
//       .replace(/\/+$/, "");

//     const url = `${baseUrl}/api/uploads/campaigns/${req.file.filename}`;

//     return res.status(200).json({
//       success: true,
//       message: "Image uploaded successfully",
//       url,
//       filename: req.file.filename,
//     });
//   } catch (err) {
//     console.error("Upload error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message || "Failed to upload image",
//     });
//   }
// });

// export default router;

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

// ===================== FILE UPLOAD HELPERS =====================

const handleUpload = async (req, res, fieldName = "file") => {
  try {
    const { upload } = await import("../middleware/upload.js");
    const uploadSingle = upload.single(fieldName);

    uploadSingle(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Upload failed",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const forwardedProto = req.get("x-forwarded-proto") || req.protocol;
      const forwardedHost = req.get("x-forwarded-host") || req.get("host");
      const baseUrl = (
        process.env.PUBLIC_URL || `${forwardedProto}://${forwardedHost}`
      ).replace(/\/+$/, "");

      return res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        url: `${baseUrl}/api/uploads/${req.file.filename}`,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
    });
  }
};

// ===================== IMAGE UPLOAD =====================
router.post("/upload-image", (req, res) => handleUpload(req, res, "image"));
router.post("/public/:orgId/:formId/upload-image", (req, res) =>
  handleUpload(req, res, "image")
);

// ===================== DOCUMENT / FILE UPLOAD =====================
router.post("/upload-file", (req, res) => handleUpload(req, res, "file"));
router.post("/public/:orgId/:formId/upload-file", (req, res) =>
  handleUpload(req, res, "file")
);

// ===================== EMAIL TRANSPORTER =====================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD?.replace(/\s+/g, ""),
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
router.post("/:id/send-email", async (req, res) => {
  try {
    let { emails, email, formUrl, formTitle, fields } = req.body;

    if (!emails && email) emails = [email];

    if (!emails || !Array.isArray(emails) || emails.length === 0 || !formUrl) {
      return res.status(400).json({
        success: false,
        message: "At least one email and formUrl are required",
      });
    }

    emails = emails
      .map((e) => e.trim())
      .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid email addresses provided",
      });
    }

    await transporter.sendMail({
      from: `"Form Builder" <${process.env.MAIL_USER}>`,
      to: emails.join(", "),
      subject: `Please fill this form: ${formTitle || "Untitled Form"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; padding: 20px;">
          <h2 style="color: #7c3aed; margin: 0 0 12px;">Hello,</h2>
          <p style="margin: 0 0 12px; color: #334155;">You have been invited to fill out a form:</p>
          <p style="font-size: 18px; font-weight: bold; margin: 0 0 18px; color: #111827;">${formTitle || "Untitled Form"}</p>
          <a href="${formUrl}" 
             style="display: inline-block; margin: 0 0 18px; padding: 14px 28px; 
                    background-color: #7c3aed; color: white; text-decoration: none; 
                    border-radius: 8px; font-weight: bold;">
            Open Form
          </a>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px; margin: 0;">
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