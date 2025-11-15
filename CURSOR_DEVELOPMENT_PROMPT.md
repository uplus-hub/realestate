# 🔧 Cursor 개발용 명령서 (Development Prompt)

## [1] 기술 스택 정의

### 프레임워크
- **Next.js 14+** (App Router 사용)
- **TypeScript** (엄격 모드)
- **React 18+**

### API 방식
- **App Router 기반**: `app/api/` 디렉토리 사용
- Route Handlers 사용 (GET, POST, PUT, DELETE)

### 데이터베이스
- **Supabase** (PostgreSQL + 실시간 기능 + 스토리지)
  - 인증: Supabase Auth
  - 스토리지: 이미지/파일 저장
  - 실시간: 채팅, 알림

### 인증 방식
- **Supabase Auth** (이메일/소셜 로그인)
- JWT 토큰 기반 세션 관리
- 역할 기반 접근 제어 (RBAC): consumer, vendor, admin

### 스타일링
- **Tailwind CSS** (유틸리티 우선)
- **shadcn/ui** (컴포넌트 라이브러리)
- 반응형 디자인 (모바일 우선)

### 추가 라이브러리
- **Zod** (스키마 검증)
- **React Hook Form** (폼 관리)
- **date-fns** (날짜 처리)
- **react-dropzone** (파일 업로드)
- **react-image-compressor** (이미지 압축)
- **socket.io-client** (실시간 채팅, 선택사항)
- **react-hot-toast** (알림)
- **jspdf** (PDF 생성 - 임대 원복 가이드)
- **exifr** (EXIF 데이터 제거)
- **ajv** (JSON Schema 검증 - 표준 견적 스키마)
- **react-signature-canvas** (전자서명)
- **@turf/turf** (GeoJSON 처리 - 권역 폴리곤)

---

## [2] 폴더 구조 (Root-level)

**폴더 구조는 아래와 같이 고정합니다. 모든 파일은 이 구조에 정확히 생성하세요.**

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   └── new/
│   │   ├── quotes/
│   │   ├── contracts/
│   │   └── chat/
│   ├── api/
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── quotes/
│   │   ├── upload/
│   │   ├── contracts/
│   │   ├── chat/
│   │   ├── disputes/
│   │   └── admin/
│   ├── layout.tsx
│   ├── page.tsx (랜딩)
│   └── globals.css
├── components/
│   ├── ui/ (shadcn 컴포넌트)
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── projects/
│   │   ├── PhotoUpload.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── RentalChecklist.tsx
│   │   ├── RentalPDFGenerator.tsx
│   │   └── PackageCard.tsx
│   ├── quotes/
│   │   ├── QuoteComparison.tsx
│   │   ├── QuoteCard.tsx
│   │   ├── QuoteForm.tsx
│   │   └── QuoteAutocomplete.tsx
│   ├── contracts/
│   │   ├── MilestoneTracker.tsx
│   │   ├── ChangeOrderCard.tsx
│   │   ├── BudgetLockBadge.tsx
│   │   ├── PaymentForm.tsx
│   │   └── SignatureCanvas.tsx
│   ├── chat/
│   │   └── ChatWindow.tsx
│   ├── vendors/
│   │   ├── VendorOnboardingForm.tsx
│   │   ├── CalendarIntegration.tsx
│   │   └── QuoteTemplateSelector.tsx
│   ├── admin/
│   │   ├── QuoteMappingManager.tsx
│   │   ├── DisputeDashboard.tsx
│   │   └── KPIDashboard.tsx
│   ├── timeline/
│   │   └── TimelineView.tsx
│   └── common/
│       ├── Loading.tsx
│       ├── ErrorBoundary.tsx
│       ├── Toast.tsx
│       ├── SLATimer.tsx
│       ├── SLACompensationBadge.tsx
│       ├── RecentViews.tsx
│       └── EmailCaptureModal.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── utils/
│   │   ├── image-compress.ts
│   │   ├── exif-remove.ts
│   │   ├── validation.ts
│   │   ├── format.ts
│   │   ├── hash-chain.ts (타임라인 해시체인)
│   │   ├── pdf-generator.ts (임대 PDF 생성)
│   │   └── event-tracker.ts (이벤트 추적)
│   └── constants/
│       ├── project-types.ts
│       ├── quote-schema.ts (JSON Schema)
│       └── exp-flags.ts (A/B 테스트 플래그)
├── hooks/
│   ├── useAuth.ts
│   ├── useProjects.ts
│   ├── useQuotes.ts
│   └── useChat.ts
├── types/
│   ├── project.ts
│   ├── quote.ts
│   ├── contract.ts
│   ├── user.ts
│   └── api.ts
├── db/
│   └── migrations/ (Supabase SQL 마이그레이션)
├── public/
│   └── images/
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## [3] API 명세서 (통합 버전)

### 인증 API

#### POST /api/auth/signup
**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "role": "consumer" | "vendor",
  "name": "string"
}
```
**Response:**
```json
{
  "success": true,
  "user": { "id": "uuid", "email": "string", "role": "string" }
}
```
**Validation:** 이메일 형식, 비밀번호 8자 이상, role 필수

---

#### POST /api/auth/login
**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "success": true,
  "session": { "access_token": "string", "user": {...} }
}
```

