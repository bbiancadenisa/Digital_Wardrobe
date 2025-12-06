import pool from "../db/index.js";

export const listOutfits = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM outfits WHERE user_id=$1 ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
};

export const createOutfit = async (req, res) => {
  const { name, garment_ids = [] } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO outfits (user_id, name) VALUES ($1,$2) RETURNING id, name, created_at`,
      [req.user.id, name]
    );
    const outfit = rows[0];

    for (const gid of garment_ids) {
      await client.query(
        `INSERT INTO outfit_items (outfit_id, garment_id) VALUES ($1,$2)`,
        [outfit.id, gid]
      );
    }
    await client.query("COMMIT");
    res.status(201).json(outfit);
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: e.message });
  } finally {
    client.release();
  }
};

export const deleteOutfit = async (req, res) => {
  const r = await pool.query(
    `DELETE FROM outfits WHERE id=$1 AND user_id=$2`,
    [req.params.id, req.user.id]
  );
  if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
};
