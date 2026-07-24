// import dotenv from "dotenv";
// dotenv.config(); // must be first

// import pg from "pg";
// // import pgvector from "pgvector/pg";
// const { Pool } = pg;

// const firstDB = new Pool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: Number(process.env.DB_PORT),
// });

// // await pgvector.registerType(firstDB);

// firstDB
//   .connect()
//   .then(() => console.log("📦 First Database Connected"))
//   .catch((err) => console.error("❌ First DB Error:", err));

// export default firstDB;

import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

const firstDB = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),

  // important
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  allowExitOnIdle: true,
});

// warm up the pool without holding a client
(async () => {
  try {
    await firstDB.query("SELECT 1");
    console.log("📦 First Database Connected");
  } catch (err) {
    console.error("❌ First DB Error:", err);
  }
})();

export default firstDB;