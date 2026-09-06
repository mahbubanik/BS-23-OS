# Tomorrow: exact usage instructions

1. On your private phone or laptop, open `app/index.html`. For a cloud URL, push the folder, set **Settings → Pages → Source** to **GitHub Actions**, let `Deploy ICP MVP` complete, then open its `/app/` URL. Use a private repository only if your GitHub plan supports private Pages; GitHub Free Pages is public-repository only. Otherwise use an approved company static host or open it locally for day one.
2. In **ICP**, either enter today’s meaningful requirements or tap **Use BS23 starting ICP**. The preset comes from the existing campaign’s European beauty/distribution focus. It is editable; remove criteria that do not apply before saving.
3. Tap **Find companies**. In search, open normal company sites, product pages, careers pages, newsrooms, and annual reports. Do not copy search snippets as evidence without opening the source.
4. For each promising company, use **Research**. Enter what you can verify. Add an evidence row for each important claim. Use `FACT` only with a direct URL; choose `INFERENCE` for your hypothesis and `UNKNOWN` where information is absent.
5. Tap **Score & save**. Read the reason line-by-line. A 65+ score is a priority to research/contact, not permission to make unsupported claims.
6. For each qualified account, use the displayed next action. First try to find one actual operational trigger or pain and the relevant Operations/Finance role.
7. At day end, tap **Export accounts** and store the file in your private Drive. Do not put confidential notes into the public-research MVP.

Start with five accounts. Improve the ICP after reviewing whether the score actually separated promising accounts from noise.

## Existing campaign starting queue

If you want to begin from the existing campaign archive, run `node tools/build-campaign-account-preview.mjs`, then `node tools/build-campaign-research-queue.mjs`. The generated queue contains only company-level research prompts; it deliberately does not import personal contact details, old email copy, or unsourced campaign claims. Research five queue items in the ICP app before syncing any qualified account to Notion.
