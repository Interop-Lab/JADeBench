"""Independent DP oracle checks for exact bit-parallel ROUGE-L."""
import random
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from metrics.similarity import rouge_l, evaluate

class RougeLTests(unittest.TestCase):
    def test_oracle(self):
        rng = random.Random(17)
        for _ in range(300):
            a = [rng.choice('abcd') for _ in range(rng.randrange(25))]
            b = [rng.choice('abcd') for _ in range(rng.randrange(25))]
            prev = [0] * (len(b) + 1)
            for token in a:
                row = [0]
                for j, ref in enumerate(b, 1):
                    row.append(prev[j-1]+1 if token == ref else max(prev[j], row[-1]))
                prev = row
            expected = round(2 * prev[-1] / (len(a)+len(b)), 6) if a and b else 0.0
            self.assertEqual(rouge_l(a, b)['rouge_l'], expected)

    def test_properties(self):
        self.assertEqual(rouge_l(['x'], ['x'])['rouge_l'], 1)
        self.assertEqual(rouge_l(['x'], ['y'])['rouge_l'], 0)
        self.assertEqual(rouge_l(['a'], ['a','b'])['rouge_l'], .666667)
        self.assertEqual(evaluate('const x=1;', '//comment\nconst x = 1;')['rouge_l'], 1)
        self.assertLess(evaluate('const y=1;', 'const x=1;')['rouge_l'], 1)

if __name__ == '__main__':
    unittest.main()
