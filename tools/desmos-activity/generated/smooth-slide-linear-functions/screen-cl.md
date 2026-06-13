# 매끄러운 미끄럼틀과 일차함수 - CL Drafts

These scripts are designed for manual paste into Amplify Classroom Activity Builder.
Run the Activity Builder script checker after pasting, because there is no public local CL compiler.

## 1. 어느 길이 더 가파를까?

Template: `notice_predict`

### s01_feedback (Note)

```cl
# s01_feedback
content:
  when s01_prediction.submitted "좋아요. 이제 가파른 정도를 수로 나타내는 방법을 찾아봅시다."
  otherwise "먼저 어느 쪽이 더 가파른지 예상해 보세요."
```

## 2. 기울기를 계산하기

Template: `numeric_check`

### s02_slope (Math Input)

```cl
# s02_slope
check = numericValue > 0.6567 and numericValue < 0.6767
correct: check
readOnly: this.submitted
```

### s02_feedback (Note)

```cl
# s02_feedback
content:
  when s02_slope.submitted and s02_slope.script.check "맞아요. 높이 변화량을 가로 변화량으로 나눈 값입니다."
  when s02_slope.submitted "높이 변화량 ÷ 가로 변화량으로 다시 계산해 보세요."
  otherwise ""
```

## 3. 미끄럼틀 애니메이션 보기

Template: `smooth_slide_graph_check`

### s03_slideGraph (Graph)

```cl
            # s03_slideGraph
            number("T"): s03_runSlide.timeSincePress(11)
            number("B_1"): 3
number("H_1"): 2
number("B_2"): 9
number("H_2"): 6
number("B_3"): 6
number("H_3"): 4

            # In the graph, define a numeric expression C.
            # Recommended graph logic:
            # m_1 = h_1 / b_1
            # m_2 = h_2 / b_2
            # m_3 = h_3 / b_3
            # E_1 = {|m_1 - m_2| < 0.02: 0, 1}
            # E_2 = {|m_3 - m_2| < 0.02: 0, 1}
            # C = {E_1 + E_2 = 0: 1, 0}
            correct: s03_slideGraph.number("C") = 1
```

### s03_runSlide (Action Button)

```cl
# s03_runSlide
resetLabel: "다시 해보기"
```

### s03_feedback (Note)

```cl
# s03_feedback
content:
  when s03_slideGraph.number("C") = 1 "세 구간의 기울기가 거의 같아서 매끄럽게 이어집니다."
  otherwise "각 구간의 기울기를 비교해 보세요. 기울기가 같아야 하나의 직선처럼 이어집니다."
```

## 4. 매끄러운 미끄럼틀 만들기

Template: `smooth_slide_graph_check`

### s04_slideGraph (Graph)

```cl
# s04_slideGraph
number("T"): s04_runSlide.timeSincePress(11)


# In the graph, define a numeric expression C.
# Recommended graph logic:
# m_1 = h_1 / b_1
# m_2 = h_2 / b_2
# m_3 = h_3 / b_3
# E_1 = {|m_1 - m_2| < 0.02: 0, 1}
# E_2 = {|m_3 - m_2| < 0.02: 0, 1}
# C = {E_1 + E_2 = 0: 1, 0}
correct: s04_slideGraph.number("C") = 1
```

### s04_runSlide (Action Button)

```cl
# s04_runSlide
resetLabel: "다시 해보기"
```

### s04_feedback (Note)

```cl
# s04_feedback
content:
  when s04_slideGraph.number("C") = 1 "세 구간의 기울기가 거의 같아서 매끄럽게 이어집니다."
  otherwise "각 구간의 기울기를 비교해 보세요. 기울기가 같아야 하나의 직선처럼 이어집니다."
```

## 5. 왜 매끄러웠을까?

Template: `reflection`

### s05_prompt (Note)

```cl
# s05_prompt
# 성찰 화면은 보통 정답 판정을 넣지 않습니다.
# 질문: 세 구간의 기울기가 어떤 관계일 때 미끄럼틀이 매끄럽게 이어지는지 설명하세요.
```

## 6. 절편으로 상황 설명하기

Template: `graph_match`

### s06_graph (Graph)

```cl
# s06_graph
# 숫자 입력이면 number sink를 사용하세요.
number("studentValue"): s06_value.numericValue

# 방정식 입력이면 아래 패턴을 별도 화면에서 검증하세요.
# function("f"): parseEquation(s06_value.latex).differenceFunction("x","y")
```

### s06_feedback (Note)

```cl
# s06_feedback
content:
  when s06_value.submitted "그래프에서 네 입력이 상황과 맞는지 비교해 보세요."
  otherwise ""
```
