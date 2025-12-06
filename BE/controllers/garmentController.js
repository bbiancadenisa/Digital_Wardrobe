import pool from "../db/index.js";
import cloudinary from "../services/cloudinary.js";

const uploadToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "digital-wardrobe" },
      (err, result) => (err ? reject(err) : resolve(result)));
    stream.end(fileBuffer);
  });

export const listGarments = async (req, res) => {
  const { q, category_id, style_id, season_id, color } = req.query;
  const where = [];
  const params = [];
  if (q) { params.push(`%${q}%`); where.push(`g.name ILIKE $${params.length}`); }
  if (category_id) { params.push(category_id); where.push(`g.category_id=$${params.length}`); }
  if (style_id)    { params.push(style_id);    where.push(`g.style_id=$${params.length}`); }
  if (season_id)   { params.push(season_id);   where.push(`g.season_id=$${params.length}`); }
  if (color)       { params.push(color);       where.push(`g.color ILIKE $${params.length}`); }

  const sql = `
    SELECT g.*, c.name AS category_name, s.name AS style_name, se.name AS season_name
    FROM garments g
    LEFT JOIN categories c ON c.id=g.category_id
    LEFT JOIN styles s     ON s.id=g.style_id
    LEFT JOIN seasons se   ON se.id=g.season_id
    WHERE g.user_id=$1 ${where.length ? " AND " + where.join(" AND ") : ""}
    ORDER BY g.created_at DESC
  `;
  const { rows } = await pool.query(sql, [req.user.id, ...params]);
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
  const { name, category_id, style_id, season_id, color, environment, material } = req.body;

  let image_url = null;
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer);
    image_url = result.secure_url;
  }

  const { rows } = await pool.query(
    `INSERT INTO garments
     (user_id, category_id, style_id, season_id, name, image_url, color, environment, material)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [req.user.id, category_id, style_id, season_id, name, image_url, color, environment, material]
  );
  res.status(201).json(rows[0]);
};

export const updateGarment = async (req, res) => {
  const { name, category_id, style_id, season_id, color, environment, material } = req.body;
  let image_url = req.body.image_url || null;

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer);
    image_url = result.secure_url;
  }

  const { rows } = await pool.query(
    `UPDATE garments SET
      name=$1, category_id=$2, style_id=$3, season_id=$4,
      image_url=$5, color=$6, environment=$7, material=$8
     WHERE id=$9 AND user_id=$10
     RETURNING *`,
    [name, category_id, style_id, season_id, image_url, color, environment, material, req.params.id, req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
};

export const deleteGarment = async (req, res) => {
  const r = await pool.query(`DELETE FROM garments WHERE id=$1 AND user_id=$2`, [req.params.id, req.user.id]);
  if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
};
