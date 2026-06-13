# 칼로리 DOWN: 하늘 계단 291개

Generated from: `calorie-down-stairs`

Audience: 중학교 수학, 비례식과 단위비율

Language: ko

## Learning Goals

- 실생활 수치를 단위비율로 해석한다.
- 10계단당 kcal를 전체 계단 수에 적용한다.
- 계산 결과를 그래프와 설명으로 검증한다.
- 랜덤 문제에서 같은 구조의 비례 계산을 반복 연습한다.

## Source/Inspiration Facts

- 공개 제목: 26.6.15 공개수업
- 작성자: 선생님 한윤석
- 썸네일 문구: 하늘 계단의 개수 291개, 10계단에 1.4 kcal, 1분에 12 kcal

## Build Sequence

## 1. 칼로리 DOWN 상황 읽기

Template: `cover_fact_card` - 도입 사실 카드

Purpose: 하늘 계단 291개와 칼로리 정보를 카드처럼 보여주고 핵심 질문을 연다.

Components:
  - intro (Note): 상황과 질문 제시
  - stairsVisual (Graph or Image): 수치/그림 모델 표시

Teacher moves:
- 학생에게 먼저 숫자 사이의 관계를 말하게 합니다.
- 계산을 시작하기 전에 단위를 소리 내어 확인합니다.
- 계단 수, 10계단당 kcal, 분당 kcal 중 어떤 정보가 이번 질문에 필요한지 묻는다.

## 2. 먼저 예상하기

Template: `notice_predict` - 예측과 관찰

Purpose: 계산 전에 학생의 직관을 수집한다.

Components:
  - prediction (Multiple Choice): 예측 선택
  - predictionReason (Free Response): 예측 이유
  - predictionFeedback (Note): 선택 후 안내

Teacher moves:
- 정답 확인보다 예상의 근거를 먼저 공유하게 합니다.
- 이후 화면에서 예측과 계산 결과가 어떻게 달라졌는지 다시 묻습니다.

## 3. 291계단의 kcal 계산

Template: `unit_rate_model` - 단위비율 모델

Purpose: 291 ÷ 10 × 1.4를 계산하고 그래프 변수로 넘긴다.

Components:
  - model (Note): 계산식/비례식 안내
  - kcalAnswer (Math Input): 학생 계산값 입력
  - kcalFeedback (Note): 단위비율 피드백
  - kcalGraph (Graph): 비례 관계 시각화

Teacher moves:
- 10계단당 값을 1계단당 값으로 바꾸는 방법을 비교합니다.
- 정확한 값과 어림값을 모두 허용할지 결정합니다.

## 4. 운동 시간으로 바꾸기

Template: `numeric_check` - 숫자 입력 자기점검

Purpose: 분당 12 kcal 조건을 사용해 같은 칼로리를 쓰는 시간을 구한다.

Components:
  - timeAnswer (Math Input): 학생 답 입력
  - timeFeedback (Note): 제출 후 피드백

Teacher moves:
- 학생이 단위까지 말하게 한 뒤 숫자를 입력하게 합니다.
- `correct:`는 대시보드 확인용이고, Note 피드백은 학생 학습용입니다.

## 5. 새 계단 수로 반복 연습

Template: `randomized_practice` - 랜덤 반복 연습

Purpose: 학생별로 다른 계단 수를 뽑아 같은 단위비율 구조를 반복한다.

Components:
  - newProblem (Action Button): 새 문제 생성
  - randomProblem (Note): 랜덤 문항 표시
  - randomAnswer (Math Input): 학생 답 입력
  - randomFeedback (Note): 랜덤 문항 피드백

Teacher moves:
- 랜덤 문제에서는 답을 잠근 뒤 새 문제 버튼으로 흐름을 넘깁니다.
- 학생별 숫자가 다르므로 대시보드에서는 풀이 전략을 확인합니다.

## 6. 비례표 완성

Template: `table_check` - 표 입력 자기점검

Purpose: 10, 20, 30계단의 kcal 표를 완성하고 비례 관계를 확인한다.

Components:
  - ratioTable (Table): 여러 값 입력
  - tableFeedback (Note): 행별/전체 피드백

Teacher moves:
- 표는 셀 좌표가 바뀌면 CL도 바뀌므로 먼저 표 구조를 고정합니다.
- 행별 피드백이 필요하면 `cellErrorMessage` 패턴으로 확장합니다.

## 7. 전략 설명하기

Template: `reflection` - 설명과 성찰

Purpose: 학생이 사용한 단위비율 전략을 문장으로 설명한다.

Components:
  - reflection (Free Response): 학생 설명
  - teacherPrompt (Note): 성찰 질문

Teacher moves:
- 학생 응답을 익명으로 골라 전체 토론에 사용합니다.
- 다음 활동을 만들 때 자주 나온 오개념을 새 화면으로 바꿉니다.

## Quality Gate

1. Activity Builder에서 화면을 먼저 만들고 컴포넌트 이름을 이 문서와 정확히 맞춘다.
2. 각 화면의 Screen CL과 컴포넌트 CL을 붙여넣는다.
3. Student Preview에서 제출 전, 제출 후, 다시 시도, 새 문제 버튼을 확인한다.
4. Teacher Dashboard에서 `correct:`와 `readOnly:` 표시가 의도대로 작동하는지 확인한다.
5. 학생에게 보이는 피드백이 단순 정답 공개가 아니라 다음 행동을 안내하는지 확인한다.
