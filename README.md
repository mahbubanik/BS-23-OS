# Brain Station 23 Sales OS

Phone-first, evidence-led sales research for BS23 Odoo ERP work.

## Tomorrow MVP

The `app/` directory is a static browser app. It requires no account, API key, server, or LLM to score and save researched accounts. Data stays in the browser until you export it. That makes it safe to use immediately, but it is not a shared team database yet.

1. Open `app/index.html` in Chrome/Edge, or serve the repository with any static-file host.
2. Define the ICP on the first screen; it is saved in this browser.
3. Use **Find companies** to open a search, research a company in a normal browser tab, then record only sourced facts in the research form.
4. Add evidence URLs and mark every statement as Fact, Inference, or Unknown.
5. Press **Score & save**. The result tells you why it qualified and what to do next.
6. Use **Export accounts** at the end of the day as your backup/import file.

For a cloud URL, push this folder to a private repository, set **Settings → Pages → Source** to **GitHub Actions**, and use the included deployment workflow. GitHub Pages on GitHub Free is available only from public repositories; private-repository Pages requires an eligible paid GitHub plan. Open the deployed `/app/` path. The static UI contains no secrets and saved records remain in the user's browser, but do not use a public site on a shared device or for client-sensitive notes.

## Quality boundary

The browser does not claim to discover facts automatically. Search results and public webpages are evidence sources; the user records the claim, URL, and confidence. The deterministic scorer then makes the qualification reproducible. Future server-side integrations belong behind `integrations/`, never in browser JavaScript.

See `docs/17_TOMORROW_MVP.md` for the exact first-day workflow.
