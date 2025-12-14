import pool from "../db/index.js";

// ======================================================
// ADD FAVORITE
// ======================================================
export const addFavorite = async (req, res) => {
  const userId = req.user.id;
  const outfitId = req.params.outfit_id;

  try {
    // Check if already exists
    const existing = await pool.query(
      `SELECT id FROM favorites WHERE user_id = $1 AND outfit_id = $2`,
      [userId, outfitId]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({ message: "Already in favorites" });
    }

    await pool.query(
      `INSERT INTO favorites (user_id, outfit_id) VALUES ($1, $2)`,
      [userId, outfitId]
    );

    res.status(201).json({ message: "Added to favorites" });
  } catch (err) {
    console.error("Error adding favorite:", err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
};

// ======================================================
// REMOVE FAVORITE
// ======================================================
export const removeFavorite = async (req, res) => {
  const userId = req.user.id;
  const outfitId = req.params.outfit_id;

  try {
    const result = await pool.query(
      "DELETE FROM favorites WHERE user_id = $1 AND outfit_id = $2",
      [userId, outfitId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Error removing favorite:", err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
};

// ======================================================
// GET ALL FAVORITE OUTFITS
// ======================================================
export const getFavorites = async (req, res) => {
  const userId = req.user.id;

  try {
    // Get favorite outfits
    const outfitFavRes = await pool.query(
      `SELECT f.id as favorite_id, f.outfit_id, f.created_at as favorited_at
         FROM favorites f
         WHERE f.user_id = $1 AND f.outfit_id IS NOT NULL
         ORDER BY f.created_at DESC`,
      [userId]
    );

    const outfitFavorites = outfitFavRes.rows;
    const results = [];

    // Get outfit details for each favorite
    for (const fav of outfitFavorites) {
      const outfitRes = await pool.query(
        `SELECT o.id, o.name, o.created_at
           FROM outfits o
           WHERE o.id = $1`,
        [fav.outfit_id]
      );

      if (outfitRes.rows.length > 0) {
        const outfit = outfitRes.rows[0];

        // Get garments for this outfit
        const garmentRes = await pool.query(
          `SELECT g.*
             FROM outfit_items oi
             JOIN garments g ON g.id = oi.garment_id
             WHERE oi.outfit_id = $1`,
          [outfit.id]
        );

        results.push({
          outfit_id: fav.outfit_id,
          outfit: {
            ...outfit,
            garments: garmentRes.rows,
          },
        });
      }
    }

    res.json(results);
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};
