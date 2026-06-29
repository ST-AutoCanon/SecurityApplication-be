import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const hospitalDB = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB2_NAME, // hospital
  port: Number(process.env.DB_PORT),
});

export default hospitalDB;
