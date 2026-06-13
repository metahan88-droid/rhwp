#!/usr/bin/env node
// CDP attach 배포 드라이버 — 이미 로그인된 크롬(9222)에 붙어 Amplify Classroom Activity Builder를 조작한다.
// 전제: scripts/chrome-debug.sh 로 hotdel@g.jbedu.kr 프로필을 9222 디버그 모드로 띄워 둔 상태.
//
// 명령:
//   node src/deploy-cdp.mjs --account              로그인 계정 확인만
//   node src/deploy-cdp.mjs --probe                계정 확인 + 편집기 구조 실측(스크린샷+DOM 덤프) — 런북 ⚠ 해소용
//   node src/deploy-cdp.mjs --open <activity-id>   해당 활동 생성 페이지를 열고, 첫 화면 붙여넣기 자료를 콘솔에 띄움(반자동)
//
// 안전 원칙: 이 드라이버는 읽기(probe/account)와 '페이지 열기'까지만 자동화한다.
// 실제 화면 생성·CL 붙여넣기·발행(되돌리기 어려운 쓰기)은 편집기 셀렉터가 probe로 확정된 뒤,
// 사용자 확인 하에 별도 단계에서 추가한다.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
// Playwright는 이웃 프로젝트(math ai)에 설치돼 있다. 절대경로로 빌려쓴다.
const PW_PATH = "/Users/han/projects/math ai/node_modules/playwright";
let chromium;
try {
  ({ chromium } = require(PW_PATH));
} catch {
  console.error(`Playwright를 찾지 못했습니다: ${PW_PATH}\n해당 프로젝트에서 'npx playwright install' 후 다시 시도하거나, 이 툴킷에 playwright를 설치하세요.`);
  process.exit(1);
}

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const CDP = process.env.CDP_URL || "http://127.0.0.1:9222";
const TARGET_ACCOUNT = process.env.DESMOS_ACCOUNT || "hotdel@g.jbedu.kr";
const BASE = "https://classroom.amplify.com";

function parseArgs(argv) {
  const a = { cmd: null, id: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--account") a.cmd = "account";
    else if (argv[i] === "--probe") a.cmd = "probe";
    else if (argv[i] === "--open") { a.cmd = "open"; a.id = argv[++i]; }
  }
  return a;
}

async function connect() {
  let browser;
  try {
    browser = await chromium.connectOverCDP(CDP);
  } catch (e) {
    console.error(`✗ ${CDP} 에 붙지 못했습니다. 먼저 디버그 크롬을 띄우세요:\n  bash scripts/chrome-debug.sh\n원본 오류: ${e.message}`);
    process.exit(1);
  }
  const ctx = browser.contexts()[0];
  if (!ctx) {
    console.error("✗ 브라우저 컨텍스트가 없습니다. 크롬 창이 하나 이상 열려 있어야 합니다.");
    process.exit(1);
  }
  return { browser, ctx };
}

async function freshPage(ctx) {
  const p = await ctx.newPage();
  p.setDefaultTimeout(20000);
  return p;
}

// 페이지 텍스트에서 로그인 이메일을 추정한다(셀렉터 비의존 — DOM 변경에 견고).
async function detectAccount(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(2500);
  const html = await page.content();
  const emails = [...html.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)].map((m) => m[0]);
  const uniq = [...new Set(emails)].filter((e) => !e.endsWith("desmos.com") && !e.includes("sentry") && !e.includes("example"));
  return uniq;
}

async function cmdAccount(page) {
  const emails = await detectAccount(page);
  const matched = emails.includes(TARGET_ACCOUNT);
  console.log(`현재 URL: ${page.url()}`);
  console.log(`페이지에서 발견된 계정 후보: ${emails.length ? emails.join(", ") : "(없음 — 비로그인이거나 셀렉터 밖)"}`);
  console.log(matched
    ? `✓ 목표 계정 ${TARGET_ACCOUNT} 로그인 확인.`
    : `⚠ 목표 계정(${TARGET_ACCOUNT})을 페이지 텍스트에서 확정하지 못했습니다. 크롬 우상단 프로필이 그 계정인지 육안 확인하세요.`);
  return matched;
}

