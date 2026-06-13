# 기울기는 변화율이다: y=ax와 y=ax+b

Generated from: `slope-rate-of-change`

Audience: 중2 수학, 일차함수의 기울기 (정비례에서 일차함수로)

Language: ko

## Learning Goals

- 정비례 y=ax에서 a를 'x가 1 증가할 때 y의 증가량'(변화율)으로 해석한다.
- y=ax와 y=ax+b를 비교해 b는 평행이동만 시키고 변화율은 바꾸지 않음을 발견한다.
- x의 계수 a와 그래프의 기울기를 동일한 것으로 연결한다.
- 두 점 사이의 변화율 계산으로 기울기를 구한다.

## Source/Inspiration Facts

- 패턴 원형: smooth-slide의 graph-owned correctness + 단위 계단 변화율 시각화
- 설계 근거: graph-as-game-engine — 판정 C는 그래프 소유, CL은 number 주입/회수만
- 동적 라벨: Desmos 라벨 ${a} 보간으로 슬라이더 값에 따라 계단 높이 라벨 실시간 갱신

## Build Sequence

## 1. 같은 빠르기, 다른 출발점

Template: `cover_fact_card` - 도입 사실 카드

Purpose: 형은 집(0m)에서, 동생은 3m 앞에서 동시에 출발해 같은 빠르기로 걷는 상황을 제시한다.

Components:
  - intro (Note): 상황과 질문 제시
  - visualModel (Graph or Image): 수치/그림 모델 표시

Teacher moves:
- 학생에게 먼저 숫자 사이의 관계를 말하게 합니다.
- 계산을 시작하기 전에 단위를 소리 내어 확인합니다.

## 2. 예측: 그래프 모양은?

Template: `notice_predict` - 예측과 관찰

Purpose: 같은 빠르기면 두 시간-거리 그래프가 어떤 관계일지 먼저 예측하게 한다.

Components:
  - s02_prediction (Multiple Choice): 예측 선택
  - s02_reason (Free Response): 예측 이유
  - s02_predFeedback (Note): 선택 후 안내

Teacher moves:
- 정답 확인보다 예상의 근거를 먼저 공유하게 합니다.
- 이후 화면에서 예측과 계산 결과가 어떻게 달라졌는지 다시 묻습니다.

## 3. 탐구 1: a는 계단의 높이

Template: `slope_rate_explorer` - 기울기 = 변화율 탐구

Purpose: 정비례 y=ax에서 a를 움직이며 'x가 1칸 갈 때 y가 a칸 변한다'를 계단으로 관찰한다.

Components:
  - s03_exploreGraph (Graph): 슬라이더 조작 + 단위 계단 시각화
  - s03_exploreNote (Note): 탐구 안내와 관찰 질문

Teacher moves:
- explore_a → compare_b → match 순서로 배치하면 'a는 계단, b는 위치'가 누적 관찰됩니다.
- match 모드의 입력은 기울기 '값'(숫자)입니다 — 식 입력이 아니므로 y= 문제는 없습니다.
- 계단 수(steps)·슬라이더 범위는 스펙의 values로 조절하세요. 라벨 +${a}는 슬라이더에 따라 실시간 갱신됩니다.

## 4. 점검: 변화율 읽기

Template: `numeric_check` - 숫자 입력 자기점검

Purpose: y=3x에서 x가 1 증가할 때 y의 증가량을 수로 답한다.

Components:
  - s04_rate (Math Input): 학생 답 입력
  - s04_feedback (Note): 제출 후 피드백

Teacher moves:
- 학생이 단위까지 말하게 한 뒤 숫자를 입력하게 합니다.
- `correct:`는 대시보드 확인용이고, Note 피드백은 학생 학습용입니다.

## 5. 탐구 2: b는 출발점만 바꾼다

Template: `slope_rate_explorer` - 기울기 = 변화율 탐구

Purpose: y=ax(점선)와 y=ax+b(실선)를 겹쳐 보며 b는 평행이동만, 계단(변화율)은 그대로임을 발견한다.

Components:
  - s05_compareGraph (Graph): 슬라이더 조작 + 단위 계단 시각화
  - s05_compareNote (Note): 탐구 안내와 관찰 질문

Teacher moves:
- explore_a → compare_b → match 순서로 배치하면 'a는 계단, b는 위치'가 누적 관찰됩니다.
- match 모드의 입력은 기울기 '값'(숫자)입니다 — 식 입력이 아니므로 y= 문제는 없습니다.
- 계단 수(steps)·슬라이더 범위는 스펙의 values로 조절하세요. 라벨 +${a}는 슬라이더에 따라 실시간 갱신됩니다.

## 6. 점검: 구간의 변화량

Template: `numeric_check` - 숫자 입력 자기점검

Purpose: y=3x+2에서 x가 2에서 5로 변할 때 y의 증가량(변화율×구간)을 계산한다.

Components:
  - s06_delta (Math Input): 학생 답 입력
  - s06_feedback (Note): 제출 후 피드백

Teacher moves:
- 학생이 단위까지 말하게 한 뒤 숫자를 입력하게 합니다.
- `correct:`는 대시보드 확인용이고, Note 피드백은 학생 학습용입니다.

## 7. 도전: 평행 만들기

Template: `slope_rate_explorer` - 기울기 = 변화율 탐구

Purpose: 빨간 선의 계단을 읽고 기울기 값을 입력해 파란 선을 평행하게 만든다.

Components:
  - s07_slopeInput (Math Input): 기울기 값 입력 (숫자)
  - s07_matchGraph (Graph): 슬라이더 조작 + 단위 계단 시각화
  - s07_matchNote (Note): 탐구 안내와 관찰 질문

Teacher moves:
- explore_a → compare_b → match 순서로 배치하면 'a는 계단, b는 위치'가 누적 관찰됩니다.
- match 모드의 입력은 기울기 '값'(숫자)입니다 — 식 입력이 아니므로 y= 문제는 없습니다.
- 계단 수(steps)·슬라이더 범위는 스펙의 values로 조절하세요. 라벨 +${a}는 슬라이더에 따라 실시간 갱신됩니다.

## 8. 정리: 기울기란 무엇인가

Template: `reflection` - 설명과 성찰

Purpose: 기울기를 변화율의 언어로 설명하게 한다.

Components:
  - s08_reflection (Free Response): 학생 설명
  - s08_prompt (Note): 성찰 질문

Teacher moves:
- 학생 응답을 익명으로 골라 전체 토론에 사용합니다.
- 다음 활동을 만들 때 자주 나온 오개념을 새 화면으로 바꿉니다.

## Quality Gate

1. Activity Builder에서 화면을 먼저 만들고 컴포넌트 이름을 이 문서와 정확히 맞춘다.
2. 각 화면의 Screen CL과 컴포넌트 CL을 붙여넣는다.
3. Student Preview에서 제출 전, 제출 후, 다시 시도, 새 문제 버튼을 확인한다.
4. Teacher Dashboard에서 `correct:`와 `readOnly:` 표시가 의도대로 작동하는지 확인한다.
5. 학생에게 보이는 피드백이 단순 정답 공개가 아니라 다음 행동을 안내하는지 확인한다.