---

### 프로젝트 API

#### POST /api/projects
**Request Body:**
```json
{
  "title": "string",
  "spaceTypes": ["string"],
  "area": { "value": "number", "unit": "평" | "㎡" },
  "budget": "number",
  "isRental": "boolean",
  "rentalChecklist": { "noiseRestriction": "boolean", "drillingRestriction": "boolean", ... },
  "photos": ["string"] // Supabase Storage URLs
}
```
**Response:**
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "status": "pending",
    "slaDeadline": "ISO8601",
    "createdAt": "ISO8601"
  }
}
```
**Validation:** 
- spaceTypes: 최소 1개
- area: 양수
- budget: 양수
- photos: 3~10개

---

#### GET /api/projects
**Query Params:** `?role=consumer&status=pending`
**Response:**
```json
{
  "success": true,
  "projects": [{ "id": "uuid", "title": "string", ... }]
}
```

---

#### GET /api/projects/[id]
**Response:**
```json
{
  "success": true,
  "project": { "id": "uuid", "quotes": [...], "timeline": [...] }
}
```

---

### 견적 API

#### POST /api/quotes
**Request Body:**
```json
{
  "projectId": "uuid",
  "lineItems": [
    {
      "category": "string",
      "unitPrice": "number",
      "quantity": "number",
      "included": ["string"],
      "excluded": ["string"],
      "assumptions": ["string"],
      "materialSpec": "string"
    }
  ],
  "totalAmount": "number",
  "validUntil": "ISO8601"
}
```
**Response:**
```json
{
  "success": true,
  "quote": { "id": "uuid", "status": "pending" }
}
```
**Validation:** lineItems 최소 1개, totalAmount = sum(unitPrice * quantity)

---

#### GET /api/quotes/compare
**Query Params:** `?projectId=uuid&quoteIds=uuid1,uuid2,uuid3`
**Response:**
```json
{
  "success": true,
  "comparison": {
    "mappingRate": "number", // 목표: 90% 이상
    "differences": [{ "field": "string", "values": [...] }],
    "table": [{ "category": "string", "quote1": {...}, "quote2": {...} }],
    "showDifferencesOnly": true // 기본값
  }
}
```
**로직:**
- 자유 입력 항목 → 표준 카테고리 매핑 (quote_mappings 테이블 활용)
- 매핑률 90% 이상 목표
- 매핑 실패 시 관리자 콘솔에 알림

---

### 파일 업로드 API

#### POST /api/upload/images
**Request:** FormData (multipart/form-data)
- `files`: File[] (3~10개)
- `projectId`: string (optional)

**Response:**
```json
{
  "success": true,
  "urls": ["string"],
  "compressed": "boolean"
}
```
**Validation:** 
- 파일당 10MB 이하
- JPG/PNG/HEIC만 허용
- EXIF 자동 제거

---

### 패키지 추천 API

#### POST /api/projects/[id]/packages
**Request Body:**
```json
{
  "budget": "number"
}
```
**Response:**
```json
{
  "success": true,
  "packages": [
    {
      "type": "budget" | "balanced" | "premium",
      "totalAmount": "number",
      "included": ["string"],
      "excluded": ["string"],
      "options": [{ "name": "string", "price": "number" }]
    }
  ]
}
```

---

### 계약 API

#### POST /api/contracts
**Request Body:**
```json
{
  "projectId": "uuid",
  "quoteId": "uuid",
  "budgetLock": "number",
  "milestones": [
    { "name": "string", "amount": "number", "status": "pending" }
  ]
}
```
**Response:**
```json
{
  "success": true,
  "contract": { "id": "uuid", "status": "active" }
}
```

---

#### POST /api/contracts/[id]/change-orders
**Request Body:**
```json
{
  "reason": "string",
  "priceDelta": "number",
  "photos": ["string"],
  "signature": "string" // base64
}
```
**Response:**
```json
{
  "success": true,
  "changeOrder": { "id": "uuid", "status": "pending_approval" }
}
```

---

### 채팅 API

#### GET /api/chat/[projectId]/messages
**Query Params:** `?limit=50&offset=0`
**Response:**
```json
{
  "success": true,
  "messages": [
    { "id": "uuid", "senderId": "uuid", "content": "string", "media": ["string"], "createdAt": "ISO8601" }
  ]
}
```

---

#### POST /api/chat/[projectId]/messages
**Request Body:**
```json
{
  "content": "string",
  "media": ["string"] // optional
}
```
**Response:**
```json
{
  "success": true,
  "message": { "id": "uuid", "createdAt": "ISO8601" }
}
```

---

### 분쟁 API

#### POST /api/disputes
**Request Body:**
```json
{
  "projectId": "uuid",
  "type": "quality" | "delay" | "cost" | "safety",
  "description": "string",
  "evidence": ["string"]
}
```
**Response:**
```json
{
  "success": true,
  "dispute": { "id": "uuid", "slaDeadline": "ISO8601" }
}
```

---

### 견적 배포 API

#### POST /api/projects/[id]/distribute-quotes
**Request Body:**
```json
{
  "maxVendors": 5,
  "filters": {
    "regions": ["string"], // 권역 필터
    "specialties": ["string"], // 공정 필터
    "minTicket": "number" // 최소 티켓 금액
  }
}
```
**Response:**
```json
{
  "success": true,
  "distributed": ["uuid"], // 배포된 업체 ID 목록
  "cooldownUntil": "ISO8601" // 쿨다운 종료 시각 (30분)
}
```
**Validation:** 
- 최대 5개 업체
- 쿨다운 30분 체크
- 권역/공정/예산 매칭

---

### SLA 관리 API

#### GET /api/projects/[id]/sla-status
**Response:**
```json
{
  "success": true,
  "sla": {
    "deadline": "ISO8601",
    "quoteCount": "number",
    "targetCount": 2,
    "isMet": "boolean",
    "compensationEligible": "boolean"
  }
}
```

#### POST /api/projects/[id]/sla-compensation
**Request Body:** (SLA 미충족 시 자동 호출)
**Response:**
```json
{
  "success": true,
  "compensation": {
    "type": "discount" | "refund",
    "amount": "number",
    "reason": "string"
  }
}
```

---

### 자동완성 API

#### GET /api/quotes/autocomplete
**Query Params:** `?vendorId=uuid&category=string`
**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "uuid",
      "lineItems": [...],
      "usedAt": "ISO8601"
    }
  ]
}
```
**로직:** 최근 3건 견적에서 항목/단가 자동 채움

