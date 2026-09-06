# Automations

Do not automate Phase 1. The safe sequence:

1. **Daily task digest**: GitHub Action/serverless job queries only due/overdue Notion tasks and creates one private Outlook draft or summary.
2. **Meeting prep**: Outlook Calendar webhook or daily pull finds next 24-hour meetings, retrieves only linked Account/Opportunity fields, creates a draft prep note.
3. **Meeting capture**: Human submits notes; workflow extracts confirmed needs, assumptions, commitments, and tasks for approval.
4. **Weekly coach**: Queries aggregate activities/opportunity changes; produces actionable patterns, never raw customer content to unnecessary providers.

Use GitHub Actions only for scheduled, low-frequency, secret-backed tasks. Avoid Actions for user-interactive OAuth or real-time webhooks.

Microsoft 365 is the chosen collaboration layer. The connected Outlook Calendar can be read for meeting preparation; any email is a draft first and must be approved before sending. Do not copy mailbox content into Notion or an LLM unless the user selects the minimal relevant excerpt.
