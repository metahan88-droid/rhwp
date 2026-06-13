// 게임형 템플릿 3종: marbleslides_style / platformer_mario / inequality_pasture
// 근거: desmos-cl 위키 gap research (2026-06-12) — 전부 1차 자료 검증 패턴.
//  - real marbleslides 컴포넌트에는 CL sink/source가 없으므로 graph-clone으로 설계한다.
//  - timeSincePress는 인자 생략 시 10초 캡 → 항상 명시 인자.
//  - CL은 변수 자기증가 불가 → 판정/점수는 그래프가 소유, CL은 number()로 읽기만.
//  - parseInequality.differenceFunction은 (큰쪽)-(작은쪽) → 해집합 항상 f>0.
//  - when/otherwise의 함수 분기는 양쪽 같은 타입 → 미제출 시 simpleFunction(`1/0`,...) 폴백.

// 공통 들여쓰기를 제거해 CL 패널에 그대로 붙여넣을 수 있는 평평한 코드로 만든다.
const code = (text) => {
  const lines = text.replace(/^\n+|\s+$/g, "").split("\n");
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length);
  const cut = Math.min(...indents);
  return lines.map((l) => l.slice(cut)).join("\n");
};
const component = (name, type, purpose) => ({ name, type, purpose });

function valueFrom(screen, key, fallback) {
  return screen[key] ?? screen.values?.[key] ?? fallback;
}

function numList(values) {
  return `\\left[${values.join(",")}\\right]`;
}

// 단위 계단(변화율 시각화) 표현식 묶음. y = a x + b 위에 x=0..steps-1 구간의 가로 +1 / 세로 +a 계단을 그린다.
// a, b는 그래프 변수 이름(latex)을 그대로 받는다 (예: "a", "2", "a_{s}").
function staircaseItems(a, b, steps, runLabel, riseLabel) {
  const xs = Array.from({ length: steps }, (_, i) => i);
  const X = `\\left[${xs.join(",")}\\right]`;
  const at = (x) => (b === "0" ? `${a}${x}` : `${a}${x}+${b}`); // a·x (+ b)
  return [
    { latex: `X_{0}=${X}`, hidden: true },
    { latex: `y=${at("X_{0}")}\\left\\{X_{0}\\le x\\le X_{0}+1\\right\\}`, lineStyle: "SOLID" },
    { latex: `x=X_{0}+1\\left\\{\\min\\left(${at("X_{0}")},${at("\\left(X_{0}+1\\right)")}\\right)\\le y\\le\\max\\left(${at("X_{0}")},${at("\\left(X_{0}+1\\right)")}\\right)\\right\\}`, lineStyle: "SOLID" },
    { latex: `\\left(X_{0}+0.5,${at("X_{0}")}\\right)`, label: runLabel, pointOpacity: 0 },
    { latex: `\\left(X_{0}+1,\\frac{${at("X_{0}")}+${at("\\left(X_{0}+1\\right)")}}{2}\\right)`, label: riseLabel, pointOpacity: 0 }
  ];
}

