# Decisions

| Decision | Reason | Consequence |
|---|---|---|
| Static phone-first MVP | Usable tomorrow with no credentials or hosting dependency | Records are browser-local until export/Notion sync is enabled |
| Deterministic scoring before AI | Reproducible, free, explainable qualification | LLM enriches only after a human has selected relevant sources |
| Evidence ledger with FACT / INFERENCE / UNKNOWN | Prevents research guesses being represented as facts | FACT requires a source URL in practice |
| Notion is the future shared brain, not the MVP runtime | Notion needs a scoped integration and database IDs | Keep browser secrets-free; server-side sync comes next |
| GitHub Pages only for static UI | Near-zero-maintenance cloud delivery | Never publish sensitive account data in a public Pages repository |
| No background research agent in Phase 1 | Legitimate public evidence needs review; search APIs have keys/costs | Semi-automatic research is the correct reliability baseline |
| Notion sync begins with Accounts and Research Evidence only | This creates a real shared record without prematurely moving contact or meeting data | The server-side adapter excludes free-form notes and client-sensitive material |
| Meeting capture remains out of browser-local storage | Notes can contain personal and client-sensitive information | Enable it only after scoped Notion access and an approved storage boundary exist |
| BS23 vault master context is the commercial source of truth | Campaign copy contains stale or conflicting partner-tier and proof claims | Agent retrieval uses a compact ERP knowledge policy plus a directly relevant client note |
