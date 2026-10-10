"""Regressions for false full scores found in the imported results."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from metrics.execution import full_suite_score

class FullSuiteScoreTests(unittest.TestCase):
    def test_complete_workload_passes(self):
        self.assertEqual(full_suite_score(0, {"passed": 5, "failed": 0},
            0, {"passed": 5, "failed": 0}), 1)

    def test_matching_failed_references_are_unscoreable(self):
        self.assertIsNone(full_suite_score(1, {"passed": 5, "failed": 1},
            1, {"passed": 5, "failed": 1}))

    def test_zero_tests_are_unscoreable(self):
        self.assertIsNone(full_suite_score(0, {"passed": 0, "failed": 0},
            0, {"passed": 0, "failed": 0}))

    def test_pass_count_cannot_hide_failures(self):
        for exit_code in [0, 1]:
            self.assertEqual(full_suite_score(0, {"passed": 5, "failed": 0},
                exit_code, {"passed": 5, "failed": 1}), 0)

    def test_early_exit_and_different_workload_fail(self):
        for count in [0, 4, 6]:
            self.assertEqual(full_suite_score(0, {"passed": 5, "failed": 0},
                0, {"passed": count, "failed": 0}), 0)

    def test_timeout_and_missing_candidate_counts_fail(self):
        self.assertEqual(full_suite_score(0, {"passed": 5, "failed": 0},
            0, {"passed": 5, "failed": 0}, timed_out=True), 0)
        self.assertEqual(full_suite_score(0, {"passed": 5, "failed": 0}, 1, None), 0)

if __name__ == "__main__":
    unittest.main()
