# 양떼 지키기: 부등식 울타리 - CL Drafts

These scripts are designed for manual paste into Amplify Classroom Activity Builder.
Run the Activity Builder script checker after pasting, because there is no public local CL compiler.

## 1. 양치기의 고민

Template: `cover_fact_card`

### intro (Note)

```cl
# intro
# 정적 도입 화면입니다. 필요하면 아래 문장을 dynamic text로 바꾸세요.
# 직선 울타리 한 줄(부등식 하나)로 양 3마리를 지키고 늑대를 막아야 합니다.
```

## 2. 첫 울타리 치기

Template: `inequality_pasture`

### s02_pasture (Graph)

```cl
# s02_pasture — 공식 음영 레시피 (CL 뉴스레터 2020-11)
function(`f`):
when s02_fence.submitted parseInequality(s02_fence.latex).differenceFunction(`x`,`y`)
otherwise simpleFunction(`1/0`,`x`,`y`)
number(`s`):
when s02_fence.submitted and parseInequality(s02_fence.latex).isStrict 1
otherwise 0
```

### s02_fence (Math Input)

```cl
# s02_fence
correct: s02_pasture.number(`C`) = 1
```

### s02_feedback (Note)

```cl
# s02_feedback
n = firstDefinedValue(s02_pasture.number(`N`), -1)
content:
when not(s02_fence.submitted) "x, y에 대한 부등식으로 울타리를 만들어 보세요. 꼴: y > x + 4 처럼"
when n = -1 "부등식 형태로 입력하세요 (등호·복합부등식은 인식 불가). 예: y > x - 1 꼴"
when s02_pasture.number(`C`) = 1 "🐑 양 3마리를 모두 지켰고 늑대는 울타리 밖입니다!"
otherwise "울타리 안의 양: ${n} / 3마리. 늑대가 들어왔는지도 확인하세요."
```

## 3. 부등호를 바꾸면?

Template: `notice_predict`

### s03_predFeedback (Note)

```cl
# s03_predFeedback
content:
  when s03_prediction.submitted "다음 화면에서 경계선 위의 양으로 직접 실험해 봅시다."
  otherwise "양 한 마리가 정확히 경계선 위에 있다면, < 와 ≤ 중 무엇을 써야 할까요?"
```

## 4. 경계선 위의 양

Template: `inequality_pasture`

### s04_pasture (Graph)

```cl
# s04_pasture — 공식 음영 레시피 (CL 뉴스레터 2020-11)
function(`f`):
when s04_fence.submitted parseInequality(s04_fence.latex).differenceFunction(`x`,`y`)
otherwise simpleFunction(`1/0`,`x`,`y`)
number(`s`):
when s04_fence.submitted and parseInequality(s04_fence.latex).isStrict 1
otherwise 0
```

### s04_fence (Math Input)

```cl
# s04_fence
correct: s04_pasture.number(`C`) = 1
```

### s04_feedback (Note)

```cl
# s04_feedback
n = firstDefinedValue(s04_pasture.number(`N`), -1)
content:
when not(s04_fence.submitted) "x, y에 대한 부등식으로 울타리를 만들어 보세요. 꼴: y > x + 4 처럼"
when n = -1 "부등식 형태로 입력하세요 (등호·복합부등식은 인식 불가). 예: y > x - 1 꼴"
when s04_pasture.number(`C`) = 1 "🐑 양 3마리를 모두 지켰고 늑대는 울타리 밖입니다!"
otherwise "울타리 안의 양: ${n} / 3마리. 늑대가 들어왔는지도 확인하세요."
```

## 5. 울타리 설계 설명

Template: `reflection`

### s05_prompt (Note)

```cl
# s05_prompt
# 성찰 화면은 보통 정답 판정을 넣지 않습니다.
# 질문: 양 (2,3)이 울타리 y ≥ x+1 안에 있는지 계산으로 확인하는 과정을 설명하세요.
```
