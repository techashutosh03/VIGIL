from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class ResolveRequest(BaseModel):
    text: str
    address: str = ""
    aicte_id: Optional[str] = None

class ResolveStage(BaseModel):
    stage: str
    confidence: float
    method: Optional[str] = None
    reasoning: Optional[str] = None
    note: Optional[str] = None

class QueryRequest(BaseModel):
    query: str

class TransitionRequest(BaseModel):
    new_state: str
    performed_by: str = "official"

class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    risk: Optional[str] = None

class GraphLink(BaseModel):
    source: str
    target: str
    bureau: Optional[str] = None

class OverlapGraphResponse(BaseModel):
    nodes: List[GraphNode]
    links: List[GraphLink]
    overlap_institution_ids: Optional[List[str]] = None
