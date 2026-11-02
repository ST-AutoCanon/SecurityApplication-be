
// // import multer from "multer";
// // import path from "path";
// // import fs from "fs";

// // /* Upload folder */
// // const uploadPath = path.resolve("security/uploads");

// // /* Create folder if it doesn't exist */
// // if (!fs.existsSync(uploadPath)) {
// //   fs.mkdirSync(uploadPath, { recursive: true });
// // }

// // /* Storage */
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, uploadPath);
// //   },

// //   filename: (req, file, cb) => {
// //     const uniqueName =
// //       Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

// //     cb(null, uniqueName);
// //   },
// // });

// // /* Allow images + documents */
// // const fileFilter = (req, file, cb) => {
// //   // Allowed extensions
// //   const allowedExtensions = /\.(jpeg|jpg|png|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip)$/i;

// //   const ext = path.extname(file.originalname).toLowerCase();

// //   if (allowedExtensions.test(ext)) {
// //     cb(null, true);
// //   } else {
// //     cb(
// //       new Error(
// //         "Only images (JPG, PNG, WEBP) and documents (PDF, DOC, DOCX, XLS, PPT, TXT, CSV, ZIP) are allowed"
// //       )
// //     );
// //   }
// // };

// // export const upload = multer({
// //   storage,
// //   fileFilter,
// //   limits: {
// //     fileSize: 15 * 1024 * 1024, // increased to 15MB
// //   },
// // });

// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const uploadPath = path.resolve(process.cwd(), "security", "uploads");

// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

// console.log("Multer saves to:", uploadPath);

// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => cb(null, uploadPath),
//   filename: (_req, file, cb) => {
//     const safe = file.originalname.replace(/\s+/g, "-");
//     cb(null, `${Date.now()}-${safe}`);
//   },
// });

// const allowed =
//   /\.(jpe?g|png|webp|gif|pdf|docx?|xlsx?|pptx?|txt|csv|zip)$/i;

// const fileFilter = (_req, file, cb) => {
//   if (allowed.test(path.extname(file.originalname))) {
//     cb(null, true);
//   } else {
//     cb(new Error("File type not allowed"), false);
//   }
// };

// export const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 15 * 1024 * 1024 },
// });

import multer from "multer";
import path from "path";
import fs from "fs";

// Backend project folder:
// PulseWork/backend
//
// Upload folder:
// PulseWork/uploads
//
// This keeps uploaded files OUTSIDE the backend/code folder.

const uploadPath = path.resolve(process.cwd(), "..", "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

console.log("=================================");
console.log("Multer upload folder:");
console.log(uploadPath);
console.log("=================================");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadPath);
  },

  filename: (_req, file, cb) => {
    const safeName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    cb(null, `${Date.now()}-${safeName}`);
  },
});

const allowed =
  /\.(jpe?g|png|webp|gif|pdf|docx?|xlsx?|pptx?|txt|csv|zip)$/i;

const fileFilter = (_req, file, cb) => {
  if (allowed.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});