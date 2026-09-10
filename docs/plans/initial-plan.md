# Phase 1 초기 개발 Plan

작성일: 2026-09-10  
상태: 검토용 계획. 구현은 시작하지 않았다.

## 1. 목적과 기준 문서

닉네임으로 가입·로그인한 사용자가 재료를 직접 등록하고, 냉장·냉동 재료와 보관기한을 모바일과 데스크톱에서 확인하는 최소 사용자 Flow를 만든다.

현재 루트에는 다음 두 문서만 존재한다. 소스 코드, 패키지 설정, 기존 API, 재사용할 컴포넌트, 기존 plans/solutions는 없다. 존재하지 않는 구현 패턴을 탐색하거나 가정하지 않는다.

| 실제 파일 | 확인된 내용 | 이번 계획에서의 역할 |
| --- | --- | --- |
| `AGENTS.md.txt` | 「냉장고를 부탁해」 서비스 요구사항과 기술 스택, §28 Phase 1 | 제품 명세 |
| `PROJECT.md.txt` | 「AI Development Guide」, Plan → Work → Review → Compound → Repeat | 개발 워크플로 |

요청된 `AGENTS.md`와 `PROJECT.md`는 실제로 없고, `.txt` 확장자 및 내용의 역할이 뒤바뀌어 있다. 이번 작업은 내용에 따라 해석하며 원본 이름과 내용은 변경하지 않는다. 다음 구현 작업에서도 이 매핑을 먼저 확인한다. 문서명 정리는 별도 변경 사항으로 제안한다.

이번 변경은 `docs/plans/initial-plan.md` 생성 하나다. 아래 파일·API·검증 명령은 향후 구현을 위한 제안이며 현재 존재하는 것으로 취급하지 않는다.

## 2. 범위와 완료 목표

### 포함

- React + TypeScript + Vite SPA 초기 구성과 Mobile First 반응형 레이아웃.
- Axios 요청을 MSW로 처리하는 API Contract 및 성공·실패 시나리오.
- 닉네임 중복 검사, 회원가입, 로그인, 현재 사용자 확인과 로그아웃.
- 재료명 직접 입력, 수량, 단위, 냉장/냉동, 등록 날짜, 실제 날짜 또는 예상 보관기한 등록.
- 내 냉장고 목록, 냉장/냉동 건수, 기한 임박 구역, 필터와 정렬.
- 초기 로딩, 빈 목록, 폼 오류, 인증 만료, 네트워크 오류 및 재시도.
- 안정된 Auth → Ingredient/Fridge 순서로 실제 Backend 연결을 시작할 전환 단계.

### 제외

사진 촬영·업로드, OCR/Vision, AI 분석, 레시피, 장보기, 친구 공유, 가격 검색, Flutter, 공동구매, Next.js/SSR은 이번 UI 구현 범위가 아니다. 관련 메뉴·빈 feature 폴더·Provider 추상화도 미리 만들지 않는다. 재료 수정·삭제, 자동 합산, 이메일 복구도 Phase 1 필수 요구로 확대하지 않는다.

### 핵심 인수 Flow

가입 → 로그인 → 빈 냉장고 → 냉장 재료 직접 등록 → 목록 반영 → 냉동 재료 등록 → 위치 필터/정렬 → 실제 날짜와 예상 날짜 구별 → 로그아웃 → 다른 계정으로 로그인했을 때 이전 사용자의 재료가 보이지 않음.

## 3. 설계 선택과 최소 구조

요구사항에 제시된 단순 Feature-based 구조를 선택한다. 페이지에 API와 폼을 모두 넣는 방식은 시작은 빠르지만 Auth/재료의 계약과 화면 책임이 섞인다. 반대로 전체 MVP 폴더를 먼저 구성하면 Phase 1에 필요 없는 추상화가 생긴다. 페이지는 화면 조합, feature는 기능, shared는 실제 공통 코드만 담당한다.

기술 스택은 React, TypeScript, Vite, React Router, Tailwind CSS, TanStack Query, React Hook Form, Zod, Axios, MSW를 사용한다. Zustand는 전역 클라이언트 상태가 실제로 생길 때 도입한다. 현재 사용자와 재료를 저장할 목적으로 설치하지 않는다. 버전과 패키지 매니저는 명세에 없으므로 구현 시작 시 호환성을 확인하고 한 개의 lockfile로 고정한다. npm을 기본 제안으로 둔다.

