import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from app.services.ai_engine import analyze_cultural_threat
from app.services.database import insert_threat, supabase

# Setup logger for backend debugging
logger = logging.getLogger(__name__)

router = APIRouter()

class MobileThreatRequest(BaseModel):
    sender: str
    content: str
    guardian_id: str
    peer_id: Optional[str] = None 

@router.post("/analyze")
async def analyze_mobile_sms(request: MobileThreatRequest, background_tasks: BackgroundTasks):
    """
    Endpoint for the Flutter app to submit SMS content for real-time analysis.
    """
    clean_peer_id = request.peer_id if request.peer_id and request.peer_id.strip() != "" else None

    try:
        profile = supabase.table("profiles").select("id").eq("id", request.guardian_id).execute()
        if not profile.data:
            raise HTTPException(status_code=404, detail="Guardian profile not found.")
            
    except Exception as e:
        logger.error(f"Supabase verification error: {e}")
        if isinstance(e, HTTPException):
            raise e

    background_tasks.add_task(
        process_mobile_threat,
        request.sender,
        request.content,
        clean_peer_id,
        request.guardian_id
    )

    return {"status": "success", "message": "Analysis queued."}


@router.get("/{guardian_id}/threats")
async def get_recent_threats(guardian_id: str):
    """
    Endpoint for the Flutter app to fetch the latest threats for the Live Feed.
    """
    try:
        response = supabase.table("threats") \
            .select("*") \
            .eq("guardian_id", guardian_id) \
            .order("created_at", desc=True) \
            .limit(10) \
            .execute()
            
        formatted_threats = []
        for threat in response.data:
            formatted_threats.append({
                "id": threat.get("id"),
                "sender": threat.get("sender", "Unknown"),
                "content": threat.get("content", ""),
                "severity": threat.get("risk_score", "HIGH"), 
                "created_at": threat.get("created_at"),
                "cultural_context_flag": threat.get("cultural_context_flag", ""),
                # THE FIX: We must pass the explanation to Flutter so the button hides if it's already done!
                "explanation": threat.get("explanation", "") 
            })
            
        return formatted_threats

    except Exception as e:
        logger.error(f"Error fetching threats for guardian {guardian_id}: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch recent threats.")


# ==========================================
# NEW: On-Demand AI Analysis Endpoint
# ==========================================
@router.get("/threat/{threat_id}/analyze")
async def get_or_generate_threat_analysis(threat_id: str):
    """
    Checks the DB for an existing explanation. If missing, triggers Bedrock, 
    saves it to the DB, and returns it to Flutter.
    """
    try:
        # 1. Fetch the exact threat from Supabase
        response = supabase.table("threats").select("*").eq("id", threat_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Threat not found.")
            
        threat = response.data[0]
        
        # 2. If the explanation already exists, return it instantly!
        if threat.get("explanation") and threat.get("explanation") != "Scam detected via Raksha Mobile App.":
            return {
                "riskScore": threat.get("risk_score"),
                "culturalContextFlag": threat.get("cultural_context_flag"),
                "explanation": threat.get("explanation")
            }
            
        # 3. If missing (e.g., background task failed or was too slow), generate it NOW using Bedrock
        analysis = await analyze_cultural_threat(threat.get("sender", "Unknown"), threat.get("content", ""))
        
        # 4. Save the new Bedrock insights back to the database
        supabase.table("threats").update({
            "risk_score": analysis.get("riskScore", "HIGH"),
            "cultural_context_flag": analysis.get("culturalContextFlag", "General Alert"),
            "explanation": analysis.get("explanation", "Analysis generated."),
            "confidence": analysis.get("confidence", 85)
        }).eq("id", threat_id).execute()
        
        return analysis

    except Exception as e:
        logger.error(f"Error fetching/generating analysis for {threat_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze threat.")


async def process_mobile_threat(sender: str, content: str, peer_id: Optional[str], guardian_id: str):
    try:
        analysis = await analyze_cultural_threat(sender, content)
        
        logger.info(f"AI Analysis Complete - Score: {analysis.get('riskScore')} - Context: {analysis.get('culturalContextFlag')}")
        
        await insert_threat(
            sender=sender,
            content=content,
            risk_score=analysis.get("riskScore", "HIGH"),
            confidence=analysis.get("confidence", 85),
            cultural_context_flag=analysis.get("culturalContextFlag", "General Alert"),
            explanation=analysis.get("explanation", "Scam detected via Raksha Mobile App."),
            peer_id=peer_id,
            guardian_id=guardian_id
        )
    except Exception as e:
        logger.error(f"Fatal error processing mobile threat in background: {e}")