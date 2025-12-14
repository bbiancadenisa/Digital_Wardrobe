import pool from "../db/index.js";

// ======================================================
// GET all active categories (ONLY current user)
// ======================================================
export const getCategories = async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT id, name 
       FROM categories 
       WHERE is_active = TRUE AND user_id = $1
       ORDER BY name ASC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// ======================================================
// CREATE category (USER-SPECIFIC)
// ======================================================
export const createCategory = async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO categories (user_id, name)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, name.trim().toLowerCase()]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Category already exists" });
    }
    console.error("Error creating category:", err);
    res.status(500).json({ error: "Failed to create category" });
  }
};

// ======================================================
// UPDATE category (ONLY if owned by user)
// ======================================================
export const updateCategory = async (req, res) => {
  const userId = req.user.id;
  const categoryId = req.params.id;
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE categories
       SET name = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [name.trim().toLowerCase(), categoryId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ error: "Failed to update category" });
  }
};

// ======================================================
// DISABLE category (soft delete, USER-SCOPED)
// ======================================================
export const disableCategory = async (req, res) => {
  const userId = req.user.id;
  const categoryId = req.params.id;

  try {
    const { rows } = await pool.query(
      `UPDATE categories
       SET is_active = FALSE
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [categoryId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category disabled", category: rows[0] });
  } catch (err) {
    console.error("Error disabling category:", err);
    res.status(500).json({ error: "Failed to disable category" });
  }
};

// ======================================================
// ENABLE category (USER-SCOPED)
// ======================================================
export const enableCategory = async (req, res) => {
  const userId = req.user.id;
  const categoryId = req.params.id;

  try {
    const { rows } = await pool.query(
      `UPDATE categories
       SET is_active = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [categoryId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category enabled", category: rows[0] });
  } catch (err) {
    console.error("Error enabling category:", err);
    res.status(500).json({ error: "Failed to enable category" });
  }
};
