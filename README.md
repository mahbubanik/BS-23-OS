# Brain Station 23 Sales OS

Phone-first, evidence-led sales operations for BS23 Odoo ERP work.

## Online sales desk

The public GitHub Pages app is available at https://mahbubanik.github.io/BS-23-OS/.

It contains a phone-first desk with working browser-local workflows for:

- Account research evidence capture and deterministic qualification
- Meeting note analysis
- Deal health and next-best-action checks
- Daily priority planning and activity capture
- Evidence-led communication briefs
- Exportable browser-local account memory

The Pages app never contains Notion credentials, Gemini credentials, vault content, client notes, or raw confidential data. Browser records remain on the device until exported.

## Secure cloud agents

server/worker.mjs is a Cloudflare Worker service ready to expose the agent registry, routing, research, meeting analysis, deal evaluation, daily planning, and Gemini-backed communication through a private authenticated API. The Pages app asks for the service URL and an access token only in the current browser session.

Deploy it only after adding SALES_OS_ACCESS_TOKEN and GEMINI_API_KEY as Worker secrets. The secret setup and deployment steps are in docs/ONLINE_AGENT_SERVICE.md. Do not put a secret in a Pages configuration file, browser local storage, Git, or Notion.

## Validation

Run these from the project root:

    node --test tests/*.test.mjs
    node tools/verify-sales-brain.mjs
    node tools/build-site.mjs
