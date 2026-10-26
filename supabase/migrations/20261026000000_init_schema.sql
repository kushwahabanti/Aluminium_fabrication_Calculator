-- ============================================================
-- Aluminium Fabrication Calculator — Supabase Schema & Storage
-- ============================================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile + settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );

  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  address     TEXT DEFAULT '',
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_type  TEXT NOT NULL,
  width         TEXT NOT NULL,
  height        TEXT NOT NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  profile       TEXT NOT NULL,
  glass_type    TEXT DEFAULT '',
  hardware      TEXT DEFAULT '',
  remarks       TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);

-- 4. QUOTATIONS
CREATE TABLE IF NOT EXISTS quotations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id         UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  project_ids         UUID[] DEFAULT '{}',
  total_material_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  labour_cost         NUMERIC(12,2) DEFAULT 0,
  additional_charges  NUMERIC(12,2) DEFAULT 0,
  profit_percentage   NUMERIC(5,2) DEFAULT 0,
  final_price         NUMERIC(12,2) NOT NULL DEFAULT 0,
  snapshot            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON quotations(user_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);

-- 5. SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name          TEXT DEFAULT 'My Fabrication Company',
  address               TEXT DEFAULT '',
  phone                 TEXT DEFAULT '',
  gst                   TEXT DEFAULT '',
  logo_url              TEXT DEFAULT '',
  default_profit_margin NUMERIC(5,2) DEFAULT 20,
  currency              TEXT DEFAULT 'INR',
  configuration         JSONB DEFAULT '{}',
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);

-- 6. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON customers;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON projects;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON quotations;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON settings;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own customers" ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create customers" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own customers" ON customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own customers" ON customers FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own quotations" ON quotations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create quotations" ON quotations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own quotations" ON quotations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own quotations" ON quotations FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);

-- 8. STORAGE BUCKET: AVATARS
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public avatar access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
