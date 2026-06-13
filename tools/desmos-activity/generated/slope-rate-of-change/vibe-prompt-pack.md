# 기울기는 변화율이다: y=ax와 y=ax+b - Vibe Prompt Pack

## One-shot Activity Builder Prompt

You are designing an Amplify Classroom / Desmos Activity Builder activity in Korean.
Create a screen-by-screen build plan using Computation Layer.
Use these constraints:

- Activity title: 기울기는 변화율이다: y=ax와 y=ax+b
- Audience: 중2 수학, 일차함수의 기울기 (정비례에서 일차함수로)
- Learning goals: 정비례 y=ax에서 a를 'x가 1 증가할 때 y의 증가량'(변화율)으로 해석한다.; y=ax와 y=ax+b를 비교해 b는 평행이동만 시키고 변화율은 바꾸지 않음을 발견한다.; x의 계수 a와 그래프의 기울기를 동일한 것으로 연결한다.; 두 점 사이의 변화율 계산으로 기울기를 구한다.
- Use component names exactly as listed in the generated plan.
- Prefer interpretive feedback before evaluative feedback.
- Separate student-facing feedback from dashboard `correct:`.
- Include `readOnly:` only when submitted answers should be locked.
- For random practice, use `randomGenerator(seed).int(a,b)` or `.float(a,b)` and explain the seed.

Screens:

1. 같은 빠르기, 다른 출발점: cover_fact_card
2. 예측: 그래프 모양은?: notice_predict
3. 탐구 1: a는 계단의 높이: slope_rate_explorer
4. 점검: 변화율 읽기: numeric_check
5. 탐구 2: b는 출발점만 바꾼다: slope_rate_explorer
6. 점검: 구간의 변화량: numeric_check
7. 도전: 평행 만들기: slope_rate_explorer
8. 정리: 기울기란 무엇인가: reflection

Return:

1. Activity overview
2. Screen-by-screen components
3. CL scripts per component
4. Dashboard correctness strategy
5. Student preview test cases
6. Teacher facilitation notes

## Revision Prompt

Improve this activity for stronger student discourse. Keep the same CL structure, but add:

- one prediction moment before calculation
- one explanation prompt after calculation
- one teacher dashboard move
- one extension screen for fast finishers

## Debug Prompt

I pasted the generated CL into Amplify Classroom and got an error. Diagnose likely causes:

- renamed component
- Screen CL variable used from component without `script.`
- string/number mismatch
- table row/column index mismatch
- `correct:` placed on the wrong component
- `readOnly:` used before submit behavior is intended
