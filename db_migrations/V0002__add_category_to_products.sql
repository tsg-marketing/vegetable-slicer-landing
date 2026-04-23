ALTER TABLE daribo_products ADD COLUMN IF NOT EXISTS category_id VARCHAR(64);
ALTER TABLE daribo_products ADD COLUMN IF NOT EXISTS category_name TEXT;

CREATE INDEX IF NOT EXISTS idx_daribo_products_category_id ON daribo_products(category_id);

CREATE TABLE IF NOT EXISTS daribo_categories (
    category_id VARCHAR(64) PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id VARCHAR(64),
    updated_at TIMESTAMP DEFAULT NOW()
);