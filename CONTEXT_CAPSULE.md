# Brain Station 23 Sales OS (Context Capsule)

Updated: 2026-09-07

Use this file as the starting context for any new session. It is intentionally free of tokens, mailbox credentials, contact PII, and raw confidential documents.

---

## 1. Objective

Build a personal, evidence-led AI Sales Operating System for Brain Station 23 / ERP23 Odoo sales. The system maximizes daily BDO sales efficiency: instant proof-grounded communication generation, on-demand prospect research, segment GTM playbooks, automated meeting intelligence, deal health tracking, and daily activity management.

---

## 2. Repository & Workspaces

- Local implementation: `C:\Users\HP\Desktop\Claude\Instantly_Campaign\brainstation23-sales-os`
- GitHub remote: `https://github.com/mahbubanik/BS-23-OS.git`
- Remote branch: `main`
- Local branch: `master` tracks `origin/main` (push via `git push origin HEAD:main`)
- Vault workspace copy: `C:\Users\HP\Desktop\Claude\Vaults\BrainStation23-Vault\brainstation23-sales-os`
- Primary source of truth: `C:\Users\HP\Desktop\Claude\Vaults\BrainStation23-Vault`
- Deliverables location: `C:\Users\HP\Desktop\Claude\Vaults\BrainStation23-Vault\50-deliverables\`

Rules:
- Do not commit `.env`, `dist/`, or `local-output/`.
- Never use em dashes anywhere in code, configuration, or documentation.

---

## 3. Authority Order

1. **Primary: BrainStation23 Vault** (authoritative business context, client notes, approved positioning, and internal truth).
2. **Secondary: `Instantly_Campaign\brainstation23-sales-os`** (implementation, schemas, agents, CLI tools, tests, and deployment configuration mirrored to GitHub).
3. **Operational: Private Notion Sales Brain** (structured working records created from reviewed evidence, qualified accounts, active opportunities, and approved vault knowledge).

When sources conflict, consult the primary vault first. Never overwrite vault truth from an unreviewed campaign row or generated draft.

---

## 4. Current Implementation

### Knowledge & Grounding Layer
- `config/bs23-erp-knowledge.json`: 30 Odoo client summaries extracted from vault notes, mapped by industry verticals, complexity patterns (SAP migrations, legacy ERP replacements, multi-country deployments, VAT engines), and guardrail rules.
- `config/bs23-company-knowledge.json`: Identity, credibility stack with caveats, 8 SBUs, 3 commercial models, ERP23 credentials, and voice guidelines.
- `config/bs23-grounded-icps.json`: 4 evidence-backed ICP definitions (Distribution, Retail/SAP Migration, Manufacturing/FMCG, Banking/Regulated).
- `config/icp-scoring.json`: 9-criteria deterministic scoring engine (qualified threshold: 65, review threshold: 40).

### Intelligence & Production Tools
- `integrations/gemini-client.mjs`: Native fetch client adapter for `gemini-3.6-flash`, using `GEMINI_API_KEY` from `.env`.
- `tools/build-communication-draft.mjs`: Context assembler and fast draft generator for cold emails, follow-ups, pitches, and proposals with `--gemini` support.
- `tools/build-segment-gtm.mjs`: Generates vertical GTM playbooks with target profiles, top module usage, messaging frameworks, and discovery questions.
- `tools/research-company.mjs`: On-demand research engine for any prospect company, tracking FACT, INFERENCE, and UNKNOWNs.

### Daily Sales Operations
- `tools/analyze-meeting-notes.mjs`: Parses meeting notes or transcripts into pains, requirements, stakeholders, detected systems, commitments, and next actions (with `--llm` support).
- `tools/evaluate-deal.mjs`: Assesses opportunity completeness, calculates health score (0-100), detects deal risks, and provides Next Best Action.
- `tools/daily-operator.mjs`: Morning priority planner, shorthand activity note parser, and end-of-day reporting.
- `tools/create-opportunity.mjs`: Creates structured deals in Notion linked to Accounts.
- `tools/route-sales-request.mjs`: Intent router for natural language agent dispatching.

### Web Interface & GitHub Pages
- Phone-first web interface in `app/`.
- Build tool `tools/build-site.mjs` bundles public app assets into `dist/` with a root redirect, strictly excluding internal knowledge configs.
- GitHub Actions deployment in `.github/workflows/deploy-pages.yml` with `enablement: true`.

---

## 5. Notion Sales Brain State

Parent page: `https://app.notion.com/p/BS23-Sales-OS-3d3710b8d378802395cbdeebfb895d8f`

10 live and verified databases:
1. **Knowledge:** 9 seeded records (identity, credibility stack, SBUs, engagement models, voice guide, case study formats).
2. **Odoo Knowledge:** 28 seeded records (real client implementation summaries).
3. **ICP Definitions:** 4 seeded records (Wholesale, Retail/SAP, Manufacturing, Banking).
4. **Accounts:** Live with first qualified account (AromaWest MB, score 80).
5. **Research Evidence:** Live with 3 URL-backed verified facts linked to AromaWest MB.
6. **Opportunities:** Live with active deal (AromaWest MB Odoo Wholesale ERP).
7. **Contacts:** Ready for reviewed stakeholder additions.
8. **Meetings:** Ready for meeting prep and capture sync.
9. **Activities:** Ready for daily operator sync.
10. **Tasks:** Ready for follow-up task tracking.

---

## 6. Formal Deliverables

- Personal 6-Month GTM Plan & Sector Playbooks (Sep 2026 - Feb 2027):  
  `Vaults\BrainStation23-Vault\50-deliverables\BDO-6-Month-GTM-Strategy-2026-09\BDO-6-Month-GTM-Plan.md`

---

## 7. Current Quality & Validation State

- **Unit Tests:** 39 tests passing across 17 test suites (`node --test tests/*.test.mjs`).
- **Site Build:** Verified clean via `node tools/build-site.mjs`.
- **Git State:** Committed and pushed to `main` on GitHub remote `mahbubanik/BS-23-OS`.

---

## 8. Validation Commands

Run from project root:
```powershell
node --test tests/*.test.mjs
node tools/verify-sales-brain.mjs
node tools/build-site.mjs
```
