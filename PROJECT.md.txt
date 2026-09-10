# AI Development Guide

이 문서는 AI Coding Agent가 이 프로젝트에서 작업할 때 따라야 하는 공통 개발 원칙을 정의한다.

목표는 단순히 코드를 빠르게 생성하는 것이 아니다.

문제를 이해하고 → Context를 확인하고 → Plan을 세우고 → 구현하고 → 검증하고 → Review하고 → 이번 작업에서 얻은 지식을 다음 작업에 남기는 것을 목표로 한다.

기본 Workflow는 다음과 같다.

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

---

# 1. Core Principle

요청을 받자마자 바로 코드를 작성하지 않는다.

먼저 다음을 확인한다.

 사용자가 실제로 해결하려는 문제
 `PROJECT.md`의 요구사항
 현재 프로젝트 구조
 이미 존재하는 코드
 재사용 가능한 Component  Utility  API
 관련 `docsplans`
 관련 `docssolutions`

기존 코드가 없는 새 프로젝트라면 존재하지 않는 패턴을 찾으려고 하지 않는다.

`PROJECT.md`를 기준으로 필요한 최소 구조부터 설계한다.

---

# 2. Plan

여러 파일에 영향을 주거나 새로운 기능을 만드는 작업은 구현 전에 Plan을 작성한다.

복잡한 작업은 다음 위치에 기록한다.

```text
docsplans
```

예

```text
docsplansinitial-plan.md
docsplansauth.md
docsplansimage-analysis.md
```

Plan에는 필요에 따라 다음을 포함한다.

 목적
 현재 구조
 참고할 기존 코드
 새로 만들 파일
 수정할 파일
 각 파일의 책임
 Data Flow
 State의 Source of Truth
 API Contract
 예상 Edge Case
 Error Handling
 구현 순서
 검증 방법

과도한 설계는 피한다.

현재 요구사항을 구현하는 데 필요한 최소한의 구조를 우선한다.

---

# 3. Work

Plan을 기준으로 구현한다.

기본 원칙

 기존 코드 스타일을 유지한다.
 필요한 부분만 수정한다.
 요청과 관계없는 코드를 함께 리팩터링하지 않는다.
 이미 존재하는 기능을 중복 구현하지 않는다.
 필요 이상의 추상화를 만들지 않는다.
 미래 기능을 지나치게 가정하지 않는다.
 새로운 Library를 이유 없이 추가하지 않는다.
 존재하지 않는 API나 Type을 추측하지 않는다.
 같은 State를 여러 곳에서 중복 관리하지 않는다.
 계산 가능한 값을 불필요하게 State로 만들지 않는다.
 임시 해결책으로 문제를 숨기지 않는다.

구현 중 Plan이 잘못된 것이 확인되면 억지로 유지하지 않는다.

```text
문제 발견
↓
원인 확인
↓
Plan 수정
↓
다시 구현
```

---

# 4. Validation

구현 후 현재 프로젝트에서 사용할 수 있는 검증 방법을 확인한다.

예

```text
Lint
Type Check
Unit Test
Integration Test
E2E Test
Build
```

프로젝트에 존재하지 않는 명령을 임의로 실행하지 않는다.

검증이 실패하면

```text
원인 확인
↓
최소 수정
↓
다시 검증
```

한다.

실제로 검증하지 않은 결과를 성공했다고 보고하지 않는다.

---

# 5. Review

구현이 끝나면 작성한 코드를 다시 검토한다.

가능하면 구현 Context와 Review Context를 분리한다.

반드시 다른 AI 모델을 사용할 필요는 없다.

같은 모델이라도 별도의 Reviewer 역할로 검토할 수 있다.

필요에 따라 다음 관점을 확인한다.

 Correctness
 Type Safety
 Architecture
 State Management
 Security
 Permission
 Performance
 Accessibility
 Error Handling
 Code Simplicity
 Maintainability

Review 결과는 필요하면 다음처럼 분류한다.

```text
P1
→ 반드시 수정

P2
→ 수정 권장

P3
→ 선택적 개선
```

AI Reviewer가 제안했다고 무조건 적용하지 않는다.

현재 요구사항과 프로젝트 구조를 기준으로 판단한다.

---

# 6. Compound

기능이 정상적으로 동작했다고 바로 작업을 종료하지 않는다.

이번 작업에서 다음 작업에도 사용할 수 있는 지식이 생겼는지 확인한다.

작업 완료 후 다음을 질문한다.

```text
이번 작업에서 어떤 문제가 발생했는가

실제 원인은 무엇이었는가

비슷한 문제가 다시 발생할 수 있는가

다른 기능에서도 적용할 수 있는가

다음에는 사람이 직접 알려주지 않아도 피할 수 있는가

docssolutions에 남길 가치가 있는가

AGENTS.md의 공통 규칙으로 만들 가치가 있는가

Test  Type  Lint로 자동 검증할 수 있는가
```

---

# 7. Solution 기록

모든 오류를 기록하지 않는다.

다음과 같은 경우 `docssolutions` 기록을 고려한다.

 원인을 찾기 어려웠다.
 다시 발생할 가능성이 있다.
 다른 기능에서도 발생할 수 있다.
 단순 오타가 아니라 구조적인 문제다.
 중요한 기술적 결정과 연결된다.
 다음 개발자나 AI가 알아두면 도움이 된다.

위치는 다음과 같다.

```text
docssolutions
```

권장 형식

```md
# 문제 제목

## Problem

어떤 문제가 발생했는가

## Cause

실제 원인은 무엇인가

## Solution

어떻게 해결했는가

## Prevention

다음에는 어떻게 예방할 수 있는가

## Generalizable Rule

다른 기능에서도 적용할 수 있는가
```

