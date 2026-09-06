# System architecture

```text
Phone browser → static ICP MVP → local encrypted-device browser storage → JSON export
                         │
                         └─ normal web search (human-reviewed public evidence)

Phase 2: browser → authenticated serverless workflow → Notion Sales Brain
                                                ├→ Search API (public query only)
                                                ├→ Microsoft 365: Outlook Mail / Calendar (Graph or approved connector)
                                                └→ LLM (minimal selected context only)
```

The browser holds no external secrets. Integration code belongs in `integrations/`; workflows in `workflows/`; business rules in `config/` and schemas in `schemas/`.
