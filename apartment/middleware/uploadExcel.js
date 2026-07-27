import multer from "multer";
import path from "path";

/**
 * Excel File Upload Middleware
 */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/excel/");
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);

    const name = `excel-${Date.now()}${ext}`;

    cb(null, name);
  },
});

/**
 * File Filter
 */
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".xlsx", ".xls"];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files are allowed"), false);
  }
};

const uploadExcel = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

export default uploadExcel;