아래는 각 작업 시점에 생성할 파일이며 지금 scaffold하지 않는다.

| 생성 예정 파일 | 책임 / 생성 단계 |
| --- | --- |
| `package.json`, `package-lock.json`, `index.html`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `eslint.config.js`, `.gitignore` | Vite/TypeScript, 의존성, 실행·검증 설정 / 작업 1 |
| `.env.example`, `README.md` | 공개 설정 예시, 실행 방법, mock 초기화와 검증 방법 / 작업 1부터 갱신 |
| `src/main.tsx`, `src/app/App.tsx`, `src/app/providers/AppProviders.tsx` | mock 시작 후 React 부트스트랩, Query provider / 작업 1 |
| `src/app/router/router.tsx`, `src/app/layouts/AppLayout.tsx`, `src/app/styles.css` | 라우트, 공통 반응형 틀, Tailwind 스타일 / 작업 1 |
| `src/shared/api/client.ts`, `src/shared/api/errors.ts` | Axios 인스턴스, 공통 오류 정규화 / 작업 2 |
| `src/mocks/browser.ts`, `src/mocks/handlers.ts`, `src/mocks/db.ts`, `public/mockServiceWorker.js` | MSW 초기화, 핸들러 조합, 메모리 데이터 / 작업 2 |
| `src/mocks/handlers/auth.ts`, `src/mocks/handlers/fridge.ts` | 기능별 계약과 권한·오류 응답 / 작업 2~4 |
| `src/features/auth/types.ts`, `api.ts`, `queries.ts`, `schemas.ts`, `AuthForm.tsx`, `RequireAuth.tsx` | 모두 `src/features/auth/` 하위. 인증 DTO, 통신, Query, 폼, 접근 제어 / 작업 3 |
| `src/pages/LoginPage.tsx`, `src/pages/SignupPage.tsx`, `src/pages/NotFoundPage.tsx` | 인증 화면과 없는 경로 / 작업 1·3 |
| `src/features/ingredient/types.ts`, `api.ts`, `schemas.ts`, `IngredientForm.tsx` | 모두 `src/features/ingredient/` 하위. 재료 DTO, 등록 요청, 검증, 입력 UI / 작업 4 |
| `src/features/ingredient/expiry.ts`, `expiryPolicy.ts` | 날짜 계산·표현 및 mock 전용 예상 기간 fixture / 작업 4 |
| `src/pages/AddIngredientPage.tsx` | 재료 직접 등록 화면 조합 / 작업 4 |
| `src/features/fridge/api.ts`, `queries.ts`, `selectors.ts`, `IngredientList.tsx` | 모두 `src/features/fridge/` 하위. 목록 조회, Query key, 필터·정렬, 목록 표시 / 작업 5 |
| `src/pages/FridgePage.tsx` | 내 냉장고 화면 조합 / 작업 5 |
| `src/shared/ui/AsyncState.tsx` | 두 화면 이상에서 공유하게 될 때만 로딩·빈 상태·오류 표시 추출 / 작업 5~6 |

`shared/types`에 모든 도메인 타입을 모으지 않는다. 재료 타입은 ingredient가 소유하며 fridge에서 사용한다. 목록과 등록이 공유하는 계약 외에 범용 repository, service 계층, 이벤트 버스는 추가하지 않는다.

### 라우트와 화면

| 경로 | 동작 |
| --- | --- |
| `/` | 현재 사용자 확인 완료 후 `/fridge` 또는 `/login`으로 이동 |
| `/signup` | 닉네임·비밀번호 가입, 성공 시 로그인으로 이동 |
| `/login` | 로그인 성공 시 `/fridge`로 이동 |
| `/fridge` | 인증 필요. 요약, 기한 임박 재료, 필터·정렬, 전체 목록, 추가 CTA |
| `/ingredients/new` | 인증 필요. 직접 등록 폼, 저장/취소 |
| 그 외 | 페이지를 찾을 수 없음과 돌아가기 링크 |

