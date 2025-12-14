import pool from "../db/index.js";
import cloudinary from "../services/cloudinary.js";

const uploadToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "digital-wardrobe" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(fileBuffer);
  });

export const listGarments = async (req, res) => {
  const { q, category_id, style_id, season_id, color } = req.query;
  const where = [];
  const params = [req.user.id];
  if (q) {
    params.push(`%${q}%`);
    where.push(`g.name ILIKE $${params.length}`);
  }
  if (category_id) {
    params.push(category_id);
    where.push(`g.category_id=$${params.length}`);
  }
  if (style_id) {
    params.push(style_id);
    where.push(`g.style_id=$${params.length}`);
  }
  if (season_id) {
    params.push(season_id);
    where.push(`g.season_id=$${params.length}`);
  }
  if (color) {
    params.push(color);
    where.push(`g.color ILIKE $${params.length}`);
  }

  const sql = `
    SELECT g.*, c.name AS category_name, s.name AS style_name, se.name AS season_name
    FROM garments g
    LEFT JOIN categories c ON c.id=g.category_id
    LEFT JOIN styles s     ON s.id=g.style_id
    LEFT JOIN seasons se   ON se.id=g.season_id
    WHERE g.user_id=$1 ${where.length ? " AND " + where.join(" AND ") : ""}
    ORDER BY g.created_at DESC
  `;
  const { rows } = await pool.query(sql, params);
  res.json(rows);
};

export const getGarment = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM garments WHERE id=$1 AND user_id=$2`,
    [req.params.id, req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
};

export const createGarment = async (req, res) => {
  try {
    const {
      name,
      category_id,
      style_id,
      season_id,
      color,
      environment,
      material,
    } = req.body;

    let image_url = null;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        image_url = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        // Continue without image if Cloudinary fails
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO garments
       (user_id, category_id, style_id, season_id, name, image_url, color, environment, material)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        req.user.id,
        category_id,
        style_id,
        season_id,
        name,
        image_url,
        color,
        environment,
        material,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating garment:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create garment" });
  }
};

// Update garment details, including optional image upload
export const updateGarment = async (req, res) => {
  const garmentId = req.params.id;
  const userId = req.user.id;

  const {
    name,
    category_id,
    style_id,
    season_id,
    color,
    environment,
    material,
  } = req.body;

  try {
    // Check if garment exists and belongs to this user
    const existing = await pool.query(
      `SELECT * FROM garments WHERE id = $1 AND user_id = $2`,
      [garmentId, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Garment not found" });
    }

    // Handle optional new image upload
    let image_url = existing.rows[0].image_url;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      image_url = result.secure_url;
    }

    // Perform the update
    const { rows } = await pool.query(
      `UPDATE garments
       SET name = $1,
           category_id = $2,
           style_id = $3,
           season_id = $4,
           color = $5,
           environment = $6,
           material = $7,
           image_url = $8
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [
        name || existing.rows[0].name,
        category_id || existing.rows[0].category_id,
        style_id || existing.rows[0].style_id,
        season_id || existing.rows[0].season_id,
        color || existing.rows[0].color,
        environment || existing.rows[0].environment,
        material || existing.rows[0].material,
        image_url,
        garmentId,
        userId,
      ]
    );

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update garment" });
  }
};

// Delete a garment
export const deleteGarment = async (req, res) => {
  const garmentId = req.params.id;
  const userId = req.user.id;

  try {
    // Check if garment is used in any outfit
    const checkRes = await pool.query(
      `SELECT DISTINCT outfit_id FROM outfit_items WHERE garment_id = $1`,
      [garmentId]
    );

    if (checkRes.rows.length > 0) {
      return res.status(400).json({
        error:
          "This garment cannot be deleted because it is used in one or more outfits.",
      });
    }

    // Delete garment only if user owns it
    const deleteRes = await pool.query(
      `DELETE FROM garments WHERE id = $1 AND user_id = $2`,
      [garmentId, userId]
    );

    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ error: "Garment not found" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting garment:", err);
    res.status(500).json({ error: "Failed to delete garment" });
  }
};

export const createMultipleGarments = async (req, res) => {
  const userId = req.user.id;
  const garments = req.body.garments;

  if (!Array.isArray(garments) || garments.length === 0) {
    return res
      .status(400)
      .json({ error: "Please provide an array of garments." });
  }

  try {
    const inserted = [];

    for (const g of garments) {
      const {
        name,
        category_id,
        style_id,
        season_id,
        environment,
        color,
        image_url,
      } = g;

      const result = await pool.query(
        `INSERT INTO garments
        (user_id, name, category_id, style_id, season_id, environment, color, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          userId,
          name,
          category_id,
          style_id,
          season_id,
          environment,
          color,
          image_url,
        ]
      );

      inserted.push(result.rows[0]);
    }

    res.json({ message: "Garments added successfully", garments: inserted });
  } catch (err) {
    console.error("Bulk insert error:", err);
    res.status(500).json({ error: "Failed to insert garments." });
  }
};
