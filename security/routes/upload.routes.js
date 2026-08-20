import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { auth } from "../../middleware/auth.js"; // adjust if your auth path is different

const router = express.Router();

// Protect all upload routes
router.use(auth);

// ===================== CREATE UPLOAD FOLDER =====================
const uploadDir = path.join(process.cwd(), "security", "uploads", "campaigns");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ===================== MULTER CONFIG =====================
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `campaign-img-${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter,
});

// ===================== UPLOAD IMAGE =====================
router.post("/image", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    // IMPORTANT: Always return a full absolute URL
    const protocol = req.protocol;                 // http or https
    const host = req.get("host");                  // localhost:5000
    const url = `${protocol}://${host}/uploads/campaigns/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url,                    // ← full URL
      filename: req.file.filename,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to upload image",
    });
  }
});

export default router;