모바일은 한 열과 쉽게 접근할 수 있는 재료 추가 버튼, 넓은 화면은 제한된 콘텐츠 폭과 여러 열의 목록을 사용한다. 로그인·등록 폼은 데스크톱에서도 지나치게 넓어지지 않게 한다. 360px/768px/1280px에서 가로 넘침과 버튼 가림을 확인한다. 폼 label, 키보드 탐색, 오류 연결, 상태 텍스트를 제공하고 날짜 구분을 색상에만 의존하지 않는다.

## 4. 상태와 Data Flow

| 데이터 | Source of Truth |
| --- | --- |
| 현재 사용자, 재료 목록 | API 응답과 TanStack Query 캐시 |
| 입력값, 폼 제출 상태 | React Hook Form |
| 유효성 규칙 | Zod schema |
| 필터·정렬 | 화면의 React State. 새로고침 시 기본값 복원 |
| 필터 결과, 냉장/냉동 건수, 기한 임박, D-day | 목록과 현재 날짜로 계산. 별도 store에 저장하지 않음 |
| 서버 역할의 mock 데이터 | MSW 메모리 DB. UI에서 직접 읽거나 쓰지 않음 |

조회: Page → feature Query → feature API → Axios → MSW → DTO → Query 캐시 → 화면.

등록: Form → Zod 검증 → mutation → Axios → MSW 검증·저장 → 성공 시 해당 사용자 목록 무효화 → `/fridge` 이동. 실패하면 입력값을 유지하고 중복 제출을 막는다. 초기에는 optimistic update를 사용하지 않는다.

인증 Query key는 `['auth', 'me']`, 냉장고 key는 `['fridge', userId]`로 제안한다. 인증 확인 중에는 보호 화면이나 로그인 화면을 성급히 노출하지 않는다. 로그아웃/인증 만료 시 진행 중인 사용자 요청을 취소하고 사용자별 캐시를 제거한다. API 함수는 데이터 통신만 하고 navigate·toast·폼 오류 변경은 UI에서 처리한다.

## 5. 제안 API Contract

다음은 기존 Backend API가 아니라 Phase 1 MSW에서 먼저 검증할 계약 초안이다. 실제 Backend 작업 전에 요청·응답·인증 방식에 합의한다. 서버 기술 스택은 원문에 없어 여기서 정하지 않는다.

### 공통 DTO와 정책

- `User`: `id: string`, `nickname: string`. 비밀번호는 응답에 포함하지 않는다.
- `Ingredient`: `id: string`, `name: string`, `quantity: number`, `unit: string`, `storage: 'fridge' | 'freezer'`, `registeredOn: YYYY-MM-DD`, `createdAt: ISO timestamp`, `registrationMethod: 'manual'`, `actualExpiry: { date: YYYY-MM-DD, kind: 'useBy' | 'bestBefore' } | null`, `estimatedExpiry: { date: YYYY-MM-DD, basis: string } | null`.
- 등록 요청은 `name`, `quantity`, `unit`, `storage`, `registeredOn`, `actualExpiry`만 받는다. ID, 생성 시각, 등록 방식, 예상 기한은 mock 서버가 결정한다. 소유자는 인증 세션에서 결정하며 요청의 userId를 신뢰하지 않는다.
- 일반 오류: `{ error: { code: string, message: string, fieldErrors?: Record<string, string> } }`. 네트워크 오류처럼 응답이 없으면 클라이언트가 구별 가능한 오류로 정규화한다.
- 모든 개인 데이터 요청은 미인증 시 401. 일반 4xx를 자동 반복 요청하지 않는다. 목록 조회의 네트워크/5xx 재시도는 1회, mutation 자동 재시도는 끈다.

| Method / URL | 요청 | 성공 응답 | 주요 실패 |
| --- | --- | --- | --- |
| POST `/api/auth/signup` | `{ nickname, password }` | 201 `{ user: User }`; 가입은 세션을 만들지 않음 | 400 필드 오류, 409 닉네임 중복 |
| POST `/api/auth/login` | `{ nickname, password }` | 200 `{ user: User }`; 세션 설정 | 400 형식 오류, 401 자격 증명 불일치 |
| GET `/api/auth/me` | 없음 | 200 `{ user: User }` | 401 세션 없음/만료 |
| POST `/api/auth/logout` | 없음 | 204, 세션 제거 | 네트워크/5xx. 서버 실패 시 로그아웃 완료로 표시하지 않음 |
| GET `/api/fridge/ingredients` | 없음 | 200 `{ items: Ingredient[] }` | 401, 500 |
| POST `/api/fridge/ingredients` | 등록 요청 DTO | 201 `{ item: Ingredient }` | 400 필드 오류, 401, 500 |

