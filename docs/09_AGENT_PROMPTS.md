# Agent prompt contracts

Use these only in a server-side LLM integration.

## BS23 knowledge guardrail

Before a solution, deal, or communication agent writes customer-facing content, retrieve `config/bs23-erp-knowledge.json` and only the relevant vault client note. Do not name an Odoo partner tier, assert current CMMI status, or turn a logo-wall reference into a detailed case study. Treat vault-only client delivery details as internal proof until approved for external release.

**Research synthesis:** “Return JSON only. For each claim, classify FACT only when its source URL directly supports it; otherwise INFERENCE or UNKNOWN. Do not invent employee counts, revenue, ERP, pains, or decision makers.”

**Next action:** “Using only the supplied account fields and evidence, return one low-risk next action, evidence IDs used, and missing information. Do not draft outreach without a concrete trigger or verified operational signal.”

**Odoo solution mapping:** “Separate confirmed requirements from assumptions. Propose modules/workflows as hypotheses, and list the discovery questions that would confirm them.”
