#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function usage() {
  return `Usage:
  node src/inspect-amplify.mjs 'https://classroom.amplify.com/activity/<id>?lang=ko' --out generated/inspections
`;
}

function parseArgs(argv) {
  const args = { url: undefined, out: "generated/inspections" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--out") {
      args.out = argv[++i];
    } else if (!args.url) {
      args.url = arg;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function activityIdFromUrl(rawUrl) {
  const url = new URL(rawUrl);
  const match = url.pathname.match(/\/activity\/([^/?#]+)/);
  if (!match) throw new Error(`Could not find activity id in URL: ${rawUrl}`);
  return match[1];
}

function metaContent(html, key) {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+id=["']${key}["'][^>]+content=["']([^"']*)["']`, "i")
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtml(match[1]);
  }
  return undefined;
}

function linkHref(html, rel) {
  const pattern = new RegExp(`<link[^>]+rel=["']${rel}["'][^>]+href=["']([^"']*)["']`, "i");
  const match = html.match(pattern);
  return match ? decodeHtml(match[1]) : undefined;
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

async function fetchText(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 200)}`);
  }
  return { response, text };
}

async function inspect(rawUrl) {
  const activityId = activityIdFromUrl(rawUrl);
  const { text: html } = await fetchText(rawUrl);
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const staticMeta = {
    canonical: linkHref(html, "canonical"),
    title: metaContent(html, "title") ?? (titleMatch ? decodeHtml(titleMatch[1]) : undefined),
    description: metaContent(html, "description"),
    twitterTitle: metaContent(html, "twitter:title"),
    twitterDescription: metaContent(html, "twitter:description"),
    image: metaContent(html, "og:image") ?? metaContent(html, "twitter:image") ?? linkHref(html, "image_src")
  };

  let activityMeta;
  try {
    const { text } = await fetchText("https://classroom.amplify.com/activity-meta/custom", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "origin": "https://classroom.amplify.com",
        "referer": rawUrl
      },
      body: JSON.stringify({
        customIds: [activityId],
        lang: new URL(rawUrl).searchParams.get("lang") ?? "ko",
        includeDraftStatus: true
      })
    });
    activityMeta = JSON.parse(text);
  } catch (error) {
    activityMeta = { error: String(error.message ?? error) };
  }

  let activityJson;
  let activitySummary;
  try {
    const { text } = await fetchText(`https://classroom.amplify.com/activity/${activityId}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "origin": "https://classroom.amplify.com",
        "referer": rawUrl
      },
      body: "{}"
    });
    activityJson = JSON.parse(text);
    activitySummary = summarizeActivityJson(activityJson);
  } catch (error) {
    activityJson = { error: String(error.message ?? error) };
    activitySummary = { error: String(error.message ?? error) };
  }

  return {
    inspectedAt: new Date().toISOString(),
    url: rawUrl,
    activityId,
    staticMeta,
    activityMeta,
    activitySummary,
    activityJson,
    notes: [
      "Public HTML exposes metadata and thumbnail.",
      "The public POST /activity/:id route may expose the customLesson JSON for public activities.",
      "Teacher sessions, dashboards, student responses, and editor-only diagnostics still require authorization.",
      "Use this output as source evidence and template inspiration, not as an activity clone."
    ]
  };
}

function summarizeActivityJson(payload) {
  const lesson = payload.customLesson ?? payload.activity ?? payload;
  const steps = Array.isArray(lesson.steps) ? lesson.steps : [];
  const summary = {
    id: lesson._id,
    title: lesson.title,
    version: lesson.version,
    commitId: lesson.commitId,
    publishedTimestamp: lesson.publishedTimestamp,
    editTimestamp: lesson.edit_ts,
    permissionToShare: lesson.permissionToShare,
    noindex: payload.noindex,
    flags: lesson.flags,
    user: lesson.user,
    author: lesson.author,
    ancestors: lesson.ancestors,
    thumb: lesson.thumb,
    screenCount: steps.length,
    componentCounts: {},
    screens: [],
    aliases: [],
    scripts: []
  };

  steps.forEach((step, index) => {
    const screen = {
      index: index + 1,
      id: step.id,
      type: step.type,
      title: step.title ?? "",
      subtitle: step.subtitle ?? "",
      componentCounts: {}
    };
    walkComponents(step, (type, config) => {
      summary.componentCounts[type] = (summary.componentCounts[type] ?? 0) + 1;
      screen.componentCounts[type] = (screen.componentCounts[type] ?? 0) + 1;
      if (config.alias !== undefined && config.alias !== null && config.alias !== "") {
        summary.aliases.push({
          screen: index + 1,
          type,
          alias: config.alias,
          id: config.id
        });
      }
      if (typeof config.script === "string" && config.script.trim() !== "") {
        summary.scripts.push({
          screen: index + 1,
          screenTitle: screen.title,
          type,
          alias: config.alias ?? null,
          id: config.id,
          script: config.script
        });
      }
    });
    summary.screens.push(screen);
  });

  return summary;
}

function walkComponents(node, visit) {
  if (Array.isArray(node)) {
    node.forEach((child) => walkComponents(child, visit));
    return;
  }
  if (!node || typeof node !== "object") return;

  for (const [key, value] of Object.entries(node)) {
    if (isComponentConfig(key, value)) {
      visit(key, value);
    }
    walkComponents(value, visit);
  }
}

function isComponentConfig(key, value) {
  if (key === "linearlayout") return false;
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.prototype.hasOwnProperty.call(value, "id") ||
    Object.prototype.hasOwnProperty.call(value, "alias") ||
    Object.prototype.hasOwnProperty.call(value, "script");
}

function writeInspection(outRoot, inspection) {
  fs.mkdirSync(outRoot, { recursive: true });
  const jsonPath = path.join(outRoot, `${inspection.activityId}.json`);
  const mdPath = path.join(outRoot, `${inspection.activityId}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(inspection, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdPath, `${renderMarkdownReport(inspection)}\n`, "utf8");
  return { jsonPath, mdPath };
}

function renderMarkdownReport(inspection) {
  const summary = inspection.activitySummary ?? {};
  const counts = summary.componentCounts
    ? Object.entries(summary.componentCounts).sort((a, b) => b[1] - a[1]).map(([key, value]) => `- ${key}: ${value}`).join("\n")
    : "- unavailable";
  const screens = Array.isArray(summary.screens)
    ? summary.screens.map((screen) => `| ${screen.index} | ${screen.title || "(untitled)"} | ${screen.type} | ${componentCountText(screen.componentCounts)} |`).join("\n")
    : "";
  const scripts = Array.isArray(summary.scripts)
    ? summary.scripts.map((script, index) => `## Script ${index + 1}: Screen ${script.screen} ${script.alias || script.id} (${script.type})

\`\`\`cl
${script.script}
\`\`\``).join("\n\n")
    : "";

  return `# Amplify Activity Inspection

Source URL: ${inspection.url}

## Static Metadata

- Activity ID: ${inspection.activityId}
- Static title: ${inspection.staticMeta.title ?? ""}
- Description: ${inspection.staticMeta.description ?? ""}
- Canonical: ${inspection.staticMeta.canonical ?? ""}
- Image: ${inspection.staticMeta.image ?? ""}

## Activity JSON Summary

- Title: ${summary.title ?? ""}
- Version: ${summary.version ?? ""}
- Commit ID: ${summary.commitId ?? ""}
- Published: ${summary.publishedTimestamp ?? ""}
- Edited: ${summary.editTimestamp ?? ""}
- Permission to share: ${summary.permissionToShare ?? ""}
- Noindex: ${summary.noindex ?? ""}
- Screen count: ${summary.screenCount ?? ""}

## Component Counts

${counts}

## Screens

| # | Title | Type | Components |
|---:|---|---|---|
${screens}

## CL Scripts

${scripts || "No CL scripts found."}
`;
}

function componentCountText(counts = {}) {
  return Object.entries(counts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}:${value}`)
    .join(", ");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.url) {
    console.error(usage());
    process.exitCode = 1;
    return;
  }
  const inspection = await inspect(args.url);
  const { jsonPath, mdPath } = writeInspection(path.resolve(process.cwd(), args.out), inspection);
  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${mdPath}`);
  console.log(`${inspection.staticMeta.title ?? "(untitled)"} - ${inspection.staticMeta.description ?? ""}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
