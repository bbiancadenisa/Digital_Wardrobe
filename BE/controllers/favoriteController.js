import pool from "../db/index.js";

// ======================================================
// ADD FAVORITE
// ======================================================
export const addFavorite = async (req, res) => {
  const userId = req.user.id;
  const outfitId = req.params.outfit_id;

  try {
    const { rows } = await pool.query(
      `INSERT INTO favorites (user_id, outfit_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, outfit_id) DO NOTHING
       RETURNING *`,
      [userId, outfitId]
    );

    if (rows.length === 0) {
      return res.status(200).json({ message: "Already in favorites" });
    }

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
      // Get favorite outfit IDs
      const favRes = await pool.query(
        `SELECT o.id, o.name, o.created_at
         FROM favorites f
         JOIN outfits o ON o.id = f.outfit_id
         WHERE f.user_id = $1
         ORDER BY f.created_at DESC`,
        [userId]
      );
  
      const outfits = favRes.rows;
  
      if (outfits.length === 0) {
        return res.json([]);
      }
  
      const outfitIds = outfits.map(o => o.id);
  
      const garmentRes = await pool.query(
        `SELECT oi.outfit_id, g.*
         FROM outfit_items oi
         JOIN garments g ON g.id = oi.garment_id
         WHERE oi.outfit_id = ANY($1)`,
        [outfitIds]
      );
  
      const garmentRows = garmentRes.rows;
  
      const favoritesWithGarments = outfits.map(outfit => ({
        ...outfit,
        garments: garmentRows.filter(g => g.outfit_id === outfit.id)
      }));
  
      res.json(favoritesWithGarments);
  
    } catch (err) {
      console.error("Error fetching favorites:", err);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  };
  