# Google Flow in TKS

Video Studio includes a Google Flow handoff anchored by OpenAI/Chadrak.

1. Enter the video idea, audience, length, platform and tone in Video Studio.
2. Select **Prepare Flow brief with OpenAI**. This uses the existing server-side
   `/api/openai` route with `gpt-4o`, independently of the general engine selector.
   Errors remain errors: this path does not silently fall back to another provider.
3. Review the resulting storyboard and per-scene prompts. Copy the brief.
4. Select **Open Google Flow**, sign in there, and paste individual scene prompts.
5. Generate and edit in Flow, then review and approve the resulting video yourself.

This is a manual production handoff, not a Flow API connection. Opening Flow
does not send the brief to Google. No Flow projects, account sessions or generated
assets are imported or synced. The brief stays in the current component session;
copy it before navigating away. Nova/Claude is not called by this workflow.

## Runtime configuration

Use the existing Node backend with `OPENAI_API_KEY` set on the server. Do not add
credentials to this repository or to client-side Vite variables. Locally, run
`npm run dev:all`; the client uses port 3001 for the API on localhost. Production
uses the same-origin API unless `VITE_API_URL` specifies the TKS backend. A static
GitHub Pages deployment alone cannot execute the OpenAI request. Existing backend
access controls and usage limits remain the operator's responsibility.

Flow sign-in and generation access are separate from OpenAI API configuration.
No Google credential is required by this manual handoff. Google's model APIs are
a separate possible future implementation and do not imply Flow project sync.

Official references:
- https://flow.google.com/
- https://ai.google.dev/gemini-api/docs/video

## Validation

Run `node --test tests/*.test.mjs` with Node 22.18+ (native TypeScript
stripping), or Node 24+. Tests use stub responses and spend no API credits.
Run `npm run build` for the full application. A real generation requires the
configured OpenAI backend and must be checked separately from mocked tests.

The pre-existing syntax corruption in `src/lib/engines.ts` and
`src/lib/performance-analytics.ts` has been repaired. The registry preserves the
28 model IDs used by the cost table, the default OpenAI engine, and storage keys.
Legacy model availability is not certified by this repair. Analytics validates
stored records, bounds history, and ranks only successful observations.

Validation: all ten tests, the full TypeScript check (`npx tsc --noEmit`) and the
production build pass. Chrome verification covers opening Video Studio, the
disabled empty-input action, and the explicit missing-OpenAI-key error. Live paid
generation remains unverified. The TKS validation workflow repeats tests, type
checking and building in CI.

The default build uses `/` for a Node-hosted app. The Pages deployment workflow
sets `VITE_BASE_PATH=/thekeyssystemstricoreai/`. Configure `VITE_API_URL` at build
time when the API is hosted elsewhere; never put API keys in Vite variables.
