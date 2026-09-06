from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class DocumentBase(BaseModel):
    title: str

class DocumentUpdate(BaseModel):
    title: str

class DocumentResponse(BaseModel):
    id: str
    title: str
    filename: str
    fileSize: int
    pageCount: int
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class DocumentUploadResponse(BaseModel):
    message: str
    document: DocumentResponse
    total_chunks: int
