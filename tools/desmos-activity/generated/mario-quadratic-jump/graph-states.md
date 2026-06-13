# 점프! 이차함수 코인 러시 - Graph States (paste-ready)

줄바꿈으로 구분된 LaTeX를 표현식 목록에 붙여넣으면 줄마다 별도 expression이 생성됩니다(실측 확인).
숨김(hidden) 표시된 표현식은 붙여넣은 뒤 그래프 아이콘을 눌러 숨기세요.

## 2. 레벨 1: 식 고치기 — `s02_stage`

뷰포트: x [-1, 9], y [-1, 7] (그래프 설정에서 맞춘 뒤 잠금 권장)

전체 상태 JSON: `graph-state.s02-edit.s02_stage.json` (Claude in Chrome / API 임베드용)

아래 표현식을 그래프 편집기에 **순서대로** 붙여넣으세요. 폴더 줄은 폴더를 만들고, 이후 표현식을 그 안에 넣습니다.

> 메모: CL이 주입: g(x), T. 캐릭터는 곡선 위를 등속으로 달린다. (미리보기용 임시 g(x)는 CL 연결 전에 삭제 — function() sink는 그래프 내 동일 함수 정의와 충돌할 수 있음)

```latex
T=0
```

### [폴더] 지형

```latex
0\le y\le0.2\left\{-1<x<9\right\}
```  <!-- 채우기:0.6 -->

### [폴더] 캐릭터 (이미지를 올리면 center를 이 점으로)

```latex
x_{p}=0+1T
```  <!-- 숨김 -->

```latex
\left(x_{p},g\left(x_{p}\right)\right)
```  <!-- 드래그:NONE, 라벨:🏃 -->

### [폴더] 코인과 판정 (CL은 S, C만 읽는다)

```latex
C_{x}=\left[2,3,4\right]
```

```latex
C_{y}=\left[3.5,4,3.5\right]
```

```latex
H=\left\{\left|g\left(C_{x}\right)-C_{y}\right|<0.4:1,0\right\}
```  <!-- 숨김 -->

```latex
P=\left\{x_{p}>C_{x}:1,0\right\}
```  <!-- 숨김 -->

```latex
S=\operatorname{total}\left(HP\right)
```  <!-- 숨김 -->

```latex
C=\left\{S=3:1,0\right\}
```  <!-- 숨김 -->

```latex
\left(C_{x},C_{y}\right)
```  <!-- 라벨:🪙 -->

```latex
\left(C_{x},C_{y}+0.5\right)\left\{HP=1\right\}
```  <!-- 라벨:✨ -->

## 4. 레벨 2: 처음부터 작성 — `s04_stage`

뷰포트: x [-1, 9], y [-1, 7] (그래프 설정에서 맞춘 뒤 잠금 권장)

전체 상태 JSON: `graph-state.s04-build.s04_stage.json` (Claude in Chrome / API 임베드용)

아래 표현식을 그래프 편집기에 **순서대로** 붙여넣으세요. 폴더 줄은 폴더를 만들고, 이후 표현식을 그 안에 넣습니다.

> 메모: CL이 주입: g(x), T. 캐릭터는 곡선 위를 등속으로 달린다. (미리보기용 임시 g(x)는 CL 연결 전에 삭제 — function() sink는 그래프 내 동일 함수 정의와 충돌할 수 있음)

```latex
T=0
```

### [폴더] 지형

```latex
0\le y\le0.2\left\{-1<x<9\right\}
```  <!-- 채우기:0.6 -->

### [폴더] 캐릭터 (이미지를 올리면 center를 이 점으로)

```latex
x_{p}=0+1T
```  <!-- 숨김 -->

```latex
\left(x_{p},g\left(x_{p}\right)\right)
```  <!-- 드래그:NONE, 라벨:🏃 -->

### [폴더] 코인과 판정 (CL은 S, C만 읽는다)

```latex
C_{x}=\left[1,3.5,6\right]
```

```latex
C_{y}=\left[2,5,2\right]
```

```latex
H=\left\{\left|g\left(C_{x}\right)-C_{y}\right|<0.4:1,0\right\}
```  <!-- 숨김 -->

```latex
P=\left\{x_{p}>C_{x}:1,0\right\}
```  <!-- 숨김 -->

```latex
S=\operatorname{total}\left(HP\right)
```  <!-- 숨김 -->

```latex
C=\left\{S=3:1,0\right\}
```  <!-- 숨김 -->

```latex
\left(C_{x},C_{y}\right)
```  <!-- 라벨:🪙 -->

```latex
\left(C_{x},C_{y}+0.5\right)\left\{HP=1\right\}
```  <!-- 라벨:✨ -->
