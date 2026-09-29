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
  } catch (err) {
    console.error("❌ First DB Error:", err);
  }
})();

export default firstDB;