# 기울기는 변화율이다: y=ax와 y=ax+b - CL Drafts

These scripts are designed for manual paste into Amplify Classroom Activity Builder.
Run the Activity Builder script checker after pasting, because there is no public local CL compiler.

## 1. 같은 빠르기, 다른 출발점

Template: `cover_fact_card`

### intro (Note)

```cl
# intro
# 정적 도입 화면입니다. 필요하면 아래 문장을 dynamic text로 바꾸세요.
# 형과 동생이 같은 빠르기로 걷습니다. 동생은 3m 앞에서 출발했어요. 1초마다 두 사람의 위치는 어떻게 변할까요? 거리 차이는 좁혀질까요?
```

## 2. 예측: 그래프 모양은?

Template: `notice_predict`

### s02_predFeedback (Note)

```cl
# s02_predFeedback
content:
  when s02_prediction.submitted "좋아요. 다음 화면에서 직접 a를 움직이며 확인해 봅시다."
  otherwise "두 사람의 시간-거리 그래프를 한 좌표평면에 그리면 어떤 모양일까요? (만난다 / 나란하다 / 벌어진다)"
```

## 3. 탐구 1: a는 계단의 높이

Template: `slope_rate_explorer`

### s03_exploreGraph (Graph)

```cl
# s03_exploreGraph — 탐구용. 대시보드 채점에서 제외.
readOnly: true
```

### s03_exploreNote (Note)

```cl
# s03_exploreNote
content: "a를 움직여 보세요. x가 1칸 갈 때 y가 몇 칸 오르나요? a를 음수로도 만들어 보세요. 계단 라벨의 숫자와 a를 비교하세요."
```

## 4. 점검: 변화율 읽기

Template: `numeric_check`

### s04_rate (Math Input)

```cl
# s04_rate
check = numericValue = 3
correct: check
readOnly: this.submitted
```

### s04_feedback (Note)

```cl
# s04_feedback
content:
  when s04_rate.submitted and s04_rate.script.check "맞아요. x의 계수 3이 곧 'x가 1 늘 때 y가 느는 양' — 변화율이자 기울기입니다."
  when s04_rate.submitted "y=3x에서 x가 1에서 2가 되면 y는 3에서 얼마가 되는지 계산해 보세요."
  otherwise ""
```

## 5. 탐구 2: b는 출발점만 바꾼다

Template: `slope_rate_explorer`

### s05_compareGraph (Graph)

```cl
# s05_compareGraph — 탐구용. 대시보드 채점에서 제외.
readOnly: true
```

### s05_compareNote (Note)

```cl
# s05_compareNote
content: "b를 움직여 보세요. 직선은 위아래로만 움직이고 계단 높이는 그대로입니다. 이제 a를 움직이면? — 형(점선)과 동생(실선) 이야기에서 b는 무엇이었나요?"
```

## 6. 점검: 구간의 변화량

Template: `numeric_check`

### s06_delta (Math Input)

```cl
# s06_delta
check = numericValue = 9
correct: check
readOnly: this.submitted
```

### s06_feedback (Note)

```cl
# s06_feedback
content:
  when s06_delta.submitted and s06_delta.script.check "맞아요. 3×(5−2)=9 — +2는 답에 영향을 주지 않았죠. 변화량은 기울기가 결정합니다."
  when s06_delta.submitted "x=2일 때와 x=5일 때의 y값을 각각 구해 빼 보세요. b의 +2는 어떻게 되나요?"
  otherwise ""
```

## 7. 도전: 평행 만들기

Template: `slope_rate_explorer`

### s07_matchGraph (Graph)

```cl
# s07_matchGraph — 판정 C는 그래프 표현식이 소유.
number(`a_{s}`): s07_slopeInput.numericValue
```

### s07_slopeInput (Math Input)

```cl
# s07_slopeInput — 기울기 '값'만 숫자로 입력 (식 전체가 아님)
correct: s07_matchGraph.number(`C`) = 1
```

### s07_matchNote (Note)

```cl
# s07_matchNote
c = firstDefinedValue(s07_matchGraph.number(`C`), -1)
content:
when c = -1 "빨간 선과 평행이 되도록 파란 선의 기울기를 숫자로 입력하세요. 힌트: 빨간 선의 계단을 세어 보세요."
when c = 1 "평행입니다! 기울기(변화율)가 1.5로 같으면 두 직선은 절대 만나지 않아요."
otherwise "아직 평행이 아니에요. 빨간 선은 x가 1칸 갈 때 y가 몇 칸 변하나요?"
```

## 8. 정리: 기울기란 무엇인가

Template: `reflection`

### s08_prompt (Note)

```cl
# s08_prompt
# 성찰 화면은 보통 정답 판정을 넣지 않습니다.
# 질문: 친구에게 '기울기'를 설명한다면? 'x가 1 증가할 때'라는 표현을 사용해, y=ax+b에서 a와 b가 각각 무엇을 결정하는지 설명하세요.
```
