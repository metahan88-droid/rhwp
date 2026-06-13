#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { listTemplates, templates } from "./templates.mjs";
import { buildState, expr, folder, note, renderPasteList, resetIds } from "./state.mjs";

const root = process.cwd();

function usage() {
  return `Usage:
  node src/generate.mjs activities/calorie-down-stairs.json --out generated
  node src/generate.mjs --list-templates
`;
}

function parseArgs(argv) {
  const args = { out: "generated", listTemplates: false, specPath: undefined };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--list-templates") {
      args.listTemplates = true;
    } else if (arg === "--out") {
      args.out = argv[++i];
    } else if (!args.specPath) {
      args.specPath = arg;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assertString(value, name) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required string: ${name}`);
  }
}

function validateSpec(spec) {
  assertString(spec.id, "id");
  assertString(spec.title, "title");
  if (!Array.isArray(spec.screens) || spec.screens.length === 0) {
    throw new Error("Spec must include at least one screen.");
  }
  for (const [index, screen] of spec.screens.entries()) {
    assertString(screen.id, `screens[${index}].id`);
    assertString(screen.title, `screens[${index}].title`);
    assertString(screen.template, `screens[${index}].template`);
    if (!templates[screen.template]) {
      throw new Error(`Unknown template "${screen.template}" on screen "${screen.id}".`);
    }
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${content.trim()}\n`, "utf8");
}

function bullet(items) {
  if (!items || items.length === 0) return "- 없음";
  return items.map((item) => `- ${item}`).join("\n");
}

