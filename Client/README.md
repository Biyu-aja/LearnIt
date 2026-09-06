# Client 🚀
### Frontend Application (React 19 + TypeScript + Tailwind CSS v4 + Vite)

Frontend aplikasi web untuk platform belajar interaktif dan tanya jawab cerdas berbasis AI dan dokumen PDF (RAG). Dibangun menggunakan **React 19**, **TypeScript**, **Tailwind CSS v4**, **Vite**, dan **React Router v7**.

---

## 🛠️ Tech Stack & Fitur Utama

- ⚡ **Vite** - Build tool ultra-cepat dengan Hot Module Replacement (HMR).
- ⚛️ **React 19** - Versi stabil terbaru React.
- 📘 **TypeScript** - Type-safety penuh pada komponen, API service, dan state.
- 🎨 **Tailwind CSS v4** - Styling modern berbasis utility dan variabel CSS kustom.
- 💬 **Interactive AI Chat** - Tanya jawab langsung dengan AI, mendukung riwayat obrolan (*conversational memory*).
- 📑 **Markdown & GFM Support** - Format tabel rapi, teks tebal, daftar poin, dan blok kode dengan `react-markdown` dan `remark-gfm`.
- 📁 **Manajemen Dokumen PDF** - Unggah materi PDF, pratinjau detail halaman/ukuran file, buka PDF, serta ubah nama (*rename*) dokumen langsung dari antarmuka.
- 🌓 **Dark & Light Mode** - Tema gelap dan terang yang tersinkronisasi otomatis dengan `localStorage`.

---

## 📁 Struktur Folder

```text
client/
├── public/              # Aset statis publik
├── src/
│   ├── assets/          # Ikon dan ilustrasi
│   ├── components/      # Komponen antarmuka (cards, modal, chat bubble, UI layout)
│   ├── constants/       # Rute URL, navigasi, dan konfigurasi konstan
│   ├── context/         # React Context untuk tema dan state global
│   ├── pages/           # Halaman utama (Dashboard, Chat)
│   ├── services/        # Integrasi HTTP API (ai.ts, api.ts)
│   ├── types/           # Interface dan definisi tipe TypeScript
│   ├── App.tsx          # Router Provider
│   ├── index.css        # Konfigurasi Tailwind v4 & tema
│   └── main.tsx         # Entry point aplikasi React
├── .env.example         # Contoh konfigurasi variabel lingkungan
├── package.json
└── vite.config.ts
```

---

## ⚙️ Panduan Instalasi & Setup

### 1. Prasyarat
Pastikan komputer kamu sudah terpasang:
- **Node.js** (versi 18 ke atas disarankan)
- Package Manager: **pnpm** (disarankan) atau **npm**

### 2. Navigasi ke Direktori Client
```bash
cd client
```

### 3. Konfigurasi Environment Variables (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi endpoint backend server (sesuaikan port jika diperlukan):
```env
VITE_API_URL=http://localhost:8000/api
```

### 4. Instalasi Dependensi
Jalankan perintah instalasi paket:
```bash
pnpm install
# atau menggunakan npm:
# npm install
```

### 5. Menjalankan Server Development
Jalankan dev server lokal:
```bash
pnpm dev
# atau menggunakan npm:
# npm run dev
```
Buka browser di: [http://localhost:5173](http://localhost:5173)

---

## 💻 Script yang Tersedia

| Perintah | Deskripsi |
| :--- | :--- |
| `pnpm dev` | Menjalankan Vite development server lokal. |
| `pnpm build` | Memeriksa tipe dan mengompilasi bundel produksi ke folder `dist/`. |
| `pnpm preview` | Menjalankan pratinjau lokal dari hasil kompilasi produksi. |
| `pnpm lint` | Menjalankan analisis kode menggunakan ESLint. |
| `pnpm make:page <NamaPage>` | Generator CLI otomatis untuk menambahkan halaman baru dan rutenya. |