---

### 임대 PDF 생성 API

#### POST /api/projects/[id]/rental-pdf
**Request Body:**
```json
{
  "checklist": { "noiseRestriction": "boolean", ... }
}
```
**Response:**
```json
{
  "success": true,
  "pdfUrl": "string" // Supabase Storage URL
}
```
**기능:** 원복 가이드 PDF 자동 생성 (템플릿 기반)

---

### 결제 API

#### POST /api/contracts/[id]/payments
**Request Body:**
```json
{
  "milestoneId": "uuid",
  "amount": "number",
  "paymentMethod": "card" | "bank_transfer",
  "cardToken": "string" // 카드 토큰화 (선택)
}
```
**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "status": "pending" | "completed" | "failed",
    "transactionId": "string"
  }
}
```

---

### 이메일 수집 API

#### POST /api/leads/email
**Request Body:**
```json
{
  "email": "string",
  "source": "landing_cta" | "onboarding"
}
```
**Response:**
```json
{
  "success": true,
  "lead": { "id": "uuid", "createdAt": "ISO8601" }
}
```

---

### 관리자 API

#### GET /api/admin/quote-mapping
**Query Params:** `?mappingRate=0.9`
**Response:**
```json
{
  "success": true,
  "mappings": [
    {
      "freeText": "string",
      "standardCategory": "string",
      "usageCount": "number"
    }
  ],
  "averageMappingRate": "number"
}
```

#### POST /api/admin/quote-mapping
**Request Body:**
```json
{
  "freeText": "string",
  "standardCategory": "string"
}
```
**기능:** 용어사전 매핑 테이블 관리

---

### 에러 코드 정책
- `400`: 잘못된 요청 (Validation 실패)
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `409`: 충돌 (예: 쿨다운)
- `500`: 서버 오류

---

## [4] DB 스키마 (ERD 형태)

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('consumer', 'vendor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### projects
```sql
CREATE TABLE projects (
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

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_sla_deadline ON projects(sla_deadline);
```

### project_photos
```sql
CREATE TABLE project_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_photos_project_id ON project_photos(project_id);
```

### quotes
```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  line_items JSONB NOT NULL, -- 표준 스키마 준수
  total_amount NUMERIC NOT NULL,
  valid_until TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotes_project_id ON quotes(project_id);
CREATE INDEX idx_quotes_vendor_id ON quotes(vendor_id);
CREATE INDEX idx_quotes_status ON quotes(status);
```

### contracts
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id),
  budget_lock NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contracts_project_id ON contracts(project_id);
```

### milestones
```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'deposited', 'inspected', 'paid', 'completed')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_milestones_contract_id ON milestones(contract_id);
```

### change_orders
```sql
CREATE TABLE change_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  price_delta NUMERIC NOT NULL,
  photos TEXT[],
  signature_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_change_orders_contract_id ON change_orders(contract_id);
```

### timeline_events
```sql
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('contract', 'change_order', 'payment', 'file', 'chat', 'signature')),
  event_data JSONB NOT NULL,
  hash_chain TEXT, -- 이전 해시 + 현재 해시
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_events_project_id ON timeline_events(project_id);
CREATE INDEX idx_timeline_events_created_at ON timeline_events(created_at);
```

### chat_messages
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  media_urls TEXT[],
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_project_id ON chat_messages(project_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
```

### disputes
```sql
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('quality', 'delay', 'cost', 'safety')),
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'escalated')),
  sla_deadline TIMESTAMPTZ NOT NULL,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_disputes_project_id ON disputes(project_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_sla_deadline ON disputes(sla_deadline);
```

### vendor_profiles
```sql
CREATE TABLE vendor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  regions JSONB, -- GeoJSON 폴리곤
  specialties TEXT[], -- 공정 목록
  min_ticket NUMERIC,
  slot_count INTEGER DEFAULT 10,
  verified BOOLEAN DEFAULT FALSE,
  license_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_profiles_user_id ON vendor_profiles(user_id);
```

### quote_distributions
```sql
CREATE TABLE quote_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  distributed_at TIMESTAMPTZ DEFAULT NOW(),
  cooldown_until TIMESTAMPTZ
);

