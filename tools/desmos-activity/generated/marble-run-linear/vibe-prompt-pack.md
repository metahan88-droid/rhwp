# 구슬 미끄럼틀: 일차함수로 별 모으기 - Vibe Prompt Pack

## One-shot Activity Builder Prompt

You are designing an Amplify Classroom / Desmos Activity Builder activity in Korean.
Create a screen-by-screen build plan using Computation Layer.
Use these constraints:

- Activity title: 구슬 미끄럼틀: 일차함수로 별 모으기
- Audience: 중학교 수학, 일차함수 식 세우기
- Learning goals: 기울기와 y절편을 조절해 원하는 직선을 만든다.; 직선이 특정 점들을 지나도록 식을 수정한다.; 함수식의 변화가 그래프 모양에 주는 영향을 설명한다.
- Use component names exactly as listed in the generated plan.
- Prefer interpretive feedback before evaluative feedback.
- Separate student-facing feedback from dashboard `correct:`.
- Include `readOnly:` only when submitted answers should be locked.
- For random practice, use `randomGenerator(seed).int(a,b)` or `.float(a,b)` and explain the seed.

Screens:

1. 구슬을 별까지 굴려 보자: cover_fact_card
2. Fix It: 숫자 하나만 바꾸기: marbleslides_style
3. Predict: 굴리기 전에 예상하기: notice_predict
4. Challenge: 별 3개를 한 직선으로: marbleslides_style
5. 전략 설명하기: reflection

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
