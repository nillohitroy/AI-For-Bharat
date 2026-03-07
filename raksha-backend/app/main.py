from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import literacy, guardian

app = FastAPI(title="Raksha AI Core Engine")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register our routers
app.include_router(literacy.router, prefix="/api/literacy", tags=["Digital Literacy"])
app.include_router(guardian.router, prefix="/api/guardian", tags=["Mobile Guardian"])

@app.get("/")
async def root():
    return {"status": "online", "system": "Raksha AI Backend"}