import dotenv from "dotenv";
dotenv.config(); // must be first

import pg from "pg";
// import pgvector from "pgvector/pg";

pg.types.setTypeParser(1082, (value) => value);

const { Pool } = pg;

const fourthDB = new Pool({
  host: process.env.DB4_HOST,
  user: process.env.DB4_USER,
  password: process.env.DB4_PASSWORD,
  database: process.env.DB4_NAME,
  port: Number(process.env.DB4_PORT),
});


// await pgvector.registerType(fourthDB);

fourthDB
  .connect()

  .then(() => console.log("📦 Fourth Database Connected"))
  .catch((err) => console.error("❌ Fourth DB Error:", err));

export default fourthDB;
