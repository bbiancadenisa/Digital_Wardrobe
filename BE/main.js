import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import garmentRoutes from "./routes/garmentRoutes.js";
import outfitRoutes from "./routes/outfitRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import styleRoutes from "./routes/styleRoutes.js";
import seasonRoutes from "./routes/seasonRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import suggestionRoutes from "./routes/suggestionRoutes.js";

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
app.use("/api/categories", categoryRoutes);
app.use("/api/styles", styleRoutes);
app.use("/api/seasons", seasonRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/suggestions", suggestionRoutes);

app.listen(process.env.PORT || 5000, () =>
  console.log("API running on", process.env.PORT || 5000)
);