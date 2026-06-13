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
  const a = { cmd: null, id: null, interval: 120, maxMin: 180 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--account") a.cmd = "account";
    else if (argv[i] === "--probe") a.cmd = "probe";
    else if (argv[i] === "--login") a.cmd = "login";
    else if (argv[i] === "--watch") a.cmd = "watch";
    else if (argv[i] === "--open") { a.cmd = "open"; a.id = argv[++i]; }
    else if (argv[i] === "--interval") a.interval = Number(argv[++i]);
    else if (argv[i] === "--max-min") a.maxMin = Number(argv[++i]);
  }
  return a;
}

// 점검 페이지 감지 (로그인 여부와 무관하게 모든 경로를 가린다).
async function isMaintenance(page) {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(2500);
  const txt = (await page.locator("body").innerText().catch(() => "")).toLowerCase();
  return /scheduled maintenance|back shortly|점검/i.test(txt);
}

// 로그인 완료 판정: classroom 홈에 "Log in" 버튼이 없으면 로그인 상태 (실측 확정).
async function isLoggedIn(page) {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(3500);
  const loginBtn = await page.getByRole("button", { name: /^log in$/i }).count().catch(() => 0);
  return loginBtn === 0;
}

// "Log in with Google" SSO — 2026-06-13 실측 확립 흐름.
// 로그인 모달은 my.amplify.com/auth(Keycloak) iframe 안에 있어 메인 page 셀렉터로는 안 잡힌다.
async function ssoLogin(ctx, page) {
  if (await isLoggedIn(page)) return { ok: true, note: "이미 로그인됨" };

  // 쿠키 동의 배너 닫기
  const consent = page.getByRole("button", { name: /확인|accept|got it/i }).first();
  if (await consent.count().catch(() => 0)) await consent.click().catch(() => {});
  await page.waitForTimeout(600);

  // Log in 버튼 → 모달(iframe) 오픈
  await page.getByRole("button", { name: /^log in$/i }).first().click().catch(() => {});
  await page.waitForTimeout(3500);

  // Keycloak iframe 안의 "Log in with Google"
  const authFrame = page.frames().find((f) => /my\.amplify\.com\/auth/i.test(f.url()));
  if (!authFrame) return { ok: false, note: "auth iframe(my.amplify.com)을 못 찾음" };
  const gbtn = authFrame.getByText(/log in with google/i).first();
  if (!(await gbtn.count().catch(() => 0))) return { ok: false, note: "iframe 내 Google 버튼 없음" };

  const [popup] = await Promise.all([
    ctx.waitForEvent("page", { timeout: 9000 }).catch(() => null),
    gbtn.click({ force: true }).catch(() => {}),
  ]);
  const authPage = popup || page;
  await authPage.waitForTimeout(5000);
  // 구글 계정 선택 화면(accountchooser)이면 목표 계정 클릭
  const acct = authPage.getByText(TARGET_ACCOUNT).first();
  if (await acct.count().catch(() => 0)) await acct.click().catch(() => {});
  await authPage.waitForTimeout(7000);

  const ok = await isLoggedIn(page);
  return { ok, note: ok ? `${TARGET_ACCOUNT} SSO 완료` : "SSO 후에도 미로그인(계정 선택 확인 필요)" };
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

async function cmdLogin(ctx, page) {
  if (await isMaintenance(page)) { console.log("⚠ Amplify 점검 중 — 로그인 불가. 복구 후 재시도."); return false; }
  const r = await ssoLogin(ctx, page);
  console.log(r.ok ? `✓ Amplify 로그인 완료 (${r.note})` : `⚠ 로그인 미완료 — ${r.note}`);
  return r.ok;
}

// 점검 복구를 폴링하다, 복구되면 SSO 로그인 → probe까지 자동 진행. (사용자 요청 "루프 연계"의 본체)
async function cmdWatch(ctx, page, args) {
  const start = new Date().getTime();
  const maxMs = args.maxMin * 60 * 1000;
  let n = 0;
  while (new Date().getTime() - start < maxMs) {
    n++;
    const maint = await isMaintenance(page);
    const mins = Math.round((new Date().getTime() - start) / 60000);
    if (maint) {
      console.log(`[${mins}m] #${n} 아직 점검 중 — ${args.interval}s 후 재확인`);
      await page.waitForTimeout(args.interval * 1000);
      continue;
    }
    console.log(`[${mins}m] ✓ 점검 종료 감지 — 자동 진행 시작`);
    const logged = await cmdLogin(ctx, page);
    if (!logged) {
      console.log("로그인 미완료 — 그 창에서 1회 로그인 후 'node src/deploy-cdp.mjs --probe' 실행하세요.");
      return;
    }
    await cmdProbe(ctx, page);
    console.log("\n✓ watch 완료: 점검 복구 → 로그인 → 실측까지 자동 진행됨.");
    return;
  }
  console.log(`⏱ ${args.maxMin}분 내 복구 안 됨 — 'npm run deploy:probe'로 수동 재개하세요.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.cmd) {
    console.log("사용법:\n  node src/deploy-cdp.mjs --account\n  node src/deploy-cdp.mjs --login\n  node src/deploy-cdp.mjs --probe\n  node src/deploy-cdp.mjs --watch [--interval 120] [--max-min 180]\n  node src/deploy-cdp.mjs --open <activity-id>");
    process.exit(0);
  }
  const { browser, ctx } = await connect();
  const page = await freshPage(ctx);
  try {
    if (args.cmd === "account") await cmdAccount(page);
    else if (args.cmd === "login") await cmdLogin(ctx, page);
    else if (args.cmd === "probe") await cmdProbe(ctx, page);
    else if (args.cmd === "watch") await cmdWatch(ctx, page, args);
    else if (args.cmd === "open") await cmdOpen(ctx, page, args.id);
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {}); // CDP attach에서 close는 연결만 끊고 실제 크롬은 유지
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
