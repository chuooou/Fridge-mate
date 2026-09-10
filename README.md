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
