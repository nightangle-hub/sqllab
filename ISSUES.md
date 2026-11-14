# SQL Lab release issue log

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
