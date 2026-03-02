import os
import json
from dotenv import load_dotenv, find_dotenv
import google.generativeai as genai

# Actively walk up the folder tree to locate the .env file in the root!
load_dotenv(find_dotenv())

gemini_key = os.getenv("GEMINI_API_KEY")

if gemini_key:
    print("✅ .env file located and Gemini API Key loaded successfully!")
    genai.configure(api_key=gemini_key)
    # Using Gemini 1.5 Flash for high-speed, free inference
    model = genai.GenerativeModel('gemini-2.5-flash')
    AI_ACTIVE = True
else:
    print("❌ ERROR: Cannot find GEMINI_API_KEY in your .env file.")
    AI_ACTIVE = False

async def analyze_cultural_threat(sender: str, content: str) -> dict:
    """Analyzes a message for localized Indian scam patterns using Gemini."""
    
    if not AI_ACTIVE:
        return _get_mock_analysis(content)

    prompt = f"""
    You are Raksha AI, a cybersecurity expert specializing in Indian social engineering.
    Analyze the following message intercepted from: {sender}
    
    Message Content: "{content}"
    
    Tasks:
    1. Determine riskScore: 'HIGH' (Clear scam), 'MEDIUM' (Suspicious/Needs review), 'LOW' (Likely safe).
    2. Identify culturalContextFlag: (e.g., 'UPI Fraud', 'Aadhar Panic', 'Diwali Offer Trap', 'KYC Scam', 'Job Fraud').
    3. Calculate confidence: 0-100.
    4. Provide a brief explanation.
    
    CRITICAL INSTRUCTION: Return ONLY a valid JSON object.
    {{
        "riskScore": "HIGH",
        "culturalContextFlag": "UPI Fraud",
        "confidence": 95,
        "explanation": "Brief explanation here..."
    }}
    """

    try:
        # Gemini's native JSON mode guarantees perfect formatting
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.3
            )
        )
        return json.loads(response.text)

    except Exception as e:
        print(f"❌ AI Engine Error: {e}")
        return _get_mock_analysis(content)

def _get_mock_analysis(content: str):
    """Fallback logic if AI is offline."""
    is_suspicious = any(word in content.lower() for word in ["kyc", "block", "offer", "winner", "otp", "vpa"])
    return {
        "riskScore": "HIGH" if is_suspicious else "LOW",
        "culturalContextFlag": "Localized Pattern Detected",
        "confidence": 85,
        "explanation": "Analyzed via local pattern matching (AI Offline)."
    }

async def generate_contextual_module(scam_message: str) -> dict:
    """Generates a custom digital literacy lesson based on the EXACT scam text."""
    
    if not AI_ACTIVE:
        return {"error": "AI Engine is offline."}

    prompt = f"""
    You are Raksha AI, an expert cybersecurity educator in India.
    A user just received this EXACT scam message: "{scam_message}"
    
    Create a specific, 3-step digital literacy module teaching the user how THIS SPECIFIC message tricks them.
    
    CRITICAL INSTRUCTION: Return ONLY a valid JSON object with this exact structure:
    {{
        "title": "Dissecting the Scam",
        "overview": "A brief 2-sentence explanation of how this specific message manipulates the victim.",
        "steps": [
            {{"stepNumber": 1, "title": "The Hook", "content": "How the scammer uses the text to grab attention."}},
            {{"stepNumber": 2, "title": "The Trap", "content": "The specific action they want you to take."}},
            {{"stepNumber": 3, "title": "The Defense", "content": "How to verify this specific claim safely."}}
        ],
        "warningRule": "A catchy 1-sentence golden rule to remember."
    }}
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.5
            )
        )
        return json.loads(response.text)

    except Exception as e:
        print(f"❌ Contextual Module Generation Error: {e}")
        return {"error": "Failed to generate contextual module."}