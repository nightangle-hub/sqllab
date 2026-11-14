# Independent SQL Lab release QA

**Decision: corrected release candidate is ready for code review. Physical iPhone sign-off remains outstanding. Nothing was merged or deployed.**

Reviewed 14 November 2026, Australia/Sydney. Review perspectives: senior full-stack engineer, SQL/data engineer, banking operations analyst, instructional designer/SQL mentor, mobile UX/accessibility specialist and QA lead. These are six review lenses applied by one agent, not six separate human or agent approvals.

## Exact version and isolation

The expanded version exists: **48 new exercises, 60 total**. Repository branch inventory and open [expansion PR #3](https://github.com/nightangle-hub/sqllab/pull/3) identified `feature/sql-learning-path-60` at `aa607b866db6f44587c72d3248a2f97b829bb70d`. Main remained `dc0314fb9bf94f9474f0672c23c78cdd0fa56c06`. No newer expansion branch was present when checked.

The local expansion checkout has a different local commit ID, so identity was checked by content, not its branch label: its index.html Git blob SHA is `260752f7af457baac769785202cd63f921d85033` and curriculum.json is `1980cf0051717e1d2a1cc0757607defed31cf0c0`, matching the remote expansion commit. Files were copied into this task's isolated work/sqllab-qa directory before editing. The original checkout and live main were not changed.

Corrections are on `qa/sql-lab-release-review`, based on the exact expanded commit. The review PR targets the expansion branch so its diff contains QA fixes, rather than duplicating the whole 60-exercise expansion against main. Original PR #3 still needs separate owner approval. Neither PR should be merged or deployed without approval.

Final HTML SHA-256: `3502a0cf8978e0b62984d0d1db9ac270cc30ae1bcc5b09970cf745ba09fe0cb3`.

## Prioritized issue log

Severity: P0 prevents safe use or risks data loss; P1 materially incorrect grading; P2 broken learning, interaction or accessibility behaviour; P3 wording or minor clarity. No P0 found. All eight reproduced or directly observable issues below are fixed in the review copy.

### P1 — grading correctness

| ID | Evidence in expanded commit aa607b8 | Fix and verification |
| --- | --- | --- |
| QA-01 | Stable ID 40, **Find payments without logs** (path position 37): `SELECT txn_id,amount FROM transactions WHERE txn_id NOT IN(SELECT txn_id FROM logs) ORDER BY txn_id` earned **✓ Correct · 14 rows** in both browsers. Schema permits NULL log links; with one NULL in the list, this query incorrectly removes otherwise unlogged transactions. Existing six fixtures never tested that case. | Hidden fixture 6 adds one resolved, unlinked log. The practice result still matches; hidden grading rejects it. The correlated NOT EXISTS answer and LEFT JOIN alternative pass. Schema labels the optional link. See `seed`, index.html:337; baseline/final safety evidence. |
| QA-02 | Stable ID 20, **Prioritize the largest payments** (path position 10): `SELECT txn_id,amount FROM transactions ORDER BY amount DESC,txn_id DESC LIMIT 3` earned **✓ Correct · 3 rows** in both browsers, despite requiring ascending IDs for tied amounts. No existing fixture had a tie among the selected top three. | Fixture 6 gives two eligible top payments equal amounts. Descending IDs now fail. Reference, ROW_NUMBER alternative and CTE wrapper pass. This was independently discovered as extra mutant index 3; all 24 extra mutants now fail somewhere in the runtime fixture matrix. |

### P2 — learning and interaction

| ID | Evidence in expanded commit aa607b8 | Fix and verification |
| --- | --- | --- |
| QA-03 | Submit the same wrong ID-12 answer three times without clicking Another hint. Repeated-error guidance reaches level 2, and `updateSolutionGate` enables Show me. This contradicts the visible requirement for two requested hint stages. Reproduced in Chromium and WebKit. | Gate uses a separate hint-request count, reset when the draft changes. Repeated submissions alone keep Show me disabled. One unsuccessful attempt plus two requested hints unlocks it; assisted state persists. index.html:611. |
| QA-04 | Start a long inspection, then edit the inspection text. `busy` remains true and the old worker can populate results for SQL no longer shown in the inspection editor. | Editing inspection SQL terminates its in-flight worker, clears stale results and shows a rerun instruction. Both browsers verify cancellation. index.html:663. |
| QA-05 | ID 32, change `HAVING COUNT(*)>=5` to `>5`. Grading rejects it, but feedback says **Count all statuses per channel**, which misses the actual boundary error. New exercises mostly fall back to task hints rather than execution-specific coaching. | Result-specific rules address boundaries, nullable counts, zero-preserving joins, log fanout, NULL-sensitive absence, ranking/sequence and percentage denominators. Correct alternatives are accepted before structural rules run. Boundary feedback now directs the learner to equality. index.html:527. Rules are heuristic and do not claim complete SQL diagnosis. |
| QA-06 | Expand View your result after an error, then rerun the same query. The result is collapsed but `aria-expanded` remains `true`. Failed review also creates an empty result heading. | Every status transition resets disclosure state; failed review is named Query result. Repeated error transitions, Escape focus restoration and an axe WCAG scan pass in both browsers. index.html:619. |

### P3 — banking terminology and copy

| ID | Evidence in expanded commit aa607b8 | Fix and verification |
| --- | --- | --- |
| QA-07 | “Unresolved queue ages” derives age from payment date, but logs have no creation timestamp. “Posted and pending exposure” adds gross credits and debits, which is not net exposure. “Reconcile regional net movement” merely totals movement without comparing another source. | Renamed to unresolved payment ages, posted/pending activity and report regional net movement. Prompts distinguish gross addition from signed net movement; age tip states the missing queue-start timestamp. ID 55 explicitly retains NULL when a percentage denominator is zero. SQL answers remain unchanged. |
| QA-08 | Coach text says “letter exercise” and “equal-to exercise,” apparently from broad replacement of the word case. | Corrected to letter case and equality boundary. No detective theme appears in displayed exercise content. Legacy storage-key text remains solely for migration compatibility. |

## Verification performed on the corrected artifact

| Suite | Actual coverage and result |
| --- | --- |
| Independent answer matrix | **4,800 reference executions + 9,600 valid alternative executions = 14,400 independently checked results**, all passing. For each of 60 exercises: 4 variants × 7 runtime fixtures plus 12 separate datasets = 40 datasets × Chromium/WebKit. Every exercise has a separately written equivalent query and an additional CTE-wrapper equivalent. |
| Expected results | All 60 have independent JavaScript row calculations. Values are derived from source records using filters, grouped collections, arithmetic and sequence traversal, not from reference SQL or the grader. Output aliases and ordering contracts were also read against the prompts. Rounded percentages, empty aggregates and NULL sequence values are explicitly handled. |
| Wrong SQL | **84 mutation cases**: one for each of 60 exercises and 24 extra boundary/tie/NULL/fanout/denominator/window mutations. Every mistake is rejected by at least one actual runtime fixture in each engine; no survivors. Not every wrong query fails every dataset, because a mistake can be invisible without its boundary or tie. |
| Existing regression suite | **3,360 reference fixture executions**, 288 original-result hash comparisons and original SQL/column/order/starter contracts retained. 392 additional row-oracle comparisons pass. Frozen visible-result hardcodes fail hidden data for every exercise/variant/engine. Wrong columns, missing rows, extra/duplicate rows and required ordering are rejected. |
| Actual Worker/UI | 130 original flow records, 22 release checks and 36 safety checks pass. These are check records, with some intentional overlap, not 188 unique journeys. All 60 answers run through the actual Worker/grader offline in both engines. No page errors or external requests in the original full-flow suite. |

Independent datasets include empty accounts/transactions/logs, accounts with no activity, channels with exactly five and exactly two rows, exactly two failures, pending totals at the stated threshold, 0/499/500/999/1000/1001/2000/4000 amounts, all-equal amounts, all-zero posted value, same-date records, varying categories, multiple logs per payment and a NULL log link. Existing visible data and original hidden fixtures 0–2 are preserved.

The canonical query, two valid alternatives and wrong queries are executed against actual bundled SQLite. The independent row calculations provide expected values. Passing a reference query against itself is not counted as an independent answer check. The embedded SQLite library and stylesheet are unchanged.

## Curriculum and banking review

All 60 prompts, reference answers, starters, three-stage hints and terminology were read. The sequence moves through projection, filtering/sorting, DISTINCT/NULL, aggregates/HAVING, joins including zero-preserving and one-to-many joins, scalar/correlated subqueries, CASE, CTEs, ranking/LAG/rolling windows and combined operations reporting. Original 12 IDs remain stable while their learning positions are interleaved. Difficulty is gradual; late combined reporting tasks require several earlier skills. The first few short projection/filter tasks provide useful repetition; this is not 48 copies of the same filter.

The compact explanation/practice model is consistent with [SQLBolt's published lesson approach](https://sqlbolt.com/). The app goes beyond its introductory path for windows and operational reporting. This is an assessment of progression and UI pattern; no plagiarism or exhaustive text-similarity audit was performed.

Prompt checks include exact fields/aliases, tie policy, inclusive/exclusive boundaries, status scope, all-account versus participating-account denominators, NULL treatment and final versus window ordering. No incorrect reference answer was found in the tested contracts. Posted credits increase balance and posted debits reduce it, explicitly from the customer-account perspective used by the exercises. Gross values add debit and credit amounts without netting. Rates use the stated channel or bank-wide population. Queue age is not inferred from a log-creation field that does not exist.

These are fictional operations examples, not banking policy, ledger certification, prudential exposure measurement or advice. Whole AUD simplify arithmetic; no currencies, fees, reversals, decimals, time zones, late postings or double-entry ledger are modeled. “Failed” is a synthetic status, not a statement that a real payment must receive a particular operational treatment.

Coach checks cover syntax/unknown columns, output names, boundaries, NULL, zero activity, fanout, ordering, hint requests, explanation text, assisted marker, recent attempts and acceptance of equivalent formulations. Hints remain staged; solutions do not appear on opening Coach. Some third-stage hints necessarily name SQL clauses, especially in original exercises. The coach is a bounded rules engine, not a parser or conversational model. It can suggest a useful check without identifying every possible logical error.

## Mobile UX and accessibility

The independent suite recorded **32 layouts**: 4 representative exercises × widths **320, 375, 390 and 430** × 2 engines, at 720px height. The inherited suite adds **40 layout cases**, including desktop, landscape and simulated safe-area values. Some cases overlap; 72 is a count of recorded checks, not distinct device models. Full-page screenshots were generated for all 32 independent cases. Representative 320px advanced, 375px beginner, 390px final and 430px join screens were visually inspected.

| Area | Observation |
| --- | --- |
| Main task and spacing | Find/Show/Sort hierarchy stays readable. Data, Coach and saved-progress controls use disclosures. Run is directly below the editor with an **8px gap** in every independent case; no competing primary action is beside it. Advanced 320px tasks need vertical scrolling before Run, because the task is longer; it remains adjacent to the editor. |
| Typography and touch | Editor is **16px**. Visible buttons, summaries and selects are at least **44px high**; primary Run is 48px. Midnight Plum colours, solid in-flow header and existing safe-area CSS are retained. |
| Overflow and scrolling | No page-wide horizontal overflow at tested widths. Wide tables scroll within their own keyboard-focusable region. Source code/long SQL remains inside the editor or code block. A CSS 200% zoom probe passed page overflow checks; this is not iOS Dynamic Type testing. |
| Keyboard/focus | Ctrl+Enter runs the draft; Escape closes Coach and returns focus to SQL. Changing exercises focuses the title and resets scroll. The skip link targets the editor. Wide sample tables can receive keyboard focus. Result disclosure now reports its true state. |
| Feedback | Live status remains the primary feedback; result tables are secondary on failure. Correct answers expose a takeaway and Next. Errors use text, not colour alone. No solution is automatically pasted into the editor. |

An axe-core scan for WCAG 2 A/AA and WCAG 2.1 AA tags returned no violations in the tested failed-result/coach state in either engine. This is one automated scan state per engine, not accessibility certification. All current lesson term chips resolve to definitions.

## Reliability, persistence, security and static delivery

Cold downloaded-file startup and full SQL execution pass offline in Chromium and WebKit. The actual Worker checks the visible dataset plus **six hidden fixtures**. A five-second recursive-query timeout terminates the Worker; the next correct query succeeds. Inspection is ungraded and editing it cancels in-flight inspection. Execution rejects more than 2,000 result rows, SQL over 12,000 characters and cells over 100,000 characters; display tables show only their first 200 rows.

SQLite query_only and a SELECT/WITH entry restriction reject DELETE, WITH-wrapped writes and configuration PRAGMA. Multiple statements are rejected while a quoted semicolon remains valid. Extension loading is unavailable. A SQL value containing an image/onerror payload renders as inert text; the app uses textContent for result cells. No credentials, backend requests or remote AI service are required. This is an application safety review, not a penetration test or dependency supply-chain audit.

Legacy progress/draft/assisted migration, per-dataset drafts, reload persistence, invalid saved JSON, out-of-range saved indexes and storage-unavailable operation are tested. File/origin/browser changes may separate storage; it remains local. Hidden HTML details and embedded answers are educational UI gates, not anti-cheat protection against developer tools.

Build validation embeds curriculum.json without a runtime fetch. A local static-server suite and offline file suite both pass; a backend or installation is not needed. A hosted URL is not a guaranteed offline PWA. No service worker or hosted-cache promise was added. Midnight Plum CSS and embedded SQLite-source SHA-256 values match the expanded source exactly.

## Explicit limitations and remaining release checks

1. **No physical iPhone was tested.** Windows WebKit is not Safari/Chrome on iOS. Real software-keyboard resizing, safe-area/status-bar appearance, touch selection/caret handles, VoiceOver and Add to Home Screen launch remain untested. Safe areas were substituted in CSS; standalone Chromium emulation did not activate.
2. **Finite grading cannot prove arbitrary-data correctness.** The review fixes two demonstrated coincidental-match gaps and exercises 84 known mutation cases. A malicious or unanticipated query can still overfit finitely many fixtures. Equivalent results pass regardless of SQL form; conceptual use of a CTE/window is encouraged rather than enforced.
3. **Memory is bounded by the browser, not by an enforced per-worker quota.** Row/cell limits apply after SQLite computes values. Very large allocations could exhaust memory before the five-second timer or post-computation size check; browser-process OOM was not deliberately induced. Offline data is tiny and synthetic.
4. **Accessibility/device coverage is limited.** Automated scans, desktop keyboard probes and screenshots do not establish screen-reader quality or physical touch usability. Very large accessibility font settings, old browsers and device-specific storage eviction were not exhaustively tested.
5. **No production deployment or merge validation occurred.** Static local serving was tested, and main's SHA remained unchanged. Hosted first-visit network access, existing host CSP changes and post-merge Pages deployment must be checked only after owner approval.

The in-app browser refused a file:// preview under its URL policy. That user-facing preview was not bypassed. Application testing used the existing installed development-test browsers; visual review used their saved screenshots. No physical-device claim is inferred from that testing.

## Reproduce

After installing the locked development dependencies and Playwright browsers:

```sh
npm ci
npx playwright install chromium webkit
npm run build
npm test
npm run test:release
npm run test:safety
```

For the optional axe scan, set AXE_MODULE to an installed axe-core/axe.min.js path before running test:release. In this review it was explicitly supplied and both scans ran. PLAYWRIGHT_MODULE and PLAYWRIGHT_BROWSERS_PATH can point to existing installed test dependencies/browsers; that is how this Windows review reused the earlier task's installation. Test files and exact scripts are included in the source bundle/PR.

Evidence files: verification.json (original regression), release-verification.json (independent matrix, mutants, UI, geometry), release-safety.json (resource, persistence and security checks), release-baseline-safety.json (before-fix grading/gate reproductions), and release-baseline.json (initial independent matrix and UI defects). Test-only storage and output records are synthetic. Generated screenshots are not added to the repository by default.

## All-exercise audit ledger

Every row below passed **80 independent reference checks and 160 alternative checks** (40 datasets × two engines), plus its deliberately wrong query was rejected on at least one runtime fixture per engine. Original IDs 0–11 additionally retain their baseline contracts and original result hashes. “Pass” means the tested prompt/result contract, not a proof over arbitrary data.

| Learning position | Stable ID | Exercise | Result |
| --- | --- | --- | --- |
| 1 | 12 | Read the account register | Pass |
| 2 | 13 | Return payment amounts | Pass |
| 3 | 14 | Filter the active register | Pass |
| 4 | 0 | Find the failed payments | Pass |
| 5 | 15 | Include a threshold | Pass |
| 6 | 16 | Combine alternatives | Pass |
| 7 | 17 | Select a closed interval | Pass |
| 8 | 18 | Read a date interval | Pass |
| 9 | 19 | Find a name prefix | Pass |
| 10 | 20 | Prioritize the largest payments | Pass |
| 11 | 21 | Read the second page | Pass |
| 12 | 1 | Review large posted payments | Pass |
| 13 | 22 | List service regions | Pass |
| 14 | 23 | List channel combinations | Pass |
| 15 | 2 | Find unresolved work | Pass |
| 16 | 24 | Review completed work | Pass |
| 17 | 25 | Label missing resolution dates | Pass |
| 18 | 26 | Count all payments | Pass |
| 19 | 27 | Count resolved dates | Pass |
| 20 | 28 | Summarize posted amounts | Pass |
| 21 | 3 | Count the payment queue | Pass |
| 22 | 29 | Compare average payment sizes | Pass |
| 23 | 30 | Measure regional coverage | Pass |
| 24 | 31 | Build a channel queue matrix | Pass |
| 25 | 4 | Build a daily debit report | Pass |
| 26 | 32 | Filter busy channels | Pass |
| 27 | 7 | Find repeat failures | Pass |
| 28 | 33 | Attach regions to payments | Pass |
| 29 | 5 | Put a name to a failed payment | Pass |
| 30 | 34 | Count activity including zero | Pass |
| 31 | 35 | Count posted activity including zero | Pass |
| 32 | 6 | Find accounts with no activity | Pass |
| 33 | 36 | Route unresolved payment work | Pass |
| 34 | 37 | Avoid duplicate payment counts | Pass |
| 35 | 38 | Find above-average payments | Pass |
| 36 | 39 | Find accounts with failures | Pass |
| 37 | 40 | Find payments without logs | Pass |
| 38 | 41 | Compare within each account | Pass |
| 39 | 42 | Band payment amounts | Pass |
| 40 | 43 | Sign posted movements | Pass |
| 41 | 44 | Pivot status counts | Pass |
| 42 | 45 | Report channel failure rates | Pass |
| 43 | 46 | Build daily posted totals | Pass |
| 44 | 8 | Escalate large pending totals | Pass |
| 45 | 47 | Compare posted and pending activity | Pass |
| 46 | 48 | Find above-average account throughput | Pass |
| 47 | 49 | Number payments per account | Pass |
| 48 | 50 | Rank tied payment amounts | Pass |
| 49 | 11 | Find the latest payment per account | Pass |
| 50 | 51 | Keep the two newest payments | Pass |
| 51 | 52 | Compare the previous amount | Pass |
| 52 | 53 | Measure days between payments | Pass |
| 53 | 54 | Calculate a three-payment average | Pass |
| 54 | 10 | Track cumulative posted movement | Pass |
| 55 | 55 | Measure channel share of posted value | Pass |
| 56 | 56 | Measure unresolved payment ages | Pass |
| 57 | 57 | Report regional net movement | Pass |
| 58 | 9 | Spot the balance mismatch | Pass |
| 59 | 58 | Quantify every balance variance | Pass |
| 60 | 59 | Return every regional debit peak | Pass |
