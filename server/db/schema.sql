-- CAA AI Product Finder database schema.
--
-- Setup/reset script: running this deletes existing CAA tables and data.
-- Use only with an empty or disposable database, or after backing up data.
-- Committing this file does not execute it.

DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS compatibility CASCADE;
DROP TABLE IF EXISTS product_links CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS vehicle_models CASCADE;
DROP TABLE IF EXISTS brands CASCADE;

CREATE TABLE brands (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-z0-9-]{1,40}$'),
  name TEXT NOT NULL UNIQUE CHECK (length(name) BETWEEN 1 AND 60),
  logo_url TEXT
);

CREATE TABLE vehicle_models (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-z0-9-]{1,60}$'),
  brand_id TEXT NOT NULL REFERENCES brands (id) ON DELETE RESTRICT,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 60),
  variant TEXT CHECK (variant IS NULL OR length(variant) <= 60),
  body_type TEXT NOT NULL CHECK (
    body_type IN ('sedan', 'hatch', 'suv', 'pickup', 'mpv', 'mini', 'offroad')
  ),
  -- These years populate the selector, not product compatibility.
  year_from INT NOT NULL CHECK (year_from BETWEEN 1980 AND 2100),
  year_to INT NOT NULL CHECK (year_to BETWEEN 1980 AND 2100),
  aliases TEXT[] NOT NULL DEFAULT '{}',
  reference_label TEXT NOT NULL,
  reference_year INT CHECK (
    reference_year IS NULL OR reference_year BETWEEN 1980 AND 2100
  ),
  sketchfab_url TEXT CHECK (
    sketchfab_url IS NULL OR sketchfab_url ~ '^https://'
  ),
  model_file TEXT,
  model_title TEXT,
  model_author TEXT,
  model_author_url TEXT,
  model_license TEXT,
  model_license_url TEXT,
  CHECK (year_to >= year_from)
);

CREATE INDEX vehicle_models_brand_idx
  ON vehicle_models (brand_id);

CREATE TABLE products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  category TEXT NOT NULL CHECK (
    category IN (
      'Evaporator', 'Cabin Filter', 'Air Filter',
      'Fuel Filter', 'Blower Motor', 'Compressor'
    )
  ),
  part_number TEXT CHECK (
    part_number IS NULL OR length(part_number) <= 60
  ),
  description TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 2000),
  -- Listed means sold by CAA; it does not confirm current stock.
  listed BOOLEAN NOT NULL DEFAULT TRUE,
  stock_status TEXT NOT NULL DEFAULT 'unconfirmed' CHECK (
    stock_status IN ('unconfirmed', 'in_stock', 'out_of_stock')
  ),
  stock_checked_on DATE,
  price_php NUMERIC(10, 2) CHECK (price_php IS NULL OR price_php >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (stock_status = 'unconfirmed' OR stock_checked_on IS NOT NULL)
);

CREATE TABLE product_links (
  product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL CHECK (
    marketplace IN ('lazada', 'shopee', 'tiktok')
  ),
  url TEXT NOT NULL CHECK (url ~ '^https://' AND length(url) <= 2000),
  PRIMARY KEY (product_id, marketplace)
);

-- Product fit by model and year.
-- A null ending year means onward; both years null means not recorded.
-- Only confirmed records may be shown as compatible matches.
CREATE TABLE compatibility (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  model_id TEXT NOT NULL REFERENCES vehicle_models (id) ON DELETE CASCADE,
  year_from INT CHECK (
    year_from IS NULL OR year_from BETWEEN 1980 AND 2100
  ),
  year_to INT CHECK (
    year_to IS NULL OR year_to BETWEEN 1980 AND 2100
  ),
  status TEXT NOT NULL CHECK (
    status IN ('confirmed', 'needs_verification')
  ),
  source TEXT NOT NULL DEFAULT '' CHECK (length(source) <= 1000),
  CHECK (year_to IS NULL OR year_from IS NOT NULL),
  CHECK (year_to IS NULL OR year_to >= year_from),
  CHECK (status <> 'confirmed' OR year_from IS NOT NULL)
);

CREATE INDEX compatibility_model_idx
  ON compatibility (model_id, status);

CREATE INDEX compatibility_product_idx
  ON compatibility (product_id);

CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  email TEXT NOT NULL UNIQUE CHECK (
    email = lower(email) AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'admin')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Store token hashes rather than raw login tokens.
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sessions_user_idx
  ON sessions (user_id);
