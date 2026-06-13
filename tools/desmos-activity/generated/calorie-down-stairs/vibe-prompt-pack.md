# 칼로리 DOWN: 하늘 계단 291개 - Vibe Prompt Pack

## One-shot Activity Builder Prompt

You are designing an Amplify Classroom / Desmos Activity Builder activity in Korean.
Create a screen-by-screen build plan using Computation Layer.
Use these constraints:

- Activity title: 칼로리 DOWN: 하늘 계단 291개
- Audience: 중학교 수학, 비례식과 단위비율
- Learning goals: 실생활 수치를 단위비율로 해석한다.; 10계단당 kcal를 전체 계단 수에 적용한다.; 계산 결과를 그래프와 설명으로 검증한다.; 랜덤 문제에서 같은 구조의 비례 계산을 반복 연습한다.
- Use component names exactly as listed in the generated plan.
- Prefer interpretive feedback before evaluative feedback.
- Separate student-facing feedback from dashboard `correct:`.
- Include `readOnly:` only when submitted answers should be locked.
- For random practice, use `randomGenerator(seed).int(a,b)` or `.float(a,b)` and explain the seed.

Screens:

1. 칼로리 DOWN 상황 읽기: cover_fact_card
2. 먼저 예상하기: notice_predict
3. 291계단의 kcal 계산: unit_rate_model
4. 운동 시간으로 바꾸기: numeric_check
5. 새 계단 수로 반복 연습: randomized_practice
6. 비례표 완성: table_check
7. 전략 설명하기: reflection

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
