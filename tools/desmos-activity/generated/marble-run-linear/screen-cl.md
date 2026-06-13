# 구슬 미끄럼틀: 일차함수로 별 모으기 - CL Drafts

These scripts are designed for manual paste into Amplify Classroom Activity Builder.
Run the Activity Builder script checker after pasting, because there is no public local CL compiler.

## 1. 구슬을 별까지 굴려 보자

Template: `cover_fact_card`

### intro (Note)

```cl
# intro
# 정적 도입 화면입니다. 필요하면 아래 문장을 dynamic text로 바꾸세요.
# 공은 (1, 8)에서 떨어져 여러분이 만든 직선을 타고 굴러갑니다. 별을 모두 모아 보세요.
```

## 2. Fix It: 숫자 하나만 바꾸기

Template: `marbleslides_style`

### s02_marbleGraph (Graph)

```cl
# s02_marbleGraph — 판정은 그래프 내부 표현식(S, C)이 소유한다.
# 주의: simpleFunction은 'y=' 방정식을 못 받는다 — 학생에게 식만 입력하게 안내.
function(`g`):
when s02_line.submitted simpleFunction(s02_line.latex,`x`)
otherwise simpleFunction(`1/0`,`x`)
number(`T`): s02_launch.timeSincePress(6)
```

### s02_line (Math Input)

```cl
# s02_line
correct: s02_marbleGraph.number(`C`) = 1
```

### s02_launch (Action Button)

```cl
# s02_launch
label: "공 굴리기"
resetLabel: "다시 굴리기"
```

### s02_feedback (Note)

```cl
# s02_feedback
s = firstDefinedValue(s02_marbleGraph.number(`S`), -1)
content:
when not(s02_line.submitted) "함수식을 y= 없이 입력하고 공을 굴려 보세요."
when s = -1 "식을 인식하지 못했어요. y= 없이 식만 다시 입력하세요. 예: -2x+5 꼴"
when s02_marbleGraph.number(`C`) = 1 "⭐ 별 2개를 모두 모았습니다!"
otherwise "지금까지 별 ${s} / 2개. 함수를 고쳐 다시 굴려 보세요."
```

## 3. Predict: 굴리기 전에 예상하기

Template: `notice_predict`

### s03_predFeedback (Note)

```cl
# s03_predFeedback
content:
  when s03_prediction.submitted "좋아요. 다음 화면에서 직접 확인해 봅시다."
  otherwise "굴리기 전에: 기울기를 더 가파르게 하면 어떤 별을 놓칠까요?"
```

## 4. Challenge: 별 3개를 한 직선으로

Template: `marbleslides_style`

### s04_marbleGraph (Graph)

```cl
# s04_marbleGraph — 판정은 그래프 내부 표현식(S, C)이 소유한다.
# 주의: simpleFunction은 'y=' 방정식을 못 받는다 — 학생에게 식만 입력하게 안내.
function(`g`):
when s04_line.submitted simpleFunction(s04_line.latex,`x`)
otherwise simpleFunction(`1/0`,`x`)
number(`T`): s04_launch.timeSincePress(6)
```

### s04_line (Math Input)

```cl
# s04_line
correct: s04_marbleGraph.number(`C`) = 1
```

### s04_launch (Action Button)

```cl
# s04_launch
label: "공 굴리기"
resetLabel: "다시 굴리기"
```

### s04_feedback (Note)

```cl
# s04_feedback
s = firstDefinedValue(s04_marbleGraph.number(`S`), -1)
content:
when not(s04_line.submitted) "함수식을 y= 없이 입력하고 공을 굴려 보세요."
when s = -1 "식을 인식하지 못했어요. y= 없이 식만 다시 입력하세요. 예: -2x+5 꼴"
when s04_marbleGraph.number(`C`) = 1 "⭐ 별 3개를 모두 모았습니다!"
otherwise "지금까지 별 ${s} / 3개. 함수를 고쳐 다시 굴려 보세요."
```

## 5. 전략 설명하기

Template: `reflection`

### s05_prompt (Note)

```cl
# s05_prompt
# 성찰 화면은 보통 정답 판정을 넣지 않습니다.
# 질문: 별 두 개의 좌표만 보고 직선의 식을 세우는 자신만의 방법을 설명하세요.
```
