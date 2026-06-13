# 매끄러운 미끄럼틀과 일차함수

Generated from: `smooth-slide-linear-functions`

Audience: 중학교 수학, 일차함수의 기울기와 절편

Language: ko

## Learning Goals

- 기울기를 두 양의 변화량의 비로 해석한다.
- 여러 선분이 하나의 직선처럼 이어지는 조건을 기울기로 설명한다.
- 그래프 조작 결과를 수식 판정값과 연결한다.
- x절편과 y절편의 의미를 실제 맥락에서 설명한다.

## Source/Inspiration Facts

- 공개 제목: 26.6.15 공개수업
- 작성자: 선생님 한윤석
- 공개 JSON 화면 수: 22
- 핵심 화면: 미끄럼틀 만들기, 매끄러운 미끄럼틀이 될까?, 매끄러운 미끄럼틀 만들기

## Build Sequence

## 1. 어느 길이 더 가파를까?

Template: `notice_predict` - 예측과 관찰

Purpose: 그림/상황을 보고 가파른 정도를 먼저 직관적으로 비교한다.

Components:
  - s01_prediction (Multiple Choice): 예측 선택
  - s01_reason (Free Response): 예측 이유
  - s01_feedback (Note): 선택 후 안내

Teacher moves:
- 정답 확인보다 예상의 근거를 먼저 공유하게 합니다.
- 이후 화면에서 예측과 계산 결과가 어떻게 달라졌는지 다시 묻습니다.

## 2. 기울기를 계산하기

Template: `numeric_check` - 숫자 입력 자기점검

Purpose: 높이 변화량과 가로 변화량의 비를 계산한다.

Components:
  - s02_slope (Math Input): 학생 답 입력
  - s02_feedback (Note): 제출 후 피드백

Teacher moves:
- 학생이 단위까지 말하게 한 뒤 숫자를 입력하게 합니다.
- `correct:`는 대시보드 확인용이고, Note 피드백은 학생 학습용입니다.

## 3. 미끄럼틀 애니메이션 보기

Template: `smooth_slide_graph_check` - 매끄러운 미끄럼틀 그래프 판정

Purpose: 버튼을 누르면 T가 증가하고 그래프의 점이 미끄럼틀을 따라 움직인다.

Components:
  - s03_slideGraph (Graph): 학생이 점/높이를 조작하고 그래프 내부에서 기울기 일치 여부 계산
  - s03_runSlide (Action Button): 미끄럼틀 애니메이션 실행
  - s03_feedback (Note): 판정 후 해석 피드백

Teacher moves:
- 수학 판정은 그래프 표현식에서 계산하고, CL은 최종 판정값 C만 읽게 합니다.
- 학생에게 높이/밑변이 바뀌면 기울기가 어떻게 달라지는지 말하게 합니다.
- 대시보드의 check는 `graph.number("C") = 1`이 true일 때만 뜨는지 확인합니다.
- 이 화면은 시범용이면 Graph CL에서 `readOnly: true`를 추가해도 됩니다.

## 4. 매끄러운 미끄럼틀 만들기

Template: `smooth_slide_graph_check` - 매끄러운 미끄럼틀 그래프 판정

Purpose: 학생이 그래프의 조절점을 움직여 세 선분의 기울기를 맞춘다.

Components:
  - s04_slideGraph (Graph): 학생이 점/높이를 조작하고 그래프 내부에서 기울기 일치 여부 계산
  - s04_runSlide (Action Button): 미끄럼틀 애니메이션 실행
  - s04_feedback (Note): 판정 후 해석 피드백

Teacher moves:
- 수학 판정은 그래프 표현식에서 계산하고, CL은 최종 판정값 C만 읽게 합니다.
- 학생에게 높이/밑변이 바뀌면 기울기가 어떻게 달라지는지 말하게 합니다.
- 대시보드의 check는 `graph.number("C") = 1`이 true일 때만 뜨는지 확인합니다.

## 5. 왜 매끄러웠을까?

Template: `reflection` - 설명과 성찰

Purpose: 기울기가 같다는 조건을 학생 언어로 설명한다.

Components:
  - s05_reflection (Free Response): 학생 설명
  - s05_prompt (Note): 성찰 질문

Teacher moves:
- 학생 응답을 익명으로 골라 전체 토론에 사용합니다.
- 다음 활동을 만들 때 자주 나온 오개념을 새 화면으로 바꿉니다.

## 6. 절편으로 상황 설명하기

Template: `graph_match` - 그래프 매칭

Purpose: 일차함수 그래프에서 x절편과 y절편이 상황에서 무엇을 뜻하는지 연결한다.

Components:
  - s06_value (Math Input): 식 또는 수치 입력
  - s06_graph (Graph): 학생 입력 시각화
  - s06_feedback (Note): 그래프 해석 안내

Teacher moves:
- 정답/오답 대신 학생 입력이 만든 그래프를 비교하게 합니다.
- 대시보드에서 서로 다른 그래프를 골라 토론합니다.

## Quality Gate

1. Activity Builder에서 화면을 먼저 만들고 컴포넌트 이름을 이 문서와 정확히 맞춘다.
2. 각 화면의 Screen CL과 컴포넌트 CL을 붙여넣는다.
3. Student Preview에서 제출 전, 제출 후, 다시 시도, 새 문제 버튼을 확인한다.
4. Teacher Dashboard에서 `correct:`와 `readOnly:` 표시가 의도대로 작동하는지 확인한다.
5. 학생에게 보이는 피드백이 단순 정답 공개가 아니라 다음 행동을 안내하는지 확인한다.
