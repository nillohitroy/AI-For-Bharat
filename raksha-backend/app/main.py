from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import literacy, webhooks

app = FastAPI(title="Raksha AI Core Engine")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Your Next.js app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register our routers
app.include_router(literacy.router, prefix="/api/literacy", tags=["Digital Literacy"])
app.include_router(webhooks.router, prefix="/hooks", tags=["Twilio Webhooks"])

@app.get("/")
async def root():
    return {"status": "online", "system": "Raksha AI Backend"}