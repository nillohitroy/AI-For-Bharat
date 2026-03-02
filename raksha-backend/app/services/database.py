import os
from supabase import create_client, Client
from dotenv import load_dotenv, find_dotenv

# Load environment variables from the .env file
env_path = find_dotenv()
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY")

# Initialize the Supabase client safely
if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: SUPABASE_URL or SUPABASE_KEY is missing in .env")
    supabase: Client = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Successfully connected to Supabase.")

async def insert_threat(sender, content, risk_score, confidence, cultural_context_flag, explanation, peer_id, guardian_id):
    """
    Inserts threat and triggers Supabase Realtime automatically.
    """
    # Production status routing
    # If the AI is only 50-70% confident or returns MEDIUM risk, 
    # route it to 'pending' for the Guardian Portal.
    status = "pending" if risk_score == "MEDIUM" or confidence < 75 else ("scam" if risk_score == "HIGH" else "safe")

    data = {
        "sender": sender,
        "content": content,
        "risk_score": risk_score,
        "confidence": confidence,
        "cultural_context_flag": cultural_context_flag,
        "explanation": explanation,
        "status": status,
        "peer_id": peer_id,
        "guardian_id": guardian_id
    }

    try:
        # Pushing to Supabase triggers the WebSocket broadcast to the Next.js app
        response = supabase.table("threats").insert(data).execute()
        return response.data[0]
    except Exception as e:
        print(f"Database Broadcast Error: {e}")
        return None