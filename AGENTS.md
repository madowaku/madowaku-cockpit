# Agent guidance for madowaku-cockpit

This project is local-first and review-first. Preserve existing behavior and follow the fixed read-only MCP capability boundary in docs/mcp-security.md.

## Smartphone preview: MGSF Remote Preview Bridge M0.1

When the task is to check the Cockpit on a phone:

1. Read docs/remote-preview.md before recommending commands.
2. Suggest npm run dev:phone to start Vite on 127.0.0.1:4173 with an exact, validated Tailscale hostname.
3. Have the human review and start tailscale serve 4173 in a **separate foreground terminal**. Do not automatically start sharing, install network software, log in, change ACLs, or operate remote devices.
4. Never use tailscale funnel, --bg, --host 0.0.0.0, allowedHosts: true, permissive CORS, or public deployment as a shortcut.
5. Distinguish instructions and code review from runtime verification. Do not report success until the human confirms that a real phone opened the private URL.
6. Note that browser localStorage is origin-specific: mobile preview data is not automatically synchronized with desktop localhost.
7. Capture layout/interaction findings as a small Human Touch Lab handoff.

The existing MCP bridge remains read-only and must not gain tunnel, shell, write, browser, auth, or deploy capabilities.
