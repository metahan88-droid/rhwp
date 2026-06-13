# 점프! 이차함수 코인 러시 - Vibe Prompt Pack

## One-shot Activity Builder Prompt

You are designing an Amplify Classroom / Desmos Activity Builder activity in Korean.
Create a screen-by-screen build plan using Computation Layer.
Use these constraints:

- Activity title: 점프! 이차함수 코인 러시
- Audience: 중3 수학, 이차함수의 그래프 (꼭짓점형)
- Learning goals: 꼭짓점형 y=a(x-p)^2+q에서 a, p, q의 역할을 설명한다.; 곡선이 주어진 점들을 지나도록 계수를 조절한다.; 포물선의 폭과 방향을 a의 부호·크기와 연결한다.
- Use component names exactly as listed in the generated plan.
- Prefer interpretive feedback before evaluative feedback.
- Separate student-facing feedback from dashboard `correct:`.
- Include `readOnly:` only when submitted answers should be locked.
- For random practice, use `randomGenerator(seed).int(a,b)` or `.float(a,b)` and explain the seed.

Screens:

1. 함수가 곧 조종간: cover_fact_card
2. 레벨 1: 식 고치기: platformer_mario
3. a를 바꾸면?: notice_predict
4. 레벨 2: 처음부터 작성: platformer_mario
5. 코인 좌표를 표로 정리: table_check
6. 포물선 설계 노트: reflection

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
