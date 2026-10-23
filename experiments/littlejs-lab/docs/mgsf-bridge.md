# Proposed MGSF read-only evidence bridge (not active)

The connected GitHub installation exposed madowaku-cockpit but not an
independently verifiable MGSF repository. Never assume its paths, schemas,
auth rules or runner commands; confirm them before proposing integration.

A future adapter may import ONLY these files, from a user-selected evidence
folder, without executing anything or granting browser control:
- playtest.json: schema mgsf.littlejs.evidence.v1, variant, engine_revision,
  before/after coordinate and score snapshots, console_errors, screenshot
  name and passed
- gate.json: schema mgsf.littlejs.gate.v1, result PASS|HOLD, passed_tests,
  reasons
- playtest.png: screenshot produced by Playwright.

Validate the schema version, exact known variant, screenshots staying inside
the selected folder (reject symlinks and path traversal), SHA-256 file hashes,
engine revision and PASS gate. A PASS cannot replace human game review.

All code runs under experiments/littlejs-lab plus one path-filtered CI job.
No root npm changes, root MCP mutations, credentials, Godot scene changes,
external tunnel, model API calls or automatic game promotion.