CREATE INDEX idx_quote_distributions_project_id ON quote_distributions(project_id);
CREATE INDEX idx_quote_distributions_vendor_id ON quote_distributions(vendor_id);
CREATE INDEX idx_quote_distributions_cooldown ON quote_distributions(cooldown_until);
```

### sla_compensations
```sql
CREATE TABLE sla_compensations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  compensation_type TEXT NOT NULL CHECK (compensation_type IN ('discount', 'refund')),
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sla_compensations_project_id ON sla_compensations(project_id);
```

### quote_templates
```sql
CREATE TABLE quote_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  line_items JSONB NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quote_templates_vendor_id ON quote_templates(vendor_id);
CREATE INDEX idx_quote_templates_used_at ON quote_templates(used_at DESC);
```

### payments
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id),
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'bank_transfer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  pg_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_contract_id ON payments(contract_id);
CREATE INDEX idx_payments_milestone_id ON payments(milestone_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### email_leads
```sql
CREATE TABLE email_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('landing_cta', 'onboarding')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_leads_email ON email_leads(email);
CREATE INDEX idx_email_leads_created_at ON email_leads(created_at);
```

### quote_mappings
```sql
CREATE TABLE quote_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  free_text TEXT NOT NULL,
  standard_category TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quote_mappings_free_text ON quote_mappings(free_text);
CREATE INDEX idx_quote_mappings_standard_category ON quote_mappings(standard_category);
```

### rental_pdfs
```sql
CREATE TABLE rental_pdfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  pdf_url TEXT NOT NULL,
  checklist JSONB NOT NULL,
  template_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rental_pdfs_project_id ON rental_pdfs(project_id);
```

### vendor_calendars
```sql
CREATE TABLE vendor_calendars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  calendar_type TEXT NOT NULL CHECK (calendar_type IN ('google', 'ical')),
  external_calendar_id TEXT NOT NULL,
  oauth_token TEXT, -- 암호화 저장
  sync_enabled BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_calendars_vendor_id ON vendor_calendars(vendor_id);
```

### event_logs
```sql
CREATE TABLE event_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB,
  exp_flags JSONB, -- A/B 테스트 플래그
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_logs_user_id ON event_logs(user_id);
CREATE INDEX idx_event_logs_event_type ON event_logs(event_type);
CREATE INDEX idx_event_logs_created_at ON event_logs(created_at);
```

### recent_views
```sql
CREATE TABLE recent_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('project', 'quote', 'vendor')),
  item_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recent_views_user_id ON recent_views(user_id);
