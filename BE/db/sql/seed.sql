-- =============================================================
-- DEFAULT VALUES (SEED DATA)
-- Populates lookup tables with default values.
-- =============================================================

-- Default clothing styles
INSERT INTO styles (name) VALUES
('casual'),
('office'),
('elegant'),
('sport'),
('hiking'),
('party');

-- Default seasons
INSERT INTO seasons (name) VALUES
('spring'),
('summer'),
('autumn'),
('winter'),
('all-season');

-- Default categories
INSERT INTO categories (name) VALUES
('t-shirt'),
('jeans'),
('dress'),
('jacket'),
('pullover'),
('skirt'),
('shoes');