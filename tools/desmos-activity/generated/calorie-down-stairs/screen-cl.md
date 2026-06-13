# 칼로리 DOWN: 하늘 계단 291개 - CL Drafts

These scripts are designed for manual paste into Amplify Classroom Activity Builder.
Run the Activity Builder script checker after pasting, because there is no public local CL compiler.

## 1. 칼로리 DOWN 상황 읽기

Template: `cover_fact_card`

### intro (Note)

```cl
# intro
# 정적 도입 화면입니다. 필요하면 아래 문장을 dynamic text로 바꾸세요.
# 하늘 계단 291개를 내려가면 몇 kcal를 사용할까?
```

## 2. 먼저 예상하기

Template: `notice_predict`

### predictionFeedback (Note)

```cl
# predictionFeedback
content:
  when prediction.submitted "좋아요. 이제 10계단당 1.4 kcal라는 단위비율로 확인해 봅시다."
  otherwise "계산하기 전에 어림값을 골라 보세요."
```

## 3. 291계단의 kcal 계산

Template: `unit_rate_model`

### kcalAnswer (Math Input)

```cl
# kcalAnswer — 기준값: 291계단, 10계단당 1.4 kcal → 40.74 kcal
check = numericValue > 40.690000000000005 and numericValue < 40.79
correct: check
readOnly: this.submitted
```

### kcalFeedback (Note)

```cl
# kcalFeedback
content:
  when kcalAnswer.submitted and kcalAnswer.script.check "맞아요. 291계단은 약 40.74 kcal입니다."
  when kcalAnswer.submitted "10계단에 1.4 kcal이므로 291 ÷ 10 × 1.4를 확인해 보세요."
  otherwise ""
```

### kcalGraph (Graph)

```cl
# kcalGraph
number("stairs"): 291
number("kcalPerTen"): 1.4
number("studentKcal"): kcalAnswer.numericValue
```

## 4. 운동 시간으로 바꾸기

Template: `numeric_check`

### timeAnswer (Math Input)

```cl
# timeAnswer
check = numericValue > 3.335 and numericValue < 3.455
correct: check
readOnly: this.submitted
```

### timeFeedback (Note)

```cl
# timeFeedback
content:
  when timeAnswer.submitted and timeAnswer.script.check "맞아요. 약 3.4분입니다."
  when timeAnswer.submitted "291계단의 kcal를 먼저 구한 뒤 12로 나눠 보세요."
  otherwise ""
```

## 5. 새 계단 수로 반복 연습

Template: `randomized_practice`

### randomProblem (Note)

```cl
# randomProblem — CL에는 산술 연산자가 없으므로 모든 계산은 numericValue로 한다.
r = randomGenerator(newProblem.pressCount)
base = r.int(3, 40)
stairs = numericValue("10\cdot${base}")
expected = numericValue("1.4\cdot${stairs}/10")
lo = numericValue("${expected}-0.05")
hi = numericValue("${expected}+0.05")
content: "이번 문제: ${stairs}계단을 내려가면 몇 kcal일까요?"
```

### randomAnswer (Math Input)

```cl
# randomAnswer
check = numericValue > randomProblem.script.lo and numericValue < randomProblem.script.hi
correct: check
readOnly: this.submitted
```

### randomFeedback (Note)

```cl
# randomFeedback
content:
  when randomAnswer.submitted and randomAnswer.script.check "맞아요. 새 문제를 눌러 한 번 더 해 보세요."
  when randomAnswer.submitted "계단 수를 10으로 나눈 뒤 1.4을 곱해 보세요."
  otherwise ""
```

## 6. 비례표 완성

Template: `table_check`

### tableFeedback (Note)

```cl
# tableFeedback — 판정 변수를 노트 스크립트 안에 둔다 (화면 단위 CL 스코프에 의존하지 않음)
hasInput = not(isUndefined(ratioTable.cellNumericValue(1, 2)))
r1 = ratioTable.cellNumericValue(1, 2) = 1.4
r2 = ratioTable.cellNumericValue(2, 2) = 2.8
r3 = ratioTable.cellNumericValue(3, 2) = 4.2
allCorrect = r1 and r2 and r3
content:
when not(hasInput) ""
when allCorrect "표가 모두 맞습니다."
otherwise "각 행의 값을 다시 확인해 보세요."
```

## 7. 전략 설명하기

Template: `reflection`

### teacherPrompt (Note)

```cl
# teacherPrompt
# 성찰 화면은 보통 정답 판정을 넣지 않습니다.
# 질문: 291계단 문제에서 10계단당 1.4 kcal 정보를 어떻게 사용했는지 설명하세요.
```
