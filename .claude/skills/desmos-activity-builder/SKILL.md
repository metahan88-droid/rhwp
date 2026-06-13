# Desmos Activity Builder

Use this skill when the user asks to build, analyze, generate, or improve Desmos/Amplify Activity Builder content with Computation Layer (CL).

## Workflow

1. Work from the repository root:

   ```bash
   cd /Users/han/project/rhwp/tools/desmos-activity
   ```

2. If the user provides an Amplify Classroom activity URL, inspect it first:

   ```bash
   node src/inspect-amplify.mjs '<activity-url>' --out generated/inspections
   ```

3. Read the generated inspection Markdown before designing:

   ```bash
   sed -n '1,220p' generated/inspections/<activity-id>.md
   ```

4. Create or update an activity spec in `activities/*.json`.

5. Validate the spec:

   ```bash
   node src/lint.mjs activities/<activity>.json
   ```

6. Generate the paste pack:

   ```bash
   node src/generate.mjs activities/<activity>.json --out generated
   ```

7. Report the generated files to the user:

   - `activity-plan.md`
   - `screen-cl.md`
   - `graph-states.md` (game templates only — paste-ready graph expression list)
   - `graph-state.<screen>.<component>.json` (version-11 calculatorState)
   - `paste-checklist.md`
   - `vibe-prompt-pack.md`
   - `activity-spec.normalized.json`

Game templates (`marbleslides_style`, `platformer_mario`, `inequality_pasture`) and their
hard CL rules live in `prompts/vibe-coding-system-prompt.md` — read it before writing any CL.
Knowledge base: Obsidian wiki `03-Resources/desmos-cl` (graph-as-game-engine,
ab-graph-component-reference, inequality-pasture-pattern, cl-game-scaffolding-patterns 등).
Deploy procedure: `docs/claude-in-chrome-runbook.md`. System overview: `docs/overview.html`.

## Design Rules

- Do not call private Amplify save/import APIs.
- Generate manual Activity Builder paste packs.
- Use Korean for student-facing copy unless the user asks otherwise.
- Name components before writing CL.
- Prefer stable unique names like `s03_slideGraph`, `s03_runSlide`, `s03_feedback`.
- Put mathematical models in Graph when graph expressions are easier to debug.
- Put `correct:` on the component where the student actually works when possible.
- Use `readOnly: true` only for components that should not count toward dashboard correctness.
- For button animations, use `button.timeSincePress(max)` and send it to graph `number("T")`.
- For graph-based correctness, define a numeric graph expression such as `C`, then read it with `graph.number("C")`.
- Always include a Student Preview and Teacher Dashboard checklist.

## Useful Commands

```bash
npm run check
npm run list:templates
npm run generate:calorie
npm run generate:smooth-slide
npm run generate:marble   # 구슬 미끄럼틀 (marbleslides graph-clone)
npm run generate:mario    # 이차함수 코인 러시
npm run generate:sheep    # 양떼 부등식
```

## Core Files

- `tools/desmos-activity/README.md`
- `tools/desmos-activity/src/templates.mjs`
- `tools/desmos-activity/src/generate.mjs`
- `tools/desmos-activity/src/lint.mjs`
- `tools/desmos-activity/src/inspect-amplify.mjs`
- `mydocs/manual/desmos_activity_builder_guide.md`
- `mydocs/tech/desmos_cl_generation_architecture.md`
