import mysql from "mysql2/promise";

export const mysqlPool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : null;
