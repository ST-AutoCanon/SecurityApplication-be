// import dotenv from "dotenv";
// dotenv.config(); // must be first

// import pg from "pg";
// // import pgvector from "pgvector/pg";
// const { Pool } = pg;

// const secondDB = new Pool({
//   host: process.env.DB2_HOST,
//   user: process.env.DB2_USER,
//   password: process.env.DB2_PASSWORD,
//   database: process.env.DB2_NAME,
//   port: Number(process.env.DB2_PORT),
// });


// // Register pgvector type support
// // await pgvector.registerType(secondDB);

// secondDB
//   .connect()
//   .then(() => console.log("📦 Second Database Connected"))
//   .catch((err) => console.error("❌ Second DB Error:", err));

// export default secondDB;


import dotenv from "dotenv";

dotenv.config();

import pg from "pg";

const { Pool } = pg;

const secondDB = new Pool({
  host: process.env.DB2_HOST,
  user: process.env.DB2_USER,
  password: process.env.DB2_PASSWORD,
  database: process.env.DB2_NAME,
  port: Number(process.env.DB2_PORT),

  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection when the application starts
(async () => {
  try {
    await secondDB.query("SELECT 1");
  } catch (err) {
    console.error("❌ Second DB Error:", err);
  }
})();

// Optional: log unexpected pool errors
secondDB.on("error", (err) => {
  console.error("❌ Second DB Pool Error:", err);
});

export default secondDB;

