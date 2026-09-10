# 냉장고를 부탁해

> 현재 목표: Responsive Web MVP
> 이후 목표: Backend 연결 및 Flutter WebView App 확장

---

# 1. 프로젝트 소개

냉장고에 어떤 재료가 있는지 기억하지 못해서 같은 재료를 다시 사고,
사놓은 음식은 잊어버려 버리게 되고,
막상 요리하려고 하면 지금 가진 재료로 뭘 만들 수 있는지 모르는 문제를 해결하는 서비스.

기본 사용자 Flow:

```text
냉장고에 재료 등록
↓
현재 보유 재료 관리
↓
보관기한 확인
↓
현재 재료 기반 AI 레시피 추천
↓
부족한 재료 장보기 목록 추가
```

친구와 서로 동의한 경우에는 상대방의

```text
냉장고 재료
+
장보기 목록
```

도 확인할 수 있다.

---

# 2. 현재 개발 범위

지금은 **Web만 구현한다.**

순서는 다음과 같다.

```text
Responsive Web
↓
MSW로 사용자 Flow 구현
↓
핵심 기능 Backend 연결
↓
Web 기능 안정화
↓
Flutter WebView App
```

공동구매 기능은 현재 범위에서 제외한다.

추후 별도 기능으로 검토한다.

---

# 3. Frontend Tech Stack

기본 기술:

```text
React
TypeScript
Vite
React Router
Tailwind CSS

TanStack Query
Zustand

React Hook Form
Zod

Axios
MSW
```

현재는 React + Vite SPA로 구현한다.

검색 유입 중심 서비스보다는 로그인 후 개인 데이터를 관리하는 Application 성격이 강하므로 현재 단계에서는 Next.js를 사용하지 않는다.

실제 SSR 요구사항이 생기면 추후 다시 검토한다.

---

# 4. 상태 관리

```text
Server State
→ TanStack Query

Form State
→ React Hook Form

Validation
→ Zod

Global Client State
→ Zustand

Local UI State
→ React State
```

Server State를 Zustand에 중복 저장하지 않는다.

같은 데이터의 Source of Truth는 하나로 유지한다.

---

# 5. Backend 개발 방식

Backend도 최종적으로 구현한다.

하지만 Frontend 전체를 완성한 뒤 Backend 전체를 만드는 방식은 사용하지 않는다.

처음에는 MSW로 API Contract를 만든다.

```text
Frontend
↓
Axios
↓
MSW
```

핵심 사용자 Flow가 확인되면 기능별로 실제 Backend와 연결한다.

```text
기능 Front + MSW
↓
Flow 확인
↓
Backend 구현
↓
실제 API 연결
```

예:

```text
Auth Front + MSW
→ Auth Backend

Fridge Front + MSW
→ Fridge Backend

Friend Front + MSW
→ Friend Permission Backend
```

---

# 6. 회원가입 / 로그인

처음부터 로그인 기능을 구현한다.

사용자는 닉네임을 기준으로 활동한다.

기본 Account:

```text
nickname
password
```

닉네임은 중복될 수 없다.

로그인:

```text
닉네임
비밀번호
```

친구 검색 역시 닉네임을 사용한다.

추후 계정 복구가 필요하면 이메일 등의 정보를 추가할 수 있다.

---

# 7. 내 냉장고

재료는 기본적으로 다음 정보를 가진다.

```text
재료명

수량

단위

냉장 / 냉동

등록 날짜

실제 소비기한 / 유통기한

예상 보관기한

등록 방식
```

등록 방식:

```text
냉장고 전체 사진

개별 재료 사진

직접 검색 / 입력
```

---

# 8. 냉장고 전체 사진 분석

사용자가 냉장고 전체 사진을 촬영하거나 업로드한다.

```text
냉장고 사진
↓
AI Image Analysis
↓
재료 인식
↓
수량 추정
↓
사용자 확인
↓
냉장고 등록
```

예:

```text
계란      약 8개
우유      1개
사과      약 4개
대파      1단
양파      약 3개
```

AI가 수량까지 추정한다.

단, 수량이 정확하지 않을 수 있으므로 반드시 추정값임을 표시한다.

