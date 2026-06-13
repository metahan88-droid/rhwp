# Claude in Chrome 배포 런북 — 생성 팩을 Activity Builder에 올리기

생성기 산출물(`generated/<activity-id>/`)을 classroom.amplify.com Activity Builder에 옮기는 단계별 절차.
Claude in Chrome(브라우저 확장)에게 이 문서와 생성 팩을 주면 사람 대신 수행할 수 있다.
근거: desmos-cl 위키 gap research (2026-06-12). 미확인 UI 항목은 ⚠로 표시 — 첫 실행 때 실측으로 갱신할 것.

## 사전 조건

1. classroom.amplify.com 교사 계정 로그인 (Login with Amplify — 기존 Desmos 계정 그대로).
2. marbleslides **real 컴포넌트**가 필요한 활동이면: `https://classroom.amplify.com/labs` 에서 Marbleslides 활성화 ⚠(2020년 확인 UI, 2026 위치 재확인 필요). 이 툴킷의 `marbleslides_style` 템플릿은 graph-clone이라 Labs 불필요.
3. 생성 팩 5종 확인: `activity-plan.md`(화면 설계), `screen-cl.md`(CL 초안), `graph-states.md`(그래프 붙여넣기 목록), `graph-state.*.json`(전체 상태), `paste-checklist.md`(검증).

## 절차

### 1. 활동 생성
- 활동 목록에서 새 활동 만들기 → 제목 = activity-plan.md 의 제목.
- 화면을 activity-plan.md 순서대로 추가. 화면당 컴포넌트를 **이름까지 정확히** 문서와 일치시킨다
  (CL은 이름 의존 — 이름이 다르면 모든 스크립트가 깨진다).

### 2. 그래프 상태 입력 (화면마다, 둘 중 하나)

**경로 A — LaTeX 줄 붙여넣기 (기본, 검증됨)**
1. 그래프 컴포넌트의 그래프 편집기를 연다 (풀 계산기 UI).
2. `graph-states.md` 의 해당 화면 섹션에서 표현식 블록 전체를 복사한다.
   줄바꿈 구분 LaTeX는 줄마다 별도 expression으로 들어간다 (단독 계산기 실측 확인, AB 동일 엔진).
3. 폴더 줄(### [폴더])을 만나면: 편집기에서 폴더를 먼저 만들고, 이후 표현식을 그 안에 붙여넣는다.
4. `<!-- 숨김 -->` 표시 표현식은 좌측 아이콘을 눌러 그래프 표시를 끈다.
5. `<!-- 라벨:🐑 -->` 표시 점은 점 메뉴에서 라벨을 켜고 해당 문자를 라벨로 넣는다.
6. 뷰포트를 문서 값으로 설정하고 잠근다(설정 → 뷰포트 잠금) ⚠(잠금 UI 명칭 확인).

**경로 B — 저장 그래프 URL 임포트 (이미지·티커 포함 상태)**
1. desmos.com/calculator 를 열고, 데모 임베드 페이지 또는 콘솔에서
   `Calc.setState(<graph-state.*.json 내용>)` 실행 → 내 계정에 그래프 저장.
2. AB 그래프 편집기 표현식 목록 **첫 줄에 저장 그래프 URL을 붙여넣기** → 전체 임포트.
   제약: 교사 편집 모드 전용. ⚠소스 그래프에 폴더가 있으면 실패한다는 2017-19 자료 —
   폴더 포함 상태는 경로 A를 쓰거나 폴더를 풀어서 시도.

### 3. CL 붙여넣기
1. 컴포넌트를 선택하고 CL 코드 패널(</> 아이콘 ⚠명칭 확인)을 연다.
2. `screen-cl.md` 의 해당 컴포넌트 블록을 그대로 붙여넣는다.
3. **패널의 오류 표시를 반드시 확인** — 로컬에 CL 컴파일러가 없으므로 여기가 첫 문법 검증이다.
   흔한 오류: 컴포넌트 이름 불일치, Screen CL 변수를 `script.` 없이 참조, when/otherwise 타입 불일치.

### 4. 검증 (paste-checklist.md 순회)
1. Student Preview: 미제출 상태 → 제출 → 정답/오답 피드백 → 버튼 애니메이션(다시 굴리기) 흐름.
2. 게임 판정: 정답 함수를 입력해 그래프 내부 `C=1`이 되는지, HUD 점수(`S`, `N`)가 갱신되는지.
3. Teacher Dashboard: `correct:` 체크가 의도한 컴포넌트에만 뜨는지.
4. 잠금 화면이 있으면: 조건 불충족 시 학생이 **영구히 갇히지 않는지** 확인 (coverText 가드).

### 5. 발행
- 공유 설정을 의도대로 (링크 공유/비공개).
- 발행 후 `node src/inspect-amplify.mjs '<활동 URL>' --out generated/inspections` 로
  공개 JSON을 회수해 화면 수·컴포넌트·CL이 의도와 일치하는지 디프 확인 (공개 활동만).

## Claude in Chrome에게 줄 프롬프트 틀

```
classroom.amplify.com에 로그인된 상태야. 다음 활동을 Activity Builder로 만들어줘.
1) 첨부한 activity-plan.md 순서대로 화면과 컴포넌트를 만들고 (이름 정확히),
2) graph-states.md의 표현식을 각 그래프에 순서대로 붙여넣고 (폴더/숨김/라벨 지시 따르기),
3) screen-cl.md의 CL을 각 컴포넌트 코드 패널에 붙여넣고 오류 표시가 없는지 확인하고,
4) paste-checklist.md를 위에서부터 체크해줘.
오류가 나면 멈추고 어떤 컴포넌트의 어떤 줄인지 보고해줘.
```

## 하지 말 것

- 비공개 저장/쓰기 API 호출 시도 금지 — 저작은 편집기 UI로만 한다 (공개 `POST /activity/{id}` 는 읽기 전용 인스펙션).
- 다른 교사의 비공개 활동·학생 데이터 접근 금지.
- 한 번에 전체 활동을 만들고 끝내지 말 것 — 화면 1개를 완성·검증한 뒤 다음 화면으로.
