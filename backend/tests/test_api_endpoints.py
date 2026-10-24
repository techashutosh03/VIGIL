import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestAPIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_healthz(self):
        res = self.client.get("/healthz")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "ok")

    def test_institutions_resolve(self):
        res = self.client.post("/api/v1/institutions/resolve", json={
            "text": "ABC Institute of Technology",
            "address": "Noida, UP"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("matched", data)
        self.assertIn("stages", data)
        self.assertTrue(len(data["stages"]) >= 2)

    def test_human_override(self):
        res = self.client.post("/api/v1/institutions/override", json={
            "complaint_id": "test-c-1",
            "target_institution_id": "inst-1",
            "decision": "APPROVED",
            "reviewer": "Director AICTE",
            "notes": "Verified against physical file records."
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["action"], "HUMAN_REVIEW_APPROVED")

    def test_overlap_graph(self):
        res = self.client.get("/api/v1/dashboard/overlap-graph")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("nodes", data)
        self.assertIn("links", data)

    def test_risk_map(self):
        res = self.client.get("/api/v1/dashboard/risk-map")
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.json(), list)

    def test_copilot_query(self):
        res = self.client.post("/api/v1/copilot/query", json={
            "query": "high risk institutions in Maharashtra"
        })
        self.assertEqual(res.status_code, 200)
        self.assertIn("answer", res.json())

    def test_workflow_cases(self):
        res = self.client.get("/api/v1/workflow/cases")
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.json(), list)

    def test_war_room(self):
        res = self.client.get("/api/v1/overlaps/inst-1/war-room")
        self.assertEqual(res.status_code, 200)
        self.assertIn("suggested_lead_bureau", res.json())

    def test_dashboard_clusters(self):
        res = self.client.get("/api/v1/dashboard/clusters")
        self.assertEqual(res.status_code, 200)
        self.assertIn("clusters", res.json())

    def test_dashboard_forecast(self):
        res = self.client.get("/api/v1/dashboard/forecast/inst-1")
        self.assertEqual(res.status_code, 200)
        self.assertIn("projected_trajectory", res.json())

if __name__ == "__main__":
    unittest.main()
