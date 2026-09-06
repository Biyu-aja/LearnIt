import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from app.core.db import db
from app.schemas.chat import (
    ChatRequest, 
    ChatResponse, 
    SourceReference, 
    SessionDetailResponse, 
    MessageResponse,
    SessionUpdate
)
from app.services.vector_service import vector_service
from app.services.ai_agent import ai_agent
import logging

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/chat", tags=["Chat & AI Agent"])

@router.post("", response_model=ChatResponse)
async def ask_question(request: ChatRequest):
    """
    Endpoint utama tanya jawab dengan AI berbasis dokumen PDF atau chat langsung.
    """
    # 1. Pastikan dokumen ada di database (jika document_id diberikan)
    document = None
    if request.document_id:
        document = await db.document.find_unique(where={"id": request.document_id})
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dokumen tidak ditemukan."
            )

    # 2. Dapatkan atau buat sesi obrolan (ChatSession)
    session = None
    if request.session_id:
        session = await db.chatsession.find_unique(
            where={"id": request.session_id},
            include={"messages": {"order_by": {"createdAt": "asc"}}}
        )

    if not session:
        # Potong judul percakapan dari pertanyaan pertama
        preview_title = request.question[:35] + ("..." if len(request.question) > 35 else "")
        session = await db.chatsession.create(
            data={
                "title": preview_title,
                "documentId": request.document_id if request.document_id else None
            },
            include={"messages": True}
        )

    # 3. Kumpulkan history pesan sebelumnya untuk konteks
    chat_history = []
    if session.messages:
        for msg in session.messages:
            chat_history.append({"role": msg.role, "content": msg.content})

    # 4. Ambil potongan teks PDF yang relevan dari ChromaDB jika ada dokumen
    relevant_chunks = []
    if request.document_id:
        try:
            relevant_chunks = vector_service.query_relevant_chunks(
                document_id=request.document_id,
                query=request.question,
                n_results=4
            )
        except Exception as e:
            logger.warning(f"Gagal mengambil chunk vektor: {e}")

    # 5. Minta AI Groq menghasilkan jawaban
    try:
        ai_answer = await ai_agent.generate_rag_response(
            question=request.question,
            relevant_chunks=relevant_chunks,
            chat_history=chat_history
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memanggil model AI: {str(e)}"
        )

    # Siapkan referensi sumber (sources)
    sources = [
        SourceReference(
            page=chunk["page"],
            text_snippet=chunk["text"][:160] + "..." if len(chunk["text"]) > 160 else chunk["text"]
        )
        for chunk in relevant_chunks
    ]

    from prisma import Json

    # 6. Simpan pesan User dan jawaban Assistant ke PostgreSQL
    await db.chatmessage.create(
        data={
            "sessionId": session.id,
            "role": "user",
            "content": request.question
        }
    )

    assistant_data = {
        "sessionId": session.id,
        "role": "assistant",
        "content": ai_answer,
    }
    if sources:
        assistant_data["sources"] = Json([s.model_dump() for s in sources])

    await db.chatmessage.create(data=assistant_data)

    return ChatResponse(
        session_id=session.id,
        question=request.question,
        answer=ai_answer,
        sources=sources
    )

@router.get("/sessions")
async def get_all_sessions():
    """Mendapatkan semua sesi obrolan beserta dokumen dan daftar pesan"""
    sessions = await db.chatsession.find_many(
        include={
            "document": True,
            "messages": {"order_by": {"createdAt": "asc"}}
        },
        order={"createdAt": "desc"}
    )
    return sessions

@router.get("/sessions/{document_id}")
async def get_document_sessions(document_id: str):
    """Mendapatkan semua sesi obrolan untuk dokumen tertentu"""
    sessions = await db.chatsession.find_many(
        where={"documentId": document_id},
        include={"document": True, "messages": True},
        order={"createdAt": "desc"}
    )
    return sessions

@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Menghapus sesi obrolan dari database"""
    session = await db.chatsession.find_unique(where={"id": session_id})
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesi obrolan tidak ditemukan."
        )
    await db.chatsession.delete(where={"id": session_id})
    return {"message": "Sesi obrolan berhasil dihapus."}

@router.get("/session/{session_id}")
async def get_session_detail(session_id: str):
    """Mendapatkan riwayat obrolan lengkap dari satu sesi"""
    session = await db.chatsession.find_unique(
        where={"id": session_id},
        include={
            "document": True,
            "messages": {"order_by": {"createdAt": "asc"}}
        }
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesi obrolan tidak ditemukan."
        )
    return session

@router.patch("/session/{session_id}")
async def rename_session(session_id: str, payload: SessionUpdate):
    """Mengubah judul sesi obrolan"""
    session = await db.chatsession.find_unique(where={"id": session_id})
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesi obrolan tidak ditemukan."
        )
    clean_title = payload.title.strip()
    if not clean_title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Judul sesi tidak boleh kosong."
        )
    updated = await db.chatsession.update(
        where={"id": session_id},
        data={"title": clean_title}
    )
    return updated
