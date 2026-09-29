// import dotenv from "dotenv";
// dotenv.config(); // must be first

// import pg from "pg";
// // import pgvector from "pgvector/pg";

// pg.types.setTypeParser(1082, (value) => value);

// const { Pool } = pg;

// const fourthDB = new Pool({
//   host: process.env.DB4_HOST,
//   user: process.env.DB4_USER,
//   password: process.env.DB4_PASSWORD,
//   database: process.env.DB4_NAME,
//   port: Number(process.env.DB4_PORT),
// });


// // await pgvector.registerType(fourthDB);

// fourthDB
//   .connect()

//   .then(() => console.log("📦 Fourth Database Connected"))
//   .catch((err) => console.error("❌ Fourth DB Error:", err));

// export default fourthDB;



import dotenv from "dotenv";

dotenv.config();

import pg from "pg";

// import pgvector from "pgvector/pg";

// Keep PostgreSQL DATE values as strings (YYYY-MM-DD)
pg.types.setTypeParser(1082, (value) => value);

const { Pool } = pg;

const fourthDB = new Pool({
  host: process.env.DB4_HOST,
  user: process.env.DB4_USER,
  password: process.env.DB4_PASSWORD,
  database: process.env.DB4_NAME,
  port: Number(process.env.DB4_PORT),

  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Register pgvector type support if needed
// await pgvector.registerType(fourthDB);

// Test database connection when the application starts
(async () => {
  try {
    await fourthDB.query("SELECT 1");

  } catch (err) {
    console.error("❌ Fourth DB Error:", err);
  }
})();

// Handle unexpected pool errors
fourthDB.on("error", (err) => {
  console.error("❌ Fourth DB Pool Error:", err);
});

export default fourthDB;

