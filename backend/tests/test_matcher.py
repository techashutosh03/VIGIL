import unittest
from services.matcher import normalize_name, phonetic_match, fuzzy_score

class TestMatcher(unittest.TestCase):
    def test_normalize_name(self):
        raw = "Sri Venkateswara Coll. of Engg Pvt Ltd"
        norm = normalize_name(raw)
        self.assertNotIn("coll", norm)
        self.assertNotIn("pvt", norm)
        self.assertNotIn("ltd", norm)
        self.assertTrue(len(norm) > 0)

    def test_phonetic_match(self):
        # Phonetic equivalents
        self.assertTrue(phonetic_match("Venkateswara", "Venkatswara"))
        self.assertTrue(phonetic_match("Technology", "Technologie"))

    def test_fuzzy_score(self):
        res = fuzzy_score("ABC Institute of Technology", "ABC Inst of Tech")
        self.assertIn("combined_score", res)
        self.assertGreater(res["combined_score"], 70.0)

if __name__ == "__main__":
    unittest.main()
