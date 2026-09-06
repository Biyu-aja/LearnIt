from typing import List, Dict, Any, Optional
from groq import AsyncGroq
from app.core.config import settings
import logging

logger = logging.getLogger("uvicorn")

class AIAgentService:
    def __init__(self):
        self._client: Optional[AsyncGroq] = None

    @property
    def client(self) -> AsyncGroq:
        if not self._client:
            if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your_groq_api_key_here":
                raise ValueError("GROQ_API_KEY belum disetel di file .env! Silakan masukkan API key Groq kamu.")
            self._client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        return self._client

    async def generate_rag_response(
        self,
        question: str,
        relevant_chunks: List[Dict[str, Any]],
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Menyusun prompt RAG dengan konteks dokumen dan memanggil Groq LLM.
        """
        # Susun teks konteks dari potongan dokumen
        context_str = ""
        if relevant_chunks:
            context_blocks = []
            for chunk in relevant_chunks:
                page = chunk.get("page", 1)
                text = chunk.get("text", "")
                context_blocks.append(f"[Halaman {page}]:\n{text}")
            context_str = "\n\n---\n\n".join(context_blocks)
        else:
            context_str = "Tidak ada konteks yang ditemukan dalam dokumen untuk pertanyaan ini."

        system_prompt = (
            "Kamu adalah 'LearnIt AI', asisten tutor belajar pintar yang ramah dan teliti.\n"
            "Tugas utamamu adalah menjawab pertanyaan pengguna dengan jelas dan terstruktur "
            "berdasarkan konteks dokumen yang disediakan di bawah ini.\n\n"
            "Aturan penting:\n"
            "1. Jawablah terutama berdasarkan KONTEKS DOKUMEN di bawah.\n"
            "2. Jika jawaban sama sekali tidak ada di dalam konteks, katakan secara jujur dan sopan bahwa informasi tersebut tidak ditemukan dalam dokumen.\n"
            "3. Sebutkan nomor halaman referensi jika membantu pemahaman pengguna.\n"
            "4. Gunakan gaya bahasa Indonesia yang mudah dipahami, rapi (bisa gunakan poin-poin atau markdown jika penjelasan cukup panjang).\n\n"
            f"=== KONTEKS DOKUMEN ===\n{context_str}\n========================"
        )

        messages = [{"role": "system", "content": system_prompt}]

        # Sertakan riwayat chat sebelumnya jika ada (maksimal 6 pesan terakhir untuk efisiensi)
        if chat_history:
            for msg in chat_history[-6:]:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

        # Tambahkan pertanyaan pengguna saat ini
        messages.append({"role": "user", "content": question})

        try:
            response = await self.client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                temperature=0.3,
                max_tokens=2048,
            )
            return response.choices[0].message.content or "Maaf, tidak ada respon yang dihasilkan."
        except Exception as e:
            logger.error(f"Error saat memanggil Groq API: {e}")
            raise e

ai_agent = AIAgentService()
