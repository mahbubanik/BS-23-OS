# API and environment setup

| Dependency | Purpose | Free / limit position | Auth | Called | Data sent | Fallback |
|---|---|---|---|---|---|---|
| Notion API | Shared sales brain | Notion workspace plan determines access; API needs an integration token | Internal integration bearer token | Explicit save/sync | Selected account fields and evidence | JSON export / manual Notion entry |
| GitHub + Actions | Code, static hosting, scheduled jobs | Check current plan/billing before enabling private-repo automation | GitHub account; Actions secrets | Deploy or scheduled job | Code and explicitly selected job payload | Run locally/manual |
| GitHub Pages | Serve static UI | GitHub Free supports Pages on public repos; private-repo Pages needs an eligible paid plan | GitHub repo access | Deploy | Static app only | Local browser/company-approved static host |
| Microsoft Outlook Calendar | Meeting context | Microsoft 365 / Graph policy applies | Approved Outlook connector or Microsoft Graph OAuth | User-approved meeting prep | Calendar event metadata | Manual capture |
| Microsoft Outlook Mail | Draft/send and reply context | Microsoft 365 / Graph policy applies | Approved Outlook connector or Microsoft Graph OAuth | Draft by default; sending requires explicit approval | Minimal draft/thread metadata | Outlook UI |
| Brave Search API | Optional legitimate public discovery | Pricing/free allocation changes; verify before enabling | API key | Search query | Public ICP query only | Normal web search |
| LLM API | Later synthesis/writing | Usage billed by model and tokens | Server-side API key | Only on selected evidence | Minimal redacted context | Deterministic template/manual |

## Credential checklist

1. **Notion:** create an internal integration in Notion’s integrations area with **Read content** and **Insert content** capabilities. Share the Accounts and Research Evidence data sources with it, copy their data-source IDs, and set `NOTION_TOKEN`, `NOTION_ACCOUNTS_DATA_SOURCE_ID`, and `NOTION_EVIDENCE_DATA_SOURCE_ID` only in a trusted server/runner environment—not the browser. `integrations/notion-account-sync.mjs` syncs public research only and intentionally excludes free-form notes.
2. **Microsoft 365:** use the already connected Outlook integration for calendar reads and email drafts. If a standalone hosted workflow is later required, register a Microsoft Entra application, configure redirect URIs and delegated Graph permissions, then store `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, and `MICROSOFT_CLIENT_SECRET` only in server-side secrets.
3. **Search:** create a Brave Search API account only when manual search limits throughput; put its key in server-side secrets.
4. **GitHub:** create a **private** repository; add all `.env.example` names as repository secrets only after a workflow needs them.

Official references: [Notion API introduction](https://developers.notion.com/reference/intro), [GitHub Actions](https://docs.github.com/en/actions), [GitHub Pages](https://docs.github.com/en/pages), [Microsoft Graph overview](https://learn.microsoft.com/graph/overview), [Microsoft Graph permissions reference](https://learn.microsoft.com/graph/permissions-reference), [Brave Search API](https://brave.com/search/api/). Free-tier amounts are intentionally not hard-coded because provider terms and plans change; confirm them at setup.
