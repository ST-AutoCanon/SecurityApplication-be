import dotenv from "dotenv";
dotenv.config(); // must be first

import pg from "pg";
const { Pool } = pg;

const firstDB = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

firstDB
  .connect()
  .then(() => console.log("📦 First Database Connected"))
  .catch((err) => console.error("❌ First DB Error:", err));

export default firstDB;
