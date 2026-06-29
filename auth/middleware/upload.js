import multer from "multer";
import path from "path";
import fs from "fs";

/* ✅ Absolute safe path (works in Windows + Linux) */
const uploadPath = path.resolve("auth/uploads");

/* ✅ Ensure folder exists (prevents ENOENT error) */
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/* Storage config */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

    cb(null, uniqueName);
  },
});

/* File filter */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;

  const ext = path.extname(file.originalname).toLowerCase();

  const isValid = allowedTypes.test(ext);

  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error("Only jpeg, jpg, png, webp images are allowed"), false);
  }
};

/* Optional: file size limit (5MB) */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
