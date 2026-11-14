# SQL Lab

60 practical SQL exercises using fictional banking and operations data: the original 12 plus 48 new exercises. No mystery storyline. The mobile Midnight Plum design and solid iPhone safe-area header are retained.

## Use the app

Open `index.html` in a current browser with JavaScript and Web Workers, or serve it with any static host. No installation, backend, external API, build step or network request is needed to run the downloaded file. SQLite and its licence are embedded.

The learning order starts with SELECT, WHERE, sorting and pagination, then DISTINCT/NULL, totals and groups, joins, subqueries, CASE, CTEs, windows and operational reporting. Each exercise shows a concise task, exact result fields, ordering, a terminology tip, real sample rows and expandable schema/SQL inspection.

SQL Coach is a bounded offline rules engine. It responds to syntax, output mismatches and recent attempts. Three hint stages guide the current task. A worked solution unlocks after an unsuccessful attempt and two hint stages; revealing it marks the exercise assisted and leaves the draft unchanged. Inspection does not grade or complete an exercise.

Drafts, completion and assisted markers save in this browser when storage is available. The original integer exercise IDs and storage key are preserved even though the learning order is longer. Each dataset has separate drafts. Moving the HTML file, changing domains or using another browser/device may use separate storage; there is no account sync.

**Offline boundary:** a downloaded HTML file starts and runs SQL offline. A hosted first visit requires internet; the app does not install a service worker or guarantee offline reload of a hosted URL.

## Maintain the curriculum

`curriculum.json` contains the 48 new exercise objects and the complete learning order. IDs 0–11 remain the original exercises; new IDs are 12–59. A small adapter lets the existing app consume the new metadata. Do not renumber IDs: saved drafts and progress depend on them.

Edit metadata and run `npm run build` to embed it into the single downloadable `index.html`. The JSON source is not fetched at runtime. Each new object contains task, columns, sort contract, reference SQL, starter, explanation, three hints, term chips and a deliberately wrong query for regression testing. Equivalent SQLite queries pass when their results match; the grader does not require specific syntax such as WITH.

Every answer is executed against its practice dataset and six hidden fixtures. These vary IDs, dates, amounts, names, regions, channels and membership, and include thresholds, ties, duplicate logs and empty transaction/log tables. Grading checks names/order of columns, values, duplicate multiplicity and required row order. This is finite result-based testing, not a proof for every possible dataset.

## Run verification

Requires Node.js 20+ for development only:

```sh
npm ci
npx playwright install chromium webkit
npm run build
npm test
npm run test:release
npm run test:safety
```

On Linux, use `npx playwright install --with-deps chromium webkit` if browser system dependencies are missing. Tests write screenshots and detailed JSON to ignored `test-results/`. Baseline contracts in `scripts/original-regression.json` were captured from main commit `dc0314fb9bf94f9474f0672c23c78cdd0fa56c06`; do not regenerate them to hide a regression.

See [VERIFICATION.md](VERIFICATION.md) for exact coverage and device limitations.

## Design reference and release status

[SQLBolt](https://sqlbolt.com/) informed short concept explanations, visible practice tasks and a gradual progression. All banking tasks, data and wording here are original; no SQLBolt text, puzzles or assets were copied.

This expansion is prepared on a feature branch for review. It must not be merged or published without the owner's explicit approval.

The independent release QA fixes and exact coverage are in VERIFICATION.md; prioritized before/after evidence is in ISSUES.md. The QA PR targets feature/sql-learning-path-60 for review. Nothing is merged or deployed.

## Responsive layout review

Desktop uses a bounded two-column reference/workspace layout from 960px; smaller screens use task, data preview, editor, Run and contextual Coach in sequence. See [RESPONSIVE-VERIFICATION.md](RESPONSIVE-VERIFICATION.md) for evidence and remaining physical-iPhone checks. Run `npm run test:all` for all existing suites with accessibility scans, and `npm run test:responsive` for the before/after viewport matrix.
