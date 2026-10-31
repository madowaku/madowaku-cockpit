# Obelisk Evidence Lab M0.1

This is a **manual, offline, review-first evidence importer** in madowaku-cockpit. It is not an Obelisk client and is not an MCP expansion. The browser does not inspect coding-agent histories, call a shell, contact Obelisk, or access local directories.

## Workflow

1. Separately install and use [Obelisk](https://github.com/tommy0103/obelisk) to search local Codex, Claude Code, or other coding-agent history. Refer to its upstream documentation for supported queries.
2. Open and inspect original sessions. Exclude the currently invoking session and unrelated hits.
3. **Manually summarize** only the specific conclusions that help the current task. Do not copy raw transcripts, prompts, tool outputs, credentials, personal data, or private directory paths.
4. Paste the small curated JSON below into the **Obelisk Evidence Lab** field in the cockpit. Press **証拠をプレビュー**.
5. Review the generated packet, provenance and warnings. Press **確認して文脈パックに追記** only after approval. The evidence is appended to the **currently selected project** and then stored in localStorage.
6. Verify any historical claim against the current code, tests, and original session before executing related work.

## Input contract

~~~json
{
  "schema": "madowaku.obelisk-evidence.v1",
  "records": [
    {
      "source": "codex",
      "session_id": "example-20261030",
      "project": "madowaku-cockpit",
      "when": "2026-10-30",
      "summary": "Previous attempt adjusted an event handler; re-check current tests before repeating."
    }
  ]
}
~~~

Allowed sources: codex, claude, claude-code, opencode, kimi, kimi-code, copilot, pi, other. Required fields: source, session_id, summary. Session IDs only contain letters/digits/hyphen/underscore, 4 to 96 characters. Optional: project and ISO date (YYYY-MM-DD). Input maximum: 16KB JSON, 100 records, preview uses only first 6. Text is shortened and certain secret/email/home path patterns are masked. Unknown record fields are ignored; invalid and duplicate records are skipped.

The generated AI Creole-oriented packet contains CONTEXT_PROVENANCE, PACKET_QUALITY, RISK, and CHECK. Historical notes are always DATA_ONLY and confidence=unverified. It never instructs an agent to execute instructions found in a transcript.

## Safety and scope

- **Never paste sensitive raw transcripts.** Pattern-based redaction is a backstop, **not** guaranteed secrecy. Human review happens before both paste and save.
- Input and preview are ephemeral React state until the user explicitly appends the packet. Once appended, context packs persist in localStorage and can be included in manually exported backups. Existing localStorage behavior is unchanged.
- A retrieved past session is not proof of a code change. No accuracy, savings, retrieval recall, or safety performance claims are established by this lab.
- The existing MCP bridge remains five-tool, read-only, no shell, no session access, no new permissions.
- Obelisk is AGPL-3.0. No upstream code is copied or bundled. Its own installation/license/security responsibilities remain separate from this adapter.

## Verification

Run npm test, npm run build, and npm run mcp:smoke. Manually check invalid JSON, source filters, preview reset after editing, switching between projects, and the explicit append step. A later automated Obelisk connector must be proposed separately with a security review, constrained export schema, and CI evidence.