export const gameTemplates = {
  slope_rate_explorer: {
    title: "기울기 = 변화율 탐구",
    description: "슬라이더로 a(와 b)를 조작하며 단위 계단(x +1 → y +a)으로 기울기를 변화율로 관찰한다. match 모드는 평행 만들기 판정 포함.",
    components: (screen) => {
      const mode = valueFrom(screen, "mode", "explore_a");
      const base = [
        component(valueFrom(screen, "graph", "exploreGraph"), "Graph", "슬라이더 조작 + 단위 계단 시각화"),
        component(valueFrom(screen, "note", "exploreNote"), "Note", "탐구 안내와 관찰 질문")
      ];
      if (mode === "match") {
        base.unshift(component(valueFrom(screen, "input", "slopeInput"), "Math Input", "기울기 값 입력 (숫자)"));
      }
      return base;
    },
    scripts: (screen) => {
      const mode = valueFrom(screen, "mode", "explore_a");
      const graph = valueFrom(screen, "graph", "exploreGraph");
      const note = valueFrom(screen, "note", "exploreNote");
      if (mode !== "match") {
        const prompt = mode === "compare_b"
          ? valueFrom(screen, "prompt", "b를 움직여 보세요. 직선은 위아래로만 움직이고, 계단의 높이(변화율)는 그대로입니다. a를 움직이면 무엇이 달라지나요?")
          : valueFrom(screen, "prompt", "a를 움직여 보세요. x가 1칸 갈 때 y가 몇 칸 오르는지(계단)를 관찰하세요.");
        return [
          {
            component: graph,
            type: "Graph",
            script: code(`
              # ${graph} — 탐구용. 대시보드 채점에서 제외.
              readOnly: true
            `)
          },
          {
            component: note,
            type: "Note",
            script: code(`
              # ${note}
              content: "${prompt}"
            `)
          }
        ];
      }
      const input = valueFrom(screen, "input", "slopeInput");
      const targetA = valueFrom(screen, "targetA", 1.5);
      return [
        {
          component: graph,
          type: "Graph",
          script: code(`
            # ${graph} — 판정 C는 그래프 표현식이 소유.
            number(\`a_{s}\`): ${input}.numericValue
          `)
        },
        {
          component: input,
          type: "Math Input",
          script: code(`
            # ${input} — 기울기 '값'만 숫자로 입력 (식 전체가 아님)
            correct: ${graph}.number(\`C\`) = 1
          `)
        },
        {
          component: note,
          type: "Note",
          script: code(`
            # ${note}
            c = firstDefinedValue(${graph}.number(\`C\`), -1)
            content:
            when c = -1 "빨간 선과 평행이 되도록 파란 선의 기울기를 숫자로 입력하세요. 힌트: 빨간 선의 계단을 세어 보세요."
            when c = 1 "평행입니다! 기울기(변화율)가 ${targetA}로 같으면 두 직선은 절대 만나지 않아요."
            otherwise "아직 평행이 아니에요. 빨간 선은 x가 1칸 갈 때 y가 몇 칸 변하나요?"
          `)
        }
      ];
    },
    graphStates: (screen) => {
      const mode = valueFrom(screen, "mode", "explore_a");
      const graph = valueFrom(screen, "graph", "exploreGraph");
      const steps = valueFrom(screen, "steps", 4);
      const aInit = valueFrom(screen, "aInit", 2);
      const slider = screen.slider ?? { min: -3, max: 5, step: 0.5 };

      if (mode === "explore_a") {
        return [{
          component: graph,
          viewport: screen.viewport ?? { xmin: -2, ymin: -6, xmax: 6.5, ymax: 12 },
          items: [
            { note: "정비례 y=ax 탐구. a 슬라이더를 학생이 조작한다." },
            { latex: `a=${aInit}`, slider },
            { latex: "y=ax" },
            { latex: "\\left(0,0\\right)", label: "출발점 (0,0)" },
            { folder: "단위 계단 — x가 1 늘 때 y는 a만큼" },
            ...staircaseItems("a", "0", steps, "+1", "+${a}"),
            { folder: "기울기 = 변화율 라벨" },
            { latex: "\\left(4.6,4.6a\\right)", label: "y=${a}x", pointOpacity: 0 }
          ]
        }];
      }

      if (mode === "compare_b") {
        const bInit = valueFrom(screen, "bInit", 3);
        const bSlider = screen.bSlider ?? { min: -5, max: 6, step: 1 };
        return [{
          component: graph,
          viewport: screen.viewport ?? { xmin: -2, ymin: -6, xmax: 6.5, ymax: 14 },
          items: [
            { note: "y=ax(점선)와 y=ax+b(실선) 비교. b는 평행이동만, 계단(변화율)은 동일." },
            { latex: `a=${aInit}`, slider },
            { latex: `b=${bInit}`, slider: bSlider },
            { folder: "기준: 정비례" },
            { latex: "y=ax", lineStyle: "DASHED" },
            { folder: "비교 대상: y=ax+b" },
            { latex: "y=ax+b" },
            { latex: "\\left(0,b\\right)", label: "(0, ${b})" },
            { latex: "x=0\\left\\{\\min\\left(0,b\\right)\\le y\\le\\max\\left(0,b\\right)\\right\\}", lineStyle: "DOTTED" },
            { latex: "\\left(0.15,\\frac{b}{2}\\right)", label: "+${b}", pointOpacity: 0 },
            { folder: "단위 계단 — b가 바뀌어도 계단은 그대로" },
            ...staircaseItems("a", "b", steps, "+1", "+${a}")
          ]
        }];
      }

      // match 모드: 빨간 목표선과 평행 만들기 — 판정 C는 그래프 소유
      const targetA = valueFrom(screen, "targetA", 1.5);
      const targetB = valueFrom(screen, "targetB", 4);
      const studentB = valueFrom(screen, "studentB", 1);
      const lo = Math.min(targetB, studentB);
      const hi = Math.max(targetB, studentB);
      return [{
        component: graph,
        viewport: screen.viewport ?? { xmin: -2, ymin: -4, xmax: 7, ymax: 14 },
        items: [
          { note: "CL이 주입: a_s (학생이 입력한 기울기). 더미는 CL 실행 시 덮어써진다." },
          { latex: "a_{s}=1", hidden: true },
          { folder: "목표(빨간 선)와 그 계단" },
          { latex: `y=${targetA}x+${targetB}`, color: "#c74440" },
          ...staircaseItems(String(targetA), String(targetB), 3, "+1", `+${targetA}`).map((it) => ({ ...it, color: "#c74440" })),
          { folder: "학생 선과 판정 (CL은 C만 읽는다)" },
          { latex: `y=a_{s}x+${studentB}`, color: "#2d70b3" },
          { latex: `C=\\left\\{\\left|a_{s}-${targetA}\\right|<0.001:1,0\\right\\}`, hidden: true },
          { latex: `${lo}\\le y-a_{s}x\\le ${hi}\\left\\{C=1\\right\\}`, fillOpacity: 0.12, color: "#388c46" }
        ]
      }];
    },
    teacherMoves: [
      "explore_a → compare_b → match 순서로 배치하면 'a는 계단, b는 위치'가 누적 관찰됩니다.",
      "match 모드의 입력은 기울기 '값'(숫자)입니다 — 식 입력이 아니므로 y= 문제는 없습니다.",
      "계단 수(steps)·슬라이더 범위는 스펙의 values로 조절하세요. 라벨 +${a}는 슬라이더에 따라 실시간 갱신됩니다."
    ]
  },

  marbleslides_style: {
    title: "마블슬라이드 스타일 (그래프 클론)",
    description: "학생이 함수를 입력해 공을 굴려 별을 모은다. real marbleslides와 달리 CL 점수/판정/잠금이 가능하다.",
    components: (screen) => [
      component(valueFrom(screen, "input", "lineInput"), "Math Input", "공이 굴러갈 함수 입력"),
      component(valueFrom(screen, "button", "launch"), "Action Button", "공 발사"),
      component(valueFrom(screen, "graph", "marbleGraph"), "Graph", "공 낙하/슬라이드 애니메이션 + 별 수집 판정"),
      component(valueFrom(screen, "feedback", "marbleFeedback"), "Note", "수집 현황과 다음 행동 안내")
    ],
    scripts: (screen) => {
      const input = valueFrom(screen, "input", "lineInput");
      const button = valueFrom(screen, "button", "launch");
      const graph = valueFrom(screen, "graph", "marbleGraph");
      const feedback = valueFrom(screen, "feedback", "marbleFeedback");
      const duration = valueFrom(screen, "duration", 6);
      const starCount = (screen.stars ?? [[3, 2], [5, 1]]).length;
      return [
        {
          component: graph,
          type: "Graph",
          script: code(`
            # ${graph} — 판정은 그래프 내부 표현식(S, C)이 소유한다.
            # 주의: simpleFunction은 'y=' 방정식을 못 받는다 — 학생에게 식만 입력하게 안내.
            function(\`g\`):
            when ${input}.submitted simpleFunction(${input}.latex,\`x\`)
            otherwise simpleFunction(\`1/0\`,\`x\`)
            number(\`T\`): ${button}.timeSincePress(${duration})
          `)
        },
        {
          component: input,
          type: "Math Input",
          script: code(`
            # ${input}
            correct: ${graph}.number(\`C\`) = 1
          `)
        },
        {
          component: button,
          type: "Action Button",
          script: code(`
            # ${button}
            label: "공 굴리기"
            resetLabel: "다시 굴리기"
          `)
        },
        {
          component: feedback,
          type: "Note",
          script: code(`
            # ${feedback}
            s = firstDefinedValue(${graph}.number(\`S\`), -1)
            content:
            when not(${input}.submitted) "함수식을 y= 없이 입력하고 공을 굴려 보세요."
            when s = -1 "식을 인식하지 못했어요. y= 없이 식만 다시 입력하세요. 예: -2x+5 꼴"
            when ${graph}.number(\`C\`) = 1 "⭐ 별 ${starCount}개를 모두 모았습니다!"
            otherwise "지금까지 별 \${s} / ${starCount}개. 함수를 고쳐 다시 굴려 보세요."
          `)
        }
      ];
    },
    graphStates: (screen) => {
      const graph = valueFrom(screen, "graph", "marbleGraph");
      const drop = screen.dropPoint ?? [1, 8];
      const stars = screen.stars ?? [[3, 2], [5, 1]];
      const sx = numList(stars.map((s) => s[0]));
      const sy = numList(stars.map((s) => s[1]));
      return [
        {
          component: graph,
          viewport: screen.viewport ?? { xmin: -2, ymin: -2, xmax: 12, ymax: 10 },
          items: [
            { note: "CL이 주입: g(x) 학생 함수, T 경과 시간. (미리보기에서 보고 싶으면 g(x)=-0.5x+6을 임시로 넣었다가 CL 연결 전에 삭제 — function() sink는 그래프 내 동일 함수 정의와 충돌할 수 있음)" },
            { latex: "T=0" },
            { folder: "공 (낙하 후 곡선을 따라 굴러감)" },
            { latex: `b_{x}=${drop[0]}` },
            { latex: `b_{y}=${drop[1]}` },
            { latex: "y_{hit}=g\\left(b_{x}\\right)", hidden: true },
            { latex: "t_{1}=\\max\\left(0,\\frac{b_{y}-y_{hit}}{4}\\right)", hidden: true },
            { latex: "x_{b}=\\left\\{T<t_{1}:b_{x},b_{x}+2\\left(T-t_{1}\\right)\\right\\}", hidden: true },
            { latex: "y_{b}=\\left\\{T<t_{1}:b_{y}-4T,g\\left(x_{b}\\right)\\right\\}", hidden: true },
            { latex: "\\left(x_{b},y_{b}\\right)", label: "●", dragMode: "NONE" },
            { folder: "별과 판정 (CL은 S, C만 읽는다)" },
            { latex: `S_{x}=${sx}` },
            { latex: `S_{y}=${sy}` },
            { latex: "H=\\left\\{\\left|g\\left(S_{x}\\right)-S_{y}\\right|<0.35:1,0\\right\\}", hidden: true },
            { latex: "P=\\left\\{x_{b}>S_{x}:1,0\\right\\}", hidden: true },
            { latex: "S=\\operatorname{total}\\left(HP\\right)", hidden: true },
            { latex: `C=\\left\\{S=${stars.length}:1,0\\right\\}`, hidden: true },
            { latex: "\\left(S_{x},S_{y}\\right)", label: "⭐" }
          ]
        }
      ];
    },
    teacherMoves: [
      "공 물리는 단순화 모델입니다(낙하 후 곡선 추적). real marbleslides의 Box2D 물리와 다름을 학생에게 안내하세요.",
      "별 근접 판정 허용 오차(0.35)는 그래프 표현식 H에서 조절합니다.",
      "timeSincePress는 같은 화면의 다른 컴포넌트에 포커스가 가면 0으로 리셋됩니다 — 학생이 식을 고치면 애니메이션이 자동으로 멈추는 것이 정상입니다.",
      "Student Preview에서 미제출→제출→재제출 흐름을 꼭 확인하세요."
    ]
  },

  platformer_mario: {
    title: "플랫포머 (마리오형) 함수 점프",
    description: "학생이 작성한 함수 곡선을 따라 캐릭터가 달리며 코인을 먹는다. Super Mario Quadratics 패턴.",
    components: (screen) => [
      component(valueFrom(screen, "input", "jumpInput"), "Math Input", "점프 곡선 함수 입력"),
      component(valueFrom(screen, "button", "run"), "Action Button", "달리기 시작"),
      component(valueFrom(screen, "graph", "stageGraph"), "Graph", "지형 + 캐릭터 + 코인 + 판정"),
      component(valueFrom(screen, "hud", "scoreHud"), "Note", "코인 점수 HUD")
    ],
    scripts: (screen) => {
      const input = valueFrom(screen, "input", "jumpInput");
      const button = valueFrom(screen, "button", "run");
      const graph = valueFrom(screen, "graph", "stageGraph");
      const hud = valueFrom(screen, "hud", "scoreHud");
      const duration = valueFrom(screen, "duration", 8);
      const coinCount = (screen.coins ?? [[2, 3], [4, 4], [6, 2]]).length;
      return [
        {
          component: graph,
          type: "Graph",
          script: code(`
            # ${graph}
            # 주의: simpleFunction은 'y=' 방정식을 못 받는다 — 학생에게 식만 입력하게 안내.
            function(\`g\`):
            when ${input}.submitted simpleFunction(${input}.latex,\`x\`)
            otherwise simpleFunction(\`1/0\`,\`x\`)
            number(\`T\`): ${button}.timeSincePress(${duration})
          `)
        },
        {
          component: input,
          type: "Math Input",
          script: code(`
            # ${input}
            correct: ${graph}.number(\`C\`) = 1
          `)
        },
        {
          component: button,
          type: "Action Button",
          script: code(`
            # ${button}
            label: "달리기!"
            resetLabel: "다시 달리기"
          `)
        },
        {
          component: hud,
          type: "Note",
          script: code(`
            # ${hud}
            s = firstDefinedValue(${graph}.number(\`S\`), -1)
            content:
            when not(${input}.submitted) "점프 곡선 식을 y= 없이 입력하면 캐릭터가 달립니다. 꼴: a(x-p)^2+q"
            when s = -1 "식을 인식하지 못했어요. y= 없이 식만 다시 입력하세요. 예: -1(x-2)^2+3 꼴"
            when ${graph}.number(\`C\`) = 1 "🪙 코인 ${coinCount}개 완수! 깃발에 도착했습니다."
            otherwise "코인 \${s} / ${coinCount}개. 곡선이 코인을 지나도록 고쳐 보세요."
          `)
        }
      ];
    },
    graphStates: (screen) => {
      const graph = valueFrom(screen, "graph", "stageGraph");
      const coins = screen.coins ?? [[2, 3], [4, 4], [6, 2]];
      const startX = screen.startX ?? 0;
      const speed = screen.speed ?? 1;
      const cx = numList(coins.map((c) => c[0]));
      const cy = numList(coins.map((c) => c[1]));
      return [
        {
          component: graph,
          viewport: screen.viewport ?? { xmin: -1, ymin: -1, xmax: 9, ymax: 7 },
          items: [
            { note: "CL이 주입: g(x), T. 캐릭터는 곡선 위를 등속으로 달린다. (미리보기용 임시 g(x)는 CL 연결 전에 삭제 — function() sink는 그래프 내 동일 함수 정의와 충돌할 수 있음)" },
            { latex: "T=0" },
            { folder: "지형" },
            { latex: "0\\le y\\le0.2\\left\\{-1<x<9\\right\\}", fillOpacity: 0.6 },
            { folder: "캐릭터 (이미지를 올리면 center를 이 점으로)" },
            { latex: `x_{p}=${startX}+${speed}T`, hidden: true },
            { latex: "\\left(x_{p},g\\left(x_{p}\\right)\\right)", label: "🏃", dragMode: "NONE" },
            { folder: "코인과 판정 (CL은 S, C만 읽는다)" },
            { latex: `C_{x}=${cx}` },
            { latex: `C_{y}=${cy}` },
            { latex: "H=\\left\\{\\left|g\\left(C_{x}\\right)-C_{y}\\right|<0.4:1,0\\right\\}", hidden: true },
            { latex: "P=\\left\\{x_{p}>C_{x}:1,0\\right\\}", hidden: true },
            { latex: "S=\\operatorname{total}\\left(HP\\right)", hidden: true },
            { latex: `C=\\left\\{S=${coins.length}:1,0\\right\\}`, hidden: true },
            { latex: "\\left(C_{x},C_{y}\\right)", label: "🪙" },
            { latex: "\\left(C_{x},C_{y}+0.5\\right)\\left\\{HP=1\\right\\}", label: "✨" }
          ]
        }
      ];
    },
    teacherMoves: [
      "초반 화면은 식을 '수정'하게(꼭짓점형 기본값 제공), 후반 화면은 처음부터 작성하게 하세요 — Super Mario Quadratics의 난이도 곡선.",
      "키보드 조작은 불가능합니다. 조작감은 버튼/드래그/클릭으로만 설계하세요.",
      "캐릭터를 이미지 스프라이트로 바꾸려면 그래프 편집기에서 이미지를 업로드하고 center를 (x_p, g(x_p))로 설정하세요."
    ]
  },

  inequality_pasture: {
    title: "양떼 부등식 (영역 음영 + 객체 카운트)",
    description: "학생이 부등식 울타리를 입력하면 영역이 음영되고 울타리 안 양의 수를 그래프가 센다. Point Collector/Shira 패턴.",
    components: (screen) => [
      component(valueFrom(screen, "input", "fenceInput"), "Math Input", "울타리 부등식 입력"),
      component(valueFrom(screen, "graph", "pastureGraph"), "Graph", "음영 + 양/늑대 카운트 판정"),
      component(valueFrom(screen, "feedback", "pastureFeedback"), "Note", "울타리 안 양 수 피드백")
    ],
    scripts: (screen) => {
      const input = valueFrom(screen, "input", "fenceInput");
      const graph = valueFrom(screen, "graph", "pastureGraph");
      const feedback = valueFrom(screen, "feedback", "pastureFeedback");
      const sheepCount = (screen.sheep ?? [[1, 1], [2, 3], [3, 2]]).length;
      return [
        {
          component: graph,
          type: "Graph",
          script: code(`
            # ${graph} — 공식 음영 레시피 (CL 뉴스레터 2020-11)
            function(\`f\`):
            when ${input}.submitted parseInequality(${input}.latex).differenceFunction(\`x\`,\`y\`)
            otherwise simpleFunction(\`1/0\`,\`x\`,\`y\`)
            number(\`s\`):
            when ${input}.submitted and parseInequality(${input}.latex).isStrict 1
            otherwise 0
          `)
        },
        {
          component: input,
          type: "Math Input",
          script: code(`
            # ${input}
            correct: ${graph}.number(\`C\`) = 1
          `)
        },
        {
          component: feedback,
          type: "Note",
          script: code(`
            # ${feedback}
            n = firstDefinedValue(${graph}.number(\`N\`), -1)
            content:
            when not(${input}.submitted) "x, y에 대한 부등식으로 울타리를 만들어 보세요. 꼴: y > x + 4 처럼"
            when n = -1 "부등식 형태로 입력하세요 (등호·복합부등식은 인식 불가). 예: y > x - 1 꼴"
            when ${graph}.number(\`C\`) = 1 "🐑 양 ${sheepCount}마리를 모두 지켰고 늑대는 울타리 밖입니다!"
            otherwise "울타리 안의 양: \${n} / ${sheepCount}마리. 늑대가 들어왔는지도 확인하세요."
          `)
        }
      ];
    },
    graphStates: (screen) => {
      const graph = valueFrom(screen, "graph", "pastureGraph");
      const sheep = screen.sheep ?? [[1, 1], [2, 3], [3, 2]];
      const wolves = screen.wolves ?? [[-2, -1]];
      const sx = numList(sheep.map((s) => s[0]));
      const sy = numList(sheep.map((s) => s[1]));
      const wx = numList(wolves.map((w) => w[0]));
      const wy = numList(wolves.map((w) => w[1]));
      return [
        {
          component: graph,
          viewport: screen.viewport ?? { xmin: -6, ymin: -5, xmax: 6, ymax: 5 },
          items: [
            { note: "CL이 주입: f(x,y) 차이함수(해집합 f>0), s(strict 여부). s 더미는 CL이 덮어쓴다. (미리보기용 임시 f는 CL 연결 전에 삭제 — function() sink는 그래프 내 동일 함수 정의와 충돌할 수 있음)" },
            { latex: "s=0", hidden: true },
            { folder: "울타리 음영 — 두 줄 다 넣는다 (strict=점선, 비엄격=실선)" },
            { latex: "0<f\\left(x,y\\right)\\left\\{s=1\\right\\}", fillOpacity: 0.25 },
            { latex: "0\\le f\\left(x,y\\right)\\left\\{s=0\\right\\}", fillOpacity: 0.25 },
            { folder: "경계선 이중화 — 공식 Point Collector의 실선/점선 불일치 함정 대비 (cl.desmos.com/t/4931)" },
            { latex: "f\\left(x,y\\right)=0\\left\\{s=0\\right\\}", lineStyle: "SOLID" },
            { latex: "f\\left(x,y\\right)=0\\left\\{s=1\\right\\}", lineStyle: "DASHED" },
            { folder: "양 떼와 늑대" },
            { latex: `S_{x}=${sx}` },
            { latex: `S_{y}=${sy}` },
            { latex: `W_{x}=${wx}` },
            { latex: `W_{y}=${wy}` },
            { latex: "\\left(S_{x},S_{y}\\right)", label: "🐑" },
            { latex: "\\left(W_{x},W_{y}\\right)", label: "🐺" },
            { folder: "판정 (CL은 N, C만 읽는다) — 경계 위(|f|≤0.001)는 비엄격(s=0)일 때만 포함" },
            { latex: "N=\\operatorname{total}\\left(\\left\\{f\\left(S_{x},S_{y}\\right)>0.001:1,f\\left(S_{x},S_{y}\\right)>-0.001:1-s,0\\right\\}\\right)", hidden: true },
            { latex: "M=\\operatorname{total}\\left(\\left\\{f\\left(W_{x},W_{y}\\right)>0.001:1,f\\left(W_{x},W_{y}\\right)>-0.001:1-s,0\\right\\}\\right)", hidden: true },
            { latex: `C=\\left\\{N=${sheep.length}:\\left\\{M=0:1,0\\right\\},0\\right\\}`, hidden: true }
          ]
        }
      ];
    },
    teacherMoves: [
      "1변수 수직선 버전(Shira형)은 경계 원(열린/닫힌)을 별도 그래프로 만들어야 합니다 — 이 템플릿은 2변수 영역 버전입니다.",
      "연립부등식(울타리 2개)으로 확장하면 CL 변수명을 f/s, g/s_2처럼 유니크하게 바꿔야 합니다.",
      "구간 표기 입력은 파싱되지 않습니다. 부등식 형태로 입력하라고 안내하세요."
    ]
  }
};
