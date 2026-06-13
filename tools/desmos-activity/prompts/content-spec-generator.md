# 콘텐츠 스펙 생성기 — 임의 학습주제 → 데스모스 인터랙티브 활동

LLM이 학습주제를 받아 `build-activity.mjs --spec`용 슬라이드 스펙 JSON을 생성하는 가이드.
"HTML 콘텐츠 바이브코딩"처럼, 어떤 학습내용이든 데스모스 인터랙티브 활동으로 만든다.

## 입력
- 학습주제 (예: "이차함수 평행이동", "일차부등식 영역", "삼각비")
- 대상 학년/목표 (선택)

## 출력: 스펙 JSON
```json
{
  "title": "<활동 제목>",
  "slides": [
    { "title": "<화면 제목>", "components": [
      { "label": "<컴포넌트>", "graph": ["<LaTeX 표현식 줄>", ...], "cl": "<CL 스크립트>" }
    ]}
  ]
}
```
- `label`: 메모 · 수식 답변 · 자유 답변 · 객관식 문제 · 그래프 · 표 · 행동 버튼 · 그림판 (팔레트 aria-label 그대로)
- `graph`: 그래프 컴포넌트에만. Desmos 표현식 LaTeX 줄 배열. 슬라이더는 `a=1`처럼 변수 정의.
- `cl`: 컴포넌트 CL (가장 오른쪽=방금 추가 컴포넌트에 적용됨). 없으면 생략.

## 설계 원칙 (검증됨 — [[cl-pattern-catalog-official]])
1. **역할 분리**: 판정·물리·점수는 그래프 표현식이 소유, CL은 number/function 주입 + correct/content 회수만.
2. **단계 구성**: 도입(메모) → 탐구(그래프+슬라이더+메모CL) → 점검(수식답변 correct) → 도전 → 정리(자유답변). 4~6슬라이드.
3. **CL 적극**: 메모 content로 단계별 동적 안내, 수식답변 correct로 자동 채점.

## 콘텐츠 유형 → 레시피 ([[desmos-content-type-recipes]] 11종)
주제 성격으로 유형 선택:
- 식/방정식 세워 맞추기 → **방정식 판정형**: 그래프 `function("f"): simpleFunction(input.latex)` + `correct: graph.number("I_c")=1`
- 파라미터 탐구(슬라이더로 a,p,q 등) → **그래프 탐구형**: `a=1` 슬라이더 + `y=a(x-p)^2+q` + 메모 CL
- 영역으로 대상 모으기 → **수집/부등식 영역형**: `function("g"): simpleFunction("\\left\\{${input.latex}:1,0\\right\\}","x","y")`
- 시간 변화 관찰 → **애니메이션형**: `number("t_0"): button.timeSincePress(N)` + `animationDuration`
- 직관 점검 → **예측-확인형**: 객관식 예측 → 그래프 확인 → 메모 회상 보간
- 실생활 수치 → **수치 모델링형**: 수식답변 + `correct: numericValue=<답>`
- 단답 채점 → 수식답변 `correct: numericValue=<답>` (빈칸 가드)

## MathQuill 입력 주의 (그래프 표현식)
- `x^2` → x 다음 `^2` (자동 위첨자). `a(x-p)^2+q` 그대로 타이핑됨.
- 분수 `\frac{}{}`, 슬라이더는 `a=1`처럼 상수 대입(입력 시 슬라이더 자동 제안).
- `y=` 포함 방정식은 그래프 표현식엔 OK, 단 `simpleFunction`에 넣을 땐 `y=` 빼고.
- 학생 함수 입력은 수식답변(input/expression)으로 받고, 그래프엔 `function("f"): simpleFunction(input.latex)`로 주입.

## CL 골격 모음 (verbatim, [[cl-pattern-catalog-official]])
```cl
# 메모 동적 안내
content: when input.submitted "..." otherwise "..."
# 수식답변 채점
correct: numericValue = 3
# 그래프 소유 판정 회수
correct: graph1.number("I_c") = 1
# 학생 식 → 그래프 주입
function("f"): when input.submitted simpleFunction(input.latex) otherwise simpleFunction("x^2")
# 애니메이션 시간 주입
number("t_0"): button1.timeSincePress(10)
```

## 생성 후
```bash
node src/build-activity.mjs --spec <spec.json>   # 비공개 활동 자동 구현
# 미리보기 검증 → (사용자 승인 후) 발행/수업 배정
```

## 품질 체크
- 각 그래프 표현식이 MathQuill에 입력 가능한 LaTeX인가
- CL의 sink/source 이름이 그래프 표현식 변수와 일치하는가
- correct는 학생이 실제로 도달 가능한 정답인가 (경계·strict·빈칸 가드)
- 화면당 핵심 상호작용 1개, 컴포넌트 2~3개 이하
