# 점프! 이차함수 코인 러시 - CL Drafts

These scripts are designed for manual paste into Amplify Classroom Activity Builder.
Run the Activity Builder script checker after pasting, because there is no public local CL compiler.

## 1. 함수가 곧 조종간

Template: `cover_fact_card`

### intro (Note)

```cl
# intro
# 정적 도입 화면입니다. 필요하면 아래 문장을 dynamic text로 바꾸세요.
# 이 게임에는 방향키가 없습니다. 여러분이 쓰는 함수가 곧 캐릭터의 길입니다.
```

## 2. 레벨 1: 식 고치기

Template: `platformer_mario`

### s02_stage (Graph)

```cl
# s02_stage
# 주의: simpleFunction은 'y=' 방정식을 못 받는다 — 학생에게 식만 입력하게 안내.
function(`g`):
when s02_jump.submitted simpleFunction(s02_jump.latex,`x`)
otherwise simpleFunction(`1/0`,`x`)
number(`T`): s02_run.timeSincePress(8)
```

### s02_jump (Math Input)

```cl
# s02_jump
correct: s02_stage.number(`C`) = 1
```

### s02_run (Action Button)

```cl
# s02_run
label: "달리기!"
resetLabel: "다시 달리기"
```

### s02_hud (Note)

```cl
# s02_hud
s = firstDefinedValue(s02_stage.number(`S`), -1)
content:
when not(s02_jump.submitted) "점프 곡선 식을 y= 없이 입력하면 캐릭터가 달립니다. 꼴: a(x-p)^2+q"
when s = -1 "식을 인식하지 못했어요. y= 없이 식만 다시 입력하세요. 예: -1(x-2)^2+3 꼴"
when s02_stage.number(`C`) = 1 "🪙 코인 3개 완수! 깃발에 도착했습니다."
otherwise "코인 ${s} / 3개. 곡선이 코인을 지나도록 고쳐 보세요."
```

## 3. a를 바꾸면?

Template: `notice_predict`

### s03_predFeedback (Note)

```cl
# s03_predFeedback
content:
  when s03_prediction.submitted "다음 레벨에서 직접 확인해 봅시다."
  otherwise "a를 -2로 바꾸면 포물선은 어떻게 될까요?"
```

## 4. 레벨 2: 처음부터 작성

Template: `platformer_mario`

### s04_stage (Graph)

```cl
# s04_stage
# 주의: simpleFunction은 'y=' 방정식을 못 받는다 — 학생에게 식만 입력하게 안내.
function(`g`):
when s04_jump.submitted simpleFunction(s04_jump.latex,`x`)
otherwise simpleFunction(`1/0`,`x`)
number(`T`): s04_run.timeSincePress(8)
```

### s04_jump (Math Input)

```cl
# s04_jump
correct: s04_stage.number(`C`) = 1
```

### s04_run (Action Button)

```cl
# s04_run
label: "달리기!"
resetLabel: "다시 달리기"
```

### s04_hud (Note)

```cl
# s04_hud
s = firstDefinedValue(s04_stage.number(`S`), -1)
content:
when not(s04_jump.submitted) "점프 곡선 식을 y= 없이 입력하면 캐릭터가 달립니다. 꼴: a(x-p)^2+q"
when s = -1 "식을 인식하지 못했어요. y= 없이 식만 다시 입력하세요. 예: -1(x-2)^2+3 꼴"
when s04_stage.number(`C`) = 1 "🪙 코인 3개 완수! 깃발에 도착했습니다."
otherwise "코인 ${s} / 3개. 곡선이 코인을 지나도록 고쳐 보세요."
```

## 5. 코인 좌표를 표로 정리

Template: `table_check`

### s05_feedback (Note)

```cl
# s05_feedback — 판정 변수를 노트 스크립트 안에 둔다 (화면 단위 CL 스코프에 의존하지 않음)
hasInput = not(isUndefined(s05_table.cellNumericValue(1, 2)))
r1 = s05_table.cellNumericValue(1, 2) = 2
r2 = s05_table.cellNumericValue(2, 2) = 5
r3 = s05_table.cellNumericValue(3, 2) = 2
allCorrect = r1 and r2 and r3
content:
when not(hasInput) ""
when allCorrect "코인 좌표가 모두 맞습니다. 대칭축이 보이나요?"
otherwise "각 코인의 y좌표를 다시 확인해 보세요."
```

## 6. 포물선 설계 노트

Template: `reflection`

### s06_prompt (Note)

```cl
# s06_prompt
# 성찰 화면은 보통 정답 판정을 넣지 않습니다.
# 질문: 꼭짓점을 어디로 정했고, a는 어떻게 구했는지 설명하세요.
```
