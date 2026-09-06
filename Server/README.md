# Server 🧠
### Backend API Service (FastAPI + PostgreSQL + Prisma + ChromaDB + Groq LLM)

Backend API untuk platform belajar cerdas yang menyediakan layanan pemrosesan dokumen PDF (ekstraksi teks & vektorisasi RAG), integrasi LLM (Groq AI), serta manajemen sesi obrolan.

---

## 🛠️ Tech Stack & Fitur Utama

- ⚡ **FastAPI** - Framework Python modern, asynchronous, dan berkinerja tinggi.
- 🗄️ **PostgreSQL & Prisma Client Python** - Manajemen database relasional dengan ORM berbasis schema type-safe.
- 🤖 **Groq LLM** - Inferensi model bahasa besar super-cepat untuk menjawab pertanyaan dan bertindak sebagai tutor belajar pintar.
- 🔍 **ChromaDB & PyPDF** - Ekstraksi teks dari PDF per halaman, chunking, dan pencarian kemiripan vektor (*Retrieval-Augmented Generation / RAG*).
- 💬 **Session & History Chat Management** - Menyimpan riwayat obrolan, mengelompokkan chat per dokumen maupun obrolan umum, serta fitur ganti nama (*rename*) judul sesi dan dokumen.
- 📖 **Interactive Swagger UI** - Dokumentasi API otomatis dan pengujian langsung di `/docs`.

---

## 📁 Struktur Folder

```text
server/
├── app/
│   ├── api/routes/      # Endpoint router (document.py, chat.py)
│   ├── core/            # Konfigurasi aplikasi & inisialisasi database
│   ├── schemas/         # Pydantic data schemas untuk request & response
│   ├── services/        # Business logic (ai_agent.py, pdf_service.py, vector_service.py)
│   └── main.py          # Entry point aplikasi FastAPI
├── prisma/
│   └── schema.prisma    # Definisi skema database PostgreSQL
├── storage/             # Folder penyimpanan file upload & basis data vektor
│   ├── uploads/         # Berkas PDF yang diunggah
│   └── chroma_db/       # Indeks vektor ChromaDB
├── requirements.txt     # Daftar dependensi Python
├── .env.example         # Template konfigurasi environment
└── venv/                # Virtual environment Python
```

---

## ⚙️ Panduan Instalasi & Setup

### 1. Prasyarat
Pastikan sistem kamu telah terpasang:
- **Python** (versi 3.10 ke atas)
- **Database PostgreSQL** yang sedang berjalan aktif.
- **Akun Groq Cloud** untuk mendapatkan API key gratis di [console.groq.com](https://console.groq.com/keys).

### 2. Navigasi ke Direktori Server
```bash
cd server
```

### 3. Pembuatan & Aktivasi Virtual Environment
- **Windows (PowerShell)**:
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```
  *(Jika muncul error execution policy di PowerShell, jalankan: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` terlebih dahulu).*

- **Linux / macOS**:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

### 4. Instalasi Dependensi
Pastikan virtual environment sudah aktif (terdapat tanda `(venv)` di terminal), lalu jalankan:
```bash
pip install -r requirements.txt
```

### 5. Konfigurasi Variabel Lingkungan (`.env`)
Salin file template `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan sesuaikan nilainya:
```env
# URL Koneksi PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/LearnIt?schema=public"

# Kunci API Groq
GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxxxx"

# Pengaturan Server
APP_PORT=8000
APP_HOST="0.0.0.0"
CORS_ORIGINS="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
```

### 6. Sinkronisasi Database (Prisma)
Sinkronkan skema database ke PostgreSQL dan generate Prisma Client Python:
```bash
prisma db push
prisma generate
```

### 7. Menjalankan Server Backend
Jalankan server dengan hot-reload:

- **Menggunakan Uvicorn langsung:**
  ```bash
  uvicorn app.main:app --reload --port 8000
  ```
- **Atau menggunakan runner bawaan:**
  ```bash
  python -m app.main
  ```

Server akan aktif dan siap menerima permintaan di:
- **Base API URL**: [http://localhost:8000](http://localhost:8000)
- **Swagger UI Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📡 Ringkasan Endpoint API Utama

| Metode | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/documents/upload` | Mengunggah PDF, mengekstrak teks & membuat indeks vektor ChromaDB. |
| `GET` | `/api/documents` | Mendapatkan daftar seluruh dokumen yang tersimpan. |
| `GET` | `/api/documents/{id}` | Mengambil detail metadata satu dokumen. |
| `PATCH`| `/api/documents/{id}` | Mengubah judul / nama dokumen (*rename*). |
| `GET` | `/api/documents/{id}/file` | Membuka atau mengunduh berkas fisik PDF. |
| `DELETE`| `/api/documents/{id}` | Menghapus dokumen dari database, disk, dan ChromaDB. |
| `POST` | `/api/chat` | Mengirim pertanyaan ke AI (tanya jawab PDF via RAG atau obrolan umum). |
| `GET` | `/api/chat/sessions` | Mengambil semua sesi obrolan untuk Dashboard. |
| `GET` | `/api/chat/session/{id}` | Mengambil riwayat percakapan lengkap dari satu sesi. |
| `PATCH`| `/api/chat/session/{id}` | Mengubah judul sesi obrolan (*rename*). |
| `DELETE`| `/api/chat/session/{id}` | Menghapus sesi obrolan dari database. |
