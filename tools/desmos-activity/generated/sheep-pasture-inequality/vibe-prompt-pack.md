# 양떼 지키기: 부등식 울타리 - Vibe Prompt Pack

## One-shot Activity Builder Prompt

You are designing an Amplify Classroom / Desmos Activity Builder activity in Korean.
Create a screen-by-screen build plan using Computation Layer.
Use these constraints:

- Activity title: 양떼 지키기: 부등식 울타리
- Audience: 중2~고1 수학, 일차부등식의 영역
- Learning goals: 부등식의 해를 좌표평면의 영역으로 해석한다.; 점이 영역에 포함되는 조건을 부등식에 대입해 판단한다.; 엄격(<)과 비엄격(≤) 부등호의 차이를 경계 처리로 설명한다.
- Use component names exactly as listed in the generated plan.
- Prefer interpretive feedback before evaluative feedback.
- Separate student-facing feedback from dashboard `correct:`.
- Include `readOnly:` only when submitted answers should be locked.
- For random practice, use `randomGenerator(seed).int(a,b)` or `.float(a,b)` and explain the seed.

Screens:

1. 양치기의 고민: cover_fact_card
2. 첫 울타리 치기: inequality_pasture
3. 부등호를 바꾸면?: notice_predict
4. 경계선 위의 양: inequality_pasture
5. 울타리 설계 설명: reflection

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