async function cmdProbe(ctx, page) {
  const outDir = path.join(ROOT, "generated", "inspections", "ab-editor-probe");
  fs.mkdirSync(outDir, { recursive: true });
  await cmdAccount(page);

  const targets = [
    { name: "home", url: `${BASE}/` },
    { name: "cl-docs", url: `${BASE}/computation-layer/documentation` },
    { name: "labs", url: `${BASE}/labs` },
  ];
  const report = [];
  for (const t of targets) {
    try {
      await page.goto(t.url, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3000);
      const shot = path.join(outDir, `${t.name}.png`);
      await page.screenshot({ path: shot, fullPage: false });
      // 인터랙티브 요소 후보 덤프 (버튼/링크/aria) — 편집기 셀렉터 확정 근거
      const els = await page.evaluate(() => {
        const pick = (el) => ({
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute("role") || "",
          aria: el.getAttribute("aria-label") || "",
          text: (el.innerText || el.value || "").trim().slice(0, 40),
          testid: el.getAttribute("data-testid") || el.getAttribute("data-test") || "",
        });
        return [...document.querySelectorAll('button,[role="button"],a[href],input,[data-testid]')]
          .map(pick)
          .filter((e) => e.text || e.aria || e.testid)
          .slice(0, 120);
      });
      fs.writeFileSync(path.join(outDir, `${t.name}.elements.json`), JSON.stringify(els, null, 2));
      report.push({ target: t.name, url: page.url(), title: await page.title(), elements: els.length, screenshot: shot });
      console.log(`  · ${t.name}: ${els.length} elements → ${path.relative(ROOT, shot)}`);
    } catch (e) {
      report.push({ target: t.name, error: e.message });
      console.log(`  · ${t.name}: 실패 — ${e.message}`);
    }
  }
  fs.writeFileSync(path.join(outDir, "probe-report.json"), JSON.stringify(report, null, 2));
  console.log(`\n실측 결과: ${path.relative(ROOT, outDir)}/ (스크린샷 + *.elements.json)`);
  console.log("이 결과로 화면 생성/컴포넌트 추가/CL 패널 셀렉터를 확정한 뒤 자동 배포 단계를 추가합니다.");
}

async function cmdOpen(ctx, page, id) {
  const packDir = path.join(ROOT, "generated", id);
  if (!fs.existsSync(packDir)) {
    console.error(`✗ 생성 팩이 없습니다: ${path.relative(ROOT, packDir)}\n먼저: node src/generate.mjs activities/${id}.json --out generated`);
    process.exit(1);
  }
  await cmdAccount(page);
  // 활동 목록(여기서 사람이/후속 단계가 '새 활동 만들기'를 누른다)
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" }).catch(() => {});
  const plan = fs.readFileSync(path.join(packDir, "activity-plan.md"), "utf8");
  const title = (plan.match(/^# (.+)$/m) || [])[1] || id;
  console.log(`\n활동: ${title}`);
  console.log(`팩 위치: ${path.relative(ROOT, packDir)}/`);
  console.log("붙여넣기 자료 — screen-cl.md, graph-states.md, paste-checklist.md");
  console.log("\nActivity Builder 새 활동 화면을 띄웠습니다. 다음은 런북(docs/claude-in-chrome-runbook.md) 절차대로 화면 1개씩 진행하세요.");
  console.log("(편집기 셀렉터가 probe로 확정되면 이 단계도 자동화됩니다.)");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.cmd) {
    console.log("사용법:\n  node src/deploy-cdp.mjs --account\n  node src/deploy-cdp.mjs --probe\n  node src/deploy-cdp.mjs --open <activity-id>");
    process.exit(0);
  }
  const { browser, ctx } = await connect();
  const page = await freshPage(ctx);
  try {
    if (args.cmd === "account") await cmdAccount(page);
    else if (args.cmd === "probe") await cmdProbe(ctx, page);
    else if (args.cmd === "open") await cmdOpen(ctx, page, args.id);
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {}); // CDP attach에서 close는 연결만 끊고 실제 크롬은 유지
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
