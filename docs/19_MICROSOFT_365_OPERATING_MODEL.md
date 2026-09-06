# Microsoft 365 operating model

The Sales OS uses Microsoft 365, not Google Workspace.

## Default operating boundaries

- **Outlook Calendar:** read upcoming events only for meeting preparation. The user chooses which event is linked to an Account or Opportunity.
- **Outlook Mail:** create a draft only. Never send or reply automatically.
- **Notion:** receive only the selected meeting facts, approved tasks, and approved account evidence. It does not receive an entire mailbox or calendar.
- **Agents:** receive the smallest relevant context and return facts, inferences, unknowns, and recommended actions separately.

## Connected connector path

The approved Outlook connector is the preferred path for interactive work. It avoids storing a second OAuth credential in this repository. A standalone Microsoft Graph application is needed only for a future hosted or scheduled workflow, and its credentials must be stored as deployment secrets rather than in this project.

## First meeting-prep workflow

1. Choose the upcoming Outlook event.
2. Select the related Notion Account and, when relevant, Opportunity.
3. Retrieve only source-backed public research, deal stage, last approved activity, and safe Odoo knowledge.
4. Create a concise prep draft with objectives, hypotheses, discovery questions, and next-step options.
5. After the meeting, the user approves which confirmed facts, tasks, and commitments are written to Notion.

No email sending, calendar changes, contact creation, or bulk synchronization is part of this workflow.

The agent must receive a minimized event context, never the raw Outlook connector response. `tools/prepare-meeting-context.mjs` retains only the event subject, time window, generic location label, and attendee count. It excludes event IDs, bodies, links, passcodes, attendee identities, and organizer identity.

`tools/build-meeting-prep-draft.mjs` then combines that safe context with one selected Account. Its output is a draft containing facts, hypotheses, unknowns, evidence IDs, and recommended actions. It does not send mail or write meeting notes automatically.
