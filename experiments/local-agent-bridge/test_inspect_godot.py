"""Offline standard-library tests; no GPU or Antigravity installation required."""
import tempfile
import unittest
from pathlib import Path

from inspect_godot import MAX_FILES, collect_scripts, make_prompt


class ScriptCollectionTests(unittest.TestCase):
    def test_collect_and_ignore_non_gd(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "player.gd").write_text("extends Node\n", encoding="utf-8")
            (root / "notes.txt").write_text("ignore", encoding="utf-8")
            scripts = collect_scripts(root)
            self.assertEqual([s["path"] for s in scripts], ["player.gd"])
            self.assertIn("extends Node", make_prompt(scripts))

    def test_file_count_limited(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for n in range(MAX_FILES + 5):
                (root / f"{n:03d}.gd").write_text("pass", encoding="utf-8")
            self.assertEqual(len(collect_scripts(root)), MAX_FILES)

    def test_symlink_is_excluded(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            outside = root.parent / "other-gd-file-for-test.gd"
            # Use an existing file inside project as target to avoid touching external paths.
            (root / "original.gd").write_text("pass", encoding="utf-8")
            try:
                (root / "link.gd").symlink_to(root / "original.gd")
            except (OSError, NotImplementedError):
                self.skipTest("symlinks unavailable")
            self.assertEqual([s["path"] for s in collect_scripts(root)], ["original.gd"])


if __name__ == "__main__":
    unittest.main()
