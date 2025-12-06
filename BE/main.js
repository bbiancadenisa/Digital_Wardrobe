// import dotenv from "dotenv";
// dotenv.config(); // MUST BE FIRST

// import express from "express";
// import cors from "cors";

// import authRoutes from "./routes/authRoutes.js";
// import garmentRoutes from "./routes/garmentRoutes.js";
// import outfitRoutes from "./routes/outfitRoutes.js";

// import pkg from "pg";
// const { Client } = pkg;


// const app = express();
// app.use(express.json());

// dotenv.config();
// app.use(cors());

// app.get("/", (_req, res) => res.send("Digital Wardrobe API ✅"));

// app.use("/api/auth", authRoutes);
// app.use("/api/garments", garmentRoutes);
// app.use("/api/outfits", outfitRoutes);

// app.listen(process.env.PORT || 5000, () =>
//   console.log("API running on", process.env.PORT || 5000)
// );

// console.log("Loaded password:", process.env.DB_PASSWORD);
// console.log("Type:", typeof process.env.DB_PASSWORD);

// /////////////////

// const rawConfig = {
//   host: process.env.DB_HOST ?? "localhost",
//   user: process.env.DB_USER ?? "postgres",
//   port: Number(process.env.DB_PORT ?? 5433),
//   password: String(process.env.DB_PASSWORD),
//   database: process.env.DB_NAME ?? "Digital_Wardrobe_Database",
// };

// console.log("PG CONFIG:", rawConfig);

// const connection = new Client(rawConfig);

// connection
//   .connect()
//   .then(() => console.log("Connected to DB"))
//   .catch((err) => console.error("Connection failed:", err && (err.stack || err.message) || err));

///////////////
import dotenv from "dotenv";
dotenv.config(); // MUST BE FIRST

import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import garmentRoutes from "./routes/garmentRoutes.js";
import outfitRoutes from "./routes/outfitRoutes.js";

import pool from "./db/index.js"; // Import the connection pool

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (_req, res) => res.send("Digital Wardrobe API ✅"));

// Test database connection at startup
pool
  .connect()
  .then((client) => {
    console.log("Connected to DB");
    client.release(); // Release the client back to the pool
  })
  .catch((err) => console.error("Connection failed:", err && (err.stack || err.message) || err));

app.use("/api/auth", authRoutes);
app.use("/api/garments", garmentRoutes);
app.use("/api/outfits", outfitRoutes);

app.listen(process.env.PORT || 5000, () =>
  console.log("API running on", process.env.PORT || 5001)
);