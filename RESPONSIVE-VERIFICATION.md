# SQL Lab responsive verification

Reviewed 14 November 2026 (Australia/Sydney). Ready for code review; physical-device sign-off remains open. No merge or deployment performed.

## Version and scope

Baseline: PR #4 head qa/sql-lab-release-review, commit 5c50dc403ebb115bbafe5bbb2befbea619f4c402, layered on expansion PR #3 feature/sql-learning-path-60 at aa607b866db6f44587c72d3248a2f97b829bb70d. Separate branch: feature/responsive-desktop-iphone; PR base: qa/sql-lab-release-review. Main remains dc0314fb9bf94f9474f0672c23c78cdd0fa56c06. Existing branches and PR metadata were not changed.

Standalone HTML SHA-256: 9f60937fdf2d546c788544b5204c0bde9b39d4a9e485524a583276698c427741

Midnight Plum, all 60 exercises and stable IDs, short Find/Show/Sort prompts, hint gates, glossary, grading, saved progress and embedded offline SQLite are retained. Embedded sqlite-source and engine blocks compare byte-for-byte with the corrected baseline; parsed curriculum content is identical (build normalizes surrounding line endings). No curriculum.json change.

## Responsive arrangements

At 960px and wider, a 1248px maximum container separates task/reference from a bordered SQL workspace, with 32px between columns and 24px workspace padding. Coach and results belong to the editor column. From 600–959px the readable single column is capped at 760px. Below 600px the flow is task, two representative sample rows, editor, Run, feedback and contextual Coach. Schema and ungraded SQL inspection expand on request; Return to your SQL restores focus and reveals editor plus Run.

Spacing uses 4/8/12/16/24/32px tokens. Editor text is always 16px; Run is at least 48px high with an 8px gap below the editor; interactive controls are at least 44px high. Desktop editor height follows the viewport within 180–280px, with a short-viewport override. Focus outlines, skip navigation and keyboard shortcuts remain available. Wide tables scroll within their own focusable regions. Main content has no fixed/sticky overlay; only table headers stick inside tables. Safe areas belong to the in-flow header and main padding, avoiding duplicated bottom padding. No keyboard-detection or page-scroll locking is introduced.

## Prioritized findings

| Priority | Finding | Status |
|---|---|---|
| P2 | Desktop was constrained to 792px, with narrow task/editor columns and Coach detached below the grid. | Fixed: wider bounded grid and Coach inside workspace. Visual screenshots inspected in Chromium and WebKit. |
| P2 | Expanded mobile data required scrolling back to the editor without a direct control. | Fixed: Return to your SQL focuses the editor and keeps Run visible in tested 568px viewports. |
| P3 | Repeated overrides obscured spacing intent; desktop and mobile shared underspecified positioning. | Fixed: one responsive rules section, spacing tokens, explicit breakpoints and typography. |
| P2, release check | Real iPhone safe areas, software keyboard, touch selection, VoiceOver and home-screen launch are unverified. | Open: requires actual iPhone/iOS Safari testing before device sign-off. |
| P3, inherited | Finite grading fixtures cannot prove arbitrary SQL correctness; Worker has no enforced memory quota. | Unchanged limitation; see original VERIFICATION.md. |

## Exact rerun evidence

| Suite | Final result |
|---|---|
| npm run build | Pass; 48 expanded exercises embedded, 60 stable learning IDs. |
| npm test | Pass in Chromium and WebKit: 3,360 canonical fixture executions, 288 original-result comparisons, 392 independent row checks, 130 UI records, 40 layout checks, zero page errors/external requests. Includes all 60 actual Worker flows, timeout recovery, offline local-file startup, reload/dataset drafts, assisted markers and legacy migration. |
| npm run test:release | Pass: 4,800 references + 9,600 valid alternatives = 14,400 independent comparisons; 84 mutants rejected in each engine with no survivors; 22 UI records and 32 mobile layouts. Actual axe-core 4.14.0 scans ran in the error/Coach state in both engines and reported zero violations. |
| npm run test:safety | Pass: 36 records across both engines, including read-only enforcement, multiple statements, extension/config restrictions, row/cell/query limits, inert markup output, keyboard table scrolling, 200% text zoom, malformed/out-of-range saves and storage denial. |
| npm run test:responsive | 84 exercise layout records: 7 widths × 2 heights × 3 exercises × 2 engines. Widths 320/375/390/430/1024/1280/1440; heights 568/900. Additional interaction checks cover expanded data, focus return, Run position, errors, Coach, success, Escape, Ctrl+Enter, skip/Tab, CSS 200% zoom and a 390×320 reduced-height keyboard proxy. Four touch-enabled mobile contexts per engine verify tapping Run. |

All tested layouts have no page horizontal overflow. All 84 measurements keep Run exactly 8px below the editor. Desktop checks assert Coach is a descendant of the workspace. Existing safe-area substitution and landscape checks pass; browser standalone emulation reports unsupported. Screenshot set: 56 before/after images plus 16 error/Coach/success images = 72. The comparison HTML embeds 8 representative before/after pairs; the archive contains every raw screenshot and JSON/log evidence.

Initial restricted-host runs could not access the local server or complete local-file Worker startup; reruns with the required access passed. A first visual review found Coach was still outside the grid because of a newline-sensitive markup replacement. The markup was corrected, a DOM-placement assertion added, and all existing suites rerun on the corrected HTML.

## Reproduce

Run npm ci, npx playwright install chromium webkit, npm run build, npm run test:all, and npm run test:responsive. The responsive script extracts the exact baseline from the recorded Git commit, so keep Git history available. On this Windows host PLAYWRIGHT_BROWSERS_PATH was set to the installed browser cache. Test artifacts are ignored by Git and packaged separately. Accessibility is pinned as a development dependency only; the delivered HTML still has no external dependencies.

## Limits and review decision

WebKit on Windows is not actual iOS Safari. Touch emulation and reduced viewport tests do not open a real software keyboard. CSS zoom/text enlargement is not iOS pinch zoom or Dynamic Type. Safe-area substitutions do not verify notch/status-bar rendering. Automated axe scans and desktop keyboard tests do not certify VoiceOver usability. Advanced narrow-screen tasks and deliberately expanded inspection/Coach content still need vertical scrolling; no information is hidden merely to meet a one-screen target.

Review the layout PR and comparison HTML. Physical iPhone testing remains required for device approval. Do not merge or deploy without owner approval.
