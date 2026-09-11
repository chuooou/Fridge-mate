# 기본 기능 마무리: 저장 유지와 코드 포맷

## 목표

기존 가입·로그인·재료 등록·목록 기능의 데이터를 새로고침 후에도 유지하고 Prettier/ESLint로 코드를 읽기 쉽게 정리한다. 실제 Backend와 이후 Phase 기능은 이번 범위에 포함하지 않는다.

## Work

- Prettier 2칸 들여쓰기, 작은따옴표, 세미콜론 없음, LF 기준을 설정한다. ESLint와 충돌하는 포맷 규칙은 eslint-config-prettier로 끈다. format/format:check/lint:fix 명령과 EditorConfig를 제공한다.
- `src/mocks/db.ts`의 개발 데이터를 localStorage에 버전 있는 구조로 저장한다. 로그인 ID는 sessionStorage에 저장해 같은 탭 새로고침은 유지하고 다른 탭과 인증 상태를 분리한다.
- `src/mocks/password.ts`에 Web Crypto PBKDF2 비밀번호 검증값 생성·비교를 둔다. 저장 데이터 및 메모리 계정에 비밀번호 원문을 두지 않는다. 개발용 demo 계정도 같은 비교 경로를 사용한다.
- `src/mocks/persistence.ts`에 저장 DTO 검증과 저장 실패 처리를 둔다. 깨진 데이터나 저장 불가를 조용히 초기화하지 않는다. mutation 저장 실패 시 성공 응답을 내지 않고 기존 상태를 유지한다.
- `src/mocks/browser.ts`에서 worker 시작 전 저장 데이터를 복원한다. handler는 쓰기 전에 최신 데이터를 읽어 다른 탭의 등록을 덮어쓰지 않게 한다. 테스트에서는 persistence를 명시적으로 켜고 끈다.
- 새로고침 초기화 안내를 저장 유지 안내로 수정하고 README에 동일 origin 범위, 브라우저 데이터 삭제 영향, 개발용 한계를 기록한다.

## 검증

- 테스트 먼저: 새 계정/수동 기한 재료를 등록한 뒤 메모리 초기화·저장 재연결을 통해 실제 복원 경로 확인.
- 새로고침 로그인 유지, 로그아웃 후 미로그인 유지, 탭별 계정 분리, 다른 계정 재료 격리.
- 비밀번호 원문 비저장, 깨진 JSON/지원하지 않는 버전/저장 실패에서 기존 데이터 보존.
- 전체 테스트, typecheck, lint, format:check, build 및 브라우저에서 등록 → 새로고침 확인.

## Review / Compound

지속 저장은 mock 전용이며 실제 인증 보안을 제공하지 않는다. Source of Truth는 MSW 저장소, UI 데이터는 Query 캐시로 유지한다. 저장 장애를 정상 성공으로 오인하지 않는지 리뷰하고 재사용 가능한 교훈만 solutions에 기록한다.
