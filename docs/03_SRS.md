# Software requirements

Static browser UI: modern Chrome/Edge/Safari, including mobile. Browser storage is used only for the current device. The app shall not contain credentials or call LLMs. The scorer loads `config/icp-scoring.json` as its source of truth when served over HTTP. When opened directly from a local file, it uses a built-in, verified fallback so the day-one no-setup workflow still functions. Update the config and run tests before changing scoring.

Future sync service requirements: authenticate to Notion with a restricted internal integration; validate input against `schemas/`; use idempotency keys; log metadata but never raw sensitive notes in public CI logs.