현재 목록 규모에서는 전체 조회 후 프론트에서 필터·정렬한다. 페이지네이션이나 재료 검색 API를 미리 추가하지 않는다. 직접 검색/입력 요구는 Phase 1에서 자유 입력으로 충족한다.

### 인증과 mock 경계

실제 Backend는 HttpOnly 세션 쿠키 방식을 제안하고, Secure/SameSite, 만료, CORS·CSRF 정책은 서버 및 배포 구성과 함께 확정한다. 프론트는 Axios의 쿠키 전송 설정을 사용하고 비밀번호/토큰을 localStorage나 Zustand에 저장하지 않는다.

MSW는 메모리의 계정·현재 세션·사용자별 재료를 사용한다. 새로고침하면 seed 상태로 초기화되는 개발용 동작을 README에 명시한다. 저장 지속성을 검증한 것으로 오해하지 않게 한다. 실제 HttpOnly 쿠키의 보안 동작을 mock이 보장한다고 주장하지 않는다. 개발 fixture에는 실제 자격 증명을 넣지 않는다.

개발 환경의 명시적 mock 설정에서만 worker를 시작하고 완료 후 화면을 렌더링한다. `/api` 미처리 요청은 개발 시 계약 누락으로 드러내고 정적 자산 요청은 방해하지 않는다. 일반 production 빌드는 mock 활성화를 막으며 프론트 환경변수에 비밀 키를 넣지 않는다.

## 6. 날짜·입력 정책과 Edge Case

아래 수치·정규화 정책은 원문에 없으므로 초기 제안이다. 실제 Backend 연결 전에 같은 규칙으로 확정한다.

| 항목 | Phase 1 제안 |
| --- | --- |
| 닉네임 | 앞뒤 공백 제거, 2~20자, 한글·영문·숫자·밑줄 허용. 영문 대소문자 구분 없이 중복 판정, 표시에는 입력 대소문자 유지 |
| 비밀번호 | 8~64자, 공백을 임의 제거하지 않음. UI와 mock 모두 검사, 로그에 기록하지 않음 |
| 재료명/단위 | trim 후 각각 1~50자 / 1~10자. 단위는 자유 입력으로 불필요한 단위 변환 배제 |
| 수량 | 유한한 양수, 소수 허용. 빈 값·0·음수·NaN 거부 |
| 등록 날짜 | 기본 오늘, 유효한 날짜 필수. 미래 등록 날짜는 거부 |
| 실제 날짜 | 선택 입력. 입력하면 소비기한/유통기한 종류 필수. 과거 날짜는 경과 안내 후 저장 가능 |
| 같은 재료 재등록 | 별도 항목으로 저장. 단위·날짜가 다를 수 있어 자동 합산하지 않음 |
| 예상 계산 불가 | 실제 날짜도 fixture도 없으면 `기한 정보 없음`. 임의 기간 생성 금지 |

날짜는 날짜 전용 문자열로 주고받고, D-day는 사용자 로컬 달력 날짜 기준으로 계산한다. UTC timestamp를 잘라 등록 날짜로 사용하지 않는다. 날짜 경계 계산은 DST·월말·연말에서 일수 차이가 어긋나지 않게 순수 함수로 분리한다. 화면 복귀 또는 날짜 변경 시 오늘 기준을 갱신한다.

실제 날짜가 있으면 우선 표시하고 예상 날짜로 덮어쓰지 않는다. 예상만 있으면 `예상 보관기한`, `약 D-2`, `일반적인 보관 기준의 대략적인 예상이며 실제 상태와 보관 환경에 따라 달라질 수 있어요`를 표시한다. 실제 날짜는 종류에 맞는 라벨을 사용한다. 오늘은 `D-day`, 과거는 `기한 경과 N일`로 표시하며 예상 정보는 경과 표시에도 `예상`을 유지한다.

