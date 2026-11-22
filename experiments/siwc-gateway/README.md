# madowaku AI Gateway M0.1 (local-only experiment)

A deliberately isolated **Sign in with ChatGPT** smoke test. This is not the cockpit's existing read-only MCP bridge, and it is not a public website, shared proxy, or deployable service.

The application provides an Electron desktop window with six explicit actions: sign in, request token-sharing consent, load the model list, send one user-clicked text prompt, open the official usage page, and disconnect. There is no background generation, API-key fallback, billing integration, hosted endpoint, or listening HTTP service controlled by this experiment. The OpenAI SDK starts its own short-lived 127.0.0.1 OAuth callback during sign-in.

## Setup (Windows / PowerShell)

**Prerequisites:** Node.js 22.12+, npm, Git, and a ChatGPT account eligible for the token-sharing preview. Keep both repositories adjacent to one another.

From the directory **containing** your existing `madowaku-cockpit` checkout:

```powershell
git clone https://github.com/openai/sign-in-with-chatgpt-devkit.git
cd sign-in-with-chatgpt-devkit
git checkout 0a36fefeb913055c8c7a1a29b63d82b96b2e841a
npm ci
npm run build
cd ../madowaku-cockpit/experiments/siwc-gateway
npm install
npm test
npm start
```

The local `file:` dependency resolves `@siwc/local` from `../../../sign-in-with-chatgpt-devkit/packages/local`. The clone and build steps are intentional: **the upstream SDK is currently a private workspace package, not a generally published npm package**. Nothing from the DevKit is vendored or copied into this repository.

For another folder layout, relocate the two repositories side by side rather than changing the SDK import to a CDN or browser bundle.

## Smoke test checklist

1. Run `npm test`. It checks URL allowlisting, secure-store requirements, IPC-safe session projection, and generation input restrictions without credentials or a live API.
2. Run `npm start` on **your own Windows computer**. Confirm the screen says it is ready. If OS-backed encryption is unavailable, the connection button stays disabled.
3. Click **ChatGPTでログイン**, complete the browser authorization, and explicitly approve token sharing if your account offers it. Observe the connected status; no token should appear in the renderer.
4. Confirm the offered models appear. Choose one, then click **生成テスト** once. Verify that only the completed result is displayed.
5. Open the official usage page if desired, then click **切断**. Confirm models and the output disappear.
6. Close and reopen the desktop app to verify encrypted session persistence on that Windows installation.

The first real sign-in, entitlement check, and live response require the user's consent and local OS environment. They are **not proven by code inspection or CI**. If OAuth, token sharing, or a listed model is unavailable, do not claim the smoke test has passed. Do not work around this with extracted ChatGPT credentials.

## Security and scope

- Tokens are handled only in the Electron main process by the official `@siwc/local` SDK. The renderer gets only a whitelisted status, account label, model slugs/names, error messages, and generated text.
- The SDK requires a supplied encryption provider. This experiment uses Electron `safeStorage` and refuses to sign in if encryption is unavailable; insecure Linux `basic_text` storage is rejected. No plaintext or hardcoded-key fallback.
- The renderer has context isolation, sandboxing, disabled Node integration, an explicit preload allowlist, a restrictive Content Security Policy, strict IPC sender checks, no navigation or popup windows, and no renderer network access. The OAuth external-browser destination must have the exact origin `https://auth.openai.com`.
- This is a **desktop-only trial**, not a local HTTP API for LAN or browser clients. Do not expose credentials, the SDK client, or IPC endpoints through the existing MCP bridge.
- Requests run only after clicking **生成テスト**. The SDK's Responses path uses `store: false`; no prompts, response texts, or session tokens are saved by this experiment.
- There is **no automatic OpenAI Platform API-key fallback** and therefore no fallback API billing. ChatGPT-plan usage is still subject to account eligibility, limits, and terms. Inspect the official usage page.
- The upstream DevKit is under the **Sign-in with ChatGPT DevKit Noncommercial License v1.0**. Confirm rights before any commercial use; do not relicense or vendor upstream files as MIT.
- Dependencies and upstream code change. This experiment documents the upstream main commit reviewed for API compatibility. Recheck license, dependency security, and API behavior before upgrading or distributing.

## Review gates

M0.1 is complete only after: a passing policy test, a working Windows encrypted store, an authorized account connection, a nonempty account-provided model catalog, a single completed text response, and successful disconnect. Review the local SDK storage and Electron runtime in a real installation before treating this as production-grade.

No changes are made to `mcp/server.mjs`, `mcp/repoTools.mjs`, the browser cockpit's localStorage, deployment setup, or existing copy-only handoffs. After M0.1 is verified, a separate M0.2 review can decide how the desktop process should communicate with cockpit without weakening those boundaries.

Official sources:

- https://github.com/openai/sign-in-with-chatgpt-devkit
- https://developers.openai.com/siwc/token-sharing-open-source
- https://github.com/openai/sign-in-with-chatgpt-devkit/blob/main/docs/security.md
