# Brain Station 23 Sales OS — Context Capsule

Updated: 2026-09-06

Use this file as the starting context for a new chat. It is intentionally free of tokens, mailbox content, meeting credentials, contact PII, and raw vault documents.

## Objective

Build a phone-first, evidence-led sales operating system for Brain Station 23 / ERP23 Odoo sales. The working order is: ICP research → evidence and scoring → meeting preparation → Odoo solution mapping → deal strategy → approved communication → daily operation → coaching.

## Repository

- Local project: `C:\Users\HP\Desktop\Claude\Instantly_Campaign\brainstation23-sales-os`
- GitHub remote: `https://github.com/mahbubanik/BS-23-OS.git`
- Remote branch: `main`
- Latest published commit: `698a438`
- Local branch is named `master` but tracks `origin/main`; push with `git push origin HEAD:main`.
- Do not commit `.env`, `dist/`, or `local-output/`.

## Current implementation

- Phone-first static ICP app in `app/`.
- Deterministic configurable scoring in `config/icp-scoring.json`.
- BS23 starting ICP in `config/bs23-campaign-icp.json`.
- Agent registry and intent router in `agents/registry.json` and `tools/route-sales-request.mjs`.
- Structured agent output contract in `schemas/agent-output.schema.json`.
- Notion server-side public-research sync in `integrations/notion-account-sync.mjs`.
- Account sync is duplicate-safe and rejects anything except `qualified`.
- Curated ERP23 knowledge seed in `integrations/seed-bs23-odoo-knowledge.mjs`.
- Outlook event minimization in `tools/prepare-meeting-context.mjs`.
- Deterministic meeting prep in `tools/build-meeting-prep-draft.mjs`.
- GitHub Pages workflow is manual only; it uses Node 24 and `configure-pages@v6`.

## Notion state

The private Notion parent page is user-approved and already contains ten data sources:

Accounts, Research Evidence, Contacts, Opportunities, Meetings, Activities, Tasks, ICP Definitions, Knowledge, and Odoo Knowledge.

The local `.env` contains the Notion token and data-source IDs. Never print or copy those values into chat, Git, browser code, or this capsule.

Four internal-only ERP23 summaries have been seeded into Odoo Knowledge. They retain an external-release approval warning.

## Microsoft 365 state

Microsoft 365 is the chosen collaboration layer. The connected Outlook Calendar was verified read-only. Outlook Mail is draft-only by policy; never auto-send. Raw Outlook event responses must pass through `prepare-meeting-context.mjs` before any agent sees them.

Do not inspect or synchronize mailbox content unless the user explicitly selects the relevant message or event.

## Source material

Authoritative BS23 source vault:

`C:\Users\HP\Desktop\Claude\Vaults\BrainStation23-Vault`

Primary context file:

`50-deliverables\claude-knowledge-architecture\BS23-Master-Context.md`

Curated guardrail:

`config/bs23-erp-knowledge.json`

Use the vault for internal truth, but label facts as internal until external release is approved. Do not claim an Odoo partner tier, current CMMI status, exact conflicting business metrics, or undocumented client case-study details.

## Campaign data boundary

The parent workspace contains campaign archives with emails, phones, names, and outreach copy. The Sales OS only creates company-level review previews and queues by default. Campaign ERP labels and segmentation are `INFERENCE`, not `FACT`, until supported by public evidence. Do not bulk-import campaign contacts into Notion.

## Current quality state

- All implemented tests pass.
- The first five public research drafts are local only.
- They are not qualified yet because ERP/system, operational pain, and buying triggers remain unknown.
- Therefore no unreviewed campaign or research records have been synced as sales-ready Accounts.

## Recommended next phase

1. Select one Outlook meeting and one reviewed Notion Account.
2. Run the minimized meeting context through the deterministic meeting-prep generator.
3. Add an approval step for confirmed meeting needs, commitments, and tasks.
4. Research the next queue accounts only with public sources.
5. Sync an Account only after the ICP app marks it `qualified`.
6. Add Outlook draft creation only after the draft approval flow is tested.

## Useful validation

From the project folder:

```text
node --test tests/*.test.mjs
node tools/build-site.mjs
node tools/verify-sales-brain.mjs
```

## New-chat instruction

Read this capsule first, inspect the live repository and current Git state, preserve the evidence and privacy boundaries, then continue from the recommended next phase. Do not restart the architecture or expose credentials.
