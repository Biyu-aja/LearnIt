from prisma import Prisma
import logging

logger = logging.getLogger("uvicorn")

db = Prisma()

async def connect_db():
    """Menghubungkan Prisma Client ke PostgreSQL"""
    try:
        if not db.is_connected():
            await db.connect()
            logger.info("Berhasil terhubung ke PostgreSQL via Prisma!")
    except Exception as e:
        logger.error(f"Gagal menghubungkan ke PostgreSQL: {e}")
        raise e

async def disconnect_db():
    """Memutuskan koneksi Prisma Client"""
    if db.is_connected():
        await db.disconnect()
        logger.info("Koneksi Prisma terputus.")
