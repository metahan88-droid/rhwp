# Activity Builder JSON 해부 (공개 활동 `6a2a1e755c2f2268f8e2eb7d` 실측, 2026-06-12)

`POST https://classroom.amplify.com/activity/{id}` (body `{}`) 가 반환하는 `customLesson`의 실제 구조.
`src/inspect-amplify.mjs` 결과물(`generated/inspections/*.json`)에서 직접 확인했다.

## 최상위

```
customLesson: {
  _id, version, steps, activity, ancestors, complete, edit_ts,
  licenses, screenLicenses, permissionToShare, publishedTimestamp,
  thumb, title, user, author, commitId, flags, customMetadata,
  standardsAlignment, logicalId, draftTitle, draftAuthor
}
```

- `steps`: **객체**(배열 아님). 키 순서가 화면 순서. 본 활동은 22개.

## 화면(step)

```
step: { type: "two-column" | ..., id: <uuid>, teacherTips: {}, root: { linearlayout: {...} } }
```

- `root.linearlayout`: `{ mainType: "columns" | "rows", components: [...] }` 재귀 중첩.
- 컴포넌트는 `{ "<타입키>": {...} }` 형태의 단일 키 객체.

## 관측된 컴포넌트 타입 키

| 타입 키 | 개수(본 활동) | 비고 |
|---|---|---|
| `sketch` | 28 | `background: sketchLayer(s1.sketch)` 캐리오버 패턴 |
| `exhibit/text` | 7 | 정적/동적 텍스트 |
| `exhibit/image` | 6 | `img: https://uploads.desmos.com/activitybuilder/<hash>` |
| `input/graph` | 4 | **`calculatorState` 전체 내장** |
| `action-button` | 3 | `resetLabel` 등 CL |
| `multiple-choice` | 2 | |
| `input/text` | 1 | 자유 응답 |

공통 필드: `id`(uuid), `script`(CL 문자열 또는 null), `alias`(CL 이름 또는 null).

## input/graph 의 calculatorState

```
{
  exhibitMode: true|false,        // 시연용(readOnly성) 그래프 여부와 연동되는 표시 모드
  calculatorState: {
    version: 11,
    randomSeed: "<hex>",
    graph: {
      viewport: { xmin, ymin, xmax, ymax },
      showGrid, showXAxis, showYAxis, userLockedViewport, squareAxes
    },
    expressions: { list: [ ... ] }
  },
  script, alias, aspectRatio: "16:9", id, img, legacyActionsOverrideSinks
}
```

### expressions.list 항목 타입 (실측)

- `{ type: "expression", id, latex, color?, hidden?, dragMode?("Y"|"X"|"XY"|"NONE"), fillOpacity?, pointStyle?, folderId? }`
- `{ type: "image", id, image_url: "https://uploads.desmos.com/calculator-images/<hash>", name, center: "\\left(x,y\\right)", width: "11.19", height: "9" }`
  - center/width/height 는 **LaTeX 문자열** (수식 가능 — 애니메이션 변수로 움직이는 이미지 가능)
- `{ type: "folder", id, title, hidden? }` + 멤버는 `folderId`로 연결
- `{ type: "text", id, text? }`

## 그래프를 게임 엔진으로 쓰는 실측 패턴 (graph1, 107개 표현식)

`knowledge/graph1-smooth-slide-state.json` 전체 저장본 참고. 구성:

1. **CL→그래프 입력**: CL이 `number("T"): button1.timeSincePress(11)` 로 시간을 주입. 그래프에는 `T=0` 기본값 정의.
2. **파라미터/스케일 폴더**: `B_1..H_3`(CL이 주입 가능), `s = 9/max(9, ΣH, ΣB)` 자동 스케일.
3. **위치 리스트**: `B=[b_1,b_2,b_3]`, `C_x=[...]` 누적 좌표 리스트로 구간 배치.
4. **단계 애니메이션**: `p_raise=min(1, T/2)`, `t_anim=min(1,T-4){T>2}` — T 구간별 연출 단계.
5. **조건부 렌더**: `y=C_y-H/2 {C_x-B/2<x<C_x+B/2}` 같은 제한 영역 식, `{T>5}{E_1=1}` 중첩 조건.
6. **물리 연출**: 다이버 `c_x = b_t - ½A cos(a_1) T_slide²` 포물선 낙하, 회전 각 `a_1=-arctan(h_1,b_1)`.
7. **판정**: `E_1={|m_1-m_2|<.02:0,1}`, `E_2={|m_3-m_2|<.02:0,1}`, `C={E_1+E_2=0:1,0}` → CL `correct: graph1.number("C")=1`.
8. **움직이는 이미지**: image의 center를 변수 좌표로 — 스프라이트.

## 시사점 (툴킷 설계)

- 그래프 상태는 **완전한 JSON으로 사전 제작 가능** → 생성기가 `calculatorState`를 통째로 만들어 두면,
  저작 시 그래프 편집기에서 표현식을 붙여넣거나(리스트 복붙) Claude in Chrome이 입력한다.
- 이미지 스프라이트는 uploads.desmos.com 업로드가 필요하므로, 토큰 없이 쓰려면
  **점/폴리곤/parametric 기반 벡터 스프라이트**가 안전한 기본값.
- `correct`/`readOnly`/`timeSincePress` 패턴은 게임형 활동에서도 동일하게 동작 — 게임 판정은 그래프가 소유.
