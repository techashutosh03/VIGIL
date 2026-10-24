import unittest
from agents.risk_predictive import compute_risk_score, forecast_grievance_outbreak, cluster_institution_outbreaks

class TestPredictiveRisk(unittest.TestCase):
    def test_compute_risk_score(self):
        score_data = compute_risk_score("inst-1")
        self.assertIn("score", score_data)
        self.assertGreaterEqual(score_data["score"], 0)
        self.assertLessEqual(score_data["score"], 100)

    def test_forecast_outbreak(self):
        forecast = forecast_grievance_outbreak("inst-1", days_ahead=30)
        self.assertEqual(forecast["institution_id"], "inst-1")
        self.assertEqual(forecast["forecast_horizon_days"], 30)
        self.assertIn("outbreak_probability", forecast)
        self.assertIn("projected_trajectory", forecast)
        self.assertTrue(len(forecast["projected_trajectory"]) > 0)

    def test_hdbscan_clusters(self):
        result = cluster_institution_outbreaks()
        self.assertIn("cluster_count", result)
        self.assertIn("clusters", result)
        self.assertIn("isolated_institutions", result)

if __name__ == "__main__":
    unittest.main()