기한 임박은 남은 0~3일로 제안하고 경과 항목은 별도 강조한다. 기한 임박 필터는 0~3일만 포함한다. 기본 정렬은 기한 오름차순(경과 포함), 기한 없음은 마지막이다. 최근 등록순은 `createdAt` 내림차순, 이름순은 한국어 기준이며 동률은 ID로 안정화한다. 위치별 건수는 전체 항목 수로 계산하며 단위가 다른 수량을 합치지 않는다.

예상 보관기간의 실제 근거 데이터는 제공되지 않았다. MSW에서는 테스트용임이 명확한 소수 재료 fixture로 등록 날짜 + 보관 위치별 일수 계산 Flow만 검증한다. 이를 실제 식품 보관 기준으로 출시하지 않는다. 실제 데이터 근거·정책이 확정되면 Backend가 계산 결과와 basis를 제공하고 프론트는 표시만 담당한다.

## 7. 구현 순서 — 향후 Work 체크리스트

각 작업은 Plan 확인 → 작은 구현 → 해당 검증 → Reviewer 관점 재검토 → 필요한 지식 기록으로 끝낸다. 문제 발견 시 원인을 확인하고 이 Plan을 먼저 수정한다. 아래 체크박스는 현재 모두 미착수다.

### 작업 1. 실행 가능한 반응형 SPA 기반

- [ ] 3절의 초기 설정 파일과 app/router/layout을 생성하고 필요한 패키지만 설치한다.
- [ ] `/login`, `/signup`, `/fridge`, `/ingredients/new`, 404 경로 및 공통 레이아웃을 연결한다. 기능 없는 미래 메뉴는 만들지 않는다.
- [ ] `dev`, `lint`, `typecheck`, `build` 스크립트를 실제 package.json에 정의하고 README에 기록한다.
- [ ] 세 화면 폭에서 이동·레이아웃·키보드 접근을 확인하고 lint/typecheck/build를 실행한다.

완료 기준: SPA가 실행되고 경로와 반응형 틀이 동작한다. 아직 구현되지 않은 기능이 작동한다고 표시하지 않는다.

### 작업 2. API와 MSW 기반

- [ ] 공통 Axios·오류 타입과 5절 DTO를 정의한다. API 함수는 화면 부수효과를 포함하지 않는다.
- [ ] mock DB와 worker 초기화, Auth/Fridge 핸들러를 연결한다.
- [ ] 빈 목록, 정상 데이터, 지연, 400/401/409/500, 네트워크 오류를 재현 가능하게 구성한다. 테스트에서는 handler override로 전환한다.
- [ ] 직접 UI에서 DB를 읽지 않는지, 미인증 401과 사용자별 데이터 분리를 확인한다.
- [ ] 의미 있는 계약·상태 통합 테스트를 위해 Vitest와 React Testing Library, jsdom 및 테스트용 MSW server를 도입한다. Vite 호환 테스트 실행과 접근성 기반 UI 검증 목적이며 런타임 번들에는 포함하지 않는다.

완료 기준: 실제 Axios 요청으로 계약의 성공·실패를 재현하며 mock 초기화 전에 API가 새지 않는다.

### 작업 3. 회원가입·로그인·세션 화면

- [ ] `auth`의 schema/API/Query와 인증 화면을 연결한다.
- [ ] 가입 중복 409는 닉네임 필드에, 로그인 401은 자격 증명 오류로 표시한다. 최초 `me` 401은 비로그인 상태로 처리한다.
- [ ] 보호 경로의 인증 로딩·오류·미로그인 분기를 구현한다. 인증 확인 네트워크 실패를 무조건 미로그인으로 바꾸지 않는다.
- [ ] 로그인·로그아웃 및 계정 변경에서 캐시 취소·제거를 검증한다.

완료 기준: 가입 후 로그인할 수 있고 미인증 보호 경로 접근 및 계정 간 데이터 노출을 막는다.

### 작업 4. 직접 등록과 날짜 정책

