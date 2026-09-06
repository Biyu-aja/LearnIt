from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.db import connect_db, disconnect_db
from app.api.routes.document import router as document_router
from app.api.routes.chat import router as chat_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Dijalankan saat server mulai
    await connect_db()
    yield
    # Dijalankan saat server dimatikan
    await disconnect_db()

app = FastAPI(
    title="LearnIt AI Server",
    description="Backend API untuk Agent AI Tanya Jawab Dokumen PDF",
    version="1.0.0",
    lifespan=lifespan
)

# Konfigurasi CORS agar frontend dapat memanggil API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list if settings.cors_list else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan Router Endpoint
app.include_router(document_router, prefix="/api")
app.include_router(chat_router, prefix="/api")

@app.get("/", tags=["Health Check"])
async def root():
    return {
        "status": "online",
        "service": "LearnIt AI Backend",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=True
    )
