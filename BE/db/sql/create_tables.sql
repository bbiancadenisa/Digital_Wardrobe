-- =============================================================
-- DIGITAL WARDROBE DATABASE SCHEMA
-- Description:
-- This SQL script defines the database structure for the
-- "Digital Wardrobe" web application.
-- It includes entities for users, garments, outfit creation,
-- and lookup tables for controlled attributes (style, season).
-- =============================================================

-- =============================================================
-- 1. USERS TABLE
-- Stores registered users of the application.
-- =============================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Stores information about registered users, including login credentials.';
COMMENT ON COLUMN users.username IS 'Unique username selected by the user.';
COMMENT ON COLUMN users.email IS 'Unique email used for authentication.';
COMMENT ON COLUMN users.password_hash IS 'Encrypted password (using bcrypt).';
COMMENT ON COLUMN users.created_at IS 'Date and time when the account was created.';

-- =============================================================
-- 2. CATEGORIES TABLE
-- Defines general garment categories (e.g., t-shirt, jeans, jacket).
-- =============================================================
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

COMMENT ON TABLE categories IS 'Defines clothing categories such as T-shirt, jeans, dress, or jacket.';

-- =============================================================
-- 3. STYLES TABLE
-- Lookup table for fashion styles.
-- =============================================================
CREATE TABLE styles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

COMMENT ON TABLE styles IS 'Lookup table defining clothing styles (casual, office, elegant, sport, etc.).';

-- =============================================================
-- 4. SEASONS TABLE
-- Lookup table for seasons (used to classify garments).
-- =============================================================
CREATE TABLE seasons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

COMMENT ON TABLE seasons IS 'Lookup table defining seasons (summer, winter, autumn, etc.).';

-- =============================================================
-- 5. GARMENTS TABLE
-- Represents individual clothing items owned by a user.
-- Linked to categories, styles, and seasons.
-- =============================================================
CREATE TABLE garments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id),
  style_id INT REFERENCES styles(id),
  season_id INT REFERENCES seasons(id),
  name VARCHAR(100),
  image_url TEXT,
  color VARCHAR(30),
  environment VARCHAR(30),
  material VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_environment CHECK (environment IN ('indoor', 'outdoor'))
);

COMMENT ON TABLE garments IS 'Represents an individual piece of clothing added by a user.';
COMMENT ON COLUMN garments.image_url IS 'Link to the image stored in Cloudinary or another storage service.';
COMMENT ON COLUMN garments.environment IS 'Specifies if the garment is for indoor or outdoor use.';

-- =============================================================
-- 6. OUTFITS TABLE
-- Represents a combination of garments created by a user.
-- =============================================================
CREATE TABLE outfits (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE outfits IS 'Represents a saved outfit composed of multiple garments.';

-- =============================================================
-- 7. OUTFIT_ITEMS TABLE
-- Junction table to link garments and outfits (many-to-many).
-- =============================================================
CREATE TABLE outfit_items (
  outfit_id INT REFERENCES outfits(id) ON DELETE CASCADE,
  garment_id INT REFERENCES garments(id) ON DELETE CASCADE,
  PRIMARY KEY (outfit_id, garment_id)
);

COMMENT ON TABLE outfit_items IS 'Junction table connecting outfits and garments (many-to-many relationship).';

-- =============================================================
-- 8. INDEXES (Performance Optimization)
-- =============================================================
CREATE INDEX idx_garments_user_id ON garments(user_id);
CREATE INDEX idx_garments_category_id ON garments(category_id);
CREATE INDEX idx_garments_style_id ON garments(style_id);
CREATE INDEX idx_garments_season_id ON garments(season_id);
CREATE INDEX idx_outfits_user_id ON outfits(user_id);

-- =============================================================
-- END OF SCHEMA
-- =============================================================