---

# 8. AGENTS.md 승격 기준

`docssolutions`에 기록했다고 해서 모두 `AGENTS.md`에 추가하지 않는다.

다음에 해당할 때만 공통 규칙 추가를 고려한다.

 다른 기능에서도 반복될 수 있다.
 프로젝트 전반에서 계속 적용된다.
 다음 AI 작업에서도 알아야 한다.
 하나의 일반적인 Rule로 만들 수 있다.

AI는 새로운 규칙을 발견했다고 임의로 `AGENTS.md`를 수정하지 않는다.

먼저 다음을 제안한다.

```text
이 문제를 solutions에 기록할 가치가 있는지

AGENTS.md에 추가할 가치가 있는지

추가한다면 어떤 일반화된 규칙이 적절한지
```

최종 추가 여부는 개발자가 판단한다.

---

# 9. 같은 문제가 반복되는 경우

관련 규칙이 이미 `AGENTS.md`에 있다면 같은 내용을 다른 문장으로 계속 추가하지 않는다.

대신 확인한다.

```text
기존 규칙이 너무 모호한가

Review에서 잡을 수 있는가

Test로 잡을 수 있는가

Type System으로 막을 수 있는가

Lint Rule로 막을 수 있는가
```

가능하면 문서보다 자동 검증 가능한 방법을 우선한다.

```text
개발자 기억
↓
docssolutions
↓
AGENTS.md
↓
Reviewer
↓
Test  Type  Lint
```

아래로 갈수록 사람이 직접 기억하지 않아도 시스템이 문제를 잡을 수 있다.

---

# 10. State Management

State를 새로 만들기 전에 먼저 확인한다.

```text
이미 같은 데이터가 존재하는가

기존 값으로 계산 가능한가

Server State인가

Form State인가

Global Client State인가

Local UI State인가
```

같은 데이터를 여러 State Store에서 중복 관리하지 않는다.

---

# 11. API

API Contract가 명확하지 않으면 추측하지 않는다.

먼저 다음을 확인한다.

 `PROJECT.md`
 기존 API 코드
 Mock Handler
 Backend Contract
 현재 Type

API 함수는 서버 통신 책임에 집중한다.

API 함수 안에 UI 전용 로직을 넣지 않는다.

예

```text
navigate
toast
form error UI
modal open  close
```

---

# 12. Error Handling

모든 Error를 하나의 Toast로 처리하지 않는다.

오류의 종류에 따라 적절한 복구 방법을 제공한다.

예

```text
Validation Error
Authentication Error
Authorization Error
Not Found
Server Error
Network Error
AI Analysis Error
```

사용자가 다시 시도하거나 다른 방법으로 계속 진행할 수 있는 경우 Fallback Flow를 제공한다.

---

# 13. New Library

새로운 Library는 기존 기술로 해결하기 어려운 경우에만 추가한다.

추가하기 전에 다음을 확인한다.

```text
왜 필요한가

기존 기술로 해결할 수 없는가

대안은 있는가

유지보수 부담은 어떤가

Bundle에 미치는 영향은 어떤가
```

필요하지 않은 Library를 미리 설치하지 않는다.

---

# 14. Project Documents

기본 문서 구조는 다음과 같다.

```text
project
│
├─ AGENTS.md
├─ PROJECT.md
│
├─ docs
│  ├─ plans
│  └─ solutions
│
└─ src
```

역할

```text
AGENTS.md

= AI가 어떻게 개발해야 하는지


PROJECT.md

= 무엇을 만드는 프로젝트인지


docsplans

= 만들기 전에 결정한 것


docssolutions

= 만들면서 배우게 된 것
```

---

# 15. Completion Report

작업 완료 후 가능하면 다음을 간단하게 보고한다.

```text
1. 무엇을 변경했는지

2. 왜 이렇게 구현했는지

3. 어떤 파일을 변경했는지

4. 어떤 검증을 했는지

5. 남아 있는 문제

6. 확인이 필요한 내용

7. 이번 작업에서 Compound할 지식이 있었는지

8. docssolutions 기록을 제안하는지

9. AGENTS.md에 추가할 규칙을 제안하는지
```

---

# 16. Do Not

AI는 다음 행동을 피한다.

 프로젝트를 확인하지 않고 바로 코드를 작성한다.
 존재하지 않는 Requirement를 추측한다.
 존재하지 않는 API를 임의로 만든다.
 기존 코드를 확인하지 않고 같은 기능을 다시 만든다.
 작은 문제에 지나치게 복잡한 Architecture를 도입한다.
 필요하지 않은 Library를 추가한다.
 오류의 원인을 확인하지 않고 증상만 덮는다.
 검증하지 않은 코드를 완료 처리한다.
 일회성 오류를 모두 `AGENTS.md` 규칙으로 만든다.
 기존 규칙과 같은 내용을 반복해서 추가한다.
 개발자 승인 없이 중요한 프로젝트 규칙을 변경한다.

---

# Final Compound Question

모든 작업이 끝난 후 마지막으로 확인한다.

 이번에 배운 것을 다음에는 다시 사람이 알려줘야 하는가

그렇다면 다음 중 어디에 남길 수 있는지 검토한다.

```text
docssolutions
AGENTS.md
Reviewer
Test
Type System
Lint
```

이 프로젝트의 목표는 AI에게 같은 설명을 계속 반복하는 것이 아니다.

이번 개발에서 얻은 지식이 다음 개발의 기본 Context가 되도록 만든다.
