from typing import List, Optional
from pydantic import BaseModel

class ResolveStage(BaseModel):
    stage: str
    confidence: float
    method: Optional[str] = None

class ResolveRequest(BaseModel):
    text: str

class ResolveResponse(BaseModel):
    matched_institution: str
    aicte_id: str
    status: str
    confidence: float
    stages: List[ResolveStage]

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # 'institution' | 'complaint'
    risk: Optional[str] = None

class GraphLink(BaseModel):
    source: str
    target: str
    bureau: Optional[str] = None

class OverlapGraphResponse(BaseModel):
    nodes: List[GraphNode]
    links: List[GraphLink]

class CopilotQueryRequest(BaseModel):
    query: str

class CopilotQueryResponse(BaseModel):
    answer: str
    confidence: Optional[float] = 0.95
    source: Optional[str] = "Groq Llama-3.1-70B AICTE Engine"

class RiskMapPoint(BaseModel):
    name: str
    coordinates: List[float]
    risk: str  # 'GREEN' | 'AMBER' | 'RED'

class AuditReasoningResponse(BaseModel):
    decision_id: str
    reasoning: str
    timestamp: Optional[str] = None
    provenance_hash: Optional[str] = None
