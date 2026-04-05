-- Demo seed data for Finance Dashboard
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with your actual Supabase auth user UUID
-- Find it in Supabase → Authentication → Users

DO $$
DECLARE
  uid uuid := 'YOUR_USER_ID_HERE'::uuid;  -- ← Replace this
  cat_freelance uuid;
  cat_agencia uuid;
  cat_comisiones uuid;
  cat_servicios uuid;
  cat_sw uuid;
  cat_impuestos uuid;
  cat_suscripciones uuid;
  cat_inv uuid;
BEGIN

-- ─── Categories ───────────────────────────────────────────────
INSERT INTO finance_categories (user_id, context, name, type, color, icon) VALUES
  (uid, 'personal', 'Freelance',        'income',  '#34d399', 'briefcase'),
  (uid, 'personal', 'MercadoPago',      'income',  '#3b9afe', 'credit-card'),
  (uid, 'personal', 'Cripto',           'income',  '#f59e0b', 'trending-up'),
  (uid, 'personal', 'Impuestos',        'expense', '#f87171', 'file-text'),
  (uid, 'personal', 'Suscripciones',    'expense', '#a78bfa', 'repeat'),
  (uid, 'personal', 'Software',         'expense', '#60a5fa', 'code'),
  (uid, 'agency',   'Proyectos web',    'income',  '#34d399', 'globe'),
  (uid, 'agency',   'Comisiones',       'income',  '#818cf8', 'percent'),
  (uid, 'agency',   'Servicios',        'expense', '#f87171', 'tool'),
  (uid, 'agency',   'Inversión',        'expense', '#fb923c', 'trending-up')
RETURNING id INTO cat_freelance;

SELECT id INTO cat_freelance     FROM finance_categories WHERE user_id=uid AND name='Freelance';
SELECT id INTO cat_agencia       FROM finance_categories WHERE user_id=uid AND name='Proyectos web';
SELECT id INTO cat_comisiones    FROM finance_categories WHERE user_id=uid AND name='Comisiones';
SELECT id INTO cat_servicios     FROM finance_categories WHERE user_id=uid AND name='Servicios';
SELECT id INTO cat_sw            FROM finance_categories WHERE user_id=uid AND name='Software';
SELECT id INTO cat_impuestos     FROM finance_categories WHERE user_id=uid AND name='Impuestos';
SELECT id INTO cat_suscripciones FROM finance_categories WHERE user_id=uid AND name='Suscripciones';
SELECT id INTO cat_inv           FROM finance_categories WHERE user_id=uid AND name='Inversión';

-- ─── Transactions — Personal (últimos 6 meses) ────────────────
INSERT INTO transactions (user_id, context, type, amount, currency, description, category_id, source, date) VALUES
  -- Enero
  (uid,'personal','income', 350000,'ARS','Proyecto landing page',cat_freelance,'manual', NOW()-INTERVAL'5 months 20 days'),
  (uid,'personal','income',  75000,'ARS','Pago MP cobro mensual',cat_freelance,'mercadopago', NOW()-INTERVAL'5 months 18 days'),
  (uid,'personal','expense', 42000,'ARS','Adobe Creative Cloud',cat_sw,'manual', NOW()-INTERVAL'5 months 15 days'),
  (uid,'personal','expense', 18000,'ARS','Figma anual',cat_suscripciones,'manual', NOW()-INTERVAL'5 months 10 days'),
  -- Febrero
  (uid,'personal','income', 420000,'ARS','Rediseño e-commerce',cat_freelance,'manual', NOW()-INTERVAL'4 months 22 days'),
  (uid,'personal','income',  50000,'ARS','Correcciones cliente',cat_freelance,'manual', NOW()-INTERVAL'4 months 15 days'),
  (uid,'personal','expense', 95000,'ARS','AFIP monotributo',cat_impuestos,'manual', NOW()-INTERVAL'4 months 10 days'),
  (uid,'personal','expense', 42000,'ARS','Adobe Creative Cloud',cat_sw,'manual', NOW()-INTERVAL'4 months 5 days'),
  -- Marzo
  (uid,'personal','income', 550000,'ARS','App web dashboard',cat_freelance,'manual', NOW()-INTERVAL'3 months 25 days'),
  (uid,'personal','income', 120000,'ARS','Mantenimiento mensual x3',cat_freelance,'manual', NOW()-INTERVAL'3 months 12 days'),
  (uid,'personal','expense', 95000,'ARS','AFIP monotributo',cat_impuestos,'manual', NOW()-INTERVAL'3 months 8 days'),
  (uid,'personal','expense', 15000,'ARS','ChatGPT Plus',cat_suscripciones,'manual', NOW()-INTERVAL'3 months 5 days'),
  -- Abril
  (uid,'personal','income', 480000,'ARS','Integración API cliente',cat_freelance,'manual', NOW()-INTERVAL'2 months 20 days'),
  (uid,'personal','income',  85000,'ARS','Pago MP suscripción',cat_freelance,'mercadopago', NOW()-INTERVAL'2 months 12 days'),
  (uid,'personal','expense', 95000,'ARS','AFIP monotributo',cat_impuestos,'manual', NOW()-INTERVAL'2 months 8 days'),
  (uid,'personal','expense', 42000,'ARS','Adobe Creative Cloud',cat_sw,'manual', NOW()-INTERVAL'2 months 3 days'),
  -- Mayo
  (uid,'personal','income', 680000,'ARS','Sistema de gestión completo',cat_freelance,'manual', NOW()-INTERVAL'1 month 22 days'),
  (uid,'personal','income', 150000,'ARS','Consultoría UX',cat_freelance,'manual', NOW()-INTERVAL'1 month 10 days'),
  (uid,'personal','expense', 95000,'ARS','AFIP monotributo',cat_impuestos,'manual', NOW()-INTERVAL'1 month 8 days'),
  (uid,'personal','expense', 28000,'ARS','Vercel Pro',cat_suscripciones,'manual', NOW()-INTERVAL'1 month 5 days'),
  -- Junio (este mes)
  (uid,'personal','income', 320000,'ARS','E-commerce fase 1',cat_freelance,'manual', NOW()-INTERVAL'12 days'),
  (uid,'personal','income',  95000,'ARS','Mantenimiento mensual',cat_freelance,'manual', NOW()-INTERVAL'5 days'),
  (uid,'personal','expense', 42000,'ARS','Adobe Creative Cloud',cat_sw,'manual', NOW()-INTERVAL'3 days'),
  (uid,'personal','expense', 95000,'ARS','AFIP monotributo',cat_impuestos,'manual', NOW()-INTERVAL'2 days');

