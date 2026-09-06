# Data contracts

`schemas/account.schema.json` and `schemas/evidence.schema.json` define the Phase-1 portable account package. Required distinctions:

- `FACT`: claim plus a direct source URL. It represents what the source says, not a conclusion.
- `INFERENCE`: a reasoned hypothesis; include why in the claim and never use it as confirmed requirement.
- `UNKNOWN`: a material field that has not been verified.

Future action response: `{ account_id, generated_at, facts_used: [evidence_id], recommendation, confidence, missing_information }`. Consumer agents must receive only selected entity fields and relevant evidence IDs.

