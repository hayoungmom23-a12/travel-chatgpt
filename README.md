# 여정 AI

여행 조건을 입력하면 Gemini AI가 일자별 여행 계획 초안을 만들어 주는 웹 도구입니다. 여행지, 일정, 인원, 예산, 여행 스타일, 동행자 관계, 피하고 싶은 것을 반영해 일정의 출발점을 제공합니다.

> 가격, 운영시간, 휴무, 예약 가능 여부는 실시간 정보가 아닌 추정 정보입니다. 방문 전에는 반드시 공식 채널에서 다시 확인해야 합니다.

## 주요 기능

- 여행지, 날짜, 인원, 동행자 관계, 예산, 여행 스타일, 제외 조건 입력
- AI 기반 일자별 코스와 시간대별 활동 제안
- 예상 예산표와 1인 참고 금액 표시
- 준비물 체크리스트와 우천 시 실내 대안 제공
- 코스, 예산, 체크리스트, 우천 대안 직접 편집
- 로그인 없이 현재 브라우저에 일정 보관
- 결과 공유 및 외부 지도 검색 연결
- 입력 조건 충돌, API 키 설정, 요청 한도, Gemini 일시 오류, 계획 형식 오류를 구분한 안내

## 사용 기술

- Next.js 16, React 19, TypeScript
- Tailwind CSS
- React Hook Form, Zod
- Gemini GenerateContent REST API

## 로컬에서 실행하기

### 1. 준비물

- Node.js 설치
- Gemini API 키

### 2. 프로젝트 폴더에서 명령 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000/`을 엽니다. 3000번 포트를 다른 프로젝트가 사용 중이면 다음처럼 다른 포트를 지정할 수 있습니다.

```bash
npm run dev -- -p 3100
```

이 경우 `http://localhost:3100/`으로 접속합니다. 로컬 웹사이트를 사용하는 동안에는 `npm run dev`를 실행한 터미널을 켜 둬야 합니다.

## API 키 설정

프로젝트 최상위 폴더에 있는 `.env` 파일을 메모장으로 열고, `=` 오른쪽에 본인의 Gemini API 키를 입력합니다.

```env
GEMINI_API_KEY=본인의_Gemini_API_키
GEMINI_MODEL=
GEMINI_TIMEOUT_MS=
```

- `GEMINI_MODEL`을 비워 두면 기본 모델인 `gemini-3.8-flash`를 사용합니다.
- `.env` 파일을 저장한 뒤에는 개발 서버를 껐다가 다시 실행해야 변경한 키가 적용됩니다.
- `.env`는 `.gitignore`에 등록되어 있어 GitHub에 올라가지 않습니다.
- API 키는 GitHub, 채팅, 과제 제출 화면에 올리거나 공유하면 안 됩니다.

## 오류 안내

| 화면 안내 | 의미 | 할 일 |
| --- | --- | --- |
| API 키 설정 필요 | `.env`에 API 키가 없을 수 있음 | `GEMINI_API_KEY`를 확인하고 서버를 다시 실행 |
| API 키 확인 | 키가 잘못되었거나 프로젝트 권한이 없음 | 키와 Google AI Studio 프로젝트 권한 확인 |
| 요청 한도 도달 | Gemini 요청 횟수 또는 사용량 한도 초과 | 생성 버튼을 반복해서 누르지 말고 잠시 기다린 뒤 한 번만 재시도 |
| Gemini 일시 오류 | Gemini 서버가 일시적으로 바쁘거나 응답하지 않음 | 잠시 뒤 다시 시도 |
| 계획 형식 오류 | AI 응답이 화면에 표시할 형식과 맞지 않음 | 같은 조건으로 다시 시도 |

## Vercel 배포

1. GitHub에 이 저장소를 푸시합니다.
2. [Vercel](https://vercel.com/)에서 GitHub 저장소를 Import합니다.
3. Vercel의 Project Settings → Environment Variables에 `GEMINI_API_KEY`를 등록합니다.
4. 필요하면 `GEMINI_MODEL=gemini-3.8-flash`를 추가합니다.
5. Deploy를 누릅니다.

Vercel에 등록하는 환경변수는 GitHub의 `.env` 파일과 별도로 관리됩니다. API 키 값을 GitHub에 푸시하지 않습니다.

## 프로젝트 문서

- [PRD](docs/01_PRD.md)
- [FRD](docs/03_FRD.md)
- [TRD](docs/04_TRD.md)
- [개발 계획](docs/05_개발계획.md)

## 제공하지 않는 기능

- 숙소, 교통, 관광, 식당 예약 및 결제
- 실시간 가격, 좌석, 재고, 운영시간, 휴무 정보 보장
- 실시간 길찾기 및 위치 추적
- 로그인과 계정 관리
