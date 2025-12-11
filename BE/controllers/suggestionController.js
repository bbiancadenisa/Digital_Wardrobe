import pool from "../db/index.js";
import { CATEGORY_GROUPS } from "../constants/categoryGroups.js";

export const getSuggestions = async (req, res) => {
  const userId = req.user.id;

  // Extract user preference filters (optional)
  const {
    season = null,
    style = null,
    color = null,
    environment = null
  } = req.body;

  try {
    // ---------------------------------------------------------
    // 1. Get all garments for the user
    // ---------------------------------------------------------
    const { rows: garments } = await pool.query(
      `SELECT g.*, 
              LOWER(c.name) AS category_name, 
              LOWER(s.name) AS style_name, 
              LOWER(se.name) AS season_name
       FROM garments g
       LEFT JOIN categories c ON c.id = g.category_id
       LEFT JOIN styles s ON s.id = g.style_id
       LEFT JOIN seasons se ON se.id = g.season_id
       WHERE g.user_id = $1`,
      [userId]
    );

    if (garments.length < 2) {
      return res.status(400).json({
        error: "Not enough garments to generate suggestions. Add more to your wardrobe."
      });
    }

    // ---------------------------------------------------------
    // 2. Apply user filters (season, style, color, environment)
    // ---------------------------------------------------------
    let filteredGarments = garments;

    // SEASON FILTER — allow "all-season" to match anything
    if (season) {
      const requested = season.toLowerCase();
      filteredGarments = filteredGarments.filter(g =>
        g.season_name === requested || g.season_name === "all-season"
      );
    }

    // STYLE FILTER
    if (style) {
      const requested = style.toLowerCase();
      filteredGarments = filteredGarments.filter(
        g => g.style_name === requested
      );
    }

    // COLOR FILTER
    if (color) {
      const requested = color.toLowerCase();
      filteredGarments = filteredGarments.filter(
        g => g.color?.toLowerCase() === requested
      );
    }

    // ENVIRONMENT FILTER — allow "both" to match everything
    if (environment) {
      const requested = environment.toLowerCase();
      filteredGarments = filteredGarments.filter(g => {
        const env = g.environment?.toLowerCase();
        return env === requested || env === "both";
      });
    }

    if (filteredGarments.length < 2) {
      return res.status(400).json({
        error:
          "No garments match your selected filters. Try adjusting your criteria."
      });
    }

    // ---------------------------------------------------------
    // 3. Group garments into categories (tops, bottoms, dresses, etc.)
    // ---------------------------------------------------------
    const grouped = {
      tops: [],
      bottoms: [],
      dresses: [],
      outerwear: [],
      footwear: []
    };

    for (const g of filteredGarments) {
      const cat = g.category_name;

      if (CATEGORY_GROUPS.tops.includes(cat)) grouped.tops.push(g);
      else if (CATEGORY_GROUPS.bottoms.includes(cat)) grouped.bottoms.push(g);
      else if (CATEGORY_GROUPS.dresses.includes(cat)) grouped.dresses.push(g);
      else if (CATEGORY_GROUPS.outerwear.includes(cat)) grouped.outerwear.push(g);
      else if (CATEGORY_GROUPS.footwear.includes(cat)) grouped.footwear.push(g);
    }

    // Minimum required items
    if (
      grouped.tops.length === 0 &&
      grouped.dresses.length === 0
    ) {
      return res.status(400).json({
        error: "No tops or dresses available to create outfits."
      });
    }

    if (
      grouped.bottoms.length === 0 &&
      grouped.dresses.length === 0
    ) {
      return res.status(400).json({
        error:
          "No bottoms available and no dresses found. Add more garments to your wardrobe."
      });
    }

    if (grouped.footwear.length === 0) {
      return res.status(400).json({
        error:
          "You need at least one pair of shoes to generate outfit suggestions."
      });
    }

    // ---------------------------------------------------------
    // 4. Build suggestions
    // ---------------------------------------------------------
    const suggestions = [];

    // --- DRESS OUTFITS (dress + footwear + optional outerwear) ---
    for (const dress of grouped.dresses) {
      const shoes = grouped.footwear[0];

      const outfit = {
        outfit_name: `${dress.style_name} Dress Look`,
        garments: [dress, shoes]
      };

      // Add matching outerwear if exists
      const outer = grouped.outerwear.find(
        o => o.style_id === dress.style_id
      );
      if (outer) outfit.garments.push(outer);

      suggestions.push(outfit);
    }

    // --- TOP + BOTTOM + SHOES (+ OUTERWEAR) ---
    for (const top of grouped.tops) {
      for (const bottom of grouped.bottoms) {
        const shoes = grouped.footwear[0];
        if (!shoes) continue;

        const outfit = {
          outfit_name: `${top.style_name} Outfit`,
          garments: [top, bottom, shoes]
        };

        // Add matching outerwear
        const outer = grouped.outerwear.find(
          o => o.style_id === top.style_id
        );
        if (outer) outfit.garments.push(outer);

        suggestions.push(outfit);
      }
    }

    // ---------------------------------------------------------
    // 5. Handle zero suggestions
    // ---------------------------------------------------------
    if (suggestions.length === 0) {
      return res.status(400).json({
        error:
          "Could not generate any outfits based on your wardrobe and filters. Try adding more garments."
      });
    }

    // ---------------------------------------------------------
    // 6. Return up to 5 suggestions
    // ---------------------------------------------------------
    return res.json(suggestions.slice(0, 5));

  } catch (err) {
    console.error("Error generating suggestions:", err);
    res.status(500).json({ error: "Failed to generate suggestions." });
  }
};
