// import dotenv from "dotenv";
// dotenv.config(); // must be first

// import pg from "pg";
// // import pgvector from "pgvector/pg";
// const { Pool } = pg;

// const thirdDB = new Pool({
//   host: process.env.DB3_HOST,
//   user: process.env.DB3_USER,
//   password: process.env.DB3_PASSWORD,
//   database: process.env.DB3_NAME,
//   port: Number(process.env.DB3_PORT),
// });

// // Register pgvector type support
// // await pgvector.registerType(thirdDB);


// thirdDB
//   .connect()
//   .then(() => console.log("📦 Third Database Connected"))
//   .catch((err) => console.error("❌ Third DB Error:", err));

// export default thirdDB;


import dotenv from "dotenv";

dotenv.config();

import pg from "pg";

// import pgvector from "pgvector/pg";

const { Pool } = pg;

const thirdDB = new Pool({
  host: process.env.DB3_HOST,
  user: process.env.DB3_USER,
  password: process.env.DB3_PASSWORD,
  database: process.env.DB3_NAME,
  port: Number(process.env.DB3_PORT),

  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Register pgvector type support if needed
// await pgvector.registerType(thirdDB);

// Test database connection when the application starts
(async () => {
  try {
    await thirdDB.query("SELECT 1");
  } catch (err) {
    console.error("❌ Third DB Error:", err);
  }
})();

// Handle unexpected pool errors
thirdDB.on("error", (err) => {
  console.error("❌ Third DB Pool Error:", err);
});

export default thirdDB;
