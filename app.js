import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import orgSuperAdminRoutes from "./auth/routes/organisationSuperAdmin.routes.js";

import authRoutes from "./auth/routes/auth.routes.js";
import orgroutes from "./auth/routes/organisation.routes.js"


import dynamicDataRoutes from "./security/routes/dynamicData.routes.js";
import punchdata from "./security/routes/punchData.routes.js";





import adminRoutes from "./auth/routes/admin.routes.js";
import dynamicTableRoutes from "./auth/routes/dynamicTable.routes.js";
const app = express();

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      // add production frontend URL here
      // "https://yourdomain.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

// Cookie Parser
app.use(cookieParser());

// Body Parser
app.use(
  express.json({
    limit: "50mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  }),
);

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Security Visitor Management API Running",
  });
});

// =========================
// Security Module Routes
// =========================


app.use("/dynamic-tables", dynamicTableRoutes);


app.use("/api/organisation", orgroutes);
app.use("/api/auth", authRoutes);
app.use("/api/org-super-admin", orgSuperAdminRoutes);


// security routes
app.use("/dynamic-data", dynamicDataRoutes);

app.use("/punch-data", punchdata);




app.use("/api/admin", adminRoutes);
// =========================
// 404 Handler
// =========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =========================
// Global Error Handler
// =========================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;