CREATE INDEX idx_recent_views_viewed_at ON recent_views(viewed_at DESC);
-- 최근 5개만 유지 (7일 후 자동 삭제)
```

---

## [5] 화면 흐름(UX 플로우)

### 첫 화면 (랜딩 페이지)
- `/` → 역할 선택 (고객/업체) → 회원가입/로그인

### 온보딩 흐름
1. **역할 선택** (`/onboarding/role`)
   - "고객" 또는 "업체" 선택
   - 선택 후 해당 역할로 회원가입 진행

2. **고객 온보딩**
   - 회원가입 → 프로필 입력 → 대시보드

3. **업체 온보딩**
   - 회원가입 → 업체 정보 입력 (권역/공정/최소 티켓) → 캘린더 연동 → 대시보드

### 로그인 후 흐름
- **고객**: `/dashboard` → 프로젝트 목록 → 프로젝트 생성
- **업체**: `/dashboard` → 견적 요청 목록 → 견적 작성

### 프로젝트 생성 흐름 (고객)
1. `/projects/new` → "사진으로 견적" 탭 선택
2. 사진 업로드 (3~10장) → 압축 처리 → 프리뷰
3. 프로젝트 정보 입력:
   - 공간 유형 (다중 선택)
   - 면적 (평/㎡)
   - 예산
   - 임대 여부 (토글) → 체크리스트 (임대 선택 시)
4. 패키지 추천 (선택) → 패키지 카드 3개 표시
5. 제출 → 프로젝트 생성 완료 → `/projects/[id]` 이동

### 견적 수신 흐름 (고객)
1. `/projects/[id]` → SLA 타이머 표시
2. 견적 도착 알림 (푸시/톡)
3. 견적 카드 클릭 → 상세 보기
4. 견적 2개 이상 수신 시 → 비교 테이블 표시
5. 견적 선택 → 계약 진행

### 견적 작성 흐름 (업체)
1. `/quotes/requests` → 프로젝트 카드 클릭
2. 사진/정보 확인
3. 견적 입력 (라인아이템) → 자동완성 (과거 견적)
4. 제출 → 배포 완료

### 계약 흐름
1. 견적 선택 → `/contracts/new?quoteId=xxx`
2. 상한가 락 동의 → 마일스톤 설정
3. 전자서명 → 계약 완료 → `/contracts/[id]`

### 변경/추가비 흐름
1. `/contracts/[id]` → "변경 요청" 버튼
2. 근거 카드 작성 (가격Δ, 사진, 타임스탬프)
3. 전자서명 → 승인 대기
4. 승인 후 예산 재계산 → 마일스톤 갱신

### 채팅 흐름
- 프로젝트/계약 상세 페이지 → 채팅 탭
- 실시간 메시지 송수신
- 10분 무응답 시 푸시 알림

### 분쟁 흐름
1. 프로젝트 상세 → "분쟁 신고" 버튼
2. 유형 선택 → 증빙 업로드
3. 제출 → 24h SLA 시작
4. 상태 추적 → 해결서 생성

### 리다이렉트 조건
- 미인증 사용자 → `/login?redirect=/dashboard`
- 역할 불일치 (고객이 업체 페이지 접근) → `/dashboard`
- 프로젝트 소유자 불일치 → 403 에러 → 이전 페이지

### 오류 발생 시 흐름
- API 실패 → Toast 알림 → 재시도 버튼
- 네트워크 오류 → 오프라인 모드 안내
- 404 → "프로젝트를 찾을 수 없습니다" → 대시보드로 이동

---

## [6] UI 컴포넌트 구조

### components/ui/
- shadcn/ui 컴포넌트 (Button, Input, Card, Dialog, Toast 등)

### components/layout/
- **Header.tsx**: 네비게이션, 알림, 프로필
- **Sidebar.tsx**: 대시보드 메뉴 (역할별 분기)
- **Footer.tsx**: 푸터

### components/projects/
- **PhotoUpload.tsx**
  - Props: `onUpload: (files: File[]) => void`, `maxFiles: number`, `maxSize: number`
  - 드래그&드롭, 진행률, 썸네일, 순서 변경
- **ProjectForm.tsx**
  - Props: `onSubmit: (data: ProjectFormData) => void`, `initialData?: ProjectData`
  - 공간 유형, 면적, 예산 입력
- **RentalChecklist.tsx**
  - Props: `onChange: (checklist: RentalChecklist) => void`
  - 임대 체크리스트 (층간소음·타공 제한 등)
- **RentalPDFGenerator.tsx**
  - Props: `projectId: string`, `checklist: RentalChecklist`, `onGenerate: (pdfUrl: string) => void`
  - 원복 가이드 PDF 자동 생성 및 다운로드
- **PackageCard.tsx**
  - Props: `package: Package`, `onSelect: (pkg: Package) => void`
  - 패키지 카드 (절약형/균형형/프리미엄)
  - 포함/제외/가정 항목 명시, 숨은 비용 툴팁

### components/quotes/
- **QuoteCard.tsx**
  - Props: `quote: Quote`, `onSelect: (quoteId: string) => void`
- **QuoteComparison.tsx**
  - Props: `quotes: Quote[]`, `showDifferencesOnly: boolean` (기본값: true)
  - 비교 테이블, 매핑률 표시 (90% 이상 목표)
  - "차이만 보기" 토글 (기본 ON)
- **QuoteForm.tsx**
  - Props: `onSubmit: (quote: QuoteFormData) => void`, `projectId: string`
  - 라인아이템 입력, 자동완성 (과거 견적 불러오기)
- **QuoteAutocomplete.tsx**
  - Props: `vendorId: string`, `category: string`, `onSelect: (template: QuoteTemplate) => void`
  - 최근 3건 견적 템플릿 표시

### components/contracts/
- **MilestoneTracker.tsx**
  - Props: `milestones: Milestone[]`, `onUpdate: (milestoneId: string, status: string) => void`
  - 분할 결제/검수 흐름 (예치→검수→지급)
- **ChangeOrderCard.tsx**
  - Props: `changeOrder: ChangeOrder`, `onApprove: (coId: string) => void`
  - 근거 카드 (가격Δ, 사진, 타임스탬프), Diff 자동 생성
- **BudgetLockBadge.tsx**
  - Props: `lockedAmount: number`
  - 상한가 락 표시, 변경은 CO 승인으로만 가능
- **PaymentForm.tsx**
  - Props: `milestoneId: string`, `amount: number`, `onSuccess: () => void`
  - 카드/계좌 이체 선택, PG 연동
- **SignatureCanvas.tsx**
  - Props: `onSign: (signature: string) => void`
  - 전자서명 캔버스 (react-signature-canvas)

### components/chat/
- **ChatWindow.tsx**
  - Props: `projectId: string`, `userId: string`
  - 메시지 리스트, 입력창, 미디어 업로드

### components/common/
- **Loading.tsx**: 스켈레톤 UI
- **ErrorBoundary.tsx**: 에러 경계
- **Toast.tsx**: 알림 (react-hot-toast 래퍼)
- **SLATimer.tsx**: SLA 타이머 표시 (24h 카운트다운)
- **SLACompensationBadge.tsx**: SLA 미충족 시 보상 배지
- **RecentViews.tsx**: 최근 본 항목 (로컬 캐시, 최대 5개)
- **EmailCaptureModal.tsx**: 랜딩 CTA 클릭 시 이메일 수집 모달

### components/vendors/
- **VendorOnboardingForm.tsx**
  - Props: `onSubmit: (data: VendorProfileData) => void`
  - 권역 폴리곤 (GeoJSON), 공정, 최소 티켓, 슬롯 수 설정
- **CalendarIntegration.tsx**
  - Props: `vendorId: string`, `onConnect: (calendarType: string) => void`
  - Google/iCal 양방향 연동, 겹침 경고
- **QuoteTemplateSelector.tsx**
  - Props: `vendorId: string`, `specialty: string`, `onSelect: (template: QuoteTemplate) => void`
  - 공정별 프리셋 로드 (1초 이내), 포트폴리오 자동 첨부

### components/admin/
- **QuoteMappingManager.tsx**
  - Props: `mappings: QuoteMapping[]`, `onUpdate: (mapping: QuoteMapping) => void`
  - 자유 입력 항목→표준 카테고리 매핑 테이블 관리
- **DisputeDashboard.tsx**
  - Props: `disputes: Dispute[]`, `onAssign: (disputeId: string, adminId: string) => void`
  - 분쟁 큐, SLA 경과 알림, 내부 메모/할당
- **KPIDashboard.tsx**
  - Props: `kpis: KPI[]`
  - 표준견적 적용률/전환/CO동의/분쟁해결률/번들 전환 리포트

### components/timeline/
- **TimelineView.tsx**
  - Props: `projectId: string`
  - 이벤트 불변 로그 (해시체인), Append-only 저장
  - 계약/CO/지급/파일/채팅/서명 이벤트 표시

### 컴포넌트 간 책임 분리
- **Presentational Components**: UI만 담당, props로 데이터/이벤트 받음
- **Container Components**: 데이터 페칭, 상태 관리 (hooks 사용)
- **Layout Components**: 페이지 구조만 담당

---

## [7] 비기능 요구사항(NFR)

### 로딩/스켈레톤
- 모든 데이터 페칭 시 스켈레톤 UI 표시
- 이미지 업로드: 진행률 바 (0~100%)
- 버튼 클릭: 로딩 스피너 + 비활성화

### 예외 처리 정책
- **API 실패**: Toast 알림 + 재시도 버튼 (최대 3회)
- **네트워크 오류**: "인터넷 연결을 확인해주세요" 메시지
- **권한 오류**: 403 페이지 또는 리다이렉트
- **Validation 실패**: 필드별 에러 메시지 (Zod 사용)

### API 실패 시 Toast
- **에러 타입별 메시지**:
  - 400: "입력값을 확인해주세요"
  - 401: "로그인이 필요합니다"
  - 403: "권한이 없습니다"
  - 404: "리소스를 찾을 수 없습니다"
  - 500: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요"

### 입력값 Validation
- **클라이언트**: Zod 스키마로 실시간 검증
- **서버**: API Route에서 재검증
- **에러 표시**: 필드 하단 빨간 텍스트

### 성능 기준
- **이미지 압축**: 10MB → 2MB 이하 (목표)
- **페이지 로드**: 3초 이내 (LCP)
- **API 응답**: 500ms 이내 (목표)
- **이미지 로딩**: Lazy loading + blur placeholder

### 보안 기준
- **인증**: JWT 토큰 (HttpOnly 쿠키 고려)
- **파일 업로드**: 확장자 검증 + MIME 타입 검증
- **EXIF 제거**: 클라이언트에서 자동 제거 (exifr 사용)
- **SQL Injection 방지**: Supabase Parameterized Queries
- **XSS 방지**: React 자동 이스케이프
- **CORS**: 환경변수로 허용 도메인 관리
- **PII 마스킹**: 이벤트 로그에서 개인정보 마스킹

### 타임라인 해시체인 구현
- **Append-only 저장**: timeline_events 테이블에만 INSERT, UPDATE/DELETE 금지
- **해시체인 로직**:
  ```typescript
  // 이전 이벤트의 해시 + 현재 이벤트 데이터 → SHA256 해시
  const previousHash = lastEvent?.hash_chain || 'genesis';
  const currentData = JSON.stringify(eventData);
  const hashChain = sha256(previousHash + currentData);
  ```
- **불변성 검증**: 조회 시 해시체인 검증 (변조 감지)
- **감사로그 보존**: 3년 보존 정책

### 이벤트 추적 및 A/B 테스트
- **모든 뷰/행동에 expFlags 주입**: 
  - 세션/유저/역할/변형값 저장
  - `event_logs` 테이블에 JSONB로 저장
- **이벤트 타입**: 
  - `page_view`, `button_click`, `form_submit`, `quote_received`, `contract_signed` 등
- **A/B 테스트 플래그 구조**:
  ```json
  {
    "experimentId": "photo_upload_v2",
    "variant": "A" | "B",
    "assignedAt": "ISO8601"
  }
  ```

### 로컬 캐시 (최근 본 항목)
- **localStorage 사용**: `recent_views` 키로 저장
- **구조**: `[{ itemType, itemId, viewedAt }, ...]`
- **정책**: 최대 5개, 7일 후 자동 삭제
- **동기화**: 서버 `recent_views` 테이블과 주기적 동기화 (선택)

---

## [8] 개발 우선순위 (MVP 중심)

### Phase 1 (핵심 기능) - MVP
1. **인증 시스템**
   - 회원가입/로그인 (Supabase Auth)
   - 역할 분기 (consumer/vendor)

2. **프로젝트 생성 (고객)**
   - 사진 업로드 (3~10장, 압축)
   - 프로젝트 정보 입력
   - 임대 프리셋 (체크리스트)

3. **견적 시스템**
   - 견적 요청 배포 (업체 매칭)
   - 견적 작성 (라인아이템)
   - 견적 비교 (표준 스키마)

4. **기본 대시보드**
   - 프로젝트 목록 (고객)
   - 견적 요청 목록 (업체)

5. **SLA 시스템**
   - 24h 타이머 (2건 이상 견적 보장)
   - 알림 (기본)
   - SLA 미충족 시 보상 팝업

6. **견적 배포 시스템**
   - 권역/공정/예산 필터 기반 자동 매칭 (최대 5곳)
   - 쿨다운 30분 체크

### Phase 2 (보조 기능)
1. **패키지 추천**
   - 예산 기반 3카드 생성

2. **계약 시스템**
   - 상한가 락
   - 마일스톤 (기본 4단계)

3. **변경/추가비 (CO)**
   - 근거 카드
   - 전자서명

4. **인앱 채팅**
   - 기본 메시지 송수신
   - 미디어 업로드

5. **타임라인**
   - 이벤트 로그 (기본)
   - 해시체인 구현 (Append-only)

6. **표준 견적 스키마**
   - JSON Schema 검증
   - 자동완성 (과거 견적 불러오기)

7. **이메일 수집**
   - 랜딩 CTA 클릭 시 이메일 저장

### Phase 3 (Nice-to-have)
1. **분쟁 시스템**
   - 분쟁 라우터
   - SLA 관리

2. **업체 온보딩 고도화**
   - 캘린더 연동
   - 견적 템플릿

3. **관리자 콘솔**
   - 용어사전 매핑
   - 분쟁 대시보드
   - KPI 리포트

4. **번들/커머스**
   - 완공 체크리스트
   - 원복 키트

5. **고급 기능**
   - 실시간 알림 (WebSocket)
   - A/B 테스트 플래그
   - 이벤트 추적 (GA4 + 내부 로그)

6. **임대 PDF 고도화**
   - PDF 템플릿 CMS 관리
   - 버전 롤백
   - restore_kit 연동 (원복키트 추천)

7. **최근 본 항목**
   - 로컬 캐시 (localStorage)
   - 서버 동기화

---

## [9] Cursor에게 줄 "최종 개발 명령문"

### 🔧 개발 시작 명령(CURSOR COMMAND)

아래 구조에 따라 폴더와 파일을 생성하고 코드를 작성하세요.

---

### 1. 기술 스택

- **Next.js 14+** (App Router)
- **TypeScript**
- **Supabase** (PostgreSQL + Auth + Storage)
- **Tailwind CSS** + **shadcn/ui**
- **Zod** (검증)
- **React Hook Form** (폼)

---

### 2. 폴더 구조

위 [2] 섹션의 폴더 구조를 정확히 따르세요. 모든 파일은 해당 위치에 생성합니다.

---

### 3. DB 스키마

위 [4] 섹션의 SQL 스키마를 Supabase Dashboard에서 실행하거나, `db/migrations/` 폴더에 SQL 파일로 생성하세요.

**우선순위 테이블:**
1. users
2. projects
3. project_photos
4. quotes
5. contracts
6. milestones

---

### 4. API 생성 지시

`app/api/` 디렉토리에 다음 Route Handlers를 생성하세요:

**Phase 1 우선:**
- `app/api/auth/signup/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/projects/route.ts` (GET, POST)
- `app/api/projects/[id]/route.ts` (GET)
- `app/api/projects/[id]/distribute-quotes/route.ts` (POST)
- `app/api/projects/[id]/sla-status/route.ts` (GET)
- `app/api/quotes/route.ts` (POST)
- `app/api/quotes/compare/route.ts` (GET)
- `app/api/quotes/autocomplete/route.ts` (GET)
- `app/api/upload/images/route.ts`
- `app/api/leads/email/route.ts` (POST)

**각 API는:**
- Request/Response 스펙을 위 [3] 섹션에 맞게 구현
- Zod로 Request Body 검증
- Supabase 클라이언트로 DB 접근
- 에러 처리 (try-catch + 적절한 HTTP 상태 코드)
- TypeScript 타입 정의 (`types/api.ts`)

---

### 5. 컴포넌트 생성 지시

**Phase 1 우선:**
- `components/layout/Header.tsx`
- `components/layout/Sidebar.tsx`
- `components/projects/PhotoUpload.tsx` (EXIF 제거, 압축 포함)
- `components/projects/ProjectForm.tsx`
- `components/projects/RentalChecklist.tsx`
- `components/quotes/QuoteCard.tsx`
- `components/quotes/QuoteComparison.tsx` ("차이만 보기" 기본 ON)
- `components/quotes/QuoteForm.tsx` (자동완성 포함)
- `components/common/Loading.tsx`
- `components/common/Toast.tsx`
- `components/common/SLATimer.tsx`
- `components/common/EmailCaptureModal.tsx`

**각 컴포넌트는:**
- TypeScript로 작성
- Props 타입 명시
- Tailwind CSS로 스타일링
- 로딩/에러 상태 처리
- 접근성 고려 (aria-label 등)

---

### 6. 화면/페이지 생성 지시

**Phase 1 우선:**
- `app/page.tsx` (랜딩: 역할 선택)
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/(dashboard)/dashboard/page.tsx` (역할별 분기)
- `app/(dashboard)/projects/new/page.tsx` (프로젝트 생성)
- `app/(dashboard)/projects/[id]/page.tsx` (프로젝트 상세)

