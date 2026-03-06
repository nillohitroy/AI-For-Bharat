import os
import json
import time
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from app.services.ai_engine import generate_contextual_module
from app.services.bedrock_engine import invoke_bedrock_json, BEDROCK_ACTIVE
from app.services.database import supabase

router = APIRouter()

# --- QUIZ & SYLLABUS GENERATORS ---
@router.get("/generate-quiz")
async def generate_quiz(title: str = Query(...), category: str = Query(...)):
    if not BEDROCK_ACTIVE:
        return _mock_quiz_generator(title, category)
    prompt = f"""Generate a realistic social engineering scenario for a lesson titled "{title}" (Category: {category}). Create a multiple-choice question testing the user's ability to identify the red flag. Return EXACTLY 4 options. Return ONLY JSON: {{"scenario": "...", "question": "...", "options": ["1", "2", "3", "4"], "correctIndex": 0}}"""
    result = await invoke_bedrock_json(prompt)
    if "error" in result: return _mock_quiz_generator(title, category)
    return result

@router.get("/generate-syllabus")
async def generate_new_module(current_xp: int = Query(...)):
    if not BEDROCK_ACTIVE:
        return _mock_syllabus_generator(current_xp)
    prompt = f"""Indian user has {current_xp} XP. Generate one advanced module (e.g., SIM Swapping, UPI Scams). Return ONLY JSON: {{"title": "...", "category": "...", "description": "...", "reward": 250}}"""
    result = await invoke_bedrock_json(prompt)
    if "error" in result: return _mock_syllabus_generator(current_xp)
    result["id"] = int(time.time())
    result["requiredXp"] = current_xp
    return result

@router.get("/contextual")
async def get_literacy_module(threat_id: str):
    threat_query = supabase.table("threats").select("*").eq("id", threat_id).execute()
    if not threat_query.data: return {"error": "Threat not found"}
    threat = threat_query.data[0]
    
    existing = supabase.table("saved_modules").select("*").eq("threat_id", threat_id).execute()
    if existing.data: return existing.data[0] 

    ai_data = await generate_contextual_module(threat['content'])
    if "error" in ai_data: return ai_data

    saved_module = {
        "guardian_id": threat['guardian_id'],
        "threat_id": threat_id,
        "original_message": threat['content'],
        "title": ai_data.get("title", "Scam Analysis"),
        "overview": ai_data.get("overview", "Analysis of the specific threat."),
        "steps": ai_data.get("steps", []), 
        "warning_rule": ai_data.get("warningRule", ai_data.get("warning_rule", "Stay alert."))
    }
    res = supabase.table("saved_modules").insert(saved_module).execute()
    return res.data[0]

# ==========================================
# Fetch Dashboard: Bulletproof Reader
# ==========================================
def _fetch_user_metadata(guardian_id: str) -> dict:
    meta = None
    
    # 1. Try Profiles Table First
    try:
        res = supabase.table("profiles").select("raw_user_meta_data").eq("id", guardian_id).execute()
        if res.data and res.data[0].get("raw_user_meta_data"):
            raw_meta = res.data[0]["raw_user_meta_data"]
            
            # FIX: If Supabase returns a string instead of JSON, parse it!
            if isinstance(raw_meta, str):
                meta = json.loads(raw_meta)
            else:
                meta = raw_meta
            print("✅ Data found and parsed from Profiles table.")
    except Exception as e:
        print(f"⚠️ Profiles table read failed: {e}")

    # 2. Fallback to Internal Auth Table
    if not meta:
        print("🔄 Falling back to Internal Auth table...")
        try:
            auth_res = supabase.auth.admin.get_user_by_id(guardian_id)
            if auth_res and auth_res.user and auth_res.user.user_metadata:
                meta = auth_res.user.user_metadata
                print("✅ Data found in Internal Auth table.")
        except Exception as e:
            print(f"❌ Auth table read failed: {e}")

    return meta or {}

@router.get("/dashboard/{guardian_id}")
async def get_literacy_dashboard(guardian_id: str):
    try:
        meta = _fetch_user_metadata(guardian_id)
        return {
            "xp": meta.get("xp", 0),
            "custom_lessons": meta.get("custom_lessons", []),
            "completed_lessons": meta.get("completed_lessons", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# Complete Quiz: Double-Save Sync
# ==========================================
class QuizCompleteRequest(BaseModel):
    guardian_id: str
    lesson_id: int
    reward: int
    is_practice: bool = False
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None

@router.post("/complete-quiz")
async def complete_quiz(request: QuizCompleteRequest):
    try:
        meta = _fetch_user_metadata(request.guardian_id)
        completed = meta.get("completed_lessons", [])
        current_xp = meta.get("xp", 0)
        
        if request.lesson_id in completed:
            return {"status": "already_completed", "xp": current_xp}
            
        completed.append(request.lesson_id)
        new_xp = current_xp + request.reward
        meta["completed_lessons"] = completed
        meta["xp"] = new_xp
        
        # Save Quick Practice modules
        if request.is_practice:
            custom_lessons = meta.get("custom_lessons", [])
            custom_lessons.insert(0, {
                "id": request.lesson_id,
                "title": f"Practice: {request.title}",
                "category": request.category,
                "reward": request.reward,
                "requiredXp": 0, 
                "description": request.description or "Practice simulation completed."
            })
            meta["custom_lessons"] = custom_lessons
        
        # 1. Save EXCLUSIVELY to the profiles table
        profile_data = {
            "id": request.guardian_id,
            "raw_user_meta_data": meta
        }
        supabase.table("profiles").upsert(profile_data).execute()
        print(f"✅ Saved to Profiles Table.")

        # 2. FIX: ALSO save it back to the hidden Auth table so they never go out of sync!
        try:
            supabase.auth.admin.update_user_by_id(request.guardian_id, {"user_metadata": meta})
            print(f"✅ Mirrored to Auth Table.")
        except Exception as auth_e:
            print(f"⚠️ Could not mirror to auth (safe to ignore): {auth_e}")
        
        print(f"🎉 SUCCESS: Progress saved! New EXP: {new_xp}")
        return {"status": "success", "new_xp": new_xp}
        
    except Exception as e:
        print(f"❌ Error completing quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- FALLBACKS ---
def _mock_quiz_generator(title, category):
    return {"scenario": f"[MOCK] A specific scenario for {title} involving a suspicious link.", "question": f"How can you tell this {category} vector is fake?", "options": ["URL is misspelled", "Sender is unknown", "Sense of urgency", "All of the above"], "correctIndex": 3}

def _mock_syllabus_generator(xp):
    return {"id": int(time.time()), "title": "Deepfake Voice Scams", "category": "AI Social Engineering", "description": "Learn to identify synthetic voices of family members asking for urgent money.", "reward": 250, "requiredXp": xp}