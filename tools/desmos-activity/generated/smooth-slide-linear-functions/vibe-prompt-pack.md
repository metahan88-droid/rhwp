# 매끄러운 미끄럼틀과 일차함수 - Vibe Prompt Pack

## One-shot Activity Builder Prompt

You are designing an Amplify Classroom / Desmos Activity Builder activity in Korean.
Create a screen-by-screen build plan using Computation Layer.
Use these constraints:

- Activity title: 매끄러운 미끄럼틀과 일차함수
- Audience: 중학교 수학, 일차함수의 기울기와 절편
- Learning goals: 기울기를 두 양의 변화량의 비로 해석한다.; 여러 선분이 하나의 직선처럼 이어지는 조건을 기울기로 설명한다.; 그래프 조작 결과를 수식 판정값과 연결한다.; x절편과 y절편의 의미를 실제 맥락에서 설명한다.
- Use component names exactly as listed in the generated plan.
- Prefer interpretive feedback before evaluative feedback.
- Separate student-facing feedback from dashboard `correct:`.
- Include `readOnly:` only when submitted answers should be locked.
- For random practice, use `randomGenerator(seed).int(a,b)` or `.float(a,b)` and explain the seed.

Screens:

1. 어느 길이 더 가파를까?: notice_predict
2. 기울기를 계산하기: numeric_check
3. 미끄럼틀 애니메이션 보기: smooth_slide_graph_check
4. 매끄러운 미끄럼틀 만들기: smooth_slide_graph_check
5. 왜 매끄러웠을까?: reflection
6. 절편으로 상황 설명하기: graph_match

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
