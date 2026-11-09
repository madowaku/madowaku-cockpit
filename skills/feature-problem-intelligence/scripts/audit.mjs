import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Deterministic discovery catalog. It is NOT a runtime playtest.
export const BANK = [
  ["core.player-intent","all","P0","Creative Intent Engine","human","What player feeling or decision should this feature create?","Name an intended moment, then ask a tester what they actually felt."],
  ["core.affordance","all","P0","Game Design + UX","hybrid","How can a first-time player tell what can and cannot be used?","Observe first action without instructions; record incorrect assumptions."],
  ["core.trigger","all","P1","Design + Engineering","hybrid","What triggers the feature, including failed or interrupted triggers?","List distance, input, cooldown, interruption and denied feedback."],
  ["core.states","all","P0","Engineering","automated","Which states and transitions are legal, including interruption and reload?","Test transition table, reset and duplicate commands."],
  ["core.feedback","all","P1","UX + Audio + Animation","hybrid","How does the player know what changed and why?","Review success, denied, busy, and failure signals."],
  ["core.edge-cases","all","P0","Engineering + QA","automated","Can collisions, timing or reset create a soft-lock?","Replay boundary conditions and recovery paths."],
  ["core.playable-moment","all","P1","Game Test Player","human","Does observed player behavior match the intended moment?","Record time to understand, wrong attempts and reactions."],
  ["door.locked-vs-decorative","door","P0","Game Design + UX","hybrid","Can players distinguish locked from permanently decorative doors?","Compare two doors without relying on text tutorials or color alone."],
  ["door.obstruction","door","P0","Engineering + QA","automated","What happens when a player or object blocks closing?","Test reverse, reopening, overlap, and no soft-lock."],
  ["door.motion","door","P1","Animation + UX","hybrid","Does opening speed communicate the intended weight and urgency?","Compare timing variants in a traversal scene."],
  ["door.sound","door","P2","Sound Identity Lab","human","Do opening, closing and denied sounds fit the world?","Test repeated usage and sound-on/sound-off recognition."],
  ["npc.pathfinding","npc","P1","Engineering + AI","automated","Can allies and enemies pass through or wait for this feature?","Run NPC navigation across open, closed and locked states."],
  ["coop.shared-state","coop","P0","Game Design + Networking","hybrid","What happens when players enter and block the threshold at different times?","Test both sides and consistent lock/collision state."],
  ["streaming.transition","streaming","P0","Level + Engineering","automated","Could the next scene unload while a player or NPC still needs it?","Stress delayed followers, retry and scene unloading."],
  ["window.expectation","window","P1","UX + Narrative","human","Does opening the window fulfill its implied promise?","Compare player prediction before the click with actual reaction."]
];
const VALID_SCOPES = new Set(["door","npc","coop","streaming","window"]);
const STATUS = new Set(["pending","pass","fail","not_applicable"]);
const WEIGHT = {P0:0,P1:1,P2:2};
export function auditFeature(spec) {
  if (!spec || typeof spec !== "object" || Array.isArray(spec)) throw Error("Input must be an object");
  for (const key of ["feature_id","name","player_intent"]) {
    if (typeof spec[key] !== "string" || !spec[key].trim()) throw Error(key + " is required");
  }
  if (!Array.isArray(spec.scopes) || spec.scopes.some(s => !VALID_SCOPES.has(s))) throw Error("Invalid scopes");
  const scopes = [...new Set(spec.scopes)];
  const deferred = [...new Set(spec.deferred_scopes || [])];
  if (deferred.some(s => !VALID_SCOPES.has(s) || scopes.includes(s))) throw Error("Invalid or overlapping deferred scopes");
  const checks = spec.checks || {};
  if (typeof checks !== "object" || Array.isArray(checks)) throw Error("Invalid checks");
  const active = BANK.filter(row => row[1] === "all" || scopes.includes(row[1]));
  const ids = new Set(active.map(row => row[0]));
  for (const id of Object.keys(checks)) if (!ids.has(id)) throw Error("Unknown or out-of-scope check: " + id);
  const questions = active.map(row => {
    const [id,scope,priority,owner,method,question,check] = row;
    const observed = checks[id] || {status:"pending"};
    if (!STATUS.has(observed.status)) throw Error("Invalid status for " + id);
    if (observed.status !== "pending" && (typeof observed.evidence !== "string" || !observed.evidence.trim())) {
      throw Error("Evidence or rationale required for " + id);
    }
    return {id,scope,priority,owner,method,question,check,status:observed.status,evidence:observed.evidence || ""};
  }).sort((a,b) => WEIGHT[a.priority] - WEIGHT[b.priority]);
  const blockers = questions.filter(q => q.priority === "P0" && q.status !== "pass");
  const open = questions.filter(q => q.status !== "pass" && q.status !== "not_applicable");
  const gate = blockers.length ? "BLOCKED" : open.some(q => q.priority === "P1") ? "REVIEW" : "CANDIDATE";
  return {schema_version:"mgsf.feature-problem.v0.1",feature_id:spec.feature_id,name:spec.name,
    player_intent:spec.player_intent,engine:spec.engine || "unspecified",scopes,deferred_scopes:deferred,
    questions,gate,summary:{total:questions.length,p0_open:blockers.length,open:open.length,
      passed:questions.filter(q => q.status === "pass").length},
    note:"No Godot tests or player observations are performed by this generator. Evidence must be independently reviewed."};
}
function cell(text) {return String(text).replaceAll("|","\\|").replaceAll("\n"," ");}
export function toMarkdown(audit) {
  const lines = ["# Feature Problem Audit: " + audit.name,"",
    "- Feature: " + audit.feature_id,
    "- Player intent: " + audit.player_intent,
    "- Engine: " + audit.engine,
    "- Active scopes: " + (audit.scopes.join(", ") || "universal"),
    "- Deferred: " + (audit.deferred_scopes.join(", ") || "none"),
    "- Gate: " + audit.gate,
    "- Evidence-backed passes: " + audit.summary.passed + "/" + audit.summary.total,
    "- Open P0 checks: " + audit.summary.p0_open,"",
    "| Priority | Owner | Question | Verification | Status |",
    "| --- | --- | --- | --- | --- |"];
  for (const q of audit.questions) lines.push("| " + [q.priority,q.owner,q.question,q.check,q.status].map(cell).join(" | ") + " |");
  lines.push("","## First P0 checks","");
  for (const q of audit.questions.filter(x => x.priority === "P0" && x.status !== "pass").slice(0,3)) {
    lines.push("- " + q.id + ": " + q.question);
  }
  lines.push("","## Submitted evidence","");
  for (const q of audit.questions.filter(x => x.status !== "pending")) lines.push("- " + q.id + ": " + q.status + "; " + q.evidence);
  if (!audit.questions.some(x => x.status !== "pending")) lines.push("- None yet.");
  lines.push("","Note: " + audit.note,"");
  return lines.join("\n");
}
export function toCreole(audit) {
  const lines = ["ROLE: Codex","MODE: codex_patch","TASK: Feature Problem Intelligence M0.1",
    "GOAL: Implement a testable first-playable slice: " + audit.name,
    "STATE: Audit gate " + audit.gate + "; runtime tests have NOT run.",
    "TARGET: Inspect the actual game repo and scene paths before editing.",
    "DO:"];
  for (const q of audit.questions.filter(x => x.priority === "P0" && x.status !== "pass").slice(0,3)) {
    lines.push("- Resolve " + q.id + ": " + q.question + " CHECK: " + q.check);
  }
  lines.push("- Prefer existing local assets; make a minimal reversible patch.",
    "KEEP: Player intent, existing architecture, review-first workflow, read-only MCP bridge.",
    "NO: Do not add write/shell/auth capabilities to the MCP bridge; do not mark untested items passed.",
    "NO: Do not silently implement deferred scopes.",
    "OUT: Changed files, decisions, open questions, test results and replay path.",
    "CHECK: Automated state/collision tests plus first-time player observation.",
    "RISK: A paper audit cannot establish playability or fun.",
    "NEXT: Capture evidence; rerun audit; send moments to Living Moment Intelligence.","");
  return lines.join("\n");
}
function run(argv) {
  const input = argv[0];
  const formatArg = argv.find(x => x.startsWith("--format="));
  const format = formatArg ? formatArg.split("=")[1] : "markdown";
  if (!input || !["json","markdown","creole"].includes(format)) {
    console.error("Usage: node audit.mjs <feature.json> [--format=markdown|json|creole]");
    process.exitCode = 2; return;
  }
  try {
    const report = auditFeature(JSON.parse(fs.readFileSync(input,"utf8")));
    process.stdout.write(format === "json" ? JSON.stringify(report,null,2) + "\n" : format === "creole" ? toCreole(report) : toMarkdown(report));
  } catch (error) { console.error("Audit error: " + error.message); process.exitCode = 1; }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run(process.argv.slice(2));