-- ─── Transactions — Agency ────────────────────────────────────
INSERT INTO transactions (user_id, context, type, amount, currency, description, category_id, source, date) VALUES
  (uid,'agency','income',1200000,'ARS','Proyecto e-commerce Empresa A',cat_agencia,'manual', NOW()-INTERVAL'3 months 15 days'),
  (uid,'agency','income', 450000,'ARS','Comisión campaña digital',cat_comisiones,'mercadopago', NOW()-INTERVAL'3 months 5 days'),
  (uid,'agency','expense',180000,'ARS','Hosting y servidores Q1',cat_servicios,'manual', NOW()-INTERVAL'3 months 1 day'),
  (uid,'agency','income',1500000,'ARS','Rediseño marca corporativa',cat_agencia,'manual', NOW()-INTERVAL'2 months 20 days'),
  (uid,'agency','expense',320000,'ARS','Freelancers externos',cat_inv,'manual', NOW()-INTERVAL'2 months 10 days'),
  (uid,'agency','income', 600000,'ARS','Mantenimiento trimestral x4',cat_agencia,'manual', NOW()-INTERVAL'1 month 15 days'),
  (uid,'agency','income', 380000,'ARS','Comisión redes sociales',cat_comisiones,'mercadopago', NOW()-INTERVAL'1 month 8 days'),
  (uid,'agency','expense',180000,'ARS','Hosting y servidores Q2',cat_servicios,'manual', NOW()-INTERVAL'1 month 2 days'),
  (uid,'agency','income', 950000,'ARS','App móvil MVP cliente B',cat_agencia,'manual', NOW()-INTERVAL'8 days'),
  (uid,'agency','expense',150000,'ARS','Herramientas y licencias',cat_servicios,'manual', NOW()-INTERVAL'3 days');

-- ─── Portfolio Assets (demo) ──────────────────────────────────
INSERT INTO portfolio_assets (user_id, provider, asset, quantity, avg_price, current_price, currency) VALUES
  (uid,'binance','BTC',  0.0342,  58000, 67500, 'USD'),
  (uid,'binance','ETH',  1.25,    2800,  3200,  'USD'),
  (uid,'binance','USDT', 850,     1,     1,     'USD'),
  (uid,'binance','BNB',  4.5,     280,   310,   'USD'),
  (uid,'iol','GGAL',     200,     1850,  2100,  'ARS'),
  (uid,'iol','YPFD',     50,      22000, 25500, 'ARS'),
  (uid,'iol','PAMP',     300,     980,   1150,  'ARS'),
  (uid,'iol','AL30',     100,     450,   520,   'USD')
ON CONFLICT (user_id, provider, asset) DO UPDATE
  SET quantity=EXCLUDED.quantity, current_price=EXCLUDED.current_price, updated_at=now();

END $$;
