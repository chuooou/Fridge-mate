# 냉장고를 부탁해 · Fridge Mate

재료를 직접 등록하고 냉장·냉동 상태와 보관기한을 확인하는 반응형 웹 MVP입니다.

## 실행

Node.js 22.12 이상을 사용합니다. 개발 환경의 MSW 설정은 `.env.development`에 포함되어 있습니다.

```bash
npm ci
npm run dev
```

터미널에 표시되는 로컬 주소를 열어주세요. 기본 주소는 `http://127.0.0.1:5173`입니다.

**체험 계정:** 닉네임 `demo` / 비밀번호 `fridge1234`. 회원가입으로 빈 냉장고부터 시작할 수도 있습니다.

## 구현된 기능

- 닉네임 회원가입·로그인·로그아웃, 보호 경로와 로그인 후 원래 화면 복귀
- 재료명·수량·단위·냉장/냉동·등록 날짜 직접 입력
- 표준 재료 선택에 따른 예상 날짜 기본값, 날짜 직접 변경 및 자동값 복원
- 실제 소비기한/유통기한과 사용자 지정 예상 기한 구분
- 내 냉장고 목록, 위치별 건수, 기한 임박 표시, 필터·정렬
- 입력 검증, 빈 화면, 요청 실패와 재시도, 계정별 캐시 분리

현재는 **Frontend + MSW 데모**입니다. 데이터와 로그인 상태는 메모리에만 있으며 새로고침하면 초기화됩니다. 자동 보관기간은 개발용 예시이므로 실제 식품 보관 기준으로 사용하지 않습니다. 사진·AI·친구·장보기·실제 Backend는 아직 구현하지 않았습니다.

## 검증

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
```

Vitest·React Testing Library·MSW로 API 계약, 날짜/정렬과 가입 → 등록 → 계정 전환 흐름을 검증합니다.

## API 연결 설정

`.env.example`을 참고해 `.env.local`에서 설정할 수 있습니다.

| 설정 | 기본 개발값 | 역할 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | Axios API 주소 |
| `VITE_MOCK_AUTH` | `true` | 인증 mock 사용 |
| `VITE_MOCK_FRIDGE` | `true` | 재료·목록·예상 기한 mock 사용 |

실제 API 전환 시 해당 mock 플래그를 `false`로 설정하고 개발 서버를 다시 시작합니다. MSW는 개발 모드에서만 활성화합니다. 따라서 `npm run build` 결과를 단독 정적 배포하면 데이터 기능은 동작하지 않으며, 실제 Backend 연결이 필요합니다. GitHub에는 소스 프로젝트로 올리고 로컬 데모는 `npm run dev`로 확인하세요.

## AI Development Approach

이 프로젝트는 **Compound Engineering을 공부한 뒤, 학습한 내용을 실제 프로젝트 개발 과정에 적용해보기 위해 시작했습니다.**

단순히 AI에게 기능 구현을 요청하는 방식에서 끝내지 않고, 개발 과정에서 얻은 Context와 문제 해결 경험이 다음 작업에도 이어질 수 있는 구조를 만드는 것을 목표로 했습니다.

### 공부한 내용

이 프로젝트는 Compound Engineering을 공부한 뒤,
학습한 내용을 실제 개발 과정에 적용해보기 위해 시작했습니다.

[Compound Engineering - AI 코딩을 반복 작업이 아니라 쌓이는 개발로 만드는 방법](https://github.com/chuooou/ai-engineering-notes/blob/main/compound-engineering/AI%20%EC%BD%94%EB%94%A9%EC%9D%84%20%EB%B0%98%EB%B3%B5%20%EC%9E%91%EC%97%85%EC%9D%B4%20%EC%95%84%EB%8B%88%EB%9D%BC%20%EC%8C%93%EC%9D%B4%EB%8A%94%20%EA%B0%9C%EB%B0%9C%EB%A1%9C%20%EB%A7%8C%EB%93%9C%EB%8A%94%20%EB%B0%A9%EB%B2%95.md)

이 프로젝트에서는 해당 내용을 바탕으로 다음 개발 흐름을 적용합니다.

```text
Plan
↓
Work
↓
Review
↓
Compound
↓
Repeat
```

### 프로젝트에 적용한 방식

AI Coding Agent가 매 작업마다 처음부터 Context를 다시 전달받는 것이 아니라, 프로젝트 안에 필요한 정보와 개발 과정에서 얻은 지식을 계속 쌓을 수 있도록 구성했습니다.

```text
AGENTS.md
→ AI Agent가 따라야 할 개발 / 검증 / Compound 규칙

PROJECT.md
→ 프로젝트 요구사항과 기술적 방향

docs/plans
→ 기능을 만들기 전에 정리한 설계와 의사결정

docs/solutions
→ 개발하면서 발생한 문제와 원인, 해결 방법
```

기능 구현 중 반복 가능성이 있는 문제를 발견하면 단순히 수정하고 끝내지 않습니다.

```text
문제 발생
↓
원인 분석
↓
해결
↓
docs/solutions 기록 여부 판단
↓
프로젝트 전체에 적용할 수 있는 규칙인지 판단
↓
필요한 경우 AGENTS.md 반영
↓
가능하다면 Test / Type / Lint 등 자동 검증으로 발전
```

`AGENTS.md`에는 모든 오류를 기록하지 않고, 다른 기능에서도 반복될 가능성이 있고 앞으로 AI Agent가 계속 알아야 하는 내용만 일반적인 규칙으로 남깁니다.

이를 통해 **이번 작업에서 배운 내용을 다음 작업에서는 다시 설명하지 않아도 되는 개발 환경**을 만드는 것을 목표로 합니다.
