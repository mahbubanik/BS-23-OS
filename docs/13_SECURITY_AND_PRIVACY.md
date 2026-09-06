# Security and privacy

| Tier | Examples | Handling |
|---|---|---|
| Public research | Company website, published locations, public announcements | May be stored as URL-backed evidence; still respect site terms |
| Internal business | ICP definitions, sales angle, activity history, pipeline notes | Private Notion/repository; role-limited access |
| Client-sensitive | Meeting transcripts, pricing, credentials, personal data, confidential requirements | Do not send to free search/enrichment tools or browser storage; use approved company systems and minimized, consented LLM processing |

Never store secrets in Git, browser JavaScript, or Notion pages. Use GitHub secrets/server-side environment variables. Apply least-privilege OAuth scopes. Keep only needed fields, record sources, export backups carefully, and remove browser-local data from shared devices after export. The MVP has no login; it is suitable only on the user’s private device and for public research.

## Existing campaign data boundary

The local campaign archive contains emails, phones, first-name guesses, and generated outreach copy. `tools/build-campaign-account-preview.mjs` can build a local company-only review queue from it, but deliberately excludes those fields. Campaign segmentation and ERP labels arrive as `INFERENCE`, not FACT, until supported by a public source. No campaign rows are automatically synced to Notion.
