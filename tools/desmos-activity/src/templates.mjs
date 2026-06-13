import { gameTemplates } from "./gameTemplates.mjs";

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

function exactNumberCheck(screen) {
  const answer = valueFrom(screen, "answer", 42);
  const tolerance = valueFrom(screen, "tolerance", 0);
  const input = valueFrom(screen, "input", "answer");
  const feedback = valueFrom(screen, "feedback", "feedback");
  const check = tolerance === 0
    ? `check = numericValue = ${answer}`
    : `check = numericValue > ${answer - tolerance} and numericValue < ${answer + tolerance}`;

  return [
    {
      component: input,
      type: "Math Input",
      script: code(`
        # ${input}
        ${check}
        correct: check
        readOnly: this.submitted
      `)
    },
    {
      component: feedback,
      type: "Note",
      script: code(`
        # ${feedback}
        content:
          when ${input}.submitted and ${input}.script.check "${screen.correctMessage ?? "정확해요."}"
          when ${input}.submitted "${screen.tryAgainMessage ?? "다시 확인해 보세요."}"
          otherwise ""
      `)
    }
  ];
}

export const templates = {
  cover_fact_card: {
    title: "도입 사실 카드",
    description: "썸네일형 문제 상황, 핵심 수치, 질문을 한 화면에 제시합니다.",
    components: (screen) => [
      component(valueFrom(screen, "note", "intro"), "Note", "상황과 질문 제시"),
      component(valueFrom(screen, "visual", "visualModel"), "Graph or Image", "수치/그림 모델 표시")
    ],
    scripts: (screen) => [
      {
        component: valueFrom(screen, "note", "intro"),
        type: "Note",
        script: code(`
          # ${valueFrom(screen, "note", "intro")}
          # 정적 도입 화면입니다. 필요하면 아래 문장을 dynamic text로 바꾸세요.
          # ${screen.prompt ?? "오늘 다룰 실제 상황과 핵심 수치를 읽게 합니다."}
        `)
      }
    ],
    teacherMoves: [
      "학생에게 먼저 숫자 사이의 관계를 말하게 합니다.",
      "계산을 시작하기 전에 단위를 소리 내어 확인합니다."
    ]
  },

  notice_predict: {
    title: "예측과 관찰",
    description: "학생의 직관을 먼저 수집하고 이후 계산 결과와 비교합니다.",
    components: (screen) => [
      component(valueFrom(screen, "choice", "prediction"), "Multiple Choice", "예측 선택"),
      component(valueFrom(screen, "reason", "reason"), "Free Response", "예측 이유"),
      component(valueFrom(screen, "feedback", "predictionFeedback"), "Note", "선택 후 안내")
    ],
    scripts: (screen) => {
      const choice = valueFrom(screen, "choice", "prediction");
      const feedback = valueFrom(screen, "feedback", "predictionFeedback");
      return [
        {
          component: feedback,
          type: "Note",
          script: code(`
            # ${feedback}
            content:
              when ${choice}.submitted "${screen.afterSubmitMessage ?? "좋아요. 이제 계산으로 확인해 봅시다."}"
              otherwise "${screen.beforeSubmitMessage ?? "먼저 예상해 보세요."}"
          `)
        }
      ];
    },
    teacherMoves: [
      "정답 확인보다 예상의 근거를 먼저 공유하게 합니다.",
      "이후 화면에서 예측과 계산 결과가 어떻게 달라졌는지 다시 묻습니다."
    ]
  },

  numeric_check: {
    title: "숫자 입력 자기점검",
    description: "Math Input의 숫자값을 판정하고 제출 후 잠급니다.",
    components: (screen) => [
      component(valueFrom(screen, "input", "answer"), "Math Input", "학생 답 입력"),
      component(valueFrom(screen, "feedback", "feedback"), "Note", "제출 후 피드백")
    ],
    scripts: exactNumberCheck,
    teacherMoves: [
      "학생이 단위까지 말하게 한 뒤 숫자를 입력하게 합니다.",
      "`correct:`는 대시보드 확인용이고, Note 피드백은 학생 학습용입니다."
    ]
  },

  unit_rate_model: {
    title: "단위비율 모델",
    description: "계단 수, 10계단당 칼로리, 분당 칼로리 같은 비례 상황을 모델링합니다.",
    components: (screen) => [
      component(valueFrom(screen, "model", "model"), "Note", "계산식/비례식 안내"),
      component(valueFrom(screen, "input", "answer"), "Math Input", "학생 계산값 입력"),
      component(valueFrom(screen, "feedback", "feedback"), "Note", "단위비율 피드백"),
      component(valueFrom(screen, "graph", "graphModel"), "Graph", "비례 관계 시각화")
    ],
    scripts: (screen) => {
      const stairs = Number(valueFrom(screen, "stairs", 291));
      const kcalPerTen = Number(valueFrom(screen, "kcalPerTen", 1.4));
      const expected = Number((stairs / 10 * kcalPerTen).toFixed(2));
      const input = valueFrom(screen, "input", "answer");
      const feedback = valueFrom(screen, "feedback", "feedback");
      const graph = valueFrom(screen, "graph", "graphModel");
      return [
        {
          component: input,
          type: "Math Input",
          script: code(`
            # ${input} — 기준값: ${stairs}계단, 10계단당 ${kcalPerTen} kcal → ${expected} kcal
            check = numericValue > ${expected - 0.05} and numericValue < ${expected + 0.05}
            correct: check
            readOnly: this.submitted
          `)
        },
        {
          component: feedback,
          type: "Note",
          script: code(`
            # ${feedback}
            content:
              when ${input}.submitted and ${input}.script.check "맞아요. ${stairs}계단은 약 ${expected} kcal입니다."
              when ${input}.submitted "10계단에 ${kcalPerTen} kcal이므로 ${stairs} ÷ 10 × ${kcalPerTen}를 확인해 보세요."
              otherwise ""
          `)
        },
        {
          component: graph,
          type: "Graph",
          script: code(`
            # ${graph}
            number("stairs"): ${stairs}
            number("kcalPerTen"): ${kcalPerTen}
            number("studentKcal"): ${input}.numericValue
          `)
        }
      ];
    },
    teacherMoves: [
      "10계단당 값을 1계단당 값으로 바꾸는 방법을 비교합니다.",
      "정확한 값과 어림값을 모두 허용할지 결정합니다."
    ]
  },

  randomized_practice: {
    title: "랜덤 반복 연습",
    description: "Action Button의 pressCount를 seed로 사용해 학생별 안정적인 랜덤 문항을 만듭니다.",
    components: (screen) => [
      component(valueFrom(screen, "button", "newProblem"), "Action Button", "새 문제 생성"),
      component(valueFrom(screen, "problem", "problem"), "Note", "랜덤 문항 표시"),
      component(valueFrom(screen, "input", "answer"), "Math Input", "학생 답 입력"),
      component(valueFrom(screen, "feedback", "feedback"), "Note", "랜덤 문항 피드백")
    ],
    scripts: (screen) => {
      const button = valueFrom(screen, "button", "newProblem");
      const problem = valueFrom(screen, "problem", "problem");
      const input = valueFrom(screen, "input", "answer");
      const feedback = valueFrom(screen, "feedback", "feedback");
      const perTen = Number(valueFrom(screen, "kcalPerTen", 1.4));
      return [
        {
          component: problem,
          type: "Note",
          script: code(`
            # ${problem} — CL에는 산술 연산자가 없으므로 모든 계산은 numericValue로 한다.
            r = randomGenerator(${button}.pressCount)
            base = r.int(${valueFrom(screen, "minTens", 3)}, ${valueFrom(screen, "maxTens", 40)})
            stairs = numericValue("10\\cdot\${base}")
            expected = numericValue("${perTen}\\cdot\${stairs}/10")
            lo = numericValue("\${expected}-0.05")
            hi = numericValue("\${expected}+0.05")
            content: "이번 문제: \${stairs}계단을 내려가면 몇 kcal일까요?"
          `)
        },
        {
          component: input,
          type: "Math Input",
          script: code(`
            # ${input}
            check = numericValue > ${problem}.script.lo and numericValue < ${problem}.script.hi
            correct: check
            readOnly: this.submitted
          `)
        },
        {
          component: feedback,
          type: "Note",
          script: code(`
            # ${feedback}
            content:
              when ${input}.submitted and ${input}.script.check "맞아요. 새 문제를 눌러 한 번 더 해 보세요."
              when ${input}.submitted "계단 수를 10으로 나눈 뒤 ${perTen}을 곱해 보세요."
              otherwise ""
          `)
        }
      ];
    },
    teacherMoves: [
      "랜덤 문제에서는 답을 잠근 뒤 새 문제 버튼으로 흐름을 넘깁니다.",
      "학생별 숫자가 다르므로 대시보드에서는 풀이 전략을 확인합니다."
    ]
  },

  graph_match: {
    title: "그래프 매칭",
    description: "학생 입력을 그래프 또는 시각 모델의 변수로 넘겨 해석적 피드백을 만듭니다.",
    components: (screen) => [
      component(valueFrom(screen, "input", "equation"), "Math Input", "식 또는 수치 입력"),
      component(valueFrom(screen, "graph", "graph"), "Graph", "학생 입력 시각화"),
      component(valueFrom(screen, "feedback", "feedback"), "Note", "그래프 해석 안내")
    ],
    scripts: (screen) => {
      const input = valueFrom(screen, "input", "equation");
      const graph = valueFrom(screen, "graph", "graph");
      const feedback = valueFrom(screen, "feedback", "feedback");
      return [
        {
          component: graph,
          type: "Graph",
          script: code(`
            # ${graph}
            # 숫자 입력이면 number sink를 사용하세요.
            number("studentValue"): ${input}.numericValue

            # 방정식 입력이면 아래 패턴을 별도 화면에서 검증하세요.
            # function("f"): parseEquation(${input}.latex).differenceFunction("x","y")
          `)
        },
        {
          component: feedback,
          type: "Note",
          script: code(`
            # ${feedback}
            content:
              when ${input}.submitted "그래프에서 네 입력이 상황과 맞는지 비교해 보세요."
              otherwise ""
          `)
        }
      ];
    },
    teacherMoves: [
      "정답/오답 대신 학생 입력이 만든 그래프를 비교하게 합니다.",
      "대시보드에서 서로 다른 그래프를 골라 토론합니다."
    ]
  },

  smooth_slide_graph_check: {
    title: "매끄러운 미끄럼틀 그래프 판정",
    description: "버튼 타이머를 그래프 변수 T로 보내고, 그래프 내부 판정값 C를 CL의 correct로 읽습니다.",
    components: (screen) => [
      component(valueFrom(screen, "graph", "slideGraph"), "Graph", "학생이 점/높이를 조작하고 그래프 내부에서 기울기 일치 여부 계산"),
      component(valueFrom(screen, "button", "runSlide"), "Action Button", "미끄럼틀 애니메이션 실행"),
      component(valueFrom(screen, "feedback", "slideFeedback"), "Note", "판정 후 해석 피드백")
    ],
    scripts: (screen) => {
      const graph = valueFrom(screen, "graph", "slideGraph");
      const button = valueFrom(screen, "button", "runSlide");
      const feedback = valueFrom(screen, "feedback", "slideFeedback");
      const duration = valueFrom(screen, "duration", 11);
      const fixedNumbers = Object.entries(screen.graphNumbers ?? {})
        .map(([name, value]) => `number("${name}"): ${value}`)
        .join("\n");
      return [
        {
          component: graph,
          type: "Graph",
          script: code(`
            # ${graph}
            number("T"): ${button}.timeSincePress(${duration})
            ${fixedNumbers}

            # In the graph, define a numeric expression C.
            # Recommended graph logic:
            # m_1 = h_1 / b_1
            # m_2 = h_2 / b_2
            # m_3 = h_3 / b_3
            # E_1 = {|m_1 - m_2| < 0.02: 0, 1}
            # E_2 = {|m_3 - m_2| < 0.02: 0, 1}
            # C = {E_1 + E_2 = 0: 1, 0}
            correct: ${graph}.number("C") = 1
          `)
        },
        {
          component: button,
          type: "Action Button",
          script: code(`
            # ${button}
            resetLabel: "${screen.resetLabel ?? "다시 해보기"}"
          `)
        },
        {
          component: feedback,
          type: "Note",
          script: code(`
            # ${feedback}
            content:
              when ${graph}.number("C") = 1 "세 구간의 기울기가 거의 같아서 매끄럽게 이어집니다."
              otherwise "각 구간의 기울기를 비교해 보세요. 기울기가 같아야 하나의 직선처럼 이어집니다."
          `)
        }
      ];
    },
    teacherMoves: [
      "수학 판정은 그래프 표현식에서 계산하고, CL은 최종 판정값 C만 읽게 합니다.",
      "학생에게 높이/밑변이 바뀌면 기울기가 어떻게 달라지는지 말하게 합니다.",
      "대시보드의 check는 `graph.number(\"C\") = 1`이 true일 때만 뜨는지 확인합니다."
    ]
  },

  table_check: {
    title: "표 입력 자기점검",
    description: "Table의 셀 값을 기준으로 행별 피드백을 설계합니다.",
    components: (screen) => [
      component(valueFrom(screen, "table", "table"), "Table", "여러 값 입력"),
      component(valueFrom(screen, "feedback", "feedback"), "Note", "행별/전체 피드백")
    ],
    scripts: (screen) => {
      const table = valueFrom(screen, "table", "table");
      const feedback = valueFrom(screen, "feedback", "feedback");
      const expected = screen.expectedRows ?? [1.4, 2.8, 4.2];
      const checks = expected.map((value, idx) => `r${idx + 1} = ${table}.cellNumericValue(${idx + 1}, 2) = ${value}`).join("\n");
      const all = expected.map((_, idx) => `r${idx + 1}`).join(" and ");
      const correctMessage = screen.correctMessage ?? "표가 모두 맞습니다.";
      const tryAgainMessage = screen.tryAgainMessage ?? "각 행의 값을 다시 확인해 보세요.";
      return [
        {
          component: feedback,
          type: "Note",
          script: [
            `# ${feedback} — 판정 변수를 노트 스크립트 안에 둔다 (화면 단위 CL 스코프에 의존하지 않음)`,
            `hasInput = not(isUndefined(${table}.cellNumericValue(1, 2)))`,
            checks,
            `allCorrect = ${all}`,
            `content:`,
            `when not(hasInput) ""`,
            `when allCorrect "${correctMessage}"`,
            `otherwise "${tryAgainMessage}"`
          ].join("\n")
        }
      ];
    },
    teacherMoves: [
      "표는 셀 좌표가 바뀌면 CL도 바뀌므로 먼저 표 구조를 고정합니다.",
      "행별 피드백이 필요하면 `cellErrorMessage` 패턴으로 확장합니다."
    ]
  },

  card_sort_check: {
    title: "카드 정렬 자기점검",
    description: "Card Sort의 answer key와 totalCorrectCards를 사용합니다.",
    components: (screen) => [
      component(valueFrom(screen, "sort", "sort"), "Card Sort", "분류/매칭"),
      component(valueFrom(screen, "feedback", "feedback"), "Note", "맞은 카드 수 표시")
    ],
    scripts: (screen) => {
      const sort = valueFrom(screen, "sort", "sort");
      const feedback = valueFrom(screen, "feedback", "feedback");
      const total = valueFrom(screen, "totalCards", 8);
      return [
        {
          component: feedback,
          type: "Note",
          script: code(`
            # ${feedback}
            correctCards = ${sort}.totalCorrectCards
            content:
              when correctCards = ${total} "모든 카드가 맞습니다."
              otherwise "현재 " + correctCards + " / ${total}개가 맞습니다."
          `)
        }
      ];
    },
    teacherMoves: [
      "카드 수가 많아지면 피드백보다 토론 가치가 떨어질 수 있습니다.",
      "정렬 후 한두 카드만 선택해 이유를 설명하게 합니다."
    ]
  },

  reflection: {
    title: "설명과 성찰",
    description: "계산 결과보다 전략, 단위, 오개념을 수집합니다.",
    components: (screen) => [
      component(valueFrom(screen, "response", "reflection"), "Free Response", "학생 설명"),
      component(valueFrom(screen, "note", "teacherPrompt"), "Note", "성찰 질문")
    ],
    scripts: (screen) => [
      {
        component: valueFrom(screen, "note", "teacherPrompt"),
        type: "Note",
        script: code(`
          # ${valueFrom(screen, "note", "teacherPrompt")}
          # 성찰 화면은 보통 정답 판정을 넣지 않습니다.
          # 질문: ${screen.prompt ?? "오늘 사용한 전략을 한 문장으로 설명하세요."}
        `)
      }
    ],
    teacherMoves: [
      "학생 응답을 익명으로 골라 전체 토론에 사용합니다.",
      "다음 활동을 만들 때 자주 나온 오개념을 새 화면으로 바꿉니다."
    ]
  }
};

Object.assign(templates, gameTemplates);

export function listTemplates() {
  return Object.entries(templates).map(([id, template]) => ({
    id,
    title: template.title,
    description: template.description
  }));
}
