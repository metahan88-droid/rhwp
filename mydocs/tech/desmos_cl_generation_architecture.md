# Desmos CL 생성 아키텍처

## 목표

Desmos/Amplify Activity Builder 콘텐츠를 바이브코딩으로 빠르게 만들되, 매번 LLM이 CL을 새로 발명하지 않도록 스키마와 템플릿으로 제약한다.

## 범위

1차 범위:

- 공개 활동 분석
- 활동 스펙 JSON 작성
- 화면별 컴포넌트 목록 생성
- CL script 초안 생성
- 붙여넣기 체크리스트 생성
- 간단한 정적 lint

범위 밖:

- Amplify 계정 로그인 자동화
- Activity Builder 저장 API 자동 호출
- CL 공식 컴파일러 대체
- 학생 제출물/대시보드 데이터 수집

## 파이프라인

```text
public activity URL
  -> inspect-amplify.mjs
  -> inspection JSON/Markdown
  -> activity spec JSON
  -> lint.mjs
  -> generate.mjs
  -> Activity Builder paste pack
  -> manual Student Preview / Dashboard verification
```

## 중간표현

`activities/*.json`은 다음 구조를 갖는다.

```json
{
  "id": "smooth-slide-linear-functions",
  "title": "매끄러운 미끄럼틀과 일차함수",
  "learningGoals": [],
  "sourceInspiration": {},
  "screens": [
    {
      "id": "s04-build",
      "title": "매끄러운 미끄럼틀 만들기",
      "template": "smooth_slide_graph_check",
      "graph": "s04_slideGraph",
      "button": "s04_runSlide",
      "feedback": "s04_feedback"
    }
  ]
}
```

스키마 파일:

```text
tools/desmos-activity/schemas/activity-spec.schema.json
```

## 템플릿 레이어

템플릿은 `src/templates.mjs`에 정의된다.

각 템플릿은 세 가지를 제공한다.

- `components(screen)`: Activity Builder에서 만들 컴포넌트 목록
- `scripts(screen)`: 붙여넣기용 CL script
- `teacherMoves`: 교사용 운영 팁

현재 템플릿:

- `cover_fact_card`
- `notice_predict`
- `numeric_check`
- `unit_rate_model`
- `randomized_practice`
- `graph_match`
- `smooth_slide_graph_check`
- `table_check`
- `card_sort_check`
- `reflection`

## Linter

`src/lint.mjs`는 다음을 검사한다.

- activity id/title 존재
- screen id/title/template 존재
- template id 유효성
- 컴포넌트 이름이 CL-friendly identifier인지
- 같은 화면 안의 컴포넌트 이름 중복
- script 안에서 존재하지 않는 컴포넌트를 참조하는지
- Note에 `correct:`를 넣는 잠재 위험
- `randomGenerator`에 seed가 없는 잠재 위험

한계:

- CL 문법 전체를 파싱하지 않는다.
- 그래프 내부 표현식 존재 여부는 아직 검사하지 않는다.
- Activity Builder의 실제 source/sink 타입 검증은 하지 않는다.

## 공개 활동 분석기

`src/inspect-amplify.mjs`는 다음 요청을 수행한다.

- `GET <activity-url>`: HTML 메타데이터와 썸네일 추출
- `POST /activity-meta/custom`: 공개 활동 메타데이터 추출
- `POST /activity/{id}`: 공개 `customLesson` JSON 추출

출력 요약:

- screen count
- component counts
- screen title/type/component summary
- alias list
- CL scripts

## 매끄러운 미끄럼틀 템플릿 설계

대상 활동에서 확인한 안전한 구조:

- 버튼이 애니메이션 시간값을 만든다.
- 그래프가 수학 모델과 판정을 담당한다.
- CL은 그래프에 `T`를 주입하고 `C`를 읽는다.

```cl
number("T"): s04_runSlide.timeSincePress(11)
correct: s04_slideGraph.number("C") = 1
```

이 구조는 다음 장점이 있다.

- CL script가 짧다.
- 그래프 표현식을 보며 수학 모델을 디버그할 수 있다.
- 학생 조작과 대시보드 판정을 같은 그래프 상태에 묶을 수 있다.

## 향후 개선

- 그래프 state에서 `number("C")` 참조의 실제 존재 여부 검사
- `source/sink` allowlist 기반 CL lint
- 예시 활동 golden output 테스트
- Obsidian LLM wiki와 `qmd` 색인 자동 업데이트
- HWPX 교사용 활동지 export
