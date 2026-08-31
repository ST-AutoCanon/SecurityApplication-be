
import multer from "multer";
import path from "path";
import fs from "fs";

/* Upload folder */
const uploadPath = path.resolve("security/uploads");

/* Create folder if it doesn't exist */
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/* Storage */
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

/* Allow images + documents */
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedExtensions = /\.(jpeg|jpg|png|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip)$/i;

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.test(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only images (JPG, PNG, WEBP) and documents (PDF, DOC, DOCX, XLS, PPT, TXT, CSV, ZIP) are allowed"
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // increased to 15MB
  },
});