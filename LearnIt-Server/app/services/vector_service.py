import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Dict, Any
from app.core.config import settings
import logging

logger = logging.getLogger("uvicorn")

class VectorService:
    def __init__(self):
        # Inisialisasi ChromaDB client dengan penyimpanan persistent di disk
        self.client = chromadb.PersistentClient(
            path=str(settings.CHROMA_PERSIST_DIR),
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        # Satu collection utama untuk semua dokumen dengan metadata filter
        self.collection = self.client.get_or_create_collection(name="learnit_documents")

    def add_document_chunks(self, document_id: str, chunks: List[Dict[str, Any]]) -> int:
        """
        Menyimpan potongan teks dokumen ke ChromaDB dengan embedding otomatis bawaan.
        """
        if not chunks:
            return 0

        ids = [f"{document_id}_{chunk['chunk_id']}" for chunk in chunks]
        documents = [chunk["text"] for chunk in chunks]
        metadatas = [
            {
                "document_id": document_id,
                "page": int(chunk["page"]),
                "chunk_id": int(chunk["chunk_id"])
            }
            for chunk in chunks
        ]

        self.collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )
        logger.info(f"Berhasil menambahkan {len(chunks)} vektor untuk dokumen {document_id}")
        return len(chunks)

    def query_relevant_chunks(self, document_id: str, query: str, n_results: int = 4) -> List[Dict[str, Any]]:
        """
        Mencari potongan teks yang paling relevan dengan pertanyaan user
        hanya di dalam dokumen tertentu.
        """
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where={"document_id": document_id}
            )

            matched_chunks = []
            if results and results.get("documents") and len(results["documents"]) > 0:
                docs = results["documents"][0]
                metas = results["metadatas"][0] if results.get("metadatas") else []

                for doc_text, meta in zip(docs, metas):
                    matched_chunks.append({
                        "text": doc_text,
                        "page": meta.get("page", 1),
                        "chunk_id": meta.get("chunk_id", 0)
                    })

            return matched_chunks
        except Exception as e:
            logger.error(f"Gagal query vector store: {e}")
            return []

    def delete_document_vectors(self, document_id: str):
        """Menghapus semua vektor milik dokumen tertentu"""
        try:
            self.collection.delete(where={"document_id": document_id})
            logger.info(f"Berhasil menghapus vektor dokumen {document_id}")
        except Exception as e:
            logger.error(f"Gagal menghapus vektor: {e}")

vector_service = VectorService()
