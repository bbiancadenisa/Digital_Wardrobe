const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../../.env") }); // load BE/.env

const connection = new Client({
    host: process.env.DB_HOST ?? "localhost",
    user: process.env.DB_USER ?? "postgres",
    password: String(process.env.DB_PASSWORD ?? ""),
    port: Number(process.env.DB_PORT ?? 5433),
    database: process.env.DB_NAME ?? "Digital_Wardrobe_Database",
});

const seedData = async () => {
  try {
    const seedPath = path.join(__dirname, "../sql/seed.sql");
    const sql = fs.readFileSync(seedPath, "utf8");

    console.log("Connecting to PostgreSQL with:", {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
    });

    await connection.connect();
    console.log("Connected to PostgreSQL");

    await connection.query(sql);
    console.log("Default data inserted successfully!");
  } catch (err) {
    console.error("Error seeding data:", err && (err.stack || err.message) || err);
  } finally {
    try {
      await connection.end();
      console.log("Connection closed");
    } catch (endErr) {
      console.error("Error closing connection:", endErr && (endErr.stack || endErr.message) || endErr);
    }
  }
};

seedData();
