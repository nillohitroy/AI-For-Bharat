import os
import json
import time
from fastapi import APIRouter, HTTPException, Query
from app.services.ai_engine import generate_contextual_module
from app.services.bedrock_engine import invoke_bedrock_json, BEDROCK_ACTIVE
from app.services.database import supabase

router = APIRouter()

# --- QUIZ GENERATOR ---
@router.get("/generate-quiz")
async def generate_quiz(
    title: str = Query(..., description="The specific title of the lesson"),
    category: str = Query(..., description="The category of the threat")
):
    if not BEDROCK_ACTIVE:
        print("⚠️ Warning: AWS Bedrock not connected. Using mock quiz.")
        return _mock_quiz_generator(title, category)

    prompt = f"""
    You are an expert cybersecurity educator for the Indian demographic.
    Generate a realistic, text-based social engineering scenario for a lesson titled "{title}" (Category: {category}). 
    
    Then, create a multiple-choice question testing the user's ability to identify the psychological trick or technical red flag. Provide exactly 4 options.
    
    Return ONLY a valid JSON object matching this exact structure (no markdown):
    {{
        "scenario": "A 2-3 sentence realistic scenario...",
        "question": "What is the primary red flag here?",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctIndex": 0
    }}
    """
    
    result = await invoke_bedrock_json(prompt)
    if "error" in result:
        print("🔄 Falling back to mock quiz so the UI doesn't crash...")
        return _mock_quiz_generator(title, category)
        
    return result

# --- SYLLABUS GENERATOR (Infinite Modules) ---
@router.get("/generate-syllabus")
async def generate_new_module(
    current_xp: int = Query(..., description="User's current XP to scale difficulty")
):
    if not BEDROCK_ACTIVE:
        print("⚠️ Warning: AWS Bedrock not connected. Using mock syllabus.")
        return _mock_syllabus_generator(current_xp)

    prompt = f"""
    An Indian user has {current_xp} XP in cybersecurity training. 
    Generate one brand new, more advanced module for them. 
    Topics should be advanced (e.g., SIM Swapping, UPI Intent Scams, AI Voice Scams, Fake Charity).
    
    Return ONLY a JSON object matching this exact structure (no markdown):
    {{
        "title": "A short, catchy module title",
        "category": "Broad Category (e.g., AI Scams)",
        "description": "A 1-sentence description of the threat.",
        "reward": 250
    }}
    """

    result = await invoke_bedrock_json(prompt)
    if "error" in result:
        print("🔄 Falling back to mock syllabus...")
        return _mock_syllabus_generator(current_xp)
        
    result["id"] = int(time.time())
    result["requiredXp"] = current_xp
    return result

# --- DYNAMIC CONTEXTUAL MODULE GENERATOR ---
@router.get("/contextual")
async def get_literacy_module(threat_id: str):
    if supabase is None:
        raise HTTPException(status_code=500, detail="Database connection is offline.")

    threat_query = supabase.table("threats").select("*").eq("id", threat_id).execute()
    if not threat_query.data:
        return {"error": "Threat not found"}
    
    threat = threat_query.data[0]
    raw_message = threat['content']
    guardian_id = threat['guardian_id']

    existing = supabase.table("saved_modules").select("*").eq("threat_id", threat_id).execute()
    if existing.data:
        return existing.data[0] 

    ai_data = await generate_contextual_module(raw_message)

    if "error" in ai_data:
        return ai_data

    saved_module = {
        "guardian_id": guardian_id,
        "threat_id": threat_id,
        "original_message": raw_message,
        "title": ai_data.get("title", "Scam Analysis"),
        "overview": ai_data.get("overview", "Analysis of the specific threat."),
        "steps": ai_data.get("steps", []), 
        "warning_rule": ai_data.get("warningRule", ai_data.get("warning_rule", "Stay alert."))
    }
    
    res = supabase.table("saved_modules").insert(saved_module).execute()
    return res.data[0]

# --- FALLBACKS ---
def _mock_quiz_generator(title, category):
    return {
        "scenario": f"[MOCK] A specific scenario for {title} involving a suspicious link.",
        "question": f"How can you tell this {category} vector is fake?",
        "options": ["URL is misspelled", "Sender is unknown", "Sense of urgency", "All of the above"],
        "correctIndex": 3
    }

def _mock_syllabus_generator(xp):
    return {
        "id": int(time.time()),
        "title": "Deepfake Voice Scams",
        "category": "AI Social Engineering",
        "description": "Learn to identify synthetic voices of family members asking for urgent money.",
        "reward": 250,
        "requiredXp": xp
    }