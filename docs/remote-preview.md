# MGSF Remote Preview Bridge M0.1

A **manual, private smartphone preview** for the React/Vite Cockpit. This is deliberately separate from the read-only MCP bridge.

## What M0.1 does

- Starts Vite on **127.0.0.1:4173** with a fixed port.
- Reads the local Tailscale device's MagicDNS hostname (or accepts that exact hostname as an argument).
- Adds **only that specific hostname** to Vite's allowed hosts via its supported environment variable.
- Prints the command to run Tailscale Serve **in another terminal**. It never launches a tunnel, changes network policies, installs Tailscale, or logs in.
- Keeps the existing read-only MCP tools untouched.

## Prerequisites

1. Install Tailscale on the development PC and on the smartphone.
2. Sign both into the same tailnet, or configure appropriate access rules. Enable MagicDNS and HTTPS certificates.
3. Check that the PC is connected to Tailscale. The CLI command below should succeed.
4. In this repository, install dependencies with npm ci (Node 22 is used by CI).

~~~bash
tailscale status
npm ci
~~~

## Start the preview

**Terminal A: Start the local Vite development server**

~~~bash
npm run dev:phone
~~~

This command detects your own Tailscale DNS name using the local Tailscale CLI and accepts it as the one permitted remote hostname. The app remains bound to 127.0.0.1.

If the CLI is not on PATH, you can supply the exact hostname shown for your own device in the Tailscale admin console or status output:

~~~bash
npm run dev:phone -- my-pc.my-tailnet.ts.net
~~~

Replace the example with your real device's hostname. The script rejects wildcards, general domains and broad hostnames. Do not edit Vite to set allowedHosts: true.

**Terminal B: After reviewing what will be shared**

~~~bash
tailscale serve 4173
~~~

Tailscale prints a private HTTPS URL such as https://my-pc.my-tailnet.ts.net. This forwards requests to the local Vite server, only for devices authorized by the tailnet. Open the printed URL on the smartphone with Tailscale connected. Check responsive layout, taps, overflow, text size and the mobile browser console as available.

The first run may request enabling MagicDNS/HTTPS certificate support for your tailnet. Review the prompt before enabling it.

## Stop and inspect

- Press Ctrl+C in Terminal B to stop the foreground Tailscale Serve session.
- Press Ctrl+C in Terminal A to stop Vite.
- Inspect current Serve settings using the following command:

~~~bash
tailscale serve status
~~~

M0.1 intentionally does **not** use the persistent --bg mode. If a Serve rule was previously left running in the background, disable only the intended HTTPS rule after inspecting the status; do not reset unrelated Serve rules.

## Important security and data boundaries

- **Serve is tailnet-private, not automatically single-user.** Other authorized tailnet members may access the preview according to your Tailscale access rules. Restrict access before showing sensitive work.
- **Never use tailscale funnel** for M0.1. Funnel would publish the local app to the internet.
- Never use --host 0.0.0.0, Vite allowedHosts: true, or permissive CORS settings to make preview work.
- Vite is a *development* server: source code and debug information may be accessible to authorized viewers. Use only non-sensitive content during testing.
- **Cockpit uses browser localStorage.** Desktop localhost and smartphone HTTPS are separate browser origins, so saved projects do not appear automatically on the phone. Use an intentionally created test project, or review and manually export/import a backup when needed. Do not treat the mobile view as a synchronized database.
- Keep Tailscale device enrollment and access policies as human-managed operations. This workflow does not handle API keys, cookies, credentials or secrets.
- The read-only MCP bridge remains **read-only**. No new tools, shell permissions, network service, auth actions, or browser control are added to that bridge.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Tailscale not found or disconnected | Sign in on the PC. On Windows the script also tries the Program Files Tailscale CLI path. Otherwise pass the exact hostname to npm run dev:phone. |
| Vite says the host is not allowed | Check the URL hostname exactly matches the allowed hostname printed at startup, then restart Terminal A. Do not permit every host. |
| Phone cannot load the URL | Confirm both devices are online in the same permitted tailnet, MagicDNS/HTTPS are enabled, and Terminal A and B are still running. |
| Port 4173 already in use | Stop the conflicting local process. M0.1 does not silently change the port. |
| Projects/notes differ on phone | This is expected because localStorage is per-browser-origin. |
| Hot reloading fails | Reload the phone page and review Tailscale connectivity and browser console. Manual preview still works if hot reload is unavailable. |

## Codex / Claude Code handoff

~~~text
ROLE: Codex or Claude Code
MODE: local_review

TASK: Help the human preview the Madowaku Cockpit on a smartphone.
GOAL: Verify the mobile UI privately without publishing the development server.
STATE: Read docs/remote-preview.md and review current Tailscale prerequisites.
TARGET: npm run dev:phone and a human-started tailscale serve 4173 session.
DO: Explain commands, report the expected URL and checklist, ask the human to open it on their phone.
KEEP: local-first, exact allowed host, 127.0.0.1 bind, foreground-only Serve, MCP read-only.
NO: no automatic tunnel or Funnel; no --bg; no credentials; no exposure to public internet;
    no MCP shell/write/auth capability changes; no claims that an untested phone connection worked.
CHECK: npm test; npm run build; npm run mcp:smoke; manual phone verification.
RISK: tailnet access scope, Vite source visibility, and browser-origin-separated localStorage.
NEXT: Record human-confirmed mobile layout defects for Human Touch Lab.
~~~

## External references

- Tailscale Serve: https://tailscale.com/docs/features/tailscale-serve
- Tailscale CLI Serve: https://tailscale.com/docs/reference/tailscale-cli/serve
- Vite allowed hosts: https://vite.dev/config/server-options