- [ ] ingredient 타입·schema·폼을 만들고 이름/수량/단위/보관 위치/날짜를 입력받는다.
- [ ] 실제 날짜와 예상 날짜를 별도 필드로 유지하고 mock 예상 정책 및 계산 함수를 추가한다.
- [ ] 등록 성공 시 목록 key를 무효화하고 내 냉장고로 이동한다. 요청 실패 시 폼을 유지하며 취소는 저장하지 않는다.
- [ ] 수량·날짜 경계·중복 제출·예상 기준 없음 테스트를 통과시킨다.

완료 기준: 냉장/냉동 각각 등록 가능하고 실제/예상 날짜가 응답부터 UI까지 구별된다.

### 작업 5. 내 냉장고 목록

- [ ] 사용자별 Query와 목록 UI를 연결한다.
- [ ] 전체/냉장/냉동/기한 임박 필터, 기한/최근 등록/이름 정렬 및 위치별 건수를 구현한다.
- [ ] 초기 빈 목록과 필터 결과 없음 문구를 구분하고 재료 추가 경로를 제공한다.
- [ ] 실제·예상·기한 없음·경과 재료의 표시와 자정 경계 갱신을 검증한다.

완료 기준: 등록 결과를 즉시 재조회하며 필터·정렬·기한 표시가 같은 DTO를 일관되게 사용한다.

### 작업 6. 오류 복구와 통합 검증

- [ ] 최초 조회 실패는 오류 화면과 재시도, background refetch 실패는 기존 목록과 비차단 안내를 제공한다.
- [ ] 400은 필드 오류, 401은 인증 복구, 예상 밖 403은 접근 불가, 404는 없는 페이지/자원, 5xx·네트워크는 재시도로 처리한다. 모두 Toast 하나로 대체하지 않는다.
- [ ] 핵심 인수 Flow와 세 가지 화면 폭, 키보드·label·오류 연결을 검증한다.
- [ ] 사용 가능한 검증 명령의 실제 결과와 남은 제한을 기록한다.

완료 기준: 정상 흐름과 실패 복구가 재현되고 미검증 항목이 완료로 표시되지 않는다.

### 작업 7. Phase 1부터 Backend 순차 연결

- [ ] Auth mock Flow가 안정되면 서버 스택·저장소·배포 환경과 세션 정책을 정하는 별도 Auth Backend Plan을 작성한다. Phase 5까지 기다리지 않는다.
- [ ] 합의된 계약으로 Auth Backend를 구현하는 후속 작업에서 비밀번호 해시, 닉네임 유일성, 세션/쿠키, 실제 새로고침 유지와 로그아웃을 검증한다.
- [ ] Auth 계약 테스트를 실제 API에서도 확인하고 Auth mock 핸들러만 비활성화한다. 남은 Fridge mock은 명시적으로 유지하며 전환 기간의 테스트 사용자 식별 방법을 합의한다.
- [ ] Ingredient/Fridge Flow 안정 후 동일하게 별도 Backend Plan → 소유권 검사와 저장 → 실제 API 연결 → 해당 mock 제거 순서로 진행한다.

완료 기준: mock UI 검증과 실제 API 연결의 완료 상태를 별도로 보고한다. Backend 기술 선택이 필요한 시점에 확정하며 이 문서만으로 서버가 구현되었다고 간주하지 않는다.

## 8. 검증 계획

검증 파일은 필요한 작업 시점에 생성한다. 구현 전에 핵심 도메인/상태 테스트의 실패를 확인하고 최소 구현 후 통과시킨다. 설정 파일이나 단순 마크업을 그대로 반복하는 테스트는 만들지 않는다.

| 예정 파일 | 반드시 확인할 행동 |
| --- | --- |
| `src/test/setup.ts`, `src/mocks/server.ts` | 테스트마다 mock DB/handler/Query 캐시 초기화, 실제 네트워크 의존 방지 |
| `src/features/auth/auth.integration.test.tsx` | 중복 닉네임, 틀린 비밀번호, 인증 로딩/만료, 계정 전환 후 이전 목록 제거 |
| `src/features/ingredient/expiry.test.ts` | 실제 우선, 예상 라벨, 냉장/냉동 차이, 계산 근거 없음, 오늘/경과/월말/연말/시간대 경계 |
| `src/features/ingredient/IngredientForm.test.tsx` | 양수 수량·날짜 검증, 실패 시 입력 유지, 중복 제출 방지, 성공 후 목록 갱신 |
| `src/features/fridge/selectors.test.ts` | 위치 건수, 임박 경계 0/3/4일, 경과 분리, 기한 없음 마지막, 안정적 정렬 |
| `src/features/fridge/FridgePage.test.tsx` | 빈 목록/필터 빈 결과 구분, 최초 실패 재시도, background 실패 데이터 유지 |

