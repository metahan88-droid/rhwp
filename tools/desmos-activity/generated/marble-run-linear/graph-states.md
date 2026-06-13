# 구슬 미끄럼틀: 일차함수로 별 모으기 - Graph States (paste-ready)

줄바꿈으로 구분된 LaTeX를 표현식 목록에 붙여넣으면 줄마다 별도 expression이 생성됩니다(실측 확인).
숨김(hidden) 표시된 표현식은 붙여넣은 뒤 그래프 아이콘을 눌러 숨기세요.

## 2. Fix It: 숫자 하나만 바꾸기 — `s02_marbleGraph`

뷰포트: x [-2, 12], y [-2, 10] (그래프 설정에서 맞춘 뒤 잠금 권장)

전체 상태 JSON: `graph-state.s02-fix-it.s02_marbleGraph.json` (Claude in Chrome / API 임베드용)

아래 표현식을 그래프 편집기에 **순서대로** 붙여넣으세요. 폴더 줄은 폴더를 만들고, 이후 표현식을 그 안에 넣습니다.

> 메모: CL이 주입: g(x) 학생 함수, T 경과 시간. (미리보기에서 보고 싶으면 g(x)=-0.5x+6을 임시로 넣었다가 CL 연결 전에 삭제 — function() sink는 그래프 내 동일 함수 정의와 충돌할 수 있음)

```latex
T=0
```

### [폴더] 공 (낙하 후 곡선을 따라 굴러감)

```latex
b_{x}=1
```

```latex
b_{y}=8
```

```latex
y_{hit}=g\left(b_{x}\right)
```  <!-- 숨김 -->

```latex
t_{1}=\max\left(0,\frac{b_{y}-y_{hit}}{4}\right)
```  <!-- 숨김 -->

```latex
x_{b}=\left\{T<t_{1}:b_{x},b_{x}+2\left(T-t_{1}\right)\right\}
```  <!-- 숨김 -->

```latex
y_{b}=\left\{T<t_{1}:b_{y}-4T,g\left(x_{b}\right)\right\}
```  <!-- 숨김 -->

```latex
\left(x_{b},y_{b}\right)
```  <!-- 드래그:NONE, 라벨:● -->

### [폴더] 별과 판정 (CL은 S, C만 읽는다)

```latex
S_{x}=\left[3,6\right]
```

```latex
S_{y}=\left[4,2.5\right]
```

```latex
H=\left\{\left|g\left(S_{x}\right)-S_{y}\right|<0.35:1,0\right\}
```  <!-- 숨김 -->

```latex
P=\left\{x_{b}>S_{x}:1,0\right\}
```  <!-- 숨김 -->

```latex
S=\operatorname{total}\left(HP\right)
```  <!-- 숨김 -->

```latex
C=\left\{S=2:1,0\right\}
```  <!-- 숨김 -->

```latex
\left(S_{x},S_{y}\right)
```  <!-- 라벨:⭐ -->

## 4. Challenge: 별 3개를 한 직선으로 — `s04_marbleGraph`

뷰포트: x [-2, 12], y [-2, 10] (그래프 설정에서 맞춘 뒤 잠금 권장)

전체 상태 JSON: `graph-state.s04-challenge.s04_marbleGraph.json` (Claude in Chrome / API 임베드용)

아래 표현식을 그래프 편집기에 **순서대로** 붙여넣으세요. 폴더 줄은 폴더를 만들고, 이후 표현식을 그 안에 넣습니다.

> 메모: CL이 주입: g(x) 학생 함수, T 경과 시간. (미리보기에서 보고 싶으면 g(x)=-0.5x+6을 임시로 넣었다가 CL 연결 전에 삭제 — function() sink는 그래프 내 동일 함수 정의와 충돌할 수 있음)

```latex
T=0
```

### [폴더] 공 (낙하 후 곡선을 따라 굴러감)

```latex
b_{x}=0
```

```latex
b_{y}=9
```

```latex
y_{hit}=g\left(b_{x}\right)
```  <!-- 숨김 -->

```latex
t_{1}=\max\left(0,\frac{b_{y}-y_{hit}}{4}\right)
```  <!-- 숨김 -->

```latex
x_{b}=\left\{T<t_{1}:b_{x},b_{x}+2\left(T-t_{1}\right)\right\}
```  <!-- 숨김 -->

```latex
y_{b}=\left\{T<t_{1}:b_{y}-4T,g\left(x_{b}\right)\right\}
```  <!-- 숨김 -->

```latex
\left(x_{b},y_{b}\right)
```  <!-- 드래그:NONE, 라벨:● -->

### [폴더] 별과 판정 (CL은 S, C만 읽는다)

```latex
S_{x}=\left[2,4,8\right]
```

```latex
S_{y}=\left[5,3,-1\right]
```

```latex
H=\left\{\left|g\left(S_{x}\right)-S_{y}\right|<0.35:1,0\right\}
```  <!-- 숨김 -->

```latex
P=\left\{x_{b}>S_{x}:1,0\right\}
```  <!-- 숨김 -->

```latex
S=\operatorname{total}\left(HP\right)
```  <!-- 숨김 -->

```latex
C=\left\{S=3:1,0\right\}
```  <!-- 숨김 -->

```latex
\left(S_{x},S_{y}\right)
```  <!-- 라벨:⭐ -->
