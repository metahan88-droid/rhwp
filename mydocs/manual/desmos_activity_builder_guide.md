# Desmos/Amplify Activity Builder 제작 가이드

이 문서는 Desmos Computation Layer(CL) 기반 활동을 이 저장소에서 설계하고, Amplify Classroom Activity Builder에 사람이 직접 옮겨 만드는 절차를 정리한다.

## 기본 원칙

- 공식/공개 API로 확인 가능한 데이터만 수집한다.
- Activity Builder 비공개 저장 API를 자동 호출하지 않는다.
- 산출물은 `activity JSON spec`, `screen plan`, `CL paste pack`, `preview checklist`로 만든다.
- 최종 검증은 Amplify Classroom의 Student Preview와 스크립트 패널에서 한다.

## 도구 위치

```bash
cd /Users/han/project/rhwp/tools/desmos-activity
```

주요 명령:

```bash
npm run check
npm run generate:calorie
npm run generate:smooth-slide
node src/inspect-amplify.mjs 'https://classroom.amplify.com/activity/6a2a1e755c2f2268f8e2eb7d?lang=ko' --out generated/inspections
node src/lint.mjs activities/smooth-slide-linear-functions.json
```

## 활동 URL 분석

공개 활동은 먼저 `inspect-amplify.mjs`로 확인한다.

```bash
node src/inspect-amplify.mjs '<activity-url>' --out generated/inspections
```

생성 파일:

- `<activity-id>.json`: HTML 메타데이터, `/activity-meta/custom`, `/activity/{id}` 응답 전체
- `<activity-id>.md`: 화면 수, 컴포넌트 수, alias, CL script 요약

확인할 항목:

- 제목, 작성자, published/edit timestamp
- `permissionToShare`
- screen count
- component counts
- CL script 목록
- 그래프/버튼/sketch alias

## 새 활동 만들기

1. `activities/*.json` 스펙을 만든다.
2. 화면별 `template`을 고른다.
3. `node src/lint.mjs <spec>`로 컴포넌트 이름과 참조를 검사한다.
4. `node src/generate.mjs <spec> --out generated`로 붙여넣기 팩을 만든다.
5. Activity Builder에서 화면과 컴포넌트 이름을 먼저 만든다.
6. `generated/<id>/screen-cl.md`의 CL을 각 컴포넌트에 붙여넣는다.
7. `paste-checklist.md` 순서대로 Student Preview와 Dashboard를 확인한다.

## 이름 규칙

대량 제작에서는 화면 prefix를 붙인다.

- `s01_prediction`
- `s02_slope`
- `s03_slideGraph`
- `s03_runSlide`
- `s03_feedback`

원본 Desmos 활동처럼 화면마다 `s1`, `graph1`을 반복해도 동작할 수 있지만, 생성팩과 검토 문서에서는 전역 고유 이름이 유지보수에 낫다.

## 매끄러운 미끄럼틀 패턴

대상 활동 `26.6.15 공개수업`에서 확인한 핵심 패턴이다.

Graph component CL:

```cl
number("T"): button1.timeSincePress(11)

correct: graph1.number("C")=1
```

Action Button CL:

```cl
resetLabel: "다시 해보기"
```

Graph 내부 표현식 설계:

```text
m_1 = h_1 / b_1
m_2 = h_2 / b_2
m_3 = h_3 / b_3
E_1 = {|m_1 - m_2| < 0.02: 0, 1}
E_2 = {|m_3 - m_2| < 0.02: 0, 1}
C = {E_1 + E_2 = 0: 1, 0}
```

설계 이유:

- 수학 모델은 그래프가 담당한다.
- CL은 버튼 시간값을 주입하고 최종 판정값만 읽는다.
- 유지보수 시 CL보다 그래프 표현식을 보는 편이 쉽다.

## 검증 체크리스트

- 화면별 컴포넌트 이름이 생성 문서와 정확히 일치하는가?
- `button.timeSincePress(max)`의 버튼 alias가 존재하는가?
- 그래프 내부에 `C`라는 숫자 표현식이 실제로 있는가?
- `correct: graph.number("C")=1`이 Student Preview 제출/조작 후 반응하는가?
- `readOnly: true`를 넣은 그래프가 정말 시범용인가?
- sketch carryover에서 `background: sketchLayer(previous.sketch)`의 previous alias가 이전 화면에 있는가?
- Teacher Dashboard에서 check/dot/cross가 의도대로 보이는가?

## 산출물 위치

- 활동 스펙: `tools/desmos-activity/activities/`
- 생성 결과: `tools/desmos-activity/generated/`
- 조사 결과: `tools/desmos-activity/generated/inspections/`
- 프롬프트: `tools/desmos-activity/prompts/`
- 템플릿 설명: `tools/desmos-activity/templates/template-cards.md`
