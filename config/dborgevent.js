import dotenv from "dotenv";
dotenv.config(); // must be first

import pg from "pg";
const { Pool } = pg;

const secondDB = new Pool({
  host: process.env.DB2_HOST,
  user: process.env.DB2_USER,
  password: process.env.DB2_PASSWORD,
  database: process.env.DB2_NAME,
  port: Number(process.env.DB2_PORT),
});

secondDB
  .connect()
  .then(() => console.log("📦 Second Database Connected"))
  .catch((err) => console.error("❌ Second DB Error:", err));

export default secondDB;
