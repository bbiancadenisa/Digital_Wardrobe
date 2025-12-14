-- =============================================================
-- DIGITAL WARDROBE DATABASE SCHEMA
-- Description:
-- This SQL script defines the database structure for the
-- "Digital Wardrobe" web application.
-- The schema supports multi-user data isolation, outfit creation,
-- and soft deletion for controlled attributes.
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
-- User-specific garment categories (soft deletable).
-- =============================================================
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, name)
);

COMMENT ON TABLE categories IS
'Defines clothing categories (e.g., t-shirt, jeans, jacket) owned by individual users.
Categories are soft-deletable using the is_active flag.';

COMMENT ON COLUMN categories.user_id IS 'Owner of the category.';
COMMENT ON COLUMN categories.is_active IS 'Indicates whether the category is active or disabled.';

-- =============================================================
-- 3. STYLES TABLE
-- User-specific fashion styles (soft deletable).
-- =============================================================
CREATE TABLE styles (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, name)
);

COMMENT ON TABLE styles IS
'Defines clothing styles (casual, office, elegant, etc.) owned by individual users.
Styles are soft-deletable using the is_active flag.';

COMMENT ON COLUMN styles.user_id IS 'Owner of the style.';
COMMENT ON COLUMN styles.is_active IS 'Indicates whether the style is active or disabled.';

-- =============================================================
-- 4. SEASONS TABLE
-- Lookup table for seasons (global, controlled values).
-- =============================================================
CREATE TABLE seasons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

COMMENT ON TABLE seasons IS
'Lookup table defining seasons (spring, summer, autumn, winter, all-season).';

-- =============================================================
-- 5. GARMENTS TABLE
-- Represents individual clothing items owned by a user.
-- =============================================================
CREATE TABLE garments (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id),
  style_id INT NOT NULL REFERENCES styles(id),
  season_id INT REFERENCES seasons(id),
  name VARCHAR(100) NOT NULL,
  image_url TEXT,
  color VARCHAR(30),
  environment VARCHAR(30),
  material VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_environment CHECK (environment IN ('indoor', 'outdoor', 'both'))
);

COMMENT ON TABLE garments IS
'Represents an individual piece of clothing added by a user.';

COMMENT ON COLUMN garments.image_url IS
'Link to the image stored in Cloudinary or another storage service.';

COMMENT ON COLUMN garments.environment IS
'Specifies if the garment is suitable for indoor use, outdoor use, or both.';

-- =============================================================
-- 6. OUTFITS TABLE
-- Represents a combination of garments created by a user.
-- =============================================================
CREATE TABLE outfits (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE outfits IS
'Represents a saved outfit composed of multiple garments, optionally including an outfit image.';

-- =============================================================
-- 7. OUTFIT_ITEMS TABLE
-- Junction table linking outfits and garments (many-to-many).
-- =============================================================
CREATE TABLE outfit_items (
  outfit_id INT NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  garment_id INT NOT NULL REFERENCES garments(id) ON DELETE CASCADE,
  PRIMARY KEY (outfit_id, garment_id)
);

COMMENT ON TABLE outfit_items IS
'Junction table connecting outfits and garments (many-to-many relationship).';

-- =============================================================
-- 8. FAVORITES TABLE
-- Stores user-favorited outfits.
-- =============================================================
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outfit_id INT NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, outfit_id)
);

COMMENT ON TABLE favorites IS
'Stores outfits marked as favorites by users. Ensures uniqueness per user.';

-- =============================================================
-- 9. INDEXES (Performance Optimization)
-- =============================================================
CREATE INDEX idx_categories_user_id   ON categories(user_id);
CREATE INDEX idx_styles_user_id       ON styles(user_id);

CREATE INDEX idx_garments_user_id     ON garments(user_id);
CREATE INDEX idx_garments_category_id ON garments(category_id);
CREATE INDEX idx_garments_style_id    ON garments(style_id);
CREATE INDEX idx_garments_season_id   ON garments(season_id);

CREATE INDEX idx_outfits_user_id      ON outfits(user_id);

CREATE INDEX idx_favorites_user_id    ON favorites(user_id);
CREATE INDEX idx_favorites_outfit_id  ON favorites(outfit_id);

-- =============================================================
-- END OF SCHEMA
-- =============================================================
