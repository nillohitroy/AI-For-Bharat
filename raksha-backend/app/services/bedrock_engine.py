import os
import json
import boto3
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
MODEL_ID = os.getenv("BEDROCK_MODEL_ID")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")

if MODEL_ID and AWS_ACCESS_KEY_ID:
    print(f"Bedrock Engine Active: Routed to {MODEL_ID}")
    bedrock_client = boto3.client(
        service_name='bedrock-runtime',
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )
    BEDROCK_ACTIVE = True
else:
    print("❌ ERROR: Missing AWS credentials or BEDROCK_MODEL_ID in .env")
    bedrock_client = None
    BEDROCK_ACTIVE = False

async def invoke_bedrock_json(prompt: str) -> dict:
    """Calls AWS Bedrock and guarantees a JSON response."""
    if not BEDROCK_ACTIVE:
        return {"error": "Bedrock is offline"}

    messages = [{"role": "user", "content": [{"text": prompt}]}]
    
    try:
        response = bedrock_client.converse(
            modelId=MODEL_ID,
            messages=messages,
            inferenceConfig={"maxTokens": 1000, "temperature": 0.3} # Low temp for strict JSON
        )
        
        raw_text = response['output']['message']['content'][0]['text']
        
        # Clean up Markdown backticks if the model adds them (e.g., ```json ... ```)
        clean_json = raw_text.replace("```json", "").replace("```", "").strip()
        
        # Extract just the JSON object if the model was chatty
        start_idx = clean_json.find('{')
        end_idx = clean_json.rfind('}') + 1
        if start_idx != -1 and end_idx != 0:
            clean_json = clean_json[start_idx:end_idx]
            
        return json.loads(clean_json)

    except Exception as e:
        print(f"❌ AWS Bedrock Error: {e}")
        return {"error": str(e)}