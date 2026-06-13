#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { templates } from "./templates.mjs";

const KNOWN_NON_COMPONENT_REFS = new Set([
  "this",
  "Math",
  "script"
]);

function usage() {
  return "Usage: node src/lint.mjs activities/calorie-down-stairs.json\n";
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function collectComponents(screen) {
  const template = templates[screen.template];
  if (!template) return [];
  return template.components(screen).map((component) => component.name);
}

function collectScripts(screen) {
  const template = templates[screen.template];
  if (!template) return [];
  return template.scripts(screen);
}

function referencedComponents(script) {
  const refs = new Set();
  const code = stripComments(script);
  const locals = localSymbols(code);
  const regex = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\./g;
  let match;
  while ((match = regex.exec(code))) {
    const name = match[1];
    if (!KNOWN_NON_COMPONENT_REFS.has(name) && !locals.has(name)) refs.add(name);
  }
  return [...refs];
}

function stripComments(script) {
  return script
    .split("\n")
    .map((line) => line.replace(/\s*#.*$/, ""))
    .join("\n");
}

function localSymbols(script) {
  const symbols = new Set();
  const regex = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/gm;
  let match;
  while ((match = regex.exec(script))) {
    symbols.add(match[1]);
  }
  return symbols;
}

function lintSpec(spec) {
  const errors = [];
  const warnings = [];

  if (!spec.id) errors.push("Missing activity id.");
  if (!spec.title) errors.push("Missing activity title.");
  if (!Array.isArray(spec.screens) || spec.screens.length === 0) {
    errors.push("Activity must include at least one screen.");
    return { errors, warnings };
  }

  const globalComponentOwners = new Map();

  for (const [screenIndex, screen] of spec.screens.entries()) {
    const label = `${screen.id ?? `screen-${screenIndex + 1}`}`;
    const template = templates[screen.template];
    if (!template) {
      errors.push(`${label}: unknown template "${screen.template}".`);
      continue;
    }

    const components = collectComponents(screen);
    const localComponents = new Set(components);
    if (localComponents.size !== components.length) {
      errors.push(`${label}: duplicate component name within the same screen.`);
    }

    for (const componentName of components) {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(componentName)) {
        errors.push(`${label}: component "${componentName}" is not a CL-friendly identifier.`);
      }
      if (globalComponentOwners.has(componentName)) {
        warnings.push(`${label}: component "${componentName}" duplicates component from ${globalComponentOwners.get(componentName)}. Activity Builder often scopes aliases by screen, but generated packs are easier to maintain with stable unique names.`);
      } else {
        globalComponentOwners.set(componentName, label);
      }
    }

    for (const scriptBlock of collectScripts(screen)) {
      for (const ref of referencedComponents(scriptBlock.script)) {
        if (!localComponents.has(ref)) {
          errors.push(`${label}: script for "${scriptBlock.component}" references unknown component "${ref}".`);
        }
      }

      if (scriptBlock.script.includes("correct:") && scriptBlock.type === "Note") {
        warnings.push(`${label}: note "${scriptBlock.component}" contains correct:. Prefer putting correct: on the student input component.`);
      }

      if (scriptBlock.script.includes("randomGenerator(") && !scriptBlock.script.includes("pressCount")) {
        warnings.push(`${label}: randomGenerator has no obvious button pressCount seed.`);
      }
    }
  }

  return { errors, warnings };
}

function main() {
  const specPath = process.argv[2];
  if (!specPath) {
    console.error(usage());
    process.exitCode = 1;
    return;
  }

  const spec = readJson(path.resolve(process.cwd(), specPath));
  const result = lintSpec(spec);

  for (const warning of result.warnings) {
    console.warn(`warning: ${warning}`);
  }

  if (result.errors.length > 0) {
    for (const error of result.errors) {
      console.error(`error: ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`OK: ${specPath}`);
}

main();
