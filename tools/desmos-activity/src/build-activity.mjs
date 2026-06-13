#!/usr/bin/env node
// CDP attach 편집기 자동 빌더 — 한 프로세스에서 활동 생성→화면→컴포넌트→그래프표현식→CL을 연속 실행.
// 짧은 inline 스크립트는 프로세스 단절로 편집기 상태가 안 이어진다. 이 빌더는 한 세션에서 전부 처리한다.
//
//   node src/build-activity.mjs --smoke         실측 검증: 기울기 탐구 한 화면(그래프+슬라이더+CL 피드백)
//   node src/build-activity.mjs --activity <id>  기존 활동 편집기에서 빌드(쓰지 않고 진입만 — 확장용)
//
// 전제: scripts/chrome-debug.sh 로 hotdel 세션 9222 기동 + 로그인 완료.
// 발행(되돌리기 어려운 쓰기)은 하지 않는다. 비공개 활동에 화면을 구성하고 미리보기까지만.

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/Users/han/projects/math ai/node_modules/playwright");

const CDP = process.env.CDP_URL || "http://127.0.0.1:9222";
const BASE = "https://classroom.amplify.com";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs(argv) {
  const a = { cmd: null, id: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--smoke") a.cmd = "smoke";
    else if (argv[i] === "--full") a.cmd = "full";
    else if (argv[i] === "--activity") { a.cmd = "activity"; a.id = argv[++i]; }
  }
  return a;
}

// 완성형 활동: 기울기=변화율 단계적 탐구 (도입→발견→비교→점검→도전→정리). CL 적극.
// 컴포넌트 순서대로 add→(graph)→(cl 즉시)로 처리 → writeCL 'last'가 항상 방금 추가한 컴포넌트.
const SLIDES = [
  {
    title: "기울기 탐구를 시작합니다",
    components: [
      { label: "메모", cl: 'content: "기울기는 단순한 숫자가 아니라 변화의 빠르기입니다. 이 활동에서 슬라이더를 직접 움직이며, 기울기가 곧 변화율임을 스스로 발견하게 됩니다. 준비되면 다음 화면으로 넘어가세요."' },
    ],
  },
  {
    title: "발견 1 — a는 x가 1 늘 때 y가 오르는 양",
    components: [
      { label: "그래프", graph: ["a=2", "y=ax", "(0,0)", "(1,0)", "(1,a)"] },
      { label: "메모", cl: 'content: "a 슬라이더를 움직여 보세요. x가 0에서 1로 한 칸 갈 때 y는 0에서 a로 a칸 오릅니다. 보라색 점 (1,a)가 그 변화량이에요. a를 음수로도 만들어 보세요. a가 곧 기울기, 즉 변화율입니다."' },
    ],
  },
  {
    title: "발견 2 — b는 출발점만 바꾼다",
    components: [
      { label: "그래프", graph: ["a=2", "b=3", "y=ax", "y=ax+b", "(0,b)"] },
      { label: "메모", cl: 'content: "이번엔 b 슬라이더를 움직여 보세요. b가 변하면 직선은 위아래로 평행이동만 합니다. 기울기(빠르기)는 그대로예요. a를 바꾸면 두 직선의 기울기가 함께 변합니다. 출발점은 b, 변화율은 a가 결정합니다."' },
    ],
  },
  {
    title: "점검 — 변화율을 수로 답하기",
    components: [
      { label: "메모", cl: 'content: "확인 문제입니다. y=3x 에서 x가 1 증가하면 y는 얼마나 증가할까요? 아래 칸에 숫자로 답하세요."' },
      { label: "수식 답변", cl: 'correct: numericValue = 3' },
    ],
  },
  {
    title: "도전 — 평행한 직선 만들기",
    components: [
      { label: "그래프", graph: ["y=1.5x+4", "m=1", "y=mx+1", "(1,1.5)", "(2,3)"] },
      { label: "메모", cl: 'content: "빨간 직선과 평행한 직선을 만들어 보세요. m 슬라이더로 파란 직선의 기울기를 맞추면 됩니다. 평행이 된다는 것은 변화율(기울기)이 같다는 뜻입니다. 정답 기울기를 아래에 숫자로도 적어 보세요."' },
      { label: "수식 답변", cl: 'correct: numericValue = 1.5' },
    ],
  },
  {
    title: "정리 — 내 말로 설명하기",
    components: [
      { label: "메모", cl: 'content: "정리해 봅시다. 기울기는 x가 1 증가할 때 y의 변화량, 즉 변화율입니다. y=ax+b에서 a는 변화율(기울기), b는 출발점(y절편)이에요. 아래에 친구에게 설명하듯 적어 보세요."' },
      { label: "자유 답변" },
    ],
  },
];

async function addScreen(page) {
  await page.getByRole("button", { name: /새 화면|new screen|add screen/i }).first().click().catch(() => {});
  await sleep(2800);
}

