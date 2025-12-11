import pool from "../db/index.js";

export const getSeasons = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name FROM seasons ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching seasons:", err);
    res.status(500).json({ error: "Failed to fetch seasons" });
  }
};
