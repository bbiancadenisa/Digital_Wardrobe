import pool from "../db/index.js";

// ======================================================
// GET active styles (ONLY current user)
// ======================================================
export const getStyles = async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT id, name
       FROM styles
       WHERE is_active = TRUE AND user_id = $1
       ORDER BY name ASC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching styles:", err);
    res.status(500).json({ error: "Failed to fetch styles" });
  }
};

// ======================================================
// CREATE style (USER-SPECIFIC)
// ======================================================
export const createStyle = async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Style name is required" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO styles (user_id, name)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, name.trim().toLowerCase()]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Style already exists" });
    }
    console.error("Error creating style:", err);
    res.status(500).json({ error: "Failed to create style" });
  }
};

// ======================================================
// UPDATE style (ONLY if owned by user)
// ======================================================
export const updateStyle = async (req, res) => {
  const userId = req.user.id;
  const styleId = req.params.id;
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Style name is required" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE styles
       SET name = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [name.trim().toLowerCase(), styleId, userId]
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
// DISABLE style (soft delete, USER-SCOPED)
// ======================================================
export const disableStyle = async (req, res) => {
  const userId = req.user.id;
  const styleId = req.params.id;

  try {
    const { rows } = await pool.query(
      `UPDATE styles
       SET is_active = FALSE
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [styleId, userId]
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
// ENABLE style (USER-SCOPED)
// ======================================================
export const enableStyle = async (req, res) => {
  const userId = req.user.id;
  const styleId = req.params.id;

  try {
    const { rows } = await pool.query(
      `UPDATE styles
       SET is_active = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [styleId, userId]
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