**각 페이지는:**
- Server Components 우선 (필요 시 Client Components)
- 데이터 페칭: Server Components 또는 `useEffect` + API 호출
- 인증 확인: 미들웨어 또는 서버 컴포넌트
- 로딩/에러 상태 처리

---

### 7. 예외 처리/로딩 추가

- **모든 API 호출**: try-catch + Toast 알림
- **모든 데이터 페칭**: 스켈레톤 UI 표시
- **이미지 업로드**: 진행률 바
- **폼 제출**: 버튼 비활성화 + 로딩 스피너
- **에러 바운더리**: `components/common/ErrorBoundary.tsx` 사용

---

### 8. 개발 순서(Phase 별)

**Phase 1 (즉시 시작):**

1. **프로젝트 초기화**
   - `npx create-next-app@latest . --typescript --tailwind --app`
   - Supabase 클라이언트 설정 (`lib/supabase/`)
   - 환경변수 설정 (`.env.local`)

2. **인증 시스템**
   - 회원가입/로그인 페이지
   - API Routes (`/api/auth/*`)
   - 미들웨어 (인증 확인)

3. **DB 스키마 생성**
   - Supabase Dashboard에서 테이블 생성
   - 또는 마이그레이션 파일 작성

4. **프로젝트 생성 기능**
   - 사진 업로드 컴포넌트 (압축, EXIF 제거 포함)
   - 프로젝트 폼
   - API (`/api/projects`)
   - 임대 체크리스트
   - 임대 PDF 생성 (Phase 2에서 구현)

