from fastapi import APIRouter, Request, Response, BackgroundTasks
from app.services.database import supabase, insert_threat
from app.services.ai_engine import analyze_cultural_threat
import logging

router = APIRouter()

MY_GUARDIAN_ID = "c2e79516-6d10-406f-a3c8-709ffb51a50f" 

@router.post("/sms")
async def twilio_webhook(request: Request, background_tasks: BackgroundTasks):
    form_data = await request.form()
    sender_number = form_data.get("From")  # The number you are texting FROM
    message_content = form_data.get("Body")

    print(f"INCOMING SMS FROM: {sender_number}")
    print(f"CONTENT: {message_content}")

    # The 'Tracking' mechanism
    peer_lookup = supabase.table("peers")\
        .select("id, guardian_id, name")\
        .eq("phone_number", sender_number)\
        .execute()

    if not peer_lookup.data:
        print(f"Unregistered number ({sender_number})! Bypassing filter for Live Demo.")
        # For the demo, if the number isn't registered, we force it to show on YOUR dashboard
        peer_id = None
        guardian_id = MY_GUARDIAN_ID
    else:
        peer = peer_lookup.data[0]
        print(f"MATCH FOUND: Targeted at {peer['name']}")
        peer_id = peer['id']
        guardian_id = peer['guardian_id']
    
    # Offload to background task to respond to Twilio quickly
    background_tasks.add_task(
        process_and_broadcast, 
        sender_number, 
        message_content, 
        peer_id, 
        guardian_id
    )

    return Response(content="<Response></Response>", media_type="application/xml")

async def process_and_broadcast(sender, content, peer_id, guardian_id):
    print("Sending to AWS Bedrock AI Engine...")
    # Get Cultural AI Analysis
    analysis = await analyze_cultural_threat(sender, content)
    print(f"AI Result: {analysis['riskScore']} - {analysis['culturalContextFlag']}")
    
    # Log to Supabase - This triggers the Next.js Realtime event
    await insert_threat(
        sender=sender,
        content=content,
        peer_id=peer_id,
        guardian_id=guardian_id,
        risk_score=analysis.get("riskScore", "HIGH"),
        confidence=analysis.get("confidence", 85),
        cultural_context_flag=analysis.get("culturalContextFlag", "Alert"),
        explanation=analysis.get("explanation", "Scam detected.")
    )