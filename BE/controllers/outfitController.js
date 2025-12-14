import pool from "../db/index.js";

// ======================================================
// GET ALL OUTFITS FOR USER
// ======================================================
export const getOutfits = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch all outfits for the user
    const outfitRes = await pool.query(
      `SELECT id, name, created_at
       FROM outfits
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const outfits = outfitRes.rows;

    if (outfits.length === 0) {
      return res.json([]);
    }

    // Fetch all garments for these outfits in a single query
    const outfitIds = outfits.map((o) => o.id);

    const garmentRes = await pool.query(
      `SELECT oi.outfit_id, g.*
       FROM outfit_items oi
       JOIN garments g ON g.id = oi.garment_id
       WHERE oi.outfit_id = ANY($1)`,
      [outfitIds]
    );

    const garmentRows = garmentRes.rows;

    // Attach garments to their outfits
    const outfitsWithGarments = outfits.map((outfit) => ({
      ...outfit,
      garments: garmentRows.filter((g) => g.outfit_id === outfit.id),
    }));

    res.json(outfitsWithGarments);
  } catch (err) {
    console.error("Error fetching outfits:", err);
    res.status(500).json({ error: "Failed to fetch outfits" });
  }
};

// ======================================================
// CREATE OUTFIT
// ======================================================
export const createOutfit = async (req, res) => {
  const userId = req.user.id;
  let { name, garment_ids } = req.body;

  console.log("Received data:", { name, garment_ids, hasFile: !!req.file });

  // Parse garment_ids if it comes as a JSON string
  if (typeof garment_ids === "string") {
    try {
      garment_ids = JSON.parse(garment_ids);
    } catch (e) {
      console.error("Failed to parse garment_ids:", e);
      return res.status(400).json({ error: "Invalid garment_ids format" });
    }
  }

  if (!name?.trim()) {
    return res.status(400).json({ error: "Outfit name is required" });
  }

  if (!Array.isArray(garment_ids) || garment_ids.length === 0) {
    return res
      .status(400)
      .json({ error: "At least one garment must be included" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insert outfit
    const outfitRes = await client.query(
      `INSERT INTO outfits (user_id, name) 
       VALUES ($1, $2) 
       RETURNING *`,
      [userId, name.trim()]
    );

    const outfit = outfitRes.rows[0];

    // Insert outfit_items
    const insertItemQuery =
      "INSERT INTO outfit_items (outfit_id, garment_id) VALUES ($1, $2)";

    for (const garmentId of garment_ids) {
      await client.query(insertItemQuery, [outfit.id, garmentId]);
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Outfit created successfully",
      outfit_id: outfit.id,
      outfit,
      garments: garment_ids,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating outfit:", err);
    res
      .status(500)
      .json({ error: "Failed to create outfit", details: err.message });
  } finally {
    client.release();
  }
};

// ======================================================
// GET SINGLE OUTFIT + GARMENTS
// ======================================================
export const getOutfitById = async (req, res) => {
  const userId = req.user.id;
  const outfitId = req.params.id;

  try {
    // Check outfit ownership
    const outfitRes = await pool.query(
      "SELECT * FROM outfits WHERE id = $1 AND user_id = $2",
      [outfitId, userId]
    );

    if (outfitRes.rows.length === 0) {
      return res.status(404).json({ error: "Outfit not found" });
    }

    const outfit = outfitRes.rows[0];

    // Fetch included garments
    const garmentRes = await pool.query(
      `SELECT g.*, c.name AS category_name
       FROM garments g
       JOIN outfit_items oi ON g.id = oi.garment_id
       LEFT JOIN categories c ON c.id = g.category_id
       WHERE oi.outfit_id = $1`,
      [outfitId]
    );

    res.json({
      ...outfit,
      garments: garmentRes.rows,
    });
  } catch (err) {
    console.error("Error fetching outfit:", err);
    res.status(500).json({ error: "Failed to fetch outfit" });
  }
};

// ======================================================
// DELETE OUTFIT
// ======================================================
export const deleteOutfit = async (req, res) => {
  const userId = req.user.id;
  const outfitId = req.params.id;

  try {
    // Delete only if owned by user
    const result = await pool.query(
      "DELETE FROM outfits WHERE id = $1 AND user_id = $2",
      [outfitId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Outfit not found" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting outfit:", err);
    res.status(500).json({ error: "Failed to delete outfit" });
  }
};
