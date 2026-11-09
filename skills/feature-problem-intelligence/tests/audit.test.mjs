import { test } from "vitest";
import assert from "node:assert/strict";
import { auditFeature, toMarkdown, toCreole } from "../scripts/audit.mjs";
const seed = {feature_id:"door",name:"SF door",player_intent:"Clear traversal",scopes:["door","npc"],deferred_scopes:["coop"]};

test("door/NPC coverage, with deferred co-op excluded",() => {
  const report = auditFeature(seed);
  assert.equal(report.questions.length,12);
  assert.ok(report.questions.some(q => q.id === "door.obstruction"));
  assert.ok(report.questions.some(q => q.id === "npc.pathfinding"));
  assert.ok(!report.questions.some(q => q.id === "coop.shared-state"));
  assert.equal(report.gate,"BLOCKED");
});
test("window is generic plus window-specific",() => {
  const report = auditFeature({feature_id:"w",name:"window",player_intent:"Curiosity",scopes:["window"]});
  assert.ok(report.questions.some(q => q.id === "window.expectation"));
  assert.ok(!report.questions.some(q => q.id.startsWith("door.")));
});
test("passing checks require evidence",() => {
  assert.throws(() => auditFeature({...seed,checks:{"door.obstruction":{status:"pass"}}}),/Evidence/);
  const report = auditFeature({...seed,checks:{"door.obstruction":{status:"pass",evidence:"replay://door-blocked"}}});
  assert.equal(report.summary.passed,1);
});
test("reject invalid or hidden scope changes",() => {
  assert.throws(() => auditFeature({...seed,scopes:["unknown"]}),/scopes/);
  assert.throws(() => auditFeature({...seed,deferred_scopes:["door"]}),/deferred/);
  assert.throws(() => auditFeature({...seed,checks:{"coop.shared-state":{status:"pending"}}}),/out-of-scope/);
});
test("report and AI Creole preserve review gate",() => {
  const report = auditFeature(seed);
  assert.match(toMarkdown(report),/First P0 checks/);
  assert.match(toCreole(report),/ROLE: Codex/);
  assert.match(toCreole(report),/runtime tests have NOT run/);
});
