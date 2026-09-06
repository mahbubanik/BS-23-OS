# Integrations

`notion-account-sync.mjs` is a server-side adapter for a Phase-1 public-research package. It creates an Accounts page, creates its Evidence pages, and links them. It sends only mapped public-research fields and evidence; it deliberately excludes free-form notes.

Run it only from a trusted server or private workstation session with environment variables loaded. Do not import it from `app/`, and do not add browser credentials, direct client-side API calls, or raw client-sensitive data forwarding.

It accepts either one account JSON object or the browser’s exported package. For a package with multiple accounts, pass the exact company name as the second argument so a bulk export cannot be synced by accident.

For a local private setup, it reads the Git-ignored `.env`. Run `node tools/verify-notion-connection.mjs` before the first sync; it reports only connection state and data-source titles, never credentials.

`seed-bs23-odoo-knowledge.mjs` creates four idempotent, **Internal** records in the private Odoo Knowledge source. It uses only the curated summaries in `config/bs23-erp-knowledge.json`; it never uploads the source vault documents. Run it from the project root with `node integrations/seed-bs23-odoo-knowledge.mjs`.
