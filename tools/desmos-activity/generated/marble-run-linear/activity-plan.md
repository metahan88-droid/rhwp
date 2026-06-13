# 구슬 미끄럼틀: 일차함수로 별 모으기

Generated from: `marble-run-linear`

Audience: 중학교 수학, 일차함수 식 세우기

Language: ko

## Learning Goals

- 기울기와 y절편을 조절해 원하는 직선을 만든다.
- 직선이 특정 점들을 지나도록 식을 수정한다.
- 함수식의 변화가 그래프 모양에 주는 영향을 설명한다.

## Source/Inspiration Facts

- 원형: Marbleslides: Lines (Desmos 공식, 2015)
- 설계 근거: real marbleslides에는 CL이 없어 graph-clone으로 재구현 (cl.desmos.com/t/343, t/8681)
- 화면 구조: Fix It → Predict → Challenge 단계 구조 차용

## Build Sequence

## 1. 구슬을 별까지 굴려 보자

Template: `cover_fact_card` - 도입 사실 카드

Purpose: 공이 직선을 따라 굴러 별을 모으는 규칙을 소개한다.

Components:
  - intro (Note): 상황과 질문 제시
  - visualModel (Graph or Image): 수치/그림 모델 표시

Teacher moves:
- 학생에게 먼저 숫자 사이의 관계를 말하게 합니다.
- 계산을 시작하기 전에 단위를 소리 내어 확인합니다.

## 2. Fix It: 숫자 하나만 바꾸기

Template: `marbleslides_style` - 마블슬라이드 스타일 (그래프 클론)

Purpose: 주어진 식 -0.5x+6에서 y절편 하나만 고쳐 별 2개를 모은다 (별들의 기울기는 이미 -0.5).

Components:
  - s02_line (Math Input): 공이 굴러갈 함수 입력
  - s02_launch (Action Button): 공 발사
  - s02_marbleGraph (Graph): 공 낙하/슬라이드 애니메이션 + 별 수집 판정
  - s02_feedback (Note): 수집 현황과 다음 행동 안내

Teacher moves:
- 공 물리는 단순화 모델입니다(낙하 후 곡선 추적). real marbleslides의 Box2D 물리와 다름을 학생에게 안내하세요.
- 별 근접 판정 허용 오차(0.35)는 그래프 표현식 H에서 조절합니다.
- timeSincePress는 같은 화면의 다른 컴포넌트에 포커스가 가면 0으로 리셋됩니다 — 학생이 식을 고치면 애니메이션이 자동으로 멈추는 것이 정상입니다.
- Student Preview에서 미제출→제출→재제출 흐름을 꼭 확인하세요.
- initialLatex로 -0.5x+6을 미리 넣어 '수정' 과제로 만드세요 (y= 없이 — simpleFunction은 방정식을 못 받습니다). 절편을 5.5로 고치면 두 별 (3,4),(6,2.5)를 모두 지납니다.

## 3. Predict: 굴리기 전에 예상하기

Template: `notice_predict` - 예측과 관찰

Purpose: 기울기를 바꾸면 공이 어느 별을 지나게 될지 먼저 예상한다.

Components:
  - s03_prediction (Multiple Choice): 예측 선택
  - s03_reason (Free Response): 예측 이유
  - s03_predFeedback (Note): 선택 후 안내

Teacher moves:
- 정답 확인보다 예상의 근거를 먼저 공유하게 합니다.
- 이후 화면에서 예측과 계산 결과가 어떻게 달라졌는지 다시 묻습니다.

## 4. Challenge: 별 3개를 한 직선으로

Template: `marbleslides_style` - 마블슬라이드 스타일 (그래프 클론)

Purpose: 별 3개를 모두 지나는 직선을 처음부터 작성한다.

Components:
  - s04_line (Math Input): 공이 굴러갈 함수 입력
  - s04_launch (Action Button): 공 발사
  - s04_marbleGraph (Graph): 공 낙하/슬라이드 애니메이션 + 별 수집 판정
  - s04_feedback (Note): 수집 현황과 다음 행동 안내

Teacher moves:
- 공 물리는 단순화 모델입니다(낙하 후 곡선 추적). real marbleslides의 Box2D 물리와 다름을 학생에게 안내하세요.
- 별 근접 판정 허용 오차(0.35)는 그래프 표현식 H에서 조절합니다.
- timeSincePress는 같은 화면의 다른 컴포넌트에 포커스가 가면 0으로 리셋됩니다 — 학생이 식을 고치면 애니메이션이 자동으로 멈추는 것이 정상입니다.
- Student Preview에서 미제출→제출→재제출 흐름을 꼭 확인하세요.

## 5. 전략 설명하기

Template: `reflection` - 설명과 성찰

Purpose: 별 좌표에서 기울기를 어떻게 구했는지 설명한다.

Components:
  - s05_reflection (Free Response): 학생 설명
  - s05_prompt (Note): 성찰 질문

Teacher moves:
- 학생 응답을 익명으로 골라 전체 토론에 사용합니다.
- 다음 활동을 만들 때 자주 나온 오개념을 새 화면으로 바꿉니다.

## Quality Gate

1. Activity Builder에서 화면을 먼저 만들고 컴포넌트 이름을 이 문서와 정확히 맞춘다.
2. 각 화면의 Screen CL과 컴포넌트 CL을 붙여넣는다.
3. Student Preview에서 제출 전, 제출 후, 다시 시도, 새 문제 버튼을 확인한다.
4. Teacher Dashboard에서 `correct:`와 `readOnly:` 표시가 의도대로 작동하는지 확인한다.
5. 학생에게 보이는 피드백이 단순 정답 공개가 아니라 다음 행동을 안내하는지 확인한다.
