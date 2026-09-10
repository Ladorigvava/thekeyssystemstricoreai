# The Keys Systems — Tri-Core AI

A private AI workspace with independent Chadrak, Nova and Triad analyses, individual core views, saved history, and audio/video production briefs. This release repairs the existing React/Vite application and replaces its Spark dependency with a single Express backend.

## Start locally

Use Node 24 LTS (minimum 22.13).

```bash
npm ci
cp .env.example .env
npm run dev
```

Open http://127.0.0.1:5000. Add provider keys to `.env` on the server. Restart the API server after changing them. All three core providers are needed for three independent live results; other configured providers can be selected. Without credentials, the app opens and reports the missing configuration accurately.

## What works

- Parallel analysis through OpenAI Responses, Anthropic Messages and Gemini APIs.
- Distinct defaults: Chadrak → GPT-5.2, Nova → Claude Sonnet 5, Triad → Gemini 2.5 Pro. Models remain selectable.
- Streamed output, cancellation, timeout handling, per-core errors and partial completion.
- Server-side sessions, request limits, bounded input, and duplicate-request protection.
- SQLite persistence for core drafts, model choices, system prompts, history and response cache. Successful provider runs retain their model, provider response ID and local run ID.
- Exact cache matching includes input, instructions, model, core and generation settings. Tri-Core re-use is an explicit choice; no semantic substitution or silent model fallback.
- Single-core follow-up conversations; comparison, debate, research, ensemble, templates and persona workflows use the same server API.
- Audio/video studios create textual briefs, scripts and production prompts. They do not render audio or video files.
- Markdown, JSON and HTML exports. Portable share links encode the content in a URL fragment; encoding is not encryption.

## Persistence and privacy

This is a single-owner workspace. Production requires an access password and HTTPS origin. All sessions share the owner's workspace; this is not a multi-tenant service. Keys stay on the server. Requests go only to the selected provider; keys are never sent in the browser bundle.

The database belongs on persistent storage. Keep the SQLite database and WAL files together when backing up; prefer SQLite's online backup API. Some pre-existing advanced analytics, conversations and templates remain in this browser's local storage; they are not synchronized across devices. Core histories and configuration use the server database. Conflicting writes from another tab are rejected, and the UI shows unsaved changes.

Cost and quality dashboards contain estimates. Estimates for an unpriced model are not provider billing. Consult the provider's usage dashboard for charges and availability.

## Verification

```bash
npm run verify
```

This runs TypeScript, backend contract tests, DOM-based UI workflow tests, and the production build. Test fixtures are explicitly labeled and do not call real AI services. Live verification requires configured provider accounts and a deployed server. See `VALIDATION.md` for the latest observed results.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the supported Docker/Node deployment with a persistent volume. Static GitHub Pages hosting cannot run the authenticated API or SQLite. The CI workflow validates source instead of publishing an incomplete frontend.

## Existing TKS automation

The app currently has no verified binding to the existing Google Drive Intelligence Fabric, scheduled workers, or Tri-Core queues. Its API execution and history are separate from those systems. This repair does not modify live Fabric configuration, protocols, schedules or authority. A live binding requires the actual host configuration and applicable protocol before any Fabric writes can be implemented and verified.

## Credential remediation

An Anthropic credential had been committed in `.env.txt`. Its value has been removed from the new source, but the previous commit remains in repository history. The owner must revoke that exposed credential at Anthropic and configure a replacement privately. Do not reuse it.

## Provider references

Catalog checked 10 September 2026 against [OpenAI model documentation](https://developers.openai.com/api/docs/models/gpt-5.2), [Anthropic model documentation](https://platform.claude.com/docs/en/models/overview), and [Google model documentation](https://ai.google.dev/gemini-api/docs/models). A documented model may still require access on your account. Optional legacy provider entries are preserved as compatibility options and need individual live verification. Update `shared/models.json` when changing the supported catalog.