async function buildFull(page) {
  for (let i = 0; i < SLIDES.length; i++) {
    const s = SLIDES[i];
    if (i > 0) await addScreen(page);
    await setScreenTitle(page, s.title);
    for (const c of s.components) {
      await addComponent(page, c.label);
      if (c.graph) {
        const g = await editGraphExpressions(page, c.graph);
        if (!g.ok) console.log(`  ⚠ 그래프(${s.title}): ${g.note}`);
      }
      if (c.cl) {
        const r = await writeCL(page, "last", c.cl);
        if (!r.ok) console.log(`  ⚠ CL(${c.label}): ${r.note}`);
      }
    }
    console.log(`슬라이드 ${i + 1}/${SLIDES.length}: ${s.title} ✓`);
  }
}

// ---- 편집기 원자 동작 (실측 확정 셀렉터) ----

async function setScreenTitle(page, text) {
  const t = page.locator('input[placeholder*="화면 제목"], input[placeholder*="제목 또는"]').first();
  if (await t.count().catch(() => 0)) { await t.fill(text).catch(() => {}); await sleep(300); }
}

async function addComponent(page, label) {
  // 팔레트 버튼: [role=button][aria-label="<label>"] — CL/그래프편집 패널이 가릴 수 있어 force
  const btn = page.locator(`[role=button][aria-label="${label}"]`).first();
  await btn.click({ force: true }).catch(() => {});
  await sleep(2500);
}

// 그래프 편집 진입 → Desmos 표현식 줄 입력 → 닫기. (한 프로세스라 추가 직후 상태 유지)
async function editGraphExpressions(page, lines) {
  // "그래프 편집" 오버레이 텍스트 → boundingBox 더블클릭으로 진입
  const ge = page.getByText("그래프 편집").last();
  if (!(await ge.count().catch(() => 0))) return { ok: false, note: "그래프 편집 진입점 없음" };
  await ge.scrollIntoViewIfNeeded().catch(() => {});
  const box = await ge.boundingBox().catch(() => null);
  if (!box) return { ok: false, note: "그래프 편집 boundingBox 없음" };
  await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
  // Desmos 표현식 리스트 등장 대기
  try { await page.waitForSelector(".dcg-mq-editable-field", { timeout: 12000 }); }
  catch { return { ok: false, note: "표현식 입력칸(.dcg-mq-editable-field) 미등장" }; }

  const field = page.locator(".dcg-mq-editable-field").first();
  await field.click().catch(() => {});
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) { await page.keyboard.press("Enter"); await sleep(250); }
    await page.keyboard.type(lines[i], { delay: 25 });
    await sleep(400);
  }
  await sleep(800);
  const count = await page.locator(".dcg-mq-editable-field").count().catch(() => 0);
  // 그래프 편집 닫기: 우상단 "완료" 버튼
  const done = page.getByRole("button", { name: /^완료$|^done$/i }).first();
  if (await done.count().catch(() => 0)) await done.click().catch(() => {});
  else await page.mouse.click(box.x, Math.max(20, box.y - 80)).catch(() => {});
  await sleep(1500);
  return { ok: count > 0, note: `표현식 ${count}줄`, count };
}

// CL 입력: "스크립트 열기"는 화면 1개 + 컴포넌트마다 1개로 여러 개다.
// scope 'last' = 가장 최근 추가 컴포넌트(화면상 가장 오른쪽 x) / 'screen' = 화면 단위(가장 왼쪽/위).
async function writeCL(page, scope, code) {
  const btns = page.getByRole("button", { name: /스크립트 열기|open script/i });
  const n = await btns.count().catch(() => 0);
  if (n === 0) return { ok: false, note: "스크립트 열기 버튼 없음" };
  // 컴포넌트 CL = x좌표 최대(가장 오른쪽), 화면 CL = x좌표 최소
  let target = 0, best = scope === "screen" ? Infinity : -1;
  for (let i = 0; i < n; i++) {
    const bx = await btns.nth(i).boundingBox().catch(() => null);
    if (!bx) continue;
    if (scope === "screen" ? bx.x < best : bx.x > best) { best = bx.x; target = i; }
  }
  const open = btns.nth(target);
  await open.click().catch(() => {});
  await sleep(2000);
  const cm = page.locator(".CodeMirror").first();
  if (!(await cm.count().catch(() => 0))) return { ok: false, note: "CodeMirror 미등장" };
  await cm.click().catch(() => {});
  // 기존 내용 비우고 입력
  await page.keyboard.press("Meta+A").catch(() => {});
  await page.keyboard.press("Backspace").catch(() => {});
  await sleep(200);
  for (const line of code.split("\n")) { await page.keyboard.type(line, { delay: 8 }); await page.keyboard.press("Enter"); }
  await sleep(800);
  const txt = await cm.innerText().catch(() => "");
  const done = page.getByRole("button", { name: /^완료$|^done$/i }).first();
  if (await done.count().catch(() => 0)) { await done.click().catch(() => {}); await sleep(1000); }
  return { ok: txt.length > 5, note: `CL ${txt.length}자` };
}

