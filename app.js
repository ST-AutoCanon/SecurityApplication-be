import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import orgSuperAdminRoutes from "./auth/routes/organisationSuperAdmin.routes.js";

import authRoutes from "./auth/routes/auth.routes.js";
import orgroutes from "./auth/routes/organisation.routes.js";

//////////formifyroutes/////////
import formsRoutes from "./security/routes/forms.routes.js";
///////// campaignroutes///////////
import campaignRoutes from "./security/routes/campaign.routes.js";
import campaignBlockRoutes from "./security/routes/campaign.blockroutes.js";
import uploadRoutes from "./security/routes/upload.routes.js";
//////////////////////////////////////


import dynamicDataRoutes from "./security/routes/dynamicData.routes.js";
import punchdata from "./security/routes/punchData.routes.js";





import adminRoutes from "./auth/routes/admin.routes.js";
import apartmentRoutes from "./apartment/routes/apartmentMember.routes.js";
import dynamicTableRoutes from "./auth/routes/dynamicTable.routes.js";

import assignGatesRoutes from "./auth/routes/assignGates.routes.js";


const app = express();
app.set("trust proxy", 1);

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
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


app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "security", "uploads")),
);
app.use(
  "/api/uploads",
  express.static(path.join(process.cwd(), "security", "uploads")),
);
// =========================
// Security Module Routes
// =========================


app.use("/dynamic-tables", dynamicTableRoutes);


app.use("/api/organisation", orgroutes);
app.use("/api/auth", authRoutes);
app.use("/api/org-super-admin", orgSuperAdminRoutes);

///////formify routes////////////
app.use("/api/forms", formsRoutes);
///////////////////campaign routes////////
app.use("/api/campaigns", campaignRoutes);
app.use("/api/campaigns", campaignBlockRoutes);
app.use("/api/upload", uploadRoutes); 



// security routes
app.use("/dynamic-data", dynamicDataRoutes);

app.use("/punch-data", punchdata);


app.use("/api/admin", adminRoutes);
app.use("/api/admin", assignGatesRoutes);

app.use("/api/admin/apartment", apartmentRoutes);
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