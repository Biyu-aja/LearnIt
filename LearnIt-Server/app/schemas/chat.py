from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Any

class SourceReference(BaseModel):
    page: int
    text_snippet: str

class ChatRequest(BaseModel):
    document_id: Optional[str] = None
    session_id: Optional[str] = None
    question: str

class SessionUpdate(BaseModel):
    title: str

class ChatResponse(BaseModel):
    session_id: str
    question: str
    answer: str
    sources: List[SourceReference] = []

class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    sources: Optional[Any] = None
    createdAt: datetime

    class Config:
        from_attributes = True

class SessionDetailResponse(BaseModel):
    id: str
    title: str
    document_id: Optional[str] = None
    messages: List[MessageResponse]
    createdAt: datetime

    class Config:
        from_attributes = True
