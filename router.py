import os
from dotenv import load_dotenv
from openai import OpenAI
import anthropic
import google.generativeai as genai

load_dotenv()

# Initialize Clients
try:
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except:
    openai_client = None

try:
    anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
except:
    anthropic_client = None

try:
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    gemini_model = genai.GenerativeModel("gemini-1.5-flash")
except:
    gemini_model = None

def call_gpt4o(prompt):
    if not openai_client: return "❌ API Key Missing"
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[{}],
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {e}"

def call_claude3(prompt):
    if not anthropic_client: return "❌ API Key Missing"
    try:
        response = anthropic_client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=1024,
            temperature=0.7,
            messages=[{}]
        )
        return response.content[0].text
    except Exception as e:
        return f"Error: {e}"

def call_gemini(prompt):
    if not gemini_model: return "❌ API Key Missing"
    try:
        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {e}"

def synthesize_results(prompt, gpt_res, claude_res, gemini_res):
    if not openai_client: return "❌ API Key Missing for Synthesis"
    fusion_prompt = f"""
    You are CHADRAK SUPREME.
    User Prompt: "{prompt}"
    
    Inputs:
    1. GPT-4o: {gpt_res}
    2. Claude 3: {claude_res}
    3. Gemini 1.5: {gemini_res}
    
    TASK: Synthesize these into ONE superior answer. Be sophisticated and helpful.
    """
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": fusion_prompt}],
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {e}"