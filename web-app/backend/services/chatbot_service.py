"""
Universal AI-Powered Chatbot Service - BioGuideAI

This chatbot can answer ANY question the user asks, including:
- Bioinformatics concepts
- Programming questions
- Data interpretation
- Machine learning explanations
- Alignment results
- Virulence factor analysis
- General biology questions
- General technical questions
- Any other topic

Supports multiple AI providers:
1. OpenAI (GPT-4, GPT-3.5-turbo)
2. Anthropic Claude (if you have API key)
3. Google Gemini (if you have API key)
"""

import os
from typing import Optional, List, Dict
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', '')

# Universal system prompt - can answer anything
SYSTEM_PROMPT = """You are BioGuideAI, a universal AI assistant for bioinformatics education and analysis.

You can answer ANY question the user asks, including:
- Bioinformatics concepts
- Programming questions
- Data interpretation
- Machine learning explanations
- Alignment results
- Virulence factor analysis
- General biology questions
- General technical questions
- Any other topic

When answering:
1. If the question relates to bioinformatics or the current project, explain it in that context.
2. If it is a general question, answer it normally and clearly.
3. Always prefer clarity over jargon.
4. If a concept is advanced, explain it step-by-step.
5. When scientific facts are involved, rely only on trusted sources (NCBI, UniProt, Pfam, VFDB, HMMER, peer-reviewed papers).
6. If information is uncertain or depends on assumptions, clearly say so.
7. Never fabricate biological facts or results.

Context about the bioinformatics platform (when relevant):
- The platform predicts ORFs from bacterial genomes (6-frame translation)
- Uses Random Forest ML to predict virulence probability
- Runs BLAST against VFDB (Virulence Factor Database)
- Detects signal peptides for secreted proteins
- Combines evidence into VF score (0-6 points)

Scoring system:
- ML: 0-2 points (2 if prob ≥70%, 1 if ≥50%, 0 otherwise)
- BLAST: 0-3 points (3 if identity >80%, 2 if >60%, 1 if >40%, 0 otherwise)
- SignalP: 0-1 point (1 if signal peptide detected, 0 otherwise)

Classifications:
- 5-6 points: High-confidence VF
- 3-4 points: Putative VF
- 1-2 points: Low-confidence VF
- 0 points: Non-VF

Tone:
- Friendly
- Patient
- Mentor-like
- Curious and supportive

You are not limited to predefined topics.
You are here to help the user understand anything they ask."""


async def get_ai_response(message: str, history: Optional[List[Dict]] = None) -> str:
    """
    Get AI-powered response to user question
    
    Args:
        message: User's current message
        history: Conversation history (list of {role, content} dicts)
    
    Tries multiple providers in order:
    1. OpenAI
    2. Anthropic
    3. Google Gemini
    4. Fallback error message
    """
    
    # Try OpenAI first (best for general questions)
    if OPENAI_API_KEY:
        try:
            return await get_openai_response(message, history)
        except Exception as e:
            print(f"OpenAI failed: {e}")
    
    # Try Anthropic
    if ANTHROPIC_API_KEY:
        try:
            return await get_anthropic_response(message, history)
        except Exception as e:
            print(f"Anthropic failed: {e}")
    
    # Try Google Gemini
    if GOOGLE_API_KEY:
        try:
            return await get_gemini_response(message, history)
        except Exception as e:
            print(f"Gemini failed: {e}")
    
    # No API keys configured
    return get_no_api_key_message()


async def get_openai_response(message: str, history: Optional[List[Dict]] = None) -> str:
    """Get response from OpenAI API"""
    try:
        from openai import AsyncOpenAI
        
        client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        
        # Build messages array with history
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Add conversation history (last 10 messages for context)
        if history:
            for msg in history[-10:]:
                if msg.get('role') in ['user', 'assistant']:
                    messages.append({
                        "role": msg['role'],
                        "content": msg['content']
                    })
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",  # You can change to "gpt-4" for better quality
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")


async def get_anthropic_response(message: str, history: Optional[List[Dict]] = None) -> str:
    """Get response from Anthropic Claude API"""
    try:
        import anthropic
        
        client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
        
        # Build messages array
        messages = []
        
        if history:
            for msg in history[-10:]:
                if msg.get('role') in ['user', 'assistant']:
                    messages.append({
                        "role": msg['role'],
                        "content": msg['content']
                    })
        
        messages.append({"role": "user", "content": message})
        
        response = await client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=500,
            system=SYSTEM_PROMPT,
            messages=messages
        )
        
        return response.content[0].text.strip()
    
    except Exception as e:
        raise Exception(f"Anthropic API error: {str(e)}")


async def get_gemini_response(message: str, history: Optional[List[Dict]] = None) -> str:
    """Get response from Google Gemini API"""
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        # Build full prompt with history
        full_prompt = f"{SYSTEM_PROMPT}\n\n"
        
        if history:
            for msg in history[-10:]:
                role = "User" if msg.get('role') == 'user' else "Assistant"
                full_prompt += f"{role}: {msg['content']}\n"
        
        full_prompt += f"User: {message}\nAssistant:"
        
        response = await model.generate_content_async(full_prompt)
        
        return response.text.strip()
    
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")


def get_no_api_key_message() -> str:
    """Return message when no API keys are configured"""
    return """⚠️ **AI Service Not Configured**

To enable the AI chatbot, you need to set up an API key:

1. **OpenAI (Recommended)**
   - Get API key from: https://platform.openai.com/api-keys
   - Add to `.env` file: `OPENAI_API_KEY=your-key-here`

2. **Anthropic Claude** (Alternative)
   - Get API key from: https://console.anthropic.com/
   - Add to `.env` file: `ANTHROPIC_API_KEY=your-key-here`

3. **Google Gemini** (Alternative)
   - Get API key from: https://makersuite.google.com/app/apikey
   - Add to `.env` file: `GOOGLE_API_KEY=your-key-here`

After adding the key to `.env`, restart the backend server.

**For now, I can provide basic help:**
- Ask about ORFs, BLAST, ML predictions, signal peptides
- Learn about virulence factors and result interpretation
- Get guidance on using this platform"""


# Helper function for synchronous code
def get_ai_response_sync(message: str, history: Optional[List[Dict]] = None) -> str:
    """Synchronous wrapper for AI response"""
    import asyncio
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    return loop.run_until_complete(get_ai_response(message, history))
