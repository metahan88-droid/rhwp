# 기울기는 변화율이다: y=ax와 y=ax+b - Graph States (paste-ready)

줄바꿈으로 구분된 LaTeX를 표현식 목록에 붙여넣으면 줄마다 별도 expression이 생성됩니다(실측 확인).
숨김(hidden) 표시된 표현식은 붙여넣은 뒤 그래프 아이콘을 눌러 숨기세요.

## 3. 탐구 1: a는 계단의 높이 — `s03_exploreGraph`

뷰포트: x [-2, 6.5], y [-6, 12] (그래프 설정에서 맞춘 뒤 잠금 권장)

전체 상태 JSON: `graph-state.s03-explore-a.s03_exploreGraph.json` (Claude in Chrome / API 임베드용)

아래 표현식을 그래프 편집기에 **순서대로** 붙여넣으세요. 폴더 줄은 폴더를 만들고, 이후 표현식을 그 안에 넣습니다.

> 메모: 정비례 y=ax 탐구. a 슬라이더를 학생이 조작한다.

```latex
a=2
```  <!-- 슬라이더: -3 ~ 5, step 0.5 -->

```latex
y=ax
```

```latex
\left(0,0\right)
```  <!-- 라벨:출발점 (0,0) -->

### [폴더] 단위 계단 — x가 1 늘 때 y는 a만큼

```latex
X_{0}=\left[0,1,2,3\right]
```  <!-- 숨김 -->

```latex
y=aX_{0}\left\{X_{0}\le x\le X_{0}+1\right\}
```  <!-- 선스타일:SOLID -->

```latex
x=X_{0}+1\left\{\min\left(aX_{0},a\left(X_{0}+1\right)\right)\le y\le\max\left(aX_{0},a\left(X_{0}+1\right)\right)\right\}
```  <!-- 선스타일:SOLID -->

```latex
\left(X_{0}+0.5,aX_{0}\right)
```  <!-- 라벨:+1, 점 숨김(라벨만) -->

```latex
\left(X_{0}+1,\frac{aX_{0}+a\left(X_{0}+1\right)}{2}\right)
```  <!-- 라벨:+${a}, 점 숨김(라벨만) -->

### [폴더] 기울기 = 변화율 라벨

```latex
\left(4.6,4.6a\right)
```  <!-- 라벨:y=${a}x, 점 숨김(라벨만) -->

## 5. 탐구 2: b는 출발점만 바꾼다 — `s05_compareGraph`

뷰포트: x [-2, 6.5], y [-6, 14] (그래프 설정에서 맞춘 뒤 잠금 권장)

전체 상태 JSON: `graph-state.s05-compare-b.s05_compareGraph.json` (Claude in Chrome / API 임베드용)

아래 표현식을 그래프 편집기에 **순서대로** 붙여넣으세요. 폴더 줄은 폴더를 만들고, 이후 표현식을 그 안에 넣습니다.

> 메모: y=ax(점선)와 y=ax+b(실선) 비교. b는 평행이동만, 계단(변화율)은 동일.

```latex
a=2
```  <!-- 슬라이더: -3 ~ 5, step 0.5 -->

```latex
b=3
```  <!-- 슬라이더: -5 ~ 6, step 1 -->

### [폴더] 기준: 정비례

```latex
y=ax
```  <!-- 선스타일:DASHED -->

### [폴더] 비교 대상: y=ax+b

```latex
y=ax+b
```

```latex
\left(0,b\right)
```  <!-- 라벨:(0, ${b}) -->

```latex
x=0\left\{\min\left(0,b\right)\le y\le\max\left(0,b\right)\right\}
```  <!-- 선스타일:DOTTED -->

```latex
\left(0.15,\frac{b}{2}\right)
```  <!-- 라벨:+${b}, 점 숨김(라벨만) -->

### [폴더] 단위 계단 — b가 바뀌어도 계단은 그대로

```latex
X_{0}=\left[0,1,2,3\right]
```  <!-- 숨김 -->

```latex
y=aX_{0}+b\left\{X_{0}\le x\le X_{0}+1\right\}
```  <!-- 선스타일:SOLID -->

```latex
x=X_{0}+1\left\{\min\left(aX_{0}+b,a\left(X_{0}+1\right)+b\right)\le y\le\max\left(aX_{0}+b,a\left(X_{0}+1\right)+b\right)\right\}
```  <!-- 선스타일:SOLID -->

```latex
\left(X_{0}+0.5,aX_{0}+b\right)
```  <!-- 라벨:+1, 점 숨김(라벨만) -->

```latex
\left(X_{0}+1,\frac{aX_{0}+b+a\left(X_{0}+1\right)+b}{2}\right)
```  <!-- 라벨:+${a}, 점 숨김(라벨만) -->

## 7. 도전: 평행 만들기 — `s07_matchGraph`

뷰포트: x [-2, 7], y [-4, 14] (그래프 설정에서 맞춘 뒤 잠금 권장)

전체 상태 JSON: `graph-state.s07-match.s07_matchGraph.json` (Claude in Chrome / API 임베드용)

아래 표현식을 그래프 편집기에 **순서대로** 붙여넣으세요. 폴더 줄은 폴더를 만들고, 이후 표현식을 그 안에 넣습니다.

> 메모: CL이 주입: a_s (학생이 입력한 기울기). 더미는 CL 실행 시 덮어써진다.

```latex
a_{s}=1
```  <!-- 숨김 -->

### [폴더] 목표(빨간 선)와 그 계단

```latex
y=1.5x+4
```

```latex
X_{0}=\left[0,1,2\right]
```  <!-- 숨김 -->

```latex
y=1.5X_{0}+4\left\{X_{0}\le x\le X_{0}+1\right\}
```  <!-- 선스타일:SOLID -->

```latex
x=X_{0}+1\left\{\min\left(1.5X_{0}+4,1.5\left(X_{0}+1\right)+4\right)\le y\le\max\left(1.5X_{0}+4,1.5\left(X_{0}+1\right)+4\right)\right\}
```  <!-- 선스타일:SOLID -->

```latex
\left(X_{0}+0.5,1.5X_{0}+4\right)
```  <!-- 라벨:+1, 점 숨김(라벨만) -->

```latex
\left(X_{0}+1,\frac{1.5X_{0}+4+1.5\left(X_{0}+1\right)+4}{2}\right)
```  <!-- 라벨:+1.5, 점 숨김(라벨만) -->

### [폴더] 학생 선과 판정 (CL은 C만 읽는다)

```latex
y=a_{s}x+1
```

```latex
C=\left\{\left|a_{s}-1.5\right|<0.001:1,0\right\}
```  <!-- 숨김 -->

```latex
1\le y-a_{s}x\le 4\left\{C=1\right\}
```  <!-- 채우기:0.12 -->
