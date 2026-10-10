#!/usr/bin/env python3
"""The archived JSX output must retain its final-paper syntax and similarity."""
import json
import os
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from metrics import similarity, syntax  # noqa: E402


class JsxParityTests(unittest.TestCase):
    def test_archived_webcrack_output(self):
        if os.environ.get("PYTHONHASHSEED") != "0":
            self.fail("Run with PYTHONHASHSEED=0 for CodeBLEU-R data-flow parity")
        root = Path(__file__).resolve().parents[2]
        subject_id = "octokatherine__readme.so::components/DownloadModal.js"
        sample = next(row for row in map(json.loads,
                      (root / "benchmark/realworld93/sample_ids.jsonl")
                      .read_text(encoding="utf-8").splitlines())
                      if row["subject_id"] == subject_id)
        reference = (root / "benchmark/realworld93/original" /
                     sample["original_file"]).read_text(encoding="utf-8")
        run = root / "results/runs/webcrack/jsob-full"
        prediction = next(row for row in map(json.loads,
                          (run / "predictions.jsonl")
                          .read_text(encoding="utf-8").splitlines())
                          if row["subject_id"] == subject_id)
        candidate = (run / prediction["path"]).read_text(encoding="utf-8")

        verdict = syntax.evaluate(candidate, reference)
        self.assertTrue(verdict["jsx"])
        self.assertTrue(verdict["errors"])  # Known tree-sitter JSX false alarm.
        self.assertTrue(verdict["parses"])
        self.assertIs(verdict["node_check"], True)
        self.assertEqual(verdict["score"], 1)

        scores = similarity.evaluate(candidate, reference,
                                     parse_status=verdict["parses"])
        self.assertEqual(scores["codebleu_r"], 0.387384)
        self.assertEqual(scores["rouge_l"], 0.592011)
        self.assertEqual(scores["codebleu"], 0.433336)

    def test_malformed_jsx_is_rejected(self):
        candidate = "const X = () => <div><span></div>;"
        verdict = syntax.evaluate(candidate, "const X = 1;")
        self.assertFalse(verdict["parses"])
        self.assertEqual(verdict["score"], 0)
        self.assertEqual(similarity.evaluate(candidate, "const X = 1;")["rouge_l"], 0)


if __name__ == "__main__":
    unittest.main()
