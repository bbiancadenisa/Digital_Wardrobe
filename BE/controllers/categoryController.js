import pool from "../db/index.js";

// ======================================================
// GET all active categories
// ======================================================
export const getCategories = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name FROM categories WHERE is_active = TRUE ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// ======================================================
// CREATE category
// ======================================================
export const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [name.trim()]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ error: "Failed to create category" });
  }
};

// ======================================================
// UPDATE category
// ======================================================
export const updateCategory = async (req, res) => {
  const categoryId = req.params.id;
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const { rows } = await pool.query(
      "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
      [name.trim(), categoryId]
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
// DISABLE category (soft delete)
// ======================================================
export const disableCategory = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const { rows } = await pool.query(
      "UPDATE categories SET is_active = FALSE WHERE id = $1 RETURNING *",
      [categoryId]
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
// ENABLE category
// ======================================================
export const enableCategory = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const { rows } = await pool.query(
      "UPDATE categories SET is_active = TRUE WHERE id = $1 RETURNING *",
      [categoryId]
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
