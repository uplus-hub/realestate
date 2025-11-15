# 인테리어 견적 플랫폼

사진 기반 인테리어 견적 요청 및 비교 플랫폼입니다.

## 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Form**: React Hook Form + Zod
- **UI Components**: shadcn/ui

## 시작하기

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 Supabase 정보를 입력하세요
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `db/migrations/001_initial_schema.sql` 실행
3. Storage에서 `project-photos` 버킷 생성 (Public)
4. `.env.local`에 Supabase 정보 입력

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
/
├── app/              # Next.js App Router
├── components/       # React 컴포넌트
├── lib/             # 유틸리티 및 설정
├── types/            # TypeScript 타입 정의
├── db/              # DB 마이그레이션
└── public/          # 정적 파일
```

## 개발 단계

### Phase 1 (MVP)
- [x] 프로젝트 초기화
- [ ] 인증 시스템
- [ ] 프로젝트 생성
- [ ] 견적 시스템
- [ ] 대시보드

### Phase 2
- [ ] 패키지 추천
- [ ] 계약 시스템
- [ ] 결제 시스템

### Phase 3
- [ ] 분쟁 시스템
- [ ] 관리자 콘솔
- [ ] 고급 기능

## 라이선스

MIT