예:

```text
사과

약 4개

AI가 사진을 기준으로 추정한 수량이에요.
```

사용자는 AI 결과를 직접 수정할 수 있다.

AI 결과를 확인 없이 바로 냉장고에 저장하지 않는다.

---

# 9. 개별 재료 사진 등록

재료 하나만 촬영해서 등록할 수 있다.

```text
재료 촬영
↓
재료 인식
↓
수량 추정
↓
날짜 인식
↓
사용자 확인
↓
등록
```

예:

```text
우유

수량
약 1개

소비기한
2026.09.20
```

포장지에 날짜가 보이면 Vision 또는 OCR을 사용해 날짜를 분석한다.

---

# 10. 소비기한 / 예상 보관기한

실제 날짜와 예상 날짜는 반드시 구분한다.

## 실제 날짜

포장지에서 확인하거나 사용자가 직접 입력한 날짜:

```text
소비기한

2026.09.20
```

AI가 읽은 날짜라면 사용자 확인 후 저장한다.

## 예상 날짜

실제 날짜를 알 수 없다면

```text
재료 종류

+

냉장고에 넣은 날짜

+

냉장 / 냉동 여부

↓

일반적인 보관기간 기준 계산
```

으로 예상한다.

예:

```text
예상 보관기한

약 9월 25일까지

일반적인 냉장 보관 기준으로 계산한
대략적인 예상이에요.

실제 상태와 보관 환경에 따라 달라질 수 있어요.
```

예상 정보에는 반드시

```text
약
예상
대략적인
```

등 정확하지 않은 정보라는 표현을 포함한다.

---

# 11. 냉장 / 냉동

MVP에서는 다음 두 보관 위치를 제공한다.

```text
냉장
냉동
```

같은 재료라도 보관 위치에 따라 예상 보관기간을 다르게 계산한다.

실온은 추후 필요할 경우 추가한다.

---

# 12. 직접 재료 등록

사진 없이도 재료를 추가할 수 있다.

예:

```text
[재료 추가]

사과 검색

↓

사과

수량
3개

보관
냉장

[냉장고에 추가]
```

소비기한을 알고 있다면 직접 입력한다.

알 수 없다면 등록 날짜를 기준으로 예상 보관기한을 사용할 수 있다.

---

# 13. 냉장고 메인

현재 냉장고 상태를 한눈에 볼 수 있도록 한다.

예:

```text
내 냉장고

냉장 12
냉동 7

----------------

빨리 먹어야 해요

우유       D-1
대파       약 D-2
두부       D-3

----------------

전체 재료

계란
우유
사과
삼겹살
양파
```

Filter:

```text
전체
냉장
냉동
기한 임박
```

정렬:

```text
기한 임박순
최근 등록순
이름순
```

---

# 14. AI 레시피

레시피는 AI가 생성한다.

현재 냉장고의 재료와 수량을 기준으로 추천한다.

추천은 두 종류로 나눈다.

## 지금 바로 만들 수 있어요

```text
현재 재료

김치
밥
계란
대파
양파

↓

김치볶음밥
계란볶음밥
김치전
```

가능하면 보관기한이 얼마 남지 않은 재료를 우선 사용한다.

## 이것만 사면 만들 수 있어요

1~2개 정도만 추가하면 만들 수 있는 음식도 추천한다.

예:

```text
크림파스타

가지고 있어요

✓ 베이컨
✓ 양파
✓ 파스타면

추가로 필요해요

+ 생크림
+ 우유
```

CTA:

```text
[부족한 재료 장보기 목록에 추가]
```

---

# 15. AI 레시피 입력 정보

AI에게 필요에 따라 다음 정보를 전달한다.

```text
현재 재료

각 재료 수량

냉장 / 냉동

보관기한

기한 임박 여부

알레르기

사용자가 제외한 음식
```

AI가 생성한 레시피는 AI Generated 결과임을 표시한다.

---

# 16. 장보기 목록

필요한 물건을 장보기 목록에 추가한다.

직접 등록할 수도 있고 AI 레시피에서 부족한 재료를 바로 추가할 수도 있다.

예:

