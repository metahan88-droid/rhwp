# Desmos Activity

Desmos/Amplify Activity Builder에서 Computation Layer(CL) 활동을 빠르게 설계하기 위한 로컬 제작 키트입니다. 목적은 활동을 자동 업로드하는 것이 아니라, 바이브코딩으로 만든 아이디어를 `화면 구성`, `컴포넌트 이름`, `붙여넣기용 CL 초안`, `교사용 검증 체크리스트`까지 안정적으로 변환하는 것입니다.

## 왜 별도 키트인가

Amplify Classroom 활동 페이지는 공개 메타데이터와 썸네일은 확인할 수 있지만, 화면별 Activity Builder 원본과 CL 스크립트는 권한/세션 경로에 묶여 있습니다. 따라서 이 키트는 공개 자료와 공식 CL 문서에서 확인한 패턴을 바탕으로, 교사가 Activity Builder에서 직접 복사해 만들 수 있는 생산 시스템을 제공합니다.

이번 기준 활동:

- URL: <https://classroom.amplify.com/activity/6a2a1e755c2f2268f8e2eb7d?utm_campaign=share&utm_content=activity&lang=ko>
- 확인된 제목: `26.6.15 공개수업`
- 확인된 작성자: `선생님 한윤석`
- 확인된 썸네일 주제: `칼로리 DOWN`, `하늘 계단의 개수 291개`, `10계단에 1.4 kcal`, `1분에 12 kcal`
- 확인된 공개 API 성격: `/activity-meta/custom`으로 활동 메타데이터 확인 가능
- 추가 확인: `POST /activity/{id}`로 공개 Activity Builder JSON 확인 가능
- 실제 활동 구조: 22화면, 기울기/일차함수/매끄러운 미끄럼틀/절편 흐름
- 핵심 CL 패턴: `button.timeSincePress(11)`을 그래프 변수 `T`로 보내고, 그래프 내부 판정값 `C`를 `correct: graph.number("C") = 1`로 읽음

## 빠른 시작

```bash
cd /Users/han/project/rhwp/tools/desmos-activity
npm run check
npm run generate:calorie
npm run generate:smooth-slide
```

생성 결과:

- `generated/calorie-down-stairs/activity-plan.md`
- `generated/calorie-down-stairs/screen-cl.md`
- `generated/calorie-down-stairs/paste-checklist.md`
- `generated/calorie-down-stairs/vibe-prompt-pack.md`
- `generated/calorie-down-stairs/activity-spec.normalized.json`

## 새 활동 만들기

1. `activities/calorie-down-stairs.json`을 복사합니다.
2. `id`, `title`, `learningGoals`, `variables`, `screens`를 바꿉니다.
3. 각 화면의 `template`을 아래 목록에서 고릅니다.
4. 생성기를 실행합니다.

```bash
node src/generate.mjs activities/my-activity.json --out generated
```

검증:

```bash
node src/lint.mjs activities/my-activity.json
```

공개 Amplify 활동 메타데이터 조사:

```bash
node src/inspect-amplify.mjs 'https://classroom.amplify.com/activity/6a2a1e755c2f2268f8e2eb7d?lang=ko' --out generated/inspections
```

## 템플릿 목록

```bash
npm run list:templates
```

현재 포함된 템플릿:

- `cover_fact_card`: 활동 도입 카드/썸네일형 사실 제시
- `notice_predict`: 학생 예측과 관찰을 여는 화면
- `numeric_check`: Math Input 정답 판정과 즉시 피드백
- `unit_rate_model`: 단위비율/비례식 모델링
- `randomized_practice`: 버튼 seed 기반 랜덤 반복 연습
- `graph_match`: 학생 입력을 그래프/시각 모델과 연결
- `smooth_slide_graph_check`: 버튼 타이머와 그래프 내부 판정값으로 미끄럼틀/기울기 활동 제작
- `table_check`: 표 입력 자기점검
- `card_sort_check`: 카드 정렬 자기점검
- `reflection`: 설명/성찰/토론 수집

게임형 템플릿 (2026-06-12 — desmos-cl 위키 갭 리서치 기반, **그래프 상태 팩 동반 생성**):

- `marbleslides_style`: 함수로 공을 굴려 별 수집 (graph-clone — real marbleslides에는 CL sink/source가 없음)
- `platformer_mario`: 학생 함수 곡선을 따라 캐릭터가 달리며 코인 수집 (Super Mario Quadratics 패턴)
- `inequality_pasture`: 부등식 울타리로 양을 지키는 영역 음영 + 객체 카운트 (Point Collector/Shira 패턴, parseInequality + 경계선 실선/점선 이중화)

게임형 화면은 `generated/<id>/graph-states.md`(그래프 편집기 붙여넣기용 LaTeX 목록)와
`graph-state.<screen>.<component>.json`(version-11 calculatorState 전체)을 추가로 생성한다.

예제 활동 3종: `npm run generate:marble` / `npm run generate:mario` / `npm run generate:sheep`

배포 런북: `docs/claude-in-chrome-runbook.md` — 생성 팩을 Activity Builder에 올리는 단계별 절차
(Claude in Chrome에게 그대로 줄 프롬프트 틀 포함).

지식 베이스: Obsidian `03-Resources/desmos-cl` 위키 — graph-as-game-engine,
ab-graph-component-reference(공식 sink/source 레지스트리), inequality-pasture-pattern,
marbleslides-builder-facts, sprite-and-platformer-patterns, cl-game-scaffolding-patterns,
desmos-graph-state-json, official-activity-mechanics.
로컬 실측 자료: `knowledge/activity-json-anatomy.md`, `knowledge/graph1-smooth-slide-state.json`.

## Activity Builder 제작 규칙

- 컴포넌트 이름은 먼저 확정합니다. CL은 이름 의존성이 강합니다.
- 화면당 핵심 상호작용은 하나로 둡니다.
- 학생에게 보이는 피드백과 교사용 대시보드의 `correct:`는 분리해 생각합니다.
- `readOnly: this.submitted`로 제출 후 답을 잠그는 화면과, 탐색을 계속 허용하는 화면을 의도적으로 나눕니다.
- 랜덤 문항은 `randomGenerator(seed).int(a,b)` 또는 `.float(a,b)`로 설계하고, seed는 보통 버튼의 `pressCount`에 연결합니다.
- 공개 CL 컴파일러가 없으므로 Activity Builder의 스크립트 패널에서 최종 오류 확인을 해야 합니다.

## 폴더 구조

- `activities/`: 활동 스펙 JSON
- `generated/`: 생성된 설계 문서와 CL 초안
- `knowledge/`: 조사 기록, 공개 API/자료/패턴 요약
- `prompts/`: 바이브코딩용 프롬프트
- `schemas/`: 활동 스펙 스키마
- `src/`: 생성기, 템플릿 렌더러, 공개 활동 조사기, linter
- `templates/`: 사람이 읽는 템플릿 카드

## 한계

이 키트는 Desmos/Amplify의 비공개 저장 API를 호출하지 않습니다. Activity Builder에는 사람이 로그인해서 화면을 만들고, 생성된 CL 스크립트를 각 컴포넌트에 붙여넣는 방식으로 사용합니다.
