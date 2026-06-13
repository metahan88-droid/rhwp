// Desmos calculatorState 빌더.
// 공개 활동 인스펙션(knowledge/activity-json-anatomy.md)에서 실측한 version 11 구조를 따른다.
// 생성된 상태는 (1) 표현식 복붙 목록(md), (2) calculatorState JSON 두 형태로 출력된다.

let nextId = 1;

export function resetIds(start = 1) {
  nextId = start;
}

function id() {
  return String(nextId++);
}

export function expr(latex, options = {}) {
  const item = { type: "expression", id: id(), latex };
  if (options.hidden) item.hidden = true;
  if (options.color) item.color = options.color;
  if (options.dragMode) item.dragMode = options.dragMode;
  if (options.fillOpacity !== undefined) item.fillOpacity = String(options.fillOpacity);
  if (options.pointStyle) item.pointStyle = options.pointStyle;
  if (options.folderId) item.folderId = options.folderId;
  if (options.lineStyle) item.lineStyle = options.lineStyle;
  if (options.label) {
    item.showLabel = true;
    item.label = options.label;
  }
  return item;
}

export function folder(title, options = {}) {
  const item = { type: "folder", id: id(), title };
  if (options.hidden) item.hidden = true;
  return item;
}

export function note(text) {
  return { type: "text", id: id(), text };
}

// 폴더와 멤버 표현식을 한 번에 만든다.
export function folderWith(title, latexList, options = {}) {
  const f = folder(title, options);
  const members = latexList.map((entry) => {
    const item = typeof entry === "string" ? expr(entry) : expr(entry.latex, entry);
    item.folderId = f.id;
    return item;
  });
  return [f, ...members];
}

export function buildState({ viewport, showGrid = true, showXAxis = true, showYAxis = true, lockViewport = true, squareAxes, expressions }) {
  const graph = {
    viewport,
    showGrid,
    showXAxis,
    showYAxis,
    userLockedViewport: lockViewport
  };
  if (squareAxes !== undefined) graph.squareAxes = squareAxes;
  return {
    version: 11,
    graph,
    expressions: { list: expressions }
  };
}

// 사람/Claude in Chrome이 그래프 편집기에 차례로 붙여넣을 수 있는 목록을 만든다.
// Desmos 표현식 입력칸은 LaTeX 붙여넣기를 받아들인다.
export function renderPasteList(state) {
  const lines = [];
  for (const item of state.expressions.list) {
    if (item.type === "folder") {
      lines.push(`### [폴더] ${item.title}${item.hidden ? " (숨김)" : ""}`);
    } else if (item.type === "text") {
      lines.push(`> 메모: ${item.text ?? ""}`);
    } else if (item.type === "expression" && item.latex) {
      const flags = [];
      if (item.hidden) flags.push("숨김");
      if (item.dragMode) flags.push(`드래그:${item.dragMode}`);
      if (item.label) flags.push(`라벨:${item.label}`);
      if (item.lineStyle) flags.push(`선스타일:${item.lineStyle}`);
      if (item.fillOpacity) flags.push(`채우기:${item.fillOpacity}`);
      const suffix = flags.length > 0 ? `  <!-- ${flags.join(", ")} -->` : "";
      lines.push("```latex\n" + item.latex + "\n```" + suffix);
    }
  }
  return lines.join("\n\n");
}
