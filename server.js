import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

import db from "./config/dborgap.js";
import dbEvent from "./config/dborgevent.js";
import dbHospital from "./config/dborghospital.js";
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Security DB
    const securityResult = await db.query("SELECT NOW()");
    console.log("✅ Security DB Connected");
    console.log("Security DB Time:", securityResult.rows[0].now);

    // Event DB
    const eventResult = await dbEvent.query("SELECT NOW()");
    console.log("✅ Event DB Connected");
    console.log("Event DB Time:", eventResult.rows[0].now);

    // Hospital DB
    const hospitalResult = await dbHospital.query("SELECT NOW()");
    console.log("✅ Hospital DB Connected");
    console.log("Hospital DB Time:", hospitalResult.rows[0].now);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error);

    process.exit(1);
  }
}

startServer();