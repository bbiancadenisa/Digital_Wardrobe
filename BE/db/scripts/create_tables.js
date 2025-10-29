const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../../.env") }); 

const connection = new Client({
  host: process.env.DB_HOST ?? "localhost",
  user: process.env.DB_USER ?? "postgres",
  password: String(process.env.DB_PASSWORD ?? ""),
  port: Number(process.env.DB_PORT ?? 5433),
  database: process.env.DB_NAME ?? "Digital_Wardrobe_Database",
});

const createTables = async () => {
  try {
    // Build path to SQL file (one folder up, then into sql/)
    const schemaPath = path.join(__dirname, "../sql/create_tables.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");

    // Helpful: log non-sensitive connection info
    console.log("Connecting to PostgreSQL with:", {
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 5433),
      user: process.env.DB_USER ?? "postgres",
      database: process.env.DB_NAME ?? "Digital_Wardrobe_Database",
    });

    await connection.connect();
    console.log("Connected to PostgreSQL");

    await connection.query(sql);
    console.log("Tables created successfully!");
  } catch (err) {
    console.error("Error creating tables:", err && (err.stack || err.message) || err);
  } finally {
    try {
      await connection.end();
      console.log("Connection closed");
    } catch (endErr) {
      console.error("Error closing connection:", endErr && (endErr.stack || endErr.message) || endErr);
    }
  }
};

createTables();