function numbered(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function renderActivityPlan(spec) {
  const goals = bullet(spec.learningGoals ?? []);
  const sourceFacts = bullet((spec.sourceInspiration?.confirmedFacts ?? []).map((fact) => `${fact.label}: ${fact.value}`));
  const screens = spec.screens.map((screen, index) => {
    const template = templates[screen.template];
    const components = template.components(screen)
      .map((item) => `  - ${item.name} (${item.type}): ${item.purpose}`)
      .join("\n");
    return `## ${index + 1}. ${screen.title}

Template: \`${screen.template}\` - ${template.title}

Purpose: ${screen.purpose ?? template.description}

Components:
${components}

Teacher moves:
${bullet([...(template.teacherMoves ?? []), ...(screen.teacherMoves ?? [])])}`;
  }).join("\n\n");

  return `# ${spec.title}

Generated from: \`${spec.id}\`

Audience: ${spec.audience ?? "미지정"}

Language: ${spec.language ?? "ko"}

## Learning Goals

${goals}

## Source/Inspiration Facts

${sourceFacts}

## Build Sequence

${screens}

## Quality Gate

${numbered([
    "Activity Builder에서 화면을 먼저 만들고 컴포넌트 이름을 이 문서와 정확히 맞춘다.",
    "각 화면의 Screen CL과 컴포넌트 CL을 붙여넣는다.",
    "Student Preview에서 제출 전, 제출 후, 다시 시도, 새 문제 버튼을 확인한다.",
    "Teacher Dashboard에서 `correct:`와 `readOnly:` 표시가 의도대로 작동하는지 확인한다.",
    "학생에게 보이는 피드백이 단순 정답 공개가 아니라 다음 행동을 안내하는지 확인한다."
  ])}
`;
}

function renderScreenCl(spec) {
  const sections = spec.screens.map((screen, index) => {
    const template = templates[screen.template];
    const scripts = template.scripts(screen).map((entry) => `### ${entry.component} (${entry.type})

\`\`\`cl
${entry.script}
\`\`\``).join("\n\n");
    return `## ${index + 1}. ${screen.title}

Template: \`${screen.template}\`

${scripts}`;
  }).join("\n\n");

  return `# ${spec.title} - CL Drafts

These scripts are designed for manual paste into Amplify Classroom Activity Builder.
Run the Activity Builder script checker after pasting, because there is no public local CL compiler.

${sections}
`;
}

function renderChecklist(spec) {
  const perScreen = spec.screens.map((screen, index) => {
    const template = templates[screen.template];
    const componentChecks = template.components(screen).map((item) => `- [ ] Component exists: \`${item.name}\` (${item.type})`).join("\n");
    return `## ${index + 1}. ${screen.title}

${componentChecks}
- [ ] Screen/component CL pasted
- [ ] Preview before submit checked
- [ ] Preview after submit checked
- [ ] Dashboard correctness checked if this screen has \`correct:\`
- [ ] Korean text and units checked`;
  }).join("\n\n");

  return `# ${spec.title} - Paste Checklist

## Global

- [ ] Activity title, description, and thumbnail are set
- [ ] Sharing is set intentionally
- [ ] All component names match generated documents
- [ ] No screen has a hidden dependency on a renamed component
- [ ] Teacher notes include expected pacing and discussion move

${perScreen}
`;
}

function renderPromptPack(spec) {
  const templateSummary = spec.screens.map((screen, index) => `${index + 1}. ${screen.title}: ${screen.template}`).join("\n");
  return `# ${spec.title} - Vibe Prompt Pack

## One-shot Activity Builder Prompt

You are designing an Amplify Classroom / Desmos Activity Builder activity in Korean.
Create a screen-by-screen build plan using Computation Layer.
Use these constraints:

- Activity title: ${spec.title}
- Audience: ${spec.audience ?? "middle school math"}
- Learning goals: ${(spec.learningGoals ?? []).join("; ")}
- Use component names exactly as listed in the generated plan.
- Prefer interpretive feedback before evaluative feedback.
- Separate student-facing feedback from dashboard \`correct:\`.
- Include \`readOnly:\` only when submitted answers should be locked.
- For random practice, use \`randomGenerator(seed).int(a,b)\` or \`.float(a,b)\` and explain the seed.

Screens:

${templateSummary}

Return:

1. Activity overview
2. Screen-by-screen components
3. CL scripts per component
4. Dashboard correctness strategy
5. Student preview test cases
6. Teacher facilitation notes

## Revision Prompt

Improve this activity for stronger student discourse. Keep the same CL structure, but add:

- one prediction moment before calculation
- one explanation prompt after calculation
- one teacher dashboard move
- one extension screen for fast finishers

## Debug Prompt

I pasted the generated CL into Amplify Classroom and got an error. Diagnose likely causes:

- renamed component
- Screen CL variable used from component without \`script.\`
- string/number mismatch
- table row/column index mismatch
- \`correct:\` placed on the wrong component
- \`readOnly:\` used before submit behavior is intended
`;
}

// 템플릿의 graphStates 선언(items: {latex|folder|note, hidden, label, dragMode, fillOpacity})을
// version-11 calculatorState로 변환한다. folder 항목 이후의 latex 항목은 그 폴더 멤버가 된다.
function toCalculatorState(decl) {
  resetIds();
  const expressions = [];
  let currentFolderId = null;
  for (const item of decl.items) {
    if (item.folder !== undefined) {
      const f = folder(item.folder, { hidden: item.hidden });
      expressions.push(f);
      currentFolderId = f.id;
    } else if (item.note !== undefined) {
      const n = note(item.note);
      if (currentFolderId) n.folderId = currentFolderId;
      expressions.push(n);
    } else if (item.latex !== undefined) {
      const options = { ...item };
      delete options.latex;
      if (currentFolderId) options.folderId = currentFolderId;
      expressions.push(expr(item.latex, options));
    }
  }
  return buildState({
    viewport: decl.viewport,
    showGrid: decl.showGrid ?? true,
    showXAxis: decl.showXAxis ?? true,
    showYAxis: decl.showYAxis ?? true,
    expressions
  });
}

function renderGraphStates(spec, outputDir) {
  const sections = [];
  for (const [index, screen] of spec.screens.entries()) {
    const template = templates[screen.template];
    if (!template.graphStates) continue;
    for (const decl of template.graphStates(screen)) {
      const state = toCalculatorState(decl);
      const safe = (s) => String(s).replace(/[^A-Za-z0-9_-]/g, "-");
      const jsonName = `graph-state.${safe(screen.id)}.${safe(decl.component)}.json`;
      writeFile(path.join(outputDir, jsonName), JSON.stringify(state, null, 2));
      sections.push(`## ${index + 1}. ${screen.title} — \`${decl.component}\`

뷰포트: x [${decl.viewport.xmin}, ${decl.viewport.xmax}], y [${decl.viewport.ymin}, ${decl.viewport.ymax}] (그래프 설정에서 맞춘 뒤 잠금 권장)

전체 상태 JSON: \`${jsonName}\` (Claude in Chrome / API 임베드용)

아래 표현식을 그래프 편집기에 **순서대로** 붙여넣으세요. 폴더 줄은 폴더를 만들고, 이후 표현식을 그 안에 넣습니다.

${renderPasteList(state)}`);
    }
  }
  if (sections.length === 0) return null;
  return `# ${spec.title} - Graph States (paste-ready)

줄바꿈으로 구분된 LaTeX를 표현식 목록에 붙여넣으면 줄마다 별도 expression이 생성됩니다(실측 확인).
숨김(hidden) 표시된 표현식은 붙여넣은 뒤 그래프 아이콘을 눌러 숨기세요.

${sections.join("\n\n")}
`;
}

function normalizeSpec(spec) {
  return {
    ...spec,
    generatedAt: new Date().toISOString(),
    generator: "desmos-cl-vibe-lab@0.1.0",
    templateIds: spec.screens.map((screen) => screen.template)
  };
}

function generate(specPath, outRoot) {
  const absSpec = path.resolve(root, specPath);
  const spec = readJson(absSpec);
  validateSpec(spec);

  const outputDir = path.resolve(root, outRoot, spec.id);
  ensureDir(outputDir);

  writeFile(path.join(outputDir, "activity-plan.md"), renderActivityPlan(spec));
  writeFile(path.join(outputDir, "screen-cl.md"), renderScreenCl(spec));
  writeFile(path.join(outputDir, "paste-checklist.md"), renderChecklist(spec));
  writeFile(path.join(outputDir, "vibe-prompt-pack.md"), renderPromptPack(spec));
  writeFile(path.join(outputDir, "activity-spec.normalized.json"), JSON.stringify(normalizeSpec(spec), null, 2));

  const graphStatesDoc = renderGraphStates(spec, outputDir);
  if (graphStatesDoc) {
    writeFile(path.join(outputDir, "graph-states.md"), graphStatesDoc);
  }

  return outputDir;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.listTemplates) {
    for (const item of listTemplates()) {
      console.log(`${item.id}\t${item.title}\t${item.description}`);
    }
    return;
  }

  if (!args.specPath) {
    console.error(usage());
    process.exitCode = 1;
    return;
  }

  const outputDir = generate(args.specPath, args.out);
  console.log(`Generated ${outputDir}`);
}

main();
