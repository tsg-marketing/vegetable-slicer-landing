CREATE TABLE IF NOT EXISTS daribo_products (
    id SERIAL PRIMARY KEY,
    offer_id VARCHAR(64) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    url TEXT,
    price INTEGER DEFAULT 0,
    description TEXT,
    brand VARCHAR(128),
    available BOOLEAN DEFAULT TRUE,
    pictures JSONB DEFAULT '[]'::jsonb,
    params JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daribo_products_available ON daribo_products(available);
CREATE INDEX IF NOT EXISTS idx_daribo_products_offer_id ON daribo_products(offer_id);