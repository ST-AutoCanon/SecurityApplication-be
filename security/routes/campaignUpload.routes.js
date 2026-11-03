import express from "express";
import { auth } from "../../middleware/auth.js"; // ← adjust path if needed

const router = express.Router();

// Protect all routes
router.use(auth);

const handleCampaignFileUpload = (fieldName, fileLabel) => async (req, res) => {
  try {
    const { upload } = await import("../middleware/upload.js");

    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Upload failed",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: `No ${fileLabel.toLowerCase()} uploaded`,
        });
      }

      const forwardedProto = req.get("x-forwarded-proto") || req.protocol;
      const forwardedHost = req.get("x-forwarded-host") || req.get("host");
      const baseUrl = (
        process.env.PUBLIC_URL || `${forwardedProto}://${forwardedHost}`
      ).replace(/\/+$/, "");

      return res.status(200).json({
        success: true,
        message: `${fileLabel} uploaded successfully`,
        url: `${baseUrl}/api/uploads/${req.file.filename}`,
        filename: req.file.filename,
        originalname: req.file.originalname,
      });
    });
  } catch (err) {
    console.error(`Campaign ${fileLabel.toLowerCase()} upload error:`, err);
    return res.status(500).json({
      success: false,
      message: err.message || `Failed to upload ${fileLabel.toLowerCase()}`,
    });
  }
};

// ===================== UPLOAD IMAGE =====================
router.post("/image", handleCampaignFileUpload("image", "Image"));
router.post("/document", handleCampaignFileUpload("file", "Document"));

export default router;