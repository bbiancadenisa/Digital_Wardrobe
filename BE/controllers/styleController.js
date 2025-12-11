import pool from "../db/index.js";

// ======================================================
// GET active styles
// ======================================================
export const getStyles = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name FROM styles WHERE is_active = TRUE ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching styles:", err);
    res.status(500).json({ error: "Failed to fetch styles" });
  }
};

// ======================================================
// CREATE style
// ======================================================
export const createStyle = async (req, res) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Style name is required" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO styles (name) VALUES ($1) RETURNING *",
      [name.trim()]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating style:", err);
    res.status(500).json({ error: "Failed to create style" });
  }
};

// ======================================================
// UPDATE style
// ======================================================
export const updateStyle = async (req, res) => {
  const styleId = req.params.id;
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Style name is required" });
  }

  try {
    const { rows } = await pool.query(
      "UPDATE styles SET name = $1 WHERE id = $2 RETURNING *",
      [name.trim(), styleId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Style not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating style:", err);
    res.status(500).json({ error: "Failed to update style" });
  }
};

// ======================================================
// DISABLE style
// ======================================================
export const disableStyle = async (req, res) => {
  const styleId = req.params.id;

  try {
    const { rows } = await pool.query(
      "UPDATE styles SET is_active = FALSE WHERE id = $1 RETURNING *",
      [styleId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Style not found" });
    }

    res.json({ message: "Style disabled", style: rows[0] });
  } catch (err) {
    console.error("Error disabling style:", err);
    res.status(500).json({ error: "Failed to disable style" });
  }
};

// ======================================================
// ENABLE style
// ======================================================
export const enableStyle = async (req, res) => {
  const styleId = req.params.id;

  try {
    const { rows } = await pool.query(
      "UPDATE styles SET is_active = TRUE WHERE id = $1 RETURNING *",
      [styleId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Style not found" });
    }

    res.json({ message: "Style enabled", style: rows[0] });
  } catch (err) {
    console.error("Error enabling style:", err);
    res.status(500).json({ error: "Failed to enable style" });
  }
};