5. **견적 시스템**
   - 견적 작성 폼 (업체, 자동완성 포함)
   - 견적 비교 테이블 (고객, "차이만 보기" 기본 ON)
   - API (`/api/quotes`, `/api/quotes/compare`, `/api/quotes/autocomplete`)
   - 표준 견적 스키마 검증 (JSON Schema)

6. **견적 배포 시스템**
   - 권역/공정/예산 필터 기반 자동 매칭
   - API (`/api/projects/[id]/distribute-quotes`)
   - 쿨다운 30분 체크

7. **대시보드**
   - 프로젝트 목록 (고객)
   - 견적 요청 목록 (업체)
   - SLA 타이머 (24h, 2건 이상 보장)
   - SLA 보상 팝업 (미충족 시)

8. **이메일 수집**
   - 랜딩 CTA 클릭 시 이메일 모달
   - API (`/api/leads/email`)

**Phase 2 (Phase 1 완료 후):**
- 패키지 추천 (예산 기반 3카드)
- 계약 시스템 (상한가 락, 마일스톤)
- 변경/추가비 (CO, 전자서명)
- 인앱 채팅 (미디어 업로드)
- 타임라인 (해시체인 구현)
- 임대 PDF 생성 (원복 가이드)
- 결제 시스템 (PG 연동)

