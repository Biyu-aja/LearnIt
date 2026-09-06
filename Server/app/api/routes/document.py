import shutil
import uuid
from pathlib import Path
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.core.config import settings
from app.core.db import db
from app.schemas.document import DocumentResponse, DocumentUploadResponse, DocumentUpdate
from app.services.pdf_service import pdf_service
from app.services.vector_service import vector_service
import logging

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Endpoint untuk mengunggah file PDF, mengekstrak isinya,
    menyimpan metadata ke PostgreSQL, dan menyematkan vektor ke ChromaDB.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hanya file berekstensi .pdf yang diperbolehkan!"
        )

    # Buat nama file unik untuk penyimpanan lokal
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    saved_path = settings.UPLOAD_DIR / unique_filename

    try:
        # Simpan file secara fisik
        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = saved_path.stat().st_size

        # Ekstrak teks dan chunking
        pages_content = pdf_service.extract_text_with_pages(saved_path)
        if not pages_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tidak ada teks yang dapat dibaca dari file PDF ini (mungkin dokumen hanya berupa gambar/scan)."
            )

        chunks = pdf_service.chunk_text(pages_content)
        total_pages = len(pages_content)

        # Simpan metadata ke PostgreSQL via Prisma
        doc_record = await db.document.create(
            data={
                "title": file.filename.replace(".pdf", ""),
                "filename": unique_filename,
                "fileSize": file_size,
                "pageCount": total_pages
            }
        )

        # Simpan chunk ke Vector Store
        total_chunks = vector_service.add_document_chunks(doc_record.id, chunks)

        return DocumentUploadResponse(
            message="Dokumen PDF berhasil diunggah dan diindeks!",
            document=DocumentResponse.model_validate(doc_record),
            total_chunks=total_chunks
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saat memproses dokumen: {e}")
        # Hapus file jika gagal
        if saved_path.exists():
            saved_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Terjadi kesalahan saat memproses file: {str(e)}"
        )

@router.get("", response_model=List[DocumentResponse])
async def list_documents():
    """Mengambil daftar semua dokumen yang tersimpan"""
    docs = await db.document.find_many(
        order={"createdAt": "desc"}
    )
    return [DocumentResponse.model_validate(d) for d in docs]

from fastapi.responses import FileResponse

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str):
    """Mengambil detail satu dokumen berdasarkan ID"""
    doc = await db.document.find_unique(where={"id": document_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dokumen tidak ditemukan."
        )
    return DocumentResponse.model_validate(doc)

@router.patch("/{document_id}", response_model=DocumentResponse)
async def rename_document(document_id: str, payload: DocumentUpdate):
    """Mengubah nama/judul dokumen"""
    doc = await db.document.find_unique(where={"id": document_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dokumen tidak ditemukan."
        )
    clean_title = payload.title.strip()
    if not clean_title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Judul dokumen tidak boleh kosong."
        )
    updated_doc = await db.document.update(
        where={"id": document_id},
        data={"title": clean_title}
    )
    return DocumentResponse.model_validate(updated_doc)

@router.get("/{document_id}/file")
async def get_document_file(document_id: str):
    """Membuka atau mengunduh file fisik PDF"""
    doc = await db.document.find_unique(where={"id": document_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dokumen tidak ditemukan."
        )
    file_path = settings.UPLOAD_DIR / doc.filename
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File fisik dokumen tidak ditemukan di server."
        )
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=f"{doc.title}.pdf"
    )

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """Menghapus dokumen dari database, disk, dan ChromaDB"""
    doc = await db.document.find_unique(where={"id": document_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dokumen tidak ditemukan."
        )

    # Hapus file fisik
    file_path = settings.UPLOAD_DIR / doc.filename
    if file_path.exists():
        file_path.unlink()

    # Hapus vektor
    vector_service.delete_document_vectors(document_id)

    # Hapus record dari PostgreSQL
    await db.document.delete(where={"id": document_id})

    return {"message": "Dokumen berhasil dihapus secara permanen."}
