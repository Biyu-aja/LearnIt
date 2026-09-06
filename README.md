# LearnIt 🎓
### Intelligent AI-Powered Study Platform with PDF RAG Assistant

Platform pembelajaran interaktif berbasis AI yang memungkinkan pengguna untuk bertanya jawab mengenai isi dokumen PDF, membaca ringkasan materi, mengelola sesi obrolan, dan berdiskusi langsung dengan asisten belajar cerdas.

---

## 🏗️ Arsitektur Proyek

Proyek ini terdiri dari dua bagian utama:

- **[client/](./client/README.md)**: Aplikasi frontend berbasis React 19, TypeScript, Tailwind CSS v4, dan Vite.
- **[server/](./server/README.md)**: Layanan backend API berbasis FastAPI (Python), PostgreSQL (Prisma), ChromaDB (Vector Store), dan Groq LLM (RAG).

---

## 🚀 Panduan Ringkas Menjalankan Aplikasi

### 1. Menjalankan Backend (`server`)
Buka terminal pertama:
```bash
cd server

# Aktifkan virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
# source venv/bin/activate

# Pasang dependensi
pip install -r requirements.txt

# Jalankan server FastAPI
uvicorn app.main:app --reload --port 8000
```
Server akan aktif di [http://localhost:8000](http://localhost:8000).

---

### 2. Menjalankan Frontend (`client`)
Buka terminal kedua:
```bash
cd client

# Pasang dependensi
pnpm install

# Jalankan Vite dev server
pnpm dev
```
Aplikasi web dapat diakses di browser pada [http://localhost:5173](http://localhost:5173).

---

## 📚 Dokumentasi Lebih Rinci

Silakan kunjungi README di masing-masing direktori untuk panduan setup lengkap:
- 📖 [Panduan Setup & Dokumentasi Client](./Client/README.md)
- 📖 [Panduan Setup & Dokumentasi Server](./Server/README.md)
