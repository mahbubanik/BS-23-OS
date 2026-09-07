# Online Agent Service

## Why this is separate from GitHub Pages

GitHub Pages is static hosting. It can run browser-local workflows, but it cannot safely execute Node tools, keep a Gemini key secret, or access private Notion records. The Worker is the private action boundary. Pages is the phone-first user interface.

## What is ready

server/worker.mjs exposes these authenticated endpoints:

| Endpoint | Agent |
| --- | --- |
| GET /health | Service health and agent list |
| POST /v1/agents | Agent registry |
| POST /v1/route | Intent router |
| POST /v1/research | Account intelligence |
| POST /v1/meeting-analysis | Meeting copilot |
| POST /v1/deal-evaluation | Deal strategist |
| POST /v1/daily-plan | Daily operator |
| POST /v1/communication | Gemini-backed communication |

All endpoints require an Authorization header with the private access token.

## One-time deployment

1. Create or sign in to a Cloudflare account.
2. In a terminal at server/, run npx wrangler login.
3. Run npx wrangler secret put SALES_OS_ACCESS_TOKEN and use a long random value.
4. Run npx wrangler secret put GEMINI_API_KEY and paste the existing Gemini API key.
5. Run npx wrangler deploy.
6. Copy the Worker URL shown by Wrangler.
7. Open the GitHub Pages Sales OS desk. Expand Secure agent service, enter that URL and the access token, then choose Connect.

The access token is held in browser session storage, so closing the browser clears it. The URL is not secret and is retained only for convenience.

## Security boundary

- Never copy .env into server/.
- Never commit server/.dev.vars.
- Do not add internal vault knowledge to app/, dist/, or the Pages workflow.
- Do not process client-confidential meeting notes with the Gemini endpoint unless approved by Brain Station 23 policy.
- The service accepts requests only from the configured Pages origin. Update ALLOWED_ORIGIN in server/wrangler.toml if the Pages domain changes.

## Current scope

The Worker enables private online agent calls and Gemini communication. It deliberately does not expose the private Notion Sales Brain or vault knowledge to the public website. A next secure integration phase can add server-side Notion read and qualified-account sync after a user authentication layer is selected.
