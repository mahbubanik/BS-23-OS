# Agents

`registry.json` defines the seven Sales OS capabilities, their intent triggers, entity reads/writes, and operating mode. The router is deterministic: `node tools/route-sales-request.mjs "Research Petromax"` selects the smallest relevant workflow before an LLM is considered.

Every later LLM implementation must emit `schemas/agent-output.schema.json`, use only selected evidence and entity fields, and preserve FACT / INFERENCE / UNKNOWN.
