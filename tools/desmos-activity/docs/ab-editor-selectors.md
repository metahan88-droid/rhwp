# Activity Builder 편집기 셀렉터 — 실측 확정 (2026-06-13)

hotdel@g.jbedu.kr 세션에서 CDP attach로 직접 실측. `docs/claude-in-chrome-runbook.md`의 ⚠ 항목을 이 문서가 대체한다.
자동 배포 드라이버(`src/build-activity.mjs`)는 이 셀렉터를 사용한다.

## 로그인 (확립·코드화 — src/deploy-cdp.mjs)

- `scripts/chrome-debug.sh` → Profile 1(hotdel@g.jbedu.kr)을 9222로 (Chrome 136+ 회피: 전용 디렉토리 복사)
- `node src/deploy-cdp.mjs --login` → Keycloak iframe SSO (멱등)
  1. `classroom.amplify.com/` 쿠키동의 `button[name=/확인|accept/i]`
  2. `button[name=/^log in$/i]` → 모달
  3. iframe `my.amplify.com/auth` 안에서 `getByText(/log in with google/i)` force click
  4. 구글 accountchooser에서 `getByText("hotdel@g.jbedu.kr")` 클릭
  5. 로그인 판정: classroom 홈에 `button[name=/^log in$/i]` 부재

## 활동 생성

- 목록: `classroom.amplify.com/custom` (= "My Stuff" → "Custom Activities")
- `button[name=/새 액티비티|new activity/i]` → 제목 모달
- 모달 `getByRole("textbox")` 에 제목 입력
- `button[name=/새 액티비티 생성|create new activity/i]` → 편집기 `classroom.amplify.com/activity/<id>/edit`
- 기본 **비공개**(링크 공유 전까지 학생 노출 없음). 실측 활동 예: `6a2cebf252b97e02bed9b939`

## 편집기

| 대상 | 셀렉터 | 비고 |
|---|---|---|
| 화면 제목 | `input[placeholder*="화면 제목"]` ("화면 제목 또는 소개:") | |
| 새 화면 | `button[name=/새 화면/i]` | |
| 컴포넌트 추가 | `[role=button][aria-label="<타입>"]` **force click** | 팔레트. CL 패널이 가리면 force/패널 닫기 필요 |
| 컴포넌트 alias | `input[placeholder*="레이블 없는 <타입>"]` | 추가 직후 |
| CL 편집 열기 | `button[name=/스크립트 열기|open script/i]` | 화면 단위/컴포넌트 단위 각각 존재 |
| CL 입력 | `.CodeMirror` 클릭 + `page.keyboard.type(...)` | **검증됨** — content: "..." 입력 성공 |
| CL 편집 닫기 | `button[name=/^완료$|^done$/i]` | |
| 미리보기 / 발행 | `button[name=/미리보기/i]` / `button[name=/발행/i]` | 발행은 사용자 승인 후 |

### 컴포넌트 팔레트 aria-label (2026 실측 — 한국어 UI)
메모 · 자유 답변 · 수식 답변 · 객관식 문제 · 체크박스 · 정렬 리스트 · 그래프 · 기하학 · 그림판 · 미디어 · 표 · 행동 버튼 · Polypad · 그래핑 계산기 · **구슬 굴리기**(Marbleslides — Labs 없이 기본 제공으로 확인) · 카드 정렬 · 챌린지 크리에이터 · Polygraph

### 매핑: 툴킷 컴포넌트 타입 → 팔레트 라벨
- Note → 메모 / Math Input → 수식 답변 / Free Response → 자유 답변
- Multiple Choice → 객관식 문제 / Table → 표 / Action Button → 행동 버튼
- Graph → 그래프 / Sketch → 그림판 / Card Sort → 카드 정렬

## 미확정 (다음 실측 1건)

- **그래프 표현식 입력** — 그래프 컴포넌트는 썸네일로 추가되고, 표현식 편집은 그래프를 열어 Desmos 계산기(`.dcg-mq-editable-field`)에 진입해야 한다. 인라인 추가만으로는 `.dcg-*`가 안 떴다 → 그래프 클릭→편집 진입 경로 실측 필요. 확정 전까지 그래프 화면은 `graph-states.md` 수동 붙여넣기로.

## 자동 배포 드라이버 흐름 (build-activity.mjs 청사진)

```
1. deploy-cdp --login        # 세션 보장
2. createActivity(title)     # /custom → 새 액티비티 → 제목 → 생성 → editUrl
3. for each screen in pack:
     setScreenTitle(title)
     for each component: addComponent(label) → setAlias(alias)
     for each CL block: openScript(target) → typeCL(code) → done
     (그래프 화면: addComponent("그래프") → [표현식 입력: 실측 후])
     addScreen()
4. 미리보기로 육안 검증 (발행은 사용자 승인 후)
```