async function openEditor(ctx, id) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/activity/${id}/edit`, { waitUntil: "networkidle" }).catch(() => {});
  await sleep(5000);
  return page;
}

async function createActivity(ctx, title) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/custom`, { waitUntil: "networkidle" }).catch(() => {});
  await sleep(3500);
  await page.getByRole("button", { name: /새 액티비티|new activity/i }).first().click().catch(() => {});
  await sleep(2500);
  await page.getByRole("textbox").first().fill(title).catch(() => {});
  await sleep(600);
  await page.getByRole("button", { name: /새 액티비티 생성|create new activity/i }).first().click().catch(() => {});
  await sleep(8000);
  // 편집기 탭만 남기고 나머지 amplify 탭(/custom 등) 닫기 — 단일 탭 보장
  const pages = ctx.pages();
  const ed = pages.find((p) => /\/activity\/[a-f0-9]+\/edit/i.test(p.url())) || pages[pages.length - 1];
  for (const p of pages) {
    if (p !== ed && /amplify\.com/i.test(p.url())) await p.close().catch(() => {});
  }
  await ed.bringToFront().catch(() => {});
  await sleep(2000);
  const m = ed.url().match(/activity\/([a-f0-9]+)\/edit/i);
  return { page: ed, id: m ? m[1] : null };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.cmd) { console.log("사용법: node src/build-activity.mjs --smoke | --activity <id>"); process.exit(0); }
  const browser = await chromium.connectOverCDP(CDP).catch((e) => { console.error("attach 실패:", e.message); process.exit(1); });
  const ctx = browser.contexts()[0];

  // 다중 탭 충돌 방지: 기존 amplify 탭 전부 닫기 (단일 탭 보장)
  for (const p of ctx.pages()) {
    if (/amplify\.com/i.test(p.url())) await p.close().catch(() => {});
  }
  await sleep(800);

  let page, id;
  if (args.cmd === "full") {
    ({ page, id } = await createActivity(ctx, "기울기는 변화율 — 직접 탐구하는 일차함수"));
    console.log("활동 생성:", id, "| URL:", page.url().slice(0, 60));
    await buildFull(page);
    await page.screenshot({ path: "/tmp/amp-full-result.png" }).catch(() => {});
    console.log(`\n✓ 완성형 활동(${SLIDES.length}화면) 자동 구현 완료 (비공개)`);
    console.log(`${BASE}/activity/${id}/edit  — 미리보기로 확인, 발행은 사용자 승인 후`);
    await browser.close().catch(() => {});
    return;
  }
  if (args.cmd === "smoke") {
    ({ page, id } = await createActivity(ctx, "기울기 탐구 (변화율) — 자동구현 검증"));
    console.log("활동 생성:", id, "| URL:", page.url().slice(0, 60));
  } else {
    page = await openEditor(ctx, args.id); id = args.id;
    console.log("기존 활동 편집기 진입:", id);
  }

  // ── 기울기 탐구 한 화면: 그래프(슬라이더 a,b + y=ax+b + 단위계단) + 메모(CL 변화율 피드백) ──
  await setScreenTitle(page, "기울기는 변화율 — a를 움직여 보세요");
  console.log("화면 제목 설정");

  await addComponent(page, "그래프");
  console.log("그래프 컴포넌트 추가");
  const g = await editGraphExpressions(page, [
    "a=2",                 // 슬라이더 (학생 조작)
    "y=ax",                // 정비례 기준선
    "(1,0)",               // 단위 밑변 표시용
    "(1,a)",               // x=1에서 y=a — 변화율 시각화 점
  ]);
  console.log("그래프 표현식:", g.ok ? `✓ ${g.note}` : `✗ ${g.note}`);

  await addComponent(page, "메모");
  console.log("메모 컴포넌트 추가");
  // CL 적극: 메모 컴포넌트 CL(content sink)로 변화율 설명을 학생 화면에 표시 (실측 검증된 패턴)
  const cl = await writeCL(page, "last",
    'content: "기울기 a는 x가 1 증가할 때 y의 증가량입니다. 그래프의 a 슬라이더를 움직여 (1,a) 점과 직선의 변화를 관찰하세요."'
  );
  console.log("메모 CL 입력:", cl.ok ? `✓ ${cl.note}` : `✗ ${cl.note}`);

  await page.screenshot({ path: "/tmp/amp-build-result.png", fullPage: false });
  console.log(`\n결과 스크린샷: /tmp/amp-build-result.png`);
  console.log(`활동(비공개): ${BASE}/activity/${id}/edit  — 미리보기로 확인, 발행은 사용자 승인 후`);
  await browser.close().catch(() => {});
}

main().catch((e) => { console.error(e); process.exit(1); });