```text
우유
계란
생크림
사과
```

우선순위:

```text
높음
보통
낮음
```

---

# 17. 상품 가격 검색

장보기 목록의 상품을 검색해 가격 비교 결과를 보여주는 기능을 구현한다.

목표:

```text
상품 검색
↓
약 5개 결과
↓
가격순 확인
```

가능하면 다음 정보를 보여준다.

```text
가격
배송비
용량
개수
단위 가격
판매처
```

예:

```text
A 우유
900ml
2,300원

B 우유
1.8L
3,500원
```

단순 가격뿐 아니라 단위 가격도 고려한다.

실제 Shopping Provider가 결정되기 전에는 MSW Mock으로 개발한다.

임의의 Shopping Site Crawling을 기본 방법으로 사용하지 않는다.

---

# 18. 친구 검색

사용자는 닉네임으로 다른 사용자를 검색할 수 있다.

예:

```text
친구 찾기

yunu

↓

yunu

[냉장고 공유 요청]
```

---

# 19. 친구 냉장고 공유

한 사용자가 일방적으로 상대방 냉장고를 볼 수 없다.

반드시 서로 동의해야 한다.

```text
User A

↓

User B에게 냉장고 공유 요청

↓

User B 승인

↓

상호 공유 관계 생성
```

관계가 생성되면:

```text
A → B 확인 가능

B → A 확인 가능
```

한쪽만 볼 수 있는 관계는 만들지 않는다.

---

# 20. 친구에게 공개되는 데이터

공유 관계의 친구에게 공개:

```text
냉장고 재료

재료 수량

냉장 / 냉동

보관기한 정보

장보기 목록
```

공개하지 않음:

```text
냉장고 사진 원본

재료 사진

로그인 정보

개인정보

AI 사용 기록

레시피 기록

검색 기록

개인 설정
```

---

# 21. 공유 해제

공유 관계는 언제든지 한쪽에서 해제할 수 있다.

한 명이 해제하면 즉시 양쪽 접근 권한을 모두 제거한다.

```text
A → B 접근 불가

B → A 접근 불가
```

Frontend에서 UI만 숨기지 않는다.

Backend에서도 실제 권한을 검사한다.

예:

```text
GET /api/users/:userId/fridge

↓

현재 로그인 사용자와 대상 사용자가
활성화된 상호 공유 관계인가?

NO
→ 403

YES
→ Response
```

장보기 목록도 동일하게 검사한다.

---

# 22. AI Architecture

Frontend에서 AI Provider를 직접 호출하지 않는다.

최종 구조:

```text
Frontend
↓
Backend API
↓
AI Service
↓
Vision / LLM Provider
```

예:

```text
POST /api/ingredients/analyze-image

POST /api/recipes/generate
```

AI API Key는 Frontend에 노출하지 않는다.

Frontend는 어떤 AI Provider를 사용하는지 몰라도 되도록 한다.

---

# 23. AI 결과 처리 원칙

AI Prediction을 사실로 바로 확정하지 않는다.

```text
AI Prediction
↓
사용자 확인
↓
수정 가능
↓
저장
```

특히 다음은 추정값일 수 있다.

```text
재료 종류

재료 수량

포장지 날짜

예상 보관기한
```

AI가 확신하지 못한 경우 이를 UI에서 표시한다.

---

# 24. Error Handling

모든 Error를 Toast 하나로 처리하지 않는다.

## 사진 분석 실패

```text
사진에서 재료를 정확하게 확인하기 어려워요.

[다시 촬영]
[직접 추가]
```

## 수량 분석 실패

```text
재료는 확인했지만 수량은 정확하게 알기 어려워요.

직접 수량을 입력해주세요.
```

## 날짜 인식 실패

```text
날짜를 정확하게 확인하지 못했어요.

[직접 입력]
[대략적으로 계산]
```

## 친구 권한 없음

```text
현재 이 사용자의 냉장고를 볼 수 없어요.

서로 냉장고 공유에 동의한 경우에만 확인할 수 있어요.
```

## Network Error

기존 데이터가 없다면 Error UI를 보여준다.

기존 데이터가 존재하고 Background Refetch만 실패했다면 기존 화면을 가능하면 유지한다.

