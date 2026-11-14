"""Standard-library tests for M0.2 (no API keys, GPU, or SDK required)."""
import asyncio
import json
import tempfile
import unittest
from pathlib import Path

from orchestra import (SCHEMA, evaluate_benchmark, fingerprint, load_result,
                       make_candidate, make_handoff, make_plan, route_task,
                       run_local, score, snapshot)


class RoutingTests(unittest.TestCase):
    def test_local_only_for_bounded_review_with_model(self):
        route = route_task("gd_review", "medium", True)
        self.assertEqual(route["route"], "local_litert")
        self.assertTrue(route["human_approval_required"])

    def test_no_model_falls_back_to_manual_cloud_handoff(self):
        route = route_task("gd_review", "low", False)
        self.assertEqual(route["route"], "human_codex_handoff")
        self.assertEqual(route["model_calls"], 0)

    def test_high_risk_requires_human(self):
        route = route_task("gd_review", "high", True)
        self.assertEqual(route["route"], "human_codex_handoff")
        self.assertEqual(route["model_calls"], 0)

    def test_creative_tasks_are_not_auto_delegated(self):
        self.assertEqual(route_task("creative_direction", "low", True)["route"],
                         "human_codex_handoff")

    def test_bad_task_kind_is_rejected(self):
        with self.assertRaises(ValueError):
            route_task("execute_shell", "low", True)

    def test_plan_contains_only_metadata(self):
        meta = {"source_fingerprint": "a" * 64, "files": ["player.gd"],
                "files_count": 1, "sampled_characters": 100}
        plan = make_plan("gd_review", "low", True, meta)
        self.assertEqual(plan["type"], "plan")
        self.assertNotIn("content", json.dumps(plan))


class EvidenceTests(unittest.TestCase):
    def setUp(self):
        self.review = {
            "schema": SCHEMA, "type": "local_review", "route": "local_litert",
            "risk": "medium",
            "source": {"source_fingerprint": "a" * 64, "files": ["player.gd"]},
            "diagnosis_untrusted": "Possible issue in player.gd, verify manually.",
            "review_status": "pending_human_review",
        }

    def test_candidate_has_explicit_gate_and_no_raw_model_text(self):
        candidate = make_candidate(self.review, "ジャンプ処理を確認する")
        self.assertEqual(candidate["status"], "pending_human_approval")
        self.assertFalse(candidate["approved"])
        self.assertFalse(candidate["write_to_shared_brain"])
        self.assertNotIn("diagnosis_untrusted", candidate)
        self.assertNotIn("files", candidate)

    def test_candidate_rejects_missing_curated_note(self):
        with self.assertRaises(ValueError):
            make_candidate(self.review, " ")

    def test_candidate_rejects_invalid_hash(self):
        self.review["source"]["source_fingerprint"] = "not-a-hash"
        with self.assertRaises(ValueError):
            make_candidate(self.review, "Verified manually")

    def test_handoff_labels_model_output_as_untrusted(self):
        handoff = make_handoff(self.review)
        self.assertIn("ROLE: Codex", handoff)
        self.assertIn("UNTRUSTED_LOCAL_MODEL_FINDINGS_START", handoff)
        self.assertIn("Human review first", handoff)
        self.assertIn(self.review["diagnosis_untrusted"], handoff)

    def test_schema_checked_when_reading_evidence(self):
        with tempfile.TemporaryDirectory() as tmp:
            f = Path(tmp) / "result.json"
            f.write_text(json.dumps(self.review), encoding="utf-8")
            self.assertEqual(load_result(f, "local_review")["schema"], SCHEMA)
            with self.assertRaises(ValueError):
                load_result(f, "benchmark_fixture")


class BenchmarkTests(unittest.TestCase):
    def test_manual_labels_not_raw_model_text(self):
        fixture = {"cases": [{"id": "toy_case", "verified_bug_ids": ["a", "b"],
                              "local": {"reported_bug_ids": ["a", "not_a_bug"]},
                              "cloud": {"reported_bug_ids": ["a", "b"]}}]}
        scored = evaluate_benchmark(fixture)
        result = scored["results"][0]
        self.assertEqual(result["agents"]["local"]["true_positive"], 1)
        self.assertEqual(result["agents"]["local"]["false_positive"], 1)
        self.assertEqual(result["agents"]["local"]["recall"], 0.5)
        self.assertEqual(result["agents"]["cloud"]["recall"], 1)
        self.assertFalse(scored["automated_model_ranking"])

    def test_empty_expected_findings(self):
        self.assertEqual(score(set(), set())["recall"], 1)
        self.assertEqual(score(set(), {"false"})["false_positive"], 1)

    def test_bad_fixture_rejected(self):
        with self.assertRaises(ValueError):
            evaluate_benchmark({"cases": [{"id": "x", "verified_bug_ids": "wrong"}]})


class LocalRunTests(unittest.IsolatedAsyncioTestCase):
    async def test_injected_local_review_does_not_modify_project(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "player.gd"
            source.write_text("extends Node\n", encoding="utf-8")
            model = root / "dummy.litertlm"
            model.write_text("placeholder", encoding="utf-8")
            before = source.read_bytes()

            async def fake_reviewer(model_path, scripts):
                self.assertEqual(model_path, model)
                self.assertEqual(len(scripts), 1)
                return "unverified findings"

            result = await run_local(root, model, "low", reviewer=fake_reviewer)
            self.assertEqual(result["type"], "local_review")
            self.assertEqual(result["diagnosis_untrusted"], "unverified findings")
            self.assertFalse(result["automatically_modified_project"])
            self.assertEqual(source.read_bytes(), before)

    async def test_high_risk_does_not_call_model(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "player.gd").write_text("extends Node\n", encoding="utf-8")
            model = root / "dummy.litertlm"
            model.write_text("placeholder", encoding="utf-8")
            called = False

            async def fake_reviewer(model_path, scripts):
                nonlocal called
                called = True
                return "never"

            with self.assertRaises(ValueError):
                await run_local(root, model, "high", reviewer=fake_reviewer)
            self.assertFalse(called)


if __name__ == "__main__":
    unittest.main()
