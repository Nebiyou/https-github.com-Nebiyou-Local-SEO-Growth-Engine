# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2cb9590d-a300-4ff9-ae74-d3589936df73

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Grade 5 Math Mastery (this branch)

`grade5-math.html` is a fully self-contained, offline-ready study app covering every
concept tested on any US state's grade 5 math assessment (all 50 states + DC):
8 units, 23 concepts, 23 step-through animations, 230 multiple-choice + 115
open-ended + 23 challenge questions, all with worked answer keys, progress
tracking, and a per-state "what's on your test" lens.

- Open `grade5-math.html` directly in any browser — no install, no network needed.
- Research behind it: `docs/STATE-RESEARCH.md` · syllabus: `docs/SYLLABUS.md`
- To edit content: change `content/unit*.json` (schema in `content/SCHEMA.md`) or the
  engine/animations in `app/`, then rebuild with `node app/build.mjs`.
