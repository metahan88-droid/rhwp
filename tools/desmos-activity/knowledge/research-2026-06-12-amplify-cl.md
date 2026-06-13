# 2026-06-12 Amplify/Desmos CL 추가 조사

## 기준 활동 확인

URL: <https://classroom.amplify.com/activity/6a2a1e755c2f2268f8e2eb7d?utm_campaign=share&utm_content=activity&lang=ko>

확인 가능한 공개 정보:

- 제목: `26.6.15 공개수업`
- 작성자: `선생님 한윤석`
- 썸네일: `https://uploads.desmos.com/activitybuilder/0922702fec1a48d83be9637427581588`
- 썸네일 내용: `칼로리 DOWN`, `하늘 계단의 개수 291개`, `10계단에 1.4 kcal`, `1분에 12 kcal`
- 공개 메타데이터 API: `POST https://classroom.amplify.com/activity-meta/custom`
- 요청 예: `{"customIds":["6a2a1e755c2f2268f8e2eb7d"],"lang":"ko","includeDraftStatus":true}`
- `POST /activity/{id}`는 공개 활동의 `customLesson` JSON을 반환했다.
- 대상 활동은 22개 화면이며, 흐름은 기울기 도입, 일차함수 판별, 매끄러운 미끄럼틀 만들기, 절편 해석으로 이어진다.
- 주요 컴포넌트 수: sketch 28, input/graph 4, exhibit/text 7, exhibit/image 6, action-button 3, multiple-choice 2.
- CL 스크립트는 버튼 시간값을 그래프 변수 `T`로 보내고, 그래프 내부 계산값 `C`를 `correct:`로 읽는 패턴이 중심이다.

핵심 CL 예:

```cl
number("T"): button1.timeSincePress(11)

correct: graph1.number("C")=1
```

그래프 내부 판정 로직은 `m_1=h_1/b_1`, `m_2=h_2/b_2`, `m_3=h_3/b_3`처럼 기울기를 계산한 뒤, 기울기 차이가 작으면 `C=1`이 되도록 구성하는 방식으로 해석된다.

## 제작 관점의 해석

이 활동과 유사한 콘텐츠는 다음 구조로 재현하는 것이 적합하다.

1. 도입/예측: 어떤 선분 또는 길이 더 가파른지 직관을 수집한다.
2. sketch: 학생이 가파른 정도를 직접 표시하거나 이전 sketch를 다음 화면 배경으로 넘긴다.
3. 버튼 애니메이션: `button.timeSincePress(max)`를 그래프의 `T`로 보내 점/대상을 움직인다.
4. 그래프 판정: 그래프 내부에서 수학 판정값 `C`를 계산한다.
5. dashboard correctness: CL에서 `correct: graph.number("C")=1`만 읽는다.
6. 설명: 학생이 기울기와 매끄러움의 관계를 말로 설명한다.
7. 전이: 일차함수의 기울기, x절편, y절편으로 확장한다.

## 공식/1차 자료에서 반영한 규칙

- 공식 CL 문서는 `randomGenerator`가 학생별로 안정적인 난수를 만들며, seed를 넣으면 버튼 등으로 새 문제를 만들 수 있다고 설명한다.
- `randomGenerator`의 멤버 함수로 `int(a,b)`와 `float(a,b)`가 문서화되어 있다.
- Amplify Activity Builder 자료는 새 활동 제작, 컴포넌트 복사, 그래프 편집, Polypad와 CL 사용 흐름을 안내한다.
- 2026 Activity Builder Spotlight Contest는 Pro 활동 기준에 CL 또는 고급 그래프로 풍부한 학생 상호작용을 포함한다고 설명한다.

## 추가 참고 링크

- Official CL docs: <https://teacher.desmos.com/computation-layer/documentation>
- Current docs route: <https://classroom.amplify.com/computation-layer/documentation>
- Intro to CL help article: <https://service.amplify.com/article/amplify-classroom-introduction-to-computation-layer>
- Getting started with Activity Builder: <https://service.amplify.com/article/amplify-classroom-getting-started-activity-builder>
- Copy components and edit graphs: <https://service.amplify.com/article/amplify-classroom-copy-individual-components-and-edit-graphs-in-activity-builder>
- Polypad and CL: <https://service.amplify.com/article/9950411-authoring-mode-polypad-and-computation-layer>
- Spotlight Contest criteria: <https://go.info.amplify.com/fy26_amplifyclassroom_activitybuilder_national_contest_contest_content-only_optin>
- CL forum resources: <https://cl.desmos.com/c/resources/10>
- Computation Layer 101: <https://cl.desmos.com/t/computation-layer-101/8414>
- Self-checking activity hub: <https://ispeakmath.org/desmos-self-checking-activity-builders/>

## 프로젝트 반영 사항

- 활동 원본을 직접 복제하는 대신, 확인 가능한 사실과 교육 패턴을 분리한다.
- `activities/*.json`에 수업 아이디어를 구조화한다.
- `src/generate.mjs`가 화면별 구현 문서와 CL 초안을 생성한다.
- `src/inspect-amplify.mjs`가 공개 활동 JSON, 컴포넌트 수, alias, CL script 목록을 추출한다.
- `smooth_slide_graph_check` 템플릿은 대상 활동에서 확인한 그래프 판정값 기반 패턴을 재사용한다.
- `prompts/`에는 LLM이 새 활동 스펙을 안정적으로 만들도록 프롬프트를 둔다.
- `generated/` 결과물은 Activity Builder에서 수동 제작할 때 쓰는 작업지시서 역할을 한다.
