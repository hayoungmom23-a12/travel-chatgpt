# 여행 조건 기반 일자별 여행 계획 도구 TRD

## 기술 구성

| 구분 | 선택 기술 | 적용 이유 |
| --- | --- | --- |
| 웹 프레임워크 | Next.js(App Router) + TypeScript | 한 저장소에서 반응형 웹 화면과 서버 API를 함께 구현하고 Vercel에 별도 서버 설정 없이 배포한다. |
| UI | React + Tailwind CSS | `design/ai_1`, `design/ai_2`의 Tailwind 기반 모바일·데스크톱 시안을 컴포넌트로 옮기기 쉽다. 운영에서는 CDN Tailwind가 아닌 빌드 시 생성한 CSS를 사용한다. |
| 폼·검증 | React Hook Form + Zod | 입력 화면과 API Route Handler에서 같은 Zod 스키마를 사용해 여행 조건, 결과 직접 편집값, API 응답을 일관되게 검증한다. |
| 생성 API | Next.js Route Handler (`POST /api/plans`) + Gemini GenerateContent REST API | API 키를 서버에만 두고, JSON Schema Structured Outputs로 일자별 코스·예산표·체크리스트·우천 대안을 화면이 소비할 수 있는 구조화 데이터로 받는다. Gemini GenerateContent API는 JSON 응답과 JSON Schema 출력 구조를 지원한다. [Gemini GenerateContent 문서](https://ai.google.dev/api/generate-content) |
| 서버 런타임 | Node.js Runtime | 서버의 `fetch`와 비밀 환경변수를 Route Handler에서만 사용한다. Edge Runtime은 이 MVP의 필수 이점이 없으므로 선택하지 않는다. |
| 클라이언트 상태 | React `useReducer` + Context | 입력 → 처리 중 → 결과 → 오류의 명시적 상태와 결과 직접 편집의 임시 변경본을 의존성 추가 없이 관리한다. |
| 기기 내 보관 | `localStorage` | 로그인·계정·서버 저장 없이 현재 브라우저에 계획, 사용자 수정값, 체크 상태를 보관한다. |
| 공유·지도 | Web Share API/Clipboard API, 외부 지도 검색 URL | 공유는 텍스트 전달로, 지도는 알려진 지도 서비스의 검색 URL 열기로 구현한다. 지도 SDK·길찾기·위치 추적·지도 API 키는 사용하지 않는다. |
| 남용 방지 | Vercel 배포 + Upstash Redis 기반 IP rate limit | 로그인 없는 생성 API의 호출 비용을 통제한다. Vercel Project Settings에서 환경별 비밀값을 관리한다. [Vercel 환경변수 문서](https://vercel.com/docs/environment-variables) |
| 품질 검증 | Vitest + Playwright | 날짜·예산 재계산·스키마 검증은 단위 테스트, 입력·생성·오류·직접 편집·기기 저장은 E2E 테스트로 검증한다. |

생성 모델명은 서버 환경변수 `GEMINI_MODEL`로 관리한다. 미설정 시 `gemini-3.8-flash`를 기본값으로 사용하며, 지원되는 Structured Outputs 모델을 개발·미리보기·운영 환경별로 선택할 수 있게 한다. 클라이언트에는 모델명이나 API 키를 노출하지 않는다.

## 데이터 흐름

```text
[브라우저 입력 폼]
  └─ Zod 클라이언트 검증
       └─ POST /api/plans (여행 조건 JSON)
            └─ Route Handler(Node.js)
                 ├─ 요청 크기·스키마·IP rate limit 검사
                 ├─ 서버 환경변수로 Gemini GenerateContent 요청 생성
                 ├─ 고정 시스템 지침 + 사용자 조건 JSON 전송
                 ├─ Structured Outputs(JSON Schema) 수신
                 └─ 응답 Zod 재검증·추정치 안내 강제
                      ├─ 200: 구조화된 계획 JSON → 결과 화면
                      ├─ 409: 조건 충돌안 → 오류 화면
                      └─ 4xx/5xx: 안전한 오류 코드 → 오류 화면

[결과 화면]
  ├─ useReducer: 코스·예산·준비물·우천 대안 직접 편집 및 재계산
  ├─ localStorage: 사용자가 보관한 계획과 체크 상태 저장·복원
  ├─ Web Share/Clipboard: 공유 텍스트 전달
  └─ 외부 지도 검색 URL: 장소명 확인
```

1. 입력 화면은 여행지, 출발·도착일, 인원, 동행자 관계, 총예산, 여행 스타일, 제외 조건을 `PlanInputSchema`로 먼저 검증한다.
2. 통과한 값만 `/api/plans`에 전송하고, 화면은 F-09의 처리 단계 표시를 시작한다. 브라우저가 생성 모델이나 API 키에 직접 통신하지 않는다.
3. Route Handler는 동일 스키마로 재검증하고, rate limit 통과 뒤에만 모델을 호출한다. 모델에는 웹 검색·지도·예약·결제 도구를 연결하지 않는다.
4. 모델 출력은 `GeneratedPlanSchema`에 맞는 JSON으로 제한한다. 서버는 날짜별 코스, 예산, 준비물, 우천 대안, `추정치/공식 확인 필요` 안내가 모두 있는지 재검증하고 누락 시 재생성 또는 실패 처리한다.
5. 결과 직접 편집은 API 호출 없이 클라이언트 상태에서 즉시 반영한다. 예산 금액 편집은 `budget.ts`의 결정적 함수가 합계·1인 환산액·잔여 예산을 재계산하고, 편집 항목에는 `source: "user"`를 기록한다.
6. 전체 조건을 고쳐 다시 만들 때만 새 `POST /api/plans`을 보낸다. 보관·공유·외부 지도 확인은 생성 API와 독립적으로 동작한다.

## 파일 역할

```text
app/
  layout.tsx                         # 전역 레이아웃, 폰트, 메타데이터, 보안 헤더 연결
  page.tsx                           # 여행 설계 화면 진입점
  api/plans/route.ts                 # POST 계획 생성 API; 서버 전용
components/planner/
  PlannerShell.tsx                   # 입력/처리/결과/오류 상태 전환과 반응형 레이아웃
  TripForm.tsx                       # F-01~F-08 입력 폼과 Zod 오류 표시
  PlanningProgress.tsx               # F-09 처리 중 단계 표시
  ResultSummary.tsx                  # F-10 여행 요약·이동 피로도
  DayCourseEditor.tsx                # F-11 및 F-16 일자 탭, 코스 직접 편집
  BudgetEditor.tsx                   # F-12 및 F-16 예산표·재계산·추정치 표시
  ChecklistEditor.tsx                # F-13 체크·항목 편집
  RainyAlternativeEditor.tsx         # F-14 우천 대안 편집
  NoticePanel.tsx                    # F-15 공식 채널 확인 안내
  ResultActions.tsx                  # F-16~F-19 다시 만들기·지도·보관·공유
  ConflictPanel.tsx                  # F-20 조건 충돌 및 조정안
  ErrorPanel.tsx                     # F-21 생성 실패 및 재시도
lib/
  schemas/plan.ts                    # PlanInput/GeneratedPlan/편집값 Zod 스키마와 타입
  ai/generate-plan.ts                # Gemini GenerateContent REST 호출·시간 제한·Structured Output 요청
  ai/prompt.ts                       # 고정 시스템 지침과 사용자 조건 직렬화
  plan/budget.ts                     # 합계·잔여 예산·1인 환산액의 순수 계산 함수
  plan/validate-result.ts            # 필수 결과·추정치 고지·일자 완결성 서버 검증
  storage/saved-plans.ts             # localStorage 저장·복원·실패 처리
  share/plan-share.ts                # Web Share API와 Clipboard fallback
  maps/external-search.ts             # 허용된 외부 지도 도메인 URL 생성·검색어 인코딩
  rate-limit.ts                      # Upstash Redis rate limit 어댑터
  errors.ts                          # API 오류 코드와 사용자 안전 메시지 매핑
tests/
  unit/                              # 날짜, 예산, 스키마, 응답 검증 테스트
  e2e/planner.spec.ts                # 생성, 충돌, 편집, 보관, 공유 흐름 테스트
```

시안의 화면 상태는 `PlannerShell`의 `input | processing | result | conflict | error` 상태로 구현한다. 모바일과 데스크톱은 같은 데이터·기능 컴포넌트를 사용하고 Tailwind breakpoint만 달리 적용하므로, 두 시안의 기능이 분기되어 달라지는 것을 막는다.

## 환경변수

| 변수명 | 필수 | 노출 범위 | 용도 |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | 예 | 서버 전용 | Route Handler가 Gemini API를 호출할 때만 사용한다. `NEXT_PUBLIC_` 접두사를 절대 붙이지 않는다. |
| `GEMINI_MODEL` | 아니오 | 서버 전용 | Structured Outputs를 지원하는 생성 모델명. 미설정 시 `gemini-3.8-flash`를 사용한다. |
| `GEMINI_TIMEOUT_MS` | 아니오 | 서버 전용 | 모델 호출 제한 시간. 미설정 시 애플리케이션 기본값을 사용한다. |
| `UPSTASH_REDIS_REST_URL` | 예(운영) | 서버 전용 | 생성 API rate limit 저장소 주소. |
| `UPSTASH_REDIS_REST_TOKEN` | 예(운영) | 서버 전용 | 생성 API rate limit 저장소 접근 토큰. |
| `NEXT_PUBLIC_APP_NAME` | 아니오 | 브라우저 허용 | 화면에 표시할 서비스명. 비밀값이 아닌 경우에만 사용한다. |

- `.env.local`에는 개발용 값을 두고 Git에 올리지 않는다. `.env.example`에는 변수명만 남긴다.
- Vercel Project Settings에서 Development, Preview, Production 값을 분리해 등록한다. 환경변수 변경은 새 배포부터 적용되므로 변경 뒤 재배포한다. [Vercel 환경변수 문서](https://vercel.com/docs/environment-variables)
- Next.js에서 `NEXT_PUBLIC_` 접두사가 붙은 값은 브라우저 번들에 포함될 수 있다. 따라서 API 키·rate limit 토큰·모델 운영 설정에는 이 접두사를 사용하지 않는다. [Next.js 환경변수 문서](https://nextjs.org/docs/pages/guides/environment-variables)

## API 요청·응답 구조

### `POST /api/plans`

요청 본문은 UI 상태가 아닌 검증된 여행 조건만 담는다. `countMin/countMax`를 사용해 `3~4명`, `5인 이상`처럼 범위 인원을 정확한 단일 인원으로 오해하지 않게 한다.

```json
{
  "destination": "제주도 서귀포 및 동부",
  "schedule": {
    "departureDate": "2026-10-09",
    "arrivalDate": "2026-10-11"
  },
  "travelers": {
    "countMin": 2,
    "countMax": 2,
    "relationship": "couple"
  },
  "totalBudgetKrw": 1200000,
  "styles": ["nature_healing", "cafe_gourmet"],
  "avoidances": ["긴 도보 이동(1시간 이상)", "대기시간 40분 이상 맛집"]
}
```

성공 응답은 모델의 원문 텍스트가 아니라 서버 검증을 통과한 JSON만 반환한다. `source`는 생성값과 이후 브라우저에서 수정한 값을 구분하기 위한 필드다.

```json
{
  "requestId": "uuid",
  "status": "ok",
  "plan": {
    "version": 1,
    "source": "ai",
    "summary": {
      "title": "서귀포·동부 힐링 로드",
      "destination": "제주도 서귀포 및 동부",
      "duration": { "nights": 2, "days": 3 },
      "movementFatigue": {
        "level": "low",
        "reason": "연속 장거리 이동을 줄이고 휴식 시간을 포함한 참고 지표입니다.",
        "source": "ai"
      }
    },
    "days": [
      {
        "id": "day-1",
        "date": "2026-10-09",
        "title": "서귀포 도착과 휴식",
        "source": "ai",
        "items": [
          {
            "id": "item-1",
            "time": "13:00",
            "type": "meal",
            "title": "점심 식사 제안",
            "description": "대기 시간이 길면 인근 대체 식당을 고려합니다.",
            "estimatedCostKrw": 32000,
            "priceStatus": "estimate",
            "source": "ai"
          }
        ]
      }
    ],
    "budget": {
      "currency": "KRW",
      "totalBudgetKrw": 1200000,
      "categories": [
        { "id": "lodging", "name": "숙소", "amountKrw": 380000, "source": "ai" }
      ],
      "allocatedTotalKrw": 1170000,
      "remainingKrw": 30000,
      "perPerson": { "minKrw": 585000, "maxKrw": 585000 },
      "priceStatus": "estimate"
    },
    "checklist": [
      { "id": "id", "label": "신분증", "checked": false, "source": "ai" }
    ],
    "rainyAlternatives": [
      {
        "id": "rain-1",
        "dayId": "day-1",
        "originalItemId": "item-1",
        "replacementTitle": "실내 대안",
        "description": "우천 발생 시 참고할 대안입니다.",
        "source": "ai"
      }
    ],
    "notices": [
      "금액·운영시간·휴무·예약 필요 여부는 추정 또는 확인 필요 정보입니다.",
      "방문 전 공식 채널에서 다시 확인해주세요."
    ]
  }
}
```

직접 편집은 별도 API 없이 클라이언트에서 `source: "user"`로 바꾸고 Zod로 검증한다. 예를 들어 예산을 수정하면 `categories[].amountKrw`만 바꾸고 `allocatedTotalKrw`, `remainingKrw`, `perPerson`은 클라이언트 계산 함수가 다시 만든다. 이후 F-18 보관 시 이 수정본 전체를 localStorage에 저장한다.

오류 응답은 내부 제공자·스택 정보·비밀값을 노출하지 않고 아래의 안정된 코드만 반환한다.

```json
{
  "requestId": "uuid",
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR | CONDITION_CONFLICT | RATE_LIMITED | GENERATION_FAILED",
    "message": "사용자에게 표시할 안전한 안내 문구",
    "fieldErrors": { "totalBudgetKrw": "총예산을 확인해주세요." },
    "proposals": [
      { "type": "increase_budget", "label": "예산을 조정해 다시 만들기" }
    ]
  }
}
```

- `400 VALIDATION_ERROR`: 요청 스키마·날짜·예산·인원과 관계의 조합 오류
- `409 CONDITION_CONFLICT`: 실시간 최저가가 아닌 추정 계획 기준에서 조건이 양립하기 어려움
- `429 RATE_LIMITED`: IP별 생성 한도 초과
- `502/504 GENERATION_FAILED`: 모델 응답 실패·시간 초과·출력 스키마 불일치

## 보안 원칙

1. **키는 서버에서만 읽는다.** `GEMINI_API_KEY`는 서버 전용 AI 모듈에서만 `process.env`로 읽고 Gemini API 요청의 서버 측 `x-goog-api-key` 헤더에만 사용한다. Client Component, `NEXT_PUBLIC_*`, 브라우저 요청 헤더, localStorage, 오류 응답, 로그에 넣지 않는다.
2. **클라이언트는 신뢰하지 않는다.** 입력은 브라우저 UX용 Zod 검증 뒤에도 Route Handler에서 같은 스키마로 재검증한다. 본문 크기·문자열 길이·태그 개수·배열 길이를 제한한다.
3. **모델 출력도 신뢰하지 않는다.** Structured Outputs를 요청하고, 반환 JSON을 `GeneratedPlanSchema`로 다시 검사한다. 날짜별 코스·예산·준비물·우천 대안·확인 안내가 빠졌거나 금액이 음수면 응답하지 않는다.
4. **프롬프트 주입을 격리한다.** 시스템 지침은 서버 파일에 고정하고, 사용자 입력은 역할 지침이 아닌 JSON 데이터로 직렬화한다. 모델에는 웹 검색·파일 검색·함수 호출·지도·예약·결제 도구를 제공하지 않는다. “실시간 가격/운영시간을 보장하지 말 것”과 “출력은 스키마만 따를 것”을 시스템 지침과 후검증에 중복 적용한다.
5. **개인정보와 보관 범위를 최소화한다.** 로그인·계정·서버 일정 저장을 만들지 않는다. 사용자가 `내 일정 보관`을 선택한 경우에만 현재 브라우저의 localStorage에 저장하고, 자동 동기화·서버 백업을 하지 않는다. Gemini API 제공자 측 데이터 처리는 해당 제공자의 정책을 따르며, 애플리케이션은 요청 원문을 자체 로그에 남기지 않는다.
6. **호출 비용과 서비스 남용을 제어한다.** API는 같은 오리진의 `POST`만 허용하고, IP 기준 rate limit·요청 시간 제한·동시 요청 제한을 둔다. rate limit 저장소가 운영 환경에서 준비되지 않았으면 생성 API는 fail-closed로 처리한다.
7. **XSS·외부 이동을 통제한다.** 모델과 사용자가 만든 텍스트는 React 기본 이스케이프 렌더링만 사용하며 `dangerouslySetInnerHTML`을 금지한다. 지도 이동은 허용 목록의 고정 도메인에 `encodeURIComponent`로 만든 검색어만 붙인다. 보안 헤더는 CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`을 적용한다.
8. **안전한 오류·로그 정책을 적용한다.** 사용자에게는 코드별 복구 행동만 보여 주고, 제공자 원문 오류·프롬프트·API 키는 숨긴다. 운영 로그에는 requestId, 상태 코드, 지연 시간만 남기며 여행지·날짜·제외 조건 등 원문 입력은 기본적으로 기록하지 않는다.

## 대안 비교

| 선택 | 채택 이유 | 포기하는 대안과 이유 |
| --- | --- | --- |
| Next.js App Router + Vercel | UI와 서버 Route Handler를 한 프로젝트로 배포해 시안 구현과 API 키 보호를 동시에 만족한다. Route Handler는 `app` 디렉터리에서 Web Request/Response API 기반의 요청 처리기를 만들 수 있다. [Next.js Route Handlers 문서](https://nextjs.org/docs/app/getting-started/route-handlers) | Vite 정적 SPA는 가볍지만 생성 API 키를 보호할 서버가 별도로 필요하다. Express/Fastify 별도 서버는 유연하지만 배포·운영 구성이 늘어난다. |
| Gemini GenerateContent + Structured Outputs | 계획 결과를 화면·직접 편집·저장에 적합한 JSON으로 제한해 문자열 파싱 오류를 줄인다. | 자유 텍스트 응답 후 JSON을 파싱하는 방식은 필수 결과 누락, 코드 블록 혼입, 편집 데이터 불일치 위험이 커서 선택하지 않는다. |
| `useReducer` + Zod | 상태 전이와 직접 편집의 불변 업데이트를 명확히 하고, 클라이언트·서버의 검증 규칙을 공유한다. | 전역 상태 라이브러리는 현재 화면 규모에는 과하다. 단, 협업·다중 화면·오프라인 동기화가 생기면 Zustand/Redux 도입을 재검토한다. |
| localStorage | 로그인 없는 기기 내 일정 보관이라는 PRD·FRD에 가장 단순하게 맞는다. | Supabase/Postgres 등 서버 DB는 기기 간 동기화·공유 링크에 유리하지만 계정, 데이터 보존, 개인정보 처리 범위를 새로 만든다. |
| Web Share/Clipboard 텍스트 공유 | 서버 저장 없이 현재 결과를 전달할 수 있다. | 공개 공유 URL은 서버 저장·접근 제어·만료 정책이 필요하므로 MVP에서 제외한다. |
| 외부 지도 검색 URL | 장소 확인을 지원하면서 지도 API 키, 지도 렌더링, 실시간 길찾기·위치 추적을 만들지 않는다. | 지도 SDK/API 연동은 지도 화면과 실시간 데이터 책임을 늘리고 PRD의 실시간 길찾기 제외 범위를 넘어선다. |
| Upstash Redis rate limit | 로그인 없는 AI 생성 API에 서버리스 환경에서도 일관된 호출 한도를 적용한다. | 메모리 기반 rate limit은 Vercel 함수 인스턴스 간 공유되지 않아 우회 가능하다. 별도 자체 DB는 MVP 운영 부담이 크다. |