---

# 25. Responsive

Mobile First로 구현한다.

이 서비스는

```text
냉장고 앞에서 사진 촬영

마트에서 장보기 목록 확인

요리하면서 레시피 확인
```

상황에서 모바일 사용이 많을 것으로 예상한다.

기본:

```text
Mobile
↓
Tablet
↓
Desktop
```

Desktop에서도 정상적으로 사용할 수 있도록 Responsive Layout을 구현한다.

---

# 26. Architecture

프로젝트 규모에 맞는 단순한 Feature-based 구조를 사용한다.

예상 구조:

```text
src/
│
├─ app/
│  ├─ providers/
│  ├─ router/
│  └─ layouts/
│
├─ pages/
│
├─ features/
│  ├─ auth/
│  ├─ fridge/
│  ├─ ingredient/
│  ├─ recipe/
│  ├─ shopping/
│  └─ friend/
│
├─ shared/
│  ├─ api/
│  ├─ lib/
│  ├─ types/
│  └─ ui/
│
└─ mocks/
```

처음부터 모든 빈 폴더를 만들지 않는다.

실제 필요한 기능이 생길 때 생성한다.

---

# 27. Feature Responsibility

```text
features/auth

회원가입
로그인
현재 사용자


features/fridge

내 냉장고
냉장 / 냉동
재료 목록


features/ingredient

재료 등록
사진 분석
수량
보관기한


features/recipe

AI 레시피 생성
부족한 재료 계산


features/shopping

장보기 목록
우선순위
가격 검색


features/friend

닉네임 검색
공유 요청
공유 승인 / 거절
공유 해제
친구 냉장고
친구 장보기 목록
```

---

# 28. MVP 개발 순서

## Phase 1

```text
프로젝트 초기 구성

Responsive Layout

MSW

회원가입 / 로그인

닉네임

재료 직접 등록

냉장 / 냉동

내 냉장고

보관기한

기본 Error Handling
```

## Phase 2

```text
개별 재료 사진

냉장고 전체 사진

AI 재료 분석 Mock

AI 수량 추정 Mock

AI 결과 수정 / 확인
```

## Phase 3

```text
AI 레시피

바로 만들 수 있는 레시피

1~2개 부족한 레시피

장보기 목록 연결
```

## Phase 4

```text
친구 검색

냉장고 공유 요청

상호 승인

공유 해제

친구 냉장고

친구 장보기 목록
```

## Phase 5

```text
Shopping 가격 Search API
```

Backend는 Phase 5까지 완전히 미루지 않는다.

Phase 1부터 안정된 기능은 순차적으로 실제 Backend와 연결한다.

추천 순서:

```text
Auth

↓

Ingredient / Fridge

↓

Friend Permission

↓

AI Image Analysis

↓

AI Recipe

↓

Shopping
```

---

# 29. Flutter App

현재는 구현하지 않는다.

Web 기능이 안정된 후 Flutter WebView App으로 확장한다.

```text
Flutter
↓
WebView
↓
현재 React Web
```

필요한 Native 기능만 연결한다.

예:

```text
Camera
Photo Permission
Push Notification
Native Share
Web ↔ App Bridge
```

필요한 Flutter Library는 실제 구현 시점에 최소한으로 추가한다.

---

# 30. 공동구매

공동구매 Community는 현재 개발 범위에서 제외한다.

추후 서비스 확장 기능으로만 고려한다.

예상 기능:

```text
공동구매 모집

참여 인원

구매 예정일

예상 금액

예상 분량

위치

실시간 채팅
```

현재 프로젝트를 미래의 공동구매 기능 때문에 복잡하게 설계하지 않는다.

실제로 개발하게 될 때 별도의 Plan을 작성한다.

---

# Core Principle

서비스의 핵심은 AI 자체가 아니다.

```text
냉장고에 뭐가 있는지 쉽게 관리하고
↓
버리는 재료를 줄이고
↓
현재 재료를 실제 식사로 연결하고
↓
부족한 재료를 장보기까지 연결한다.
```

AI는 이 과정을 더 편리하게 만드는 수단으로 사용한다.
