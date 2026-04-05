-- Finance Dashboard Tables
-- Run this in Supabase SQL Editor after 01-create-tables.sql

-- ─────────────────────────────────────────────────────
-- 1. Finance Contexts (personal / agency per user)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL CHECK (name IN ('personal', 'agency')),
  label text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE finance_contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own contexts"
  ON finance_contexts FOR ALL
  USING (auth.uid() = user_id);

-- Seed default contexts for new users via trigger
CREATE OR REPLACE FUNCTION create_default_finance_contexts()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO finance_contexts (user_id, name, label) VALUES
    (NEW.id, 'personal', 'Personal'),
    (NEW.id, 'agency', 'Agencia');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_finance
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_finance_contexts();

-- ─────────────────────────────────────────────────────
-- 2. Categories
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  context text NOT NULL DEFAULT 'personal',
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  color text DEFAULT '#6366f1',
  icon text DEFAULT 'tag',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own categories"
  ON finance_categories FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_finance_categories_user ON finance_categories(user_id, context);

-- ─────────────────────────────────────────────────────
-- 3. Transactions (single source of truth)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  context text NOT NULL DEFAULT 'personal',
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(15, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'ARS',
  description text,
  category_id uuid REFERENCES finance_categories(id) ON DELETE SET NULL,
  source text NOT NULL CHECK (source IN ('mercadopago', 'binance', 'bna', 'iol', 'cocos', 'manual')),
  source_id text,           -- External ID for deduplication
  date timestamptz NOT NULL,
  metadata jsonb,           -- Raw response from provider
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, source, source_id)  -- Prevent duplicate imports
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_context ON transactions(user_id, context);
CREATE INDEX idx_transactions_source ON transactions(user_id, source);

-- ─────────────────────────────────────────────────────
-- 4. Integrations (external API credentials)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL CHECK (provider IN ('binance', 'iol', 'cocos', 'mercadopago')),
  access_token text,
  refresh_token text,
  api_key text,
  api_secret text,
  extra jsonb,              -- Extra provider-specific data
  last_sync timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'error', 'disconnected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, provider)
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own integrations"
  ON integrations FOR ALL
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────
-- 5. Portfolio Assets (investment snapshots)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL CHECK (provider IN ('binance', 'iol', 'cocos', 'manual')),
  asset text NOT NULL,      -- BTC, ETH, AAPL, GGAL, etc.
  quantity numeric(20, 8) NOT NULL DEFAULT 0,
  avg_price numeric(15, 4),
  current_price numeric(15, 4),
  currency text NOT NULL DEFAULT 'USD',
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, provider, asset)
);

ALTER TABLE portfolio_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own portfolio"
  ON portfolio_assets FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_portfolio_user_provider ON portfolio_assets(user_id, provider);
