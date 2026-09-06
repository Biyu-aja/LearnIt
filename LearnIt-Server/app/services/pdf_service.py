from pathlib import Path
from typing import List, Dict, Any
from pypdf import PdfReader
import logging

logger = logging.getLogger("uvicorn")

class PDFService:
    @staticmethod
    def extract_text_with_pages(file_path: Path) -> List[Dict[str, Any]]:
        """
        Mengekstrak teks dari tiap halaman PDF.
        Mengembalikan list of dict: [{'page': 1, 'text': '...'}]
        """
        reader = PdfReader(str(file_path))
        pages_content = []
        for index, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            text = text.strip()
            if text:
                pages_content.append({
                    "page": index + 1,
                    "text": text
                })
        return pages_content

    @staticmethod
    def chunk_text(
        pages_content: List[Dict[str, Any]], 
        chunk_size: int = 1000, 
        chunk_overlap: int = 200
    ) -> List[Dict[str, Any]]:
        """
        Memotong teks menjadi chunks berukuran `chunk_size` karakter
        dengan tumpang tindih (`chunk_overlap`) agar konteks kalimat tidak terputus.
        """
        chunks: List[Dict[str, Any]] = []
        chunk_id = 0

        for page_data in pages_content:
            page_num = page_data["page"]
            text = page_data["text"]

            start = 0
            while start < len(text):
                end = start + chunk_size
                chunk_slice = text[start:end]

                # Jangan simpan chunk yang terlalu pendek/kosong
                if len(chunk_slice.strip()) > 30:
                    chunks.append({
                        "chunk_id": chunk_id,
                        "page": page_num,
                        "text": chunk_slice.strip()
                    })
                    chunk_id += 1

                # Geser jendela dengan overlap
                start += (chunk_size - chunk_overlap)

        return chunks

pdf_service = PDFService()
