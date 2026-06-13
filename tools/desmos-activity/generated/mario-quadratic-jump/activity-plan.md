# 점프! 이차함수 코인 러시

Generated from: `mario-quadratic-jump`

Audience: 중3 수학, 이차함수의 그래프 (꼭짓점형)

Language: ko

## Learning Goals

- 꼭짓점형 y=a(x-p)^2+q에서 a, p, q의 역할을 설명한다.
- 곡선이 주어진 점들을 지나도록 계수를 조절한다.
- 포물선의 폭과 방향을 a의 부호·크기와 연결한다.

## Source/Inspiration Facts

- 원형: Super Mario Quadratics (John Rowe)
- 메커니즘: 조이스틱 대신 학생이 이차함수를 작성해 캐릭터가 포물선을 따라 점프
- 난이도 곡선: 초반 = 주어진 식 수정, 후반 = 처음부터 작성

## Build Sequence

## 1. 함수가 곧 조종간

Template: `cover_fact_card` - 도입 사실 카드

Purpose: 캐릭터는 여러분이 쓴 함수 곡선을 따라 달린다는 규칙을 소개한다.

Components:
  - intro (Note): 상황과 질문 제시
  - visualModel (Graph or Image): 수치/그림 모델 표시

Teacher moves:
- 학생에게 먼저 숫자 사이의 관계를 말하게 합니다.
- 계산을 시작하기 전에 단위를 소리 내어 확인합니다.

## 2. 레벨 1: 식 고치기

Template: `platformer_mario` - 플랫포머 (마리오형) 함수 점프

Purpose: 주어진 -0.5(x-3)^2+3에서 q만 고쳐 코인 3개를 먹는다.

Components:
  - s02_jump (Math Input): 점프 곡선 함수 입력
  - s02_run (Action Button): 달리기 시작
  - s02_stage (Graph): 지형 + 캐릭터 + 코인 + 판정
  - s02_hud (Note): 코인 점수 HUD

Teacher moves:
- 초반 화면은 식을 '수정'하게(꼭짓점형 기본값 제공), 후반 화면은 처음부터 작성하게 하세요 — Super Mario Quadratics의 난이도 곡선.
- 키보드 조작은 불가능합니다. 조작감은 버튼/드래그/클릭으로만 설계하세요.
- 캐릭터를 이미지 스프라이트로 바꾸려면 그래프 편집기에서 이미지를 업로드하고 center를 (x_p, g(x_p))로 설정하세요.
- initialLatex로 -0.5(x-3)^2+3을 넣어 두세요 (y= 없이 — simpleFunction은 방정식을 못 받습니다). q를 1 올리면 해결됩니다.

## 3. a를 바꾸면?

Template: `notice_predict` - 예측과 관찰

Purpose: a의 크기를 바꾸면 어떤 코인을 놓치는지 예상한다.

Components:
  - s03_prediction (Multiple Choice): 예측 선택
  - s03_reason (Free Response): 예측 이유
  - s03_predFeedback (Note): 선택 후 안내

Teacher moves:
- 정답 확인보다 예상의 근거를 먼저 공유하게 합니다.
- 이후 화면에서 예측과 계산 결과가 어떻게 달라졌는지 다시 묻습니다.

## 4. 레벨 2: 처음부터 작성

Template: `platformer_mario` - 플랫포머 (마리오형) 함수 점프

Purpose: 코인 3개를 모두 지나는 이차함수를 처음부터 작성한다.

Components:
  - s04_jump (Math Input): 점프 곡선 함수 입력
  - s04_run (Action Button): 달리기 시작
  - s04_stage (Graph): 지형 + 캐릭터 + 코인 + 판정
  - s04_hud (Note): 코인 점수 HUD

Teacher moves:
- 초반 화면은 식을 '수정'하게(꼭짓점형 기본값 제공), 후반 화면은 처음부터 작성하게 하세요 — Super Mario Quadratics의 난이도 곡선.
- 키보드 조작은 불가능합니다. 조작감은 버튼/드래그/클릭으로만 설계하세요.
- 캐릭터를 이미지 스프라이트로 바꾸려면 그래프 편집기에서 이미지를 업로드하고 center를 (x_p, g(x_p))로 설정하세요.

## 5. 코인 좌표를 표로 정리

Template: `table_check` - 표 입력 자기점검

Purpose: 레벨 2 코인 좌표를 표로 정리하며 대칭축을 찾는다.

Components:
  - s05_table (Table): 여러 값 입력
  - s05_feedback (Note): 행별/전체 피드백

Teacher moves:
- 표는 셀 좌표가 바뀌면 CL도 바뀌므로 먼저 표 구조를 고정합니다.
- 행별 피드백이 필요하면 `cellErrorMessage` 패턴으로 확장합니다.

## 6. 포물선 설계 노트

Template: `reflection` - 설명과 성찰

Purpose: 꼭짓점과 코인 좌표로 식을 세운 과정을 설명한다.

Components:
  - s06_reflection (Free Response): 학생 설명
  - s06_prompt (Note): 성찰 질문

Teacher moves:
- 학생 응답을 익명으로 골라 전체 토론에 사용합니다.
- 다음 활동을 만들 때 자주 나온 오개념을 새 화면으로 바꿉니다.

## Quality Gate

1. Activity Builder에서 화면을 먼저 만들고 컴포넌트 이름을 이 문서와 정확히 맞춘다.
2. 각 화면의 Screen CL과 컴포넌트 CL을 붙여넣는다.
3. Student Preview에서 제출 전, 제출 후, 다시 시도, 새 문제 버튼을 확인한다.
4. Teacher Dashboard에서 `correct:`와 `readOnly:` 표시가 의도대로 작동하는지 확인한다.
5. 학생에게 보이는 피드백이 단순 정답 공개가 아니라 다음 행동을 안내하는지 확인한다.
