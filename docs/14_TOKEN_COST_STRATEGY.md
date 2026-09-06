# Token and cost strategy

| Route | Use | Cost control |
|---|---|---|
| No LLM | ICP matching, score, duplicate website/name check, statuses, retrieval, exports | Phase-1 default; $0 |
| Cheap LLM | Normalize a selected page excerpt, classify a short note, draft an internal summary | JSON output, one account at a time, cache by URL/content hash |
| Strong LLM | Complex solution mapping, multi-stakeholder deal strategy, final customer-facing draft | Invoke only after enough verified evidence exists; pass selected fields, not database dumps |

Personal light-use target: $0 for Phase 1; small, controllable usage for later calls because requests are incremental and cached. Enforce per-run record limits, reject duplicated URL hashes, and only re-research after a defined freshness window or new trigger. Costs cannot be estimated credibly until a model, region, and current price are selected; use the provider’s current pricing page at enablement.

