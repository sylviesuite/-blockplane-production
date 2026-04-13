-- ============================================================
-- Green Index — Unified Product Schema
-- green_index/schema/green_products.sql
--
-- Reconciled from:
--   verified_products_supabase_20250630_181004.sql  (products table, JSON blobs)
--   enhanced_verified_products.sql                  (green_products table, dimensional)
--
-- Decision: dimensional model. Certifications are flat boolean
-- flags + shared metadata columns. No JSON blobs.
-- ============================================================

-- Drop legacy tables if running a migration
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS green_products CASCADE;

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE verification_status_enum AS ENUM (
    'verified',
    'pending',
    'failed',
    'expired',
    'unverified'
);

CREATE TYPE sustainability_grade_enum AS ENUM (
    'A+', 'A', 'A-',
    'B+', 'B', 'B-',
    'C+', 'C', 'C-',
    'D', 'F'
);

-- ============================================================
-- MAIN TABLE
-- ============================================================

CREATE TABLE green_products (

    -- Identity
    product_id              TEXT PRIMARY KEY,

    -- Product Info
    product_name            TEXT NOT NULL,
    brand                   TEXT,
    category                TEXT NOT NULL,
    subcategory             TEXT,
    material                TEXT,
    description             TEXT,
    price_usd               NUMERIC(10, 2)  CHECK (price_usd >= 0),

    -- Environmental Metrics (source: Energy Star DB, EPDs, etc.)
    carbon_impact_kg        NUMERIC(10, 4),
    water_use_liters        NUMERIC(10, 2),

    -- Dimensional Scores — 0 to 10
    ethical_score           NUMERIC(4, 1)   CHECK (ethical_score        BETWEEN 0 AND 10),
    circularity_score       NUMERIC(4, 1)   CHECK (circularity_score    BETWEEN 0 AND 10),
    health_score            NUMERIC(4, 1)   CHECK (health_score         BETWEEN 0 AND 10),
    durability_score        NUMERIC(4, 1)   CHECK (durability_score     BETWEEN 0 AND 10),

    -- Aggregate Scoring
    sustainability_score    NUMERIC(5, 1)   CHECK (sustainability_score BETWEEN 0 AND 100),
    sustainability_grade    sustainability_grade_enum,
    confidence_score        NUMERIC(4, 3)   CHECK (confidence_score     BETWEEN 0 AND 1),

    -- Certification Flags (one column per known standard)
    cert_energy_star        BOOLEAN NOT NULL DEFAULT FALSE,
    cert_usda_organic       BOOLEAN NOT NULL DEFAULT FALSE,
    cert_gots               BOOLEAN NOT NULL DEFAULT FALSE,   -- Global Organic Textile Standard
    cert_green_seal         BOOLEAN NOT NULL DEFAULT FALSE,
    cert_cosmos             BOOLEAN NOT NULL DEFAULT FALSE,
    cert_fsc                BOOLEAN NOT NULL DEFAULT FALSE,
    cert_greenguard         BOOLEAN NOT NULL DEFAULT FALSE,

    -- Certification Metadata (primary / most recent)
    cert_number             TEXT,
    certification_date      DATE,
    certifying_body         TEXT,            -- e.g. "CCOF", "Control Union", "Ecocert"

    -- Standard-Specific Scalars (only populate when flag is TRUE)
    energy_star_score       NUMERIC(5, 1)   CHECK (energy_star_score    BETWEEN 0 AND 100),
    annual_energy_use_kwh   NUMERIC(10, 2)  CHECK (annual_energy_use_kwh >= 0),
    organic_pct             NUMERIC(5, 2)   CHECK (organic_pct          BETWEEN 0 AND 100),
    green_seal_standard     TEXT,            -- e.g. "GS-37", "GS-50"

    -- Verification Provenance
    verification_status     verification_status_enum NOT NULL DEFAULT 'unverified',
    verification_source     TEXT,            -- e.g. "Energy Star Database", "USDA Organic Database"
    last_verified           TIMESTAMPTZ,

    -- Timestamps
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Query patterns: filter by category, brand, cert, score, status
CREATE INDEX idx_gp_category         ON green_products (category);
CREATE INDEX idx_gp_brand            ON green_products (brand);
CREATE INDEX idx_gp_verification     ON green_products (verification_status);
CREATE INDEX idx_gp_sustainability   ON green_products (sustainability_score DESC NULLS LAST);

-- Partial indexes on cert flags — only index rows where true
CREATE INDEX idx_gp_cert_energy_star ON green_products (cert_energy_star) WHERE cert_energy_star = TRUE;
CREATE INDEX idx_gp_cert_usda        ON green_products (cert_usda_organic) WHERE cert_usda_organic = TRUE;
CREATE INDEX idx_gp_cert_gots        ON green_products (cert_gots)         WHERE cert_gots = TRUE;
CREATE INDEX idx_gp_cert_green_seal  ON green_products (cert_green_seal)   WHERE cert_green_seal = TRUE;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_green_products_updated_at
BEFORE UPDATE ON green_products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- VIEW: verified + scored products (portal-ready)
-- ============================================================

CREATE VIEW green_products_scored AS
SELECT
    product_id,
    product_name,
    brand,
    category,
    subcategory,
    description,
    sustainability_score,
    sustainability_grade,
    confidence_score,
    ethical_score,
    circularity_score,
    health_score,
    durability_score,
    carbon_impact_kg,
    water_use_liters,
    cert_energy_star,
    cert_usda_organic,
    cert_gots,
    cert_green_seal,
    cert_cosmos,
    cert_fsc,
    cert_greenguard,
    certification_date,
    certifying_body,
    verification_status,
    verification_source,
    last_verified
FROM green_products
WHERE verification_status = 'verified'
  AND sustainability_score IS NOT NULL
ORDER BY sustainability_score DESC;
