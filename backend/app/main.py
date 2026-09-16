from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.routes import auth, scrap, recycler, pickup, transaction

# Initialize database schema tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="KabadiSetu Platform API for Smart India Hackathon 2026 (SIH26229 – Kabadiwala Connect)"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register feature route modules
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(scrap.router, prefix=settings.API_PREFIX)
app.include_router(recycler.router, prefix=settings.API_PREFIX)
app.include_router(pickup.router, prefix=settings.API_PREFIX)
app.include_router(transaction.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "hackathon": "Smart India Hackathon 2026",
        "problemStatement": "SIH26229 – Kabadiwala Connect"
    }

@app.get("/health")
def healthcheck():
    return {"status": "healthy"}
