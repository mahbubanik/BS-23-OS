# Test plan

Run `node tests/icp-scenarios.test.mjs` and `node --check app/app.js` before publishing.

| Scenario | Expected |
|---|---|
| Missing research fields | No invented score points; next action requests evidence |
| Conflicting sources | Store two evidence rows; mark uncertainty, do not resolve by assertion |
| Duplicate company | Future sync deduplicates by normalized website, then name+country; Phase 1 user reviews export |
| Bad search result | Score remains low without evidence |
| Unknown ERP | “Unknown” stays unknown, not assumed legacy/Odoo |
| Small company / huge enterprise | Match only if selected ICP size matches |
| Strong Odoo fit | Qualifies only with matched criteria plus sourced facts |
| Weak Odoo fit | Review/not-a-fit, with a factual missing-data action |

Manual check: open `app/index.html` at a narrow 390px viewport, save an ICP, add at least one FACT with URL, score an account, refresh, and export.

