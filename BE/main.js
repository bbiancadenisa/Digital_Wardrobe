const { Client } = require("pg");
const express = require("express");

const app = express();
app.use(express.json());

const connection = new Client({
  host: process.env.DB_HOST ?? "localhost",
  user: process.env.DB_USER ?? "postgres",
  port: Number(process.env.DB_PORT ?? 5433),
  password: String(process.env.DB_PASSWORD ?? ""),
  database: process.env.DB_NAME ?? "Digital_Wardrobe_Database",
});

connection
  .connect()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error("Connection failed:", err && (err.stack || err.message) || err));

