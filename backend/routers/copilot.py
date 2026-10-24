from fastapi import APIRouter
from pydantic import BaseModel
from agents.co_pilot import answer_query

router = APIRouter(prefix="/api/v1/copilot", tags=["copilot"])

class QueryRequest(BaseModel):
    query: str

@router.post("/query")
def query(req: QueryRequest):
    return answer_query(req.query)
