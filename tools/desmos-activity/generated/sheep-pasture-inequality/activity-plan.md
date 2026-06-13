# 양떼 지키기: 부등식 울타리

Generated from: `sheep-pasture-inequality`

Audience: 중2~고1 수학, 일차부등식의 영역

Language: ko

## Learning Goals

- 부등식의 해를 좌표평면의 영역으로 해석한다.
- 점이 영역에 포함되는 조건을 부등식에 대입해 판단한다.
- 엄격(<)과 비엄격(≤) 부등호의 차이를 경계 처리로 설명한다.

## Source/Inspiration Facts

- 원형: Shira the Sheep (Desmos 공식) + Point Collector: Lines + Foxes and Chickens
- 핵심 함수: parseInequality.differenceFunction — 해집합은 항상 f>0 (CL 뉴스레터 2020-11, 검증 confirmed)
- 설계 어록: stars are discrete and inequalities are continuous. But grass can be continuous! (Zack Miller)

## Build Sequence

## 1. 양치기의 고민

Template: `cover_fact_card` - 도입 사실 카드

Purpose: 양은 울타리 안에, 늑대는 밖에 — 부등식 하나로 해결하는 상황을 소개한다.

Components:
  - intro (Note): 상황과 질문 제시
  - visualModel (Graph or Image): 수치/그림 모델 표시

Teacher moves:
- 학생에게 먼저 숫자 사이의 관계를 말하게 합니다.
- 계산을 시작하기 전에 단위를 소리 내어 확인합니다.

## 2. 첫 울타리 치기

Template: `inequality_pasture` - 양떼 부등식 (영역 음영 + 객체 카운트)

Purpose: 양 3마리를 모두 포함하고 늑대를 제외하는 부등식을 만든다.

Components:
  - s02_fence (Math Input): 울타리 부등식 입력
  - s02_pasture (Graph): 음영 + 양/늑대 카운트 판정
  - s02_feedback (Note): 울타리 안 양 수 피드백

Teacher moves:
- 1변수 수직선 버전(Shira형)은 경계 원(열린/닫힌)을 별도 그래프로 만들어야 합니다 — 이 템플릿은 2변수 영역 버전입니다.
- 연립부등식(울타리 2개)으로 확장하면 CL 변수명을 f/s, g/s_2처럼 유니크하게 바꿔야 합니다.
- 구간 표기 입력은 파싱되지 않습니다. 부등식 형태로 입력하라고 안내하세요.

## 3. 부등호를 바꾸면?

Template: `notice_predict` - 예측과 관찰

Purpose: <를 ≤로 바꾸면 경계 위의 양은 어떻게 되는지 예상한다.

Components:
  - s03_prediction (Multiple Choice): 예측 선택
  - s03_reason (Free Response): 예측 이유
  - s03_predFeedback (Note): 선택 후 안내

Teacher moves:
- 정답 확인보다 예상의 근거를 먼저 공유하게 합니다.
- 이후 화면에서 예측과 계산 결과가 어떻게 달라졌는지 다시 묻습니다.

## 4. 경계선 위의 양

Template: `inequality_pasture` - 양떼 부등식 (영역 음영 + 객체 카운트)

Purpose: 경계 위에 있는 양 때문에 비엄격 부등호가 필요한 상황을 해결한다.

Components:
  - s04_fence (Math Input): 울타리 부등식 입력
  - s04_pasture (Graph): 음영 + 양/늑대 카운트 판정
  - s04_feedback (Note): 울타리 안 양 수 피드백

Teacher moves:
- 1변수 수직선 버전(Shira형)은 경계 원(열린/닫힌)을 별도 그래프로 만들어야 합니다 — 이 템플릿은 2변수 영역 버전입니다.
- 연립부등식(울타리 2개)으로 확장하면 CL 변수명을 f/s, g/s_2처럼 유니크하게 바꿔야 합니다.
- 구간 표기 입력은 파싱되지 않습니다. 부등식 형태로 입력하라고 안내하세요.
- 양 (0,1),(2,3),(4,5)는 y=x+1 위의 점들입니다. y ≥ x+1 같은 비엄격 해가 자연스럽게 나옵니다.

## 5. 울타리 설계 설명

Template: `reflection` - 설명과 성찰

Purpose: 점을 부등식에 대입해 포함 여부를 판단하는 방법을 언어화한다.

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