**Phase 3 (Phase 2 완료 후):**
- 분쟁 시스템 (라우터, SLA 관리)
- 업체 온보딩 고도화 (캘린더 연동, 견적 템플릿)
- 관리자 콘솔 (용어사전 매핑, 분쟁 대시보드, KPI 리포트)
- 번들/커머스 (완공 체크리스트, 원복 키트)
- 고급 기능 (실시간 알림, A/B 테스트, 이벤트 추적)
- 최근 본 항목 (로컬 캐시)

---

### 추가 지침

- **파일은 위에서 정의한 폴더 구조에 정확히 생성하세요.**
- **API는 Request/Response 스펙 기반으로 구현하세요.**
- **각 단계 끝나면 "Next Step?" 라고 물어보지 말고 계속 진행하세요.**
- **구현 불가한 부분은 제가 제공한 스펙을 기준으로 추정하여 작성하세요.**
- **TypeScript 타입은 엄격하게 작성하세요 (any 사용 지양).**
- **에러 메시지는 사용자 친화적으로 작성하세요.**
- **모바일 반응형을 고려하세요 (Tailwind의 `sm:`, `md:` 등 사용).**

**중요 구현 사항:**
- **이미지 압축**: 10MB 초과 시 자동 압축 (재시도 3회)
- **EXIF 제거**: 클라이언트에서 자동 제거 (exifr 사용)
- **SLA 타이머**: 24h 카운트다운, 2건 이상 견적 보장
- **견적 배포 쿨다운**: 30분 체크 (quote_distributions 테이블 활용)
- **타임라인 해시체인**: Append-only, SHA256 해시체인 구현
- **비교 테이블**: "차이만 보기" 기본 ON, 매핑률 90% 이상 목표
- **자동완성**: 최근 3건 견적에서 항목/단가 자동 채움
- **이벤트 추적**: 모든 뷰/행동에 expFlags 주입 (A/B 테스트)
- **로컬 캐시**: 최근 본 항목 localStorage 저장 (최대 5개, 7일)

---

## 시작하세요!

위 명령에 따라 **Phase 1부터 순차적으로 개발을 시작**하세요. 모든 파일과 코드를 생성하고, 각 기능이 정상 작동하도록 구현하세요.