자동 검증은 구현 중 정의할 `npm run lint`, `npm run typecheck`, `npm run test -- --run`, `npm run build`를 제안한다. 현재 해당 명령은 존재하지 않으므로 실행하지 않는다. 작업 시 실제 package.json과 실행 가능 여부를 확인하고 성공/실패 및 미실행 이유를 보고한다.

브라우저에서는 핵심 인수 Flow를 수동 확인한다. 초기에는 E2E 전용 의존성을 추가하지 않고, 반복 회귀 비용이 커질 때 자동화 필요성을 재평가한다. mock 새로고침 초기화와 실제 Backend 연결 후 영속성 검증을 구별한다.

## 9. Review와 Compound

Review는 구현 설명을 다시 읽는 대신 요구사항과 사용자 행동을 기준으로 검토한다. 동일 에이전트가 Reviewer 역할로 전환할 수 있으며 이번 Plan을 위해 별도 에이전트를 필수화하지 않는다.

- P1: 계정 간 데이터 노출, 인증 없는 접근, 실제/예상 기한 혼동, 기본 Flow 불능. 다음 단계 전에 수정한다.
- P2: 입력 손실, 오류 복구 누락, 상태 중복, 날짜·정렬 경계 오류, 주요 접근성 문제. 요구사항 영향에 따라 수정하고 결과를 기록한다.
- P3: 필수 동작을 바꾸지 않는 표현·구조 개선. 범위를 늘리지 않고 선택한다.

각 Work 종료 시 원인·해결·재발 가능성·다른 기능 적용 가능성을 확인한다. 구조적인 문제나 반복 가능한 기술 결정만 `docs/solutions/<topic>.md`에 Problem / Cause / Solution / Prevention / Generalizable Rule 형식으로 기록한다. 실제 학습 내용이 없으면 빈 solutions 폴더나 가상의 해결 기록을 만들지 않는다.

공통 규칙 승격은 필요성과 문안을 먼저 제안하고 개발자 판단을 따른다. AGENTS 문서를 임의 수정하지 않는다. 가능한 예방은 문서 추가보다 타입·테스트·Lint로 반영한다.

이번 Plan 작성에서 확인한 지식은 문서 파일명·역할 불일치이며 1절에 기록했다. 원인은 확인되지 않았으므로 추정하지 않는다. 현재는 별도 solution이나 공통 규칙 추가보다 향후 파일명 정리를 제안한다.

## 10. 계획 자체의 검토 결과와 확정 시점

Phase 1의 초기 구성·Responsive·MSW·가입/로그인·닉네임·직접 등록·냉장/냉동·내 냉장고·보관기한·Error Handling을 작업 1~6에 매핑했다. Backend 순차 전환은 작업 7에 두었고 이후 Phase 기능은 제외했다. Source of Truth, API 초안, 파일 책임, 오류 복구, 검증과 Compound 절차를 포함했다.

닉네임·비밀번호 규칙, 기한 임박 3일, mock 초기화 정책과 세션 방식은 제안이다. 프론트 구현 시 먼저 확인할 정책으로 유지한다. 실제 보관기간 데이터 근거와 서버 스택·인증·배포 정책은 실제 Backend 연결 전 확정이 필요하다. 새 요구사항이나 계약 변경이 생기면 영향을 받는 DTO·폼·mock·테스트 계획을 함께 갱신한다.

현재 완료 범위는 이 Plan 문서 작성 및 요구사항 대조 검토다. 의존성 설치, 소스·설정 생성, 앱 실행, 테스트 실행, Backend 구현은 수행하지 않았다. 후속 구현 요청 전에는 Work 단계로 넘어가지 않는다.
