# Decisions

## Authority order

- The BrainStation23 Vault is the primary source of truth for business context, client notes, approved claims, and internal knowledge.
- `Instantly_Campaign\brainstation23-sales-os` is the secondary implementation workspace and GitHub mirror.
- Private Notion is the operational structured layer; it must not override the vault without explicit review.

| Decision | Reason | Consequence |
|---|---|---|
| Static phone-first MVP | Usable tomorrow with no credentials or hosting dependency | Records are browser-local until export/Notion sync is enabled |
| Deterministic scoring before AI | Reproducible, free, explainable qualification | LLM enriches only after a human has selected relevant sources |
| Evidence ledger with FACT / INFERENCE / UNKNOWN | Prevents research guesses being represented as facts | FACT requires a source URL in practice |
| Notion is the operational shared brain | Notion provides structured databases for CRM, knowledge, and pipeline | Server-side sync protects tokens and enforces qualified-only gates |
| Sales efficiency over batch list scraping | BDO daily bottleneck is content assembly, research, and meeting prep | Focus tools on fast communication, on-demand research, and daily workflow |
| Full vault client extraction (30 Odoo clients) | 3 proof points were insufficient for cross-industry sales | All 30 Odoo client notes structured with industry, solution, and complexity |
| Gemini API with native fetch | Zero npm dependencies and high-speed LLM enrichment | Configured for gemini-3.6-flash using GEMINI_API_KEY from .env |
| Strict exclusion of internal knowledge from web dist | Protects proprietary BS23 client notes and internal strategy | tools/build-site.mjs stages only public ICP configs into dist/ |
| Personal 6-month GTM strategy in Vault deliverables | Complies with Vault deliverables filing convention | Stored permanently in 50-deliverables/BDO-6-Month-GTM-Strategy-2026-09/ |
| Meeting capture remains out of browser-local storage | Notes contain personal and client-sensitive information | Processed via CLI/server tools with optional LLM enrichment |
| BS23 vault master context is the commercial source of truth | Campaign copy contains stale or conflicting partner-tier and proof claims | Agent retrieval uses a compact ERP knowledge policy plus a directly relevant client note |
