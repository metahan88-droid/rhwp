# 양떼 지키기: 부등식 울타리 - Graph States (paste-ready)

줄바꿈으로 구분된 LaTeX를 표현식 목록에 붙여넣으면 줄마다 별도 expression이 생성됩니다(실측 확인).
숨김(hidden) 표시된 표현식은 붙여넣은 뒤 그래프 아이콘을 눌러 숨기세요.

## 2. 첫 울타리 치기 — `s02_pasture`

뷰포트: x [-6, 6], y [-5, 5] (그래프 설정에서 맞춘 뒤 잠금 권장)

전체 상태 JSON: `graph-state.s02-first-fence.s02_pasture.json` (Claude in Chrome / API 임베드용)

아래 표현식을 그래프 편집기에 **순서대로** 붙여넣으세요. 폴더 줄은 폴더를 만들고, 이후 표현식을 그 안에 넣습니다.

> 메모: CL이 주입: f(x,y) 차이함수(해집합 f>0), s(strict 여부). s 더미는 CL이 덮어쓴다. (미리보기용 임시 f는 CL 연결 전에 삭제 — function() sink는 그래프 내 동일 함수 정의와 충돌할 수 있음)

```latex
s=0
```  <!-- 숨김 -->

### [폴더] 울타리 음영 — 두 줄 다 넣는다 (strict=점선, 비엄격=실선)

```latex
0<f\left(x,y\right)\left\{s=1\right\}
```  <!-- 채우기:0.25 -->

```latex
0\le f\left(x,y\right)\left\{s=0\right\}
```  <!-- 채우기:0.25 -->

### [폴더] 경계선 이중화 — 공식 Point Collector의 실선/점선 불일치 함정 대비 (cl.desmos.com/t/4931)

```latex
f\left(x,y\right)=0\left\{s=0\right\}
```  <!-- 선스타일:SOLID -->

```latex
f\left(x,y\right)=0\left\{s=1\right\}
```  <!-- 선스타일:DASHED -->

### [폴더] 양 떼와 늑대

```latex
S_{x}=\left[1,2,3\right]
```

```latex
S_{y}=\left[1,3,2\right]
```

```latex
W_{x}=\left[-2\right]
```

```latex
W_{y}=\left[-1\right]
```

```latex
\left(S_{x},S_{y}\right)
```  <!-- 라벨:🐑 -->

```latex
\left(W_{x},W_{y}\right)
```  <!-- 라벨:🐺 -->

### [폴더] 판정 (CL은 N, C만 읽는다) — 경계 위(|f|≤0.001)는 비엄격(s=0)일 때만 포함

```latex
N=\operatorname{total}\left(\left\{f\left(S_{x},S_{y}\right)>0.001:1,f\left(S_{x},S_{y}\right)>-0.001:1-s,0\right\}\right)
```  <!-- 숨김 -->

```latex
M=\operatorname{total}\left(\left\{f\left(W_{x},W_{y}\right)>0.001:1,f\left(W_{x},W_{y}\right)>-0.001:1-s,0\right\}\right)
```  <!-- 숨김 -->

```latex
C=\left\{N=3:\left\{M=0:1,0\right\},0\right\}
```  <!-- 숨김 -->

## 4. 경계선 위의 양 — `s04_pasture`

뷰포트: x [-6, 6], y [-5, 5] (그래프 설정에서 맞춘 뒤 잠금 권장)

전체 상태 JSON: `graph-state.s04-boundary.s04_pasture.json` (Claude in Chrome / API 임베드용)

아래 표현식을 그래프 편집기에 **순서대로** 붙여넣으세요. 폴더 줄은 폴더를 만들고, 이후 표현식을 그 안에 넣습니다.

> 메모: CL이 주입: f(x,y) 차이함수(해집합 f>0), s(strict 여부). s 더미는 CL이 덮어쓴다. (미리보기용 임시 f는 CL 연결 전에 삭제 — function() sink는 그래프 내 동일 함수 정의와 충돌할 수 있음)

```latex
s=0
```  <!-- 숨김 -->

### [폴더] 울타리 음영 — 두 줄 다 넣는다 (strict=점선, 비엄격=실선)

```latex
0<f\left(x,y\right)\left\{s=1\right\}
```  <!-- 채우기:0.25 -->

```latex
0\le f\left(x,y\right)\left\{s=0\right\}
```  <!-- 채우기:0.25 -->

### [폴더] 경계선 이중화 — 공식 Point Collector의 실선/점선 불일치 함정 대비 (cl.desmos.com/t/4931)

```latex
f\left(x,y\right)=0\left\{s=0\right\}
```  <!-- 선스타일:SOLID -->

```latex
f\left(x,y\right)=0\left\{s=1\right\}
```  <!-- 선스타일:DASHED -->

### [폴더] 양 떼와 늑대

```latex
S_{x}=\left[0,2,4\right]
```

```latex
S_{y}=\left[1,3,5\right]
```

```latex
W_{x}=\left[3,-3\right]
```

```latex
W_{y}=\left[-2,-3\right]
```

```latex
\left(S_{x},S_{y}\right)
```  <!-- 라벨:🐑 -->

```latex
\left(W_{x},W_{y}\right)
```  <!-- 라벨:🐺 -->

### [폴더] 판정 (CL은 N, C만 읽는다) — 경계 위(|f|≤0.001)는 비엄격(s=0)일 때만 포함

```latex
N=\operatorname{total}\left(\left\{f\left(S_{x},S_{y}\right)>0.001:1,f\left(S_{x},S_{y}\right)>-0.001:1-s,0\right\}\right)
```  <!-- 숨김 -->

```latex
M=\operatorname{total}\left(\left\{f\left(W_{x},W_{y}\right)>0.001:1,f\left(W_{x},W_{y}\right)>-0.001:1-s,0\right\}\right)
```  <!-- 숨김 -->

```latex
C=\left\{N=3:\left\{M=0:1,0\right\},0\right\}
```  <!-- 숨김 -->
