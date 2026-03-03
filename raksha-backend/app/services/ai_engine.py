import json
from app.services.bedrock_engine import invoke_bedrock_json, BEDROCK_ACTIVE

async def analyze_cultural_threat(sender: str, content: str) -> dict:
    """Analyzes a message for localized Indian scam patterns using AWS Bedrock."""
    
    if not BEDROCK_ACTIVE:
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
    
    CRITICAL INSTRUCTION: Return ONLY a valid JSON object. Do not include markdown formatting or extra text.
    {{
        "riskScore": "HIGH",
        "culturalContextFlag": "UPI Fraud",
        "confidence": 95,
        "explanation": "Brief explanation here..."
    }}
    """

    result = await invoke_bedrock_json(prompt)
    if "error" in result:
        print(f"❌ AI Engine Fallback Triggered: {result['error']}")
        return _get_mock_analysis(content)
        
    return result

def _get_mock_analysis(content: str):
    """Fallback logic if AI is offline."""
    is_suspicious = any(word in content.lower() for word in ["kyc", "block", "offer", "winner", "otp", "vpa"])
    return {
        "riskScore": "HIGH" if is_suspicious else "LOW",
        "culturalContextFlag": "Localized Pattern Detected",
        "confidence": 85,
        "explanation": "Analyzed via local pattern matching (AWS Bedrock Offline)."
    }

async def generate_contextual_module(scam_message: str) -> dict:
    """Generates a custom digital literacy lesson based on the EXACT scam text."""
    
    if not BEDROCK_ACTIVE:
        return {"error": "AWS Bedrock is offline."}

    prompt = f"""
    You are Raksha AI, an expert cybersecurity educator in India.
    A user just received this EXACT scam message: "{scam_message}"
    
    Create a specific, 3-step digital literacy module teaching the user how THIS SPECIFIC message tricks them.
    
    CRITICAL INSTRUCTION: Return ONLY a valid JSON object with this exact structure (no markdown):
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

    result = await invoke_bedrock_json(prompt)
    if "error" in result:
        print(f"❌ Contextual Module Generation Error: {result['error']}")
        return {"error": "Failed to generate contextual module."}
        
    return result