-- 인테리어 견적 플랫폼 초기 스키마
-- Supabase SQL Editor에서 실행하세요

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- users 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('consumer', 'vendor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- projects 테이블
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  space_types TEXT[] NOT NULL,
  area_value NUMERIC NOT NULL,
  area_unit TEXT NOT NULL CHECK (area_unit IN ('평', '㎡')),
  budget NUMERIC NOT NULL,
  is_rental BOOLEAN DEFAULT FALSE,
  rental_checklist JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'contracted', 'in_progress', 'completed', 'cancelled')),
  sla_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_sla_deadline ON projects(sla_deadline);

-- project_photos 테이블
CREATE TABLE IF NOT EXISTS project_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_photos_project_id ON project_photos(project_id);

-- quotes 테이블
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  line_items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  valid_until TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_project_id ON quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_quotes_vendor_id ON quotes(vendor_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);

-- quote_distributions 테이블 (견적 배포 및 쿨다운 관리)
CREATE TABLE IF NOT EXISTS quote_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  distributed_at TIMESTAMPTZ DEFAULT NOW(),
  cooldown_until TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quote_distributions_project_id ON quote_distributions(project_id);
CREATE INDEX IF NOT EXISTS idx_quote_distributions_vendor_id ON quote_distributions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_quote_distributions_cooldown ON quote_distributions(cooldown_until);

-- vendor_profiles 테이블
CREATE TABLE IF NOT EXISTS vendor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  regions JSONB,
  specialties TEXT[],
  min_ticket NUMERIC,
  slot_count INTEGER DEFAULT 10,
  verified BOOLEAN DEFAULT FALSE,
  license_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_profiles_user_id ON vendor_profiles(user_id);

-- quote_templates 테이블 (자동완성용)
CREATE TABLE IF NOT EXISTS quote_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  line_items JSONB NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_templates_vendor_id ON quote_templates(vendor_id);
CREATE INDEX IF NOT EXISTS idx_quote_templates_used_at ON quote_templates(used_at DESC);

-- sla_compensations 테이블
CREATE TABLE IF NOT EXISTS sla_compensations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  compensation_type TEXT NOT NULL CHECK (compensation_type IN ('discount', 'refund')),
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sla_compensations_project_id ON sla_compensations(project_id);

-- email_leads 테이블
CREATE TABLE IF NOT EXISTS email_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('landing_cta', 'onboarding')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_leads_email ON email_leads(email);
CREATE INDEX IF NOT EXISTS idx_email_leads_created_at ON email_leads(created_at);

-- quote_mappings 테이블 (용어사전 매핑)
CREATE TABLE IF NOT EXISTS quote_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  free_text TEXT NOT NULL,
  standard_category TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_mappings_free_text ON quote_mappings(free_text);
CREATE INDEX IF NOT EXISTS idx_quote_mappings_standard_category ON quote_mappings(standard_category);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_profiles_updated_at BEFORE UPDATE ON vendor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_mappings_updated_at BEFORE UPDATE ON quote_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

