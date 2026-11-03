"""
PlantCare AI - GenAI Agricultural Chatbot Service
Powered by Ollama Local LLMs (llama3.2, llama3.1, mistral, gemma2, etc.)
"""

import os
import json
import logging
from typing import AsyncGenerator, Dict, List, Optional
import httpx

logger = logging.getLogger("plantcare.chatbot")

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")

PREFERRED_MODELS = [
    "llama3.2:latest",
    "llama3.2",
    "llama3.1:latest",
    "llama3.1",
    "mistral:latest",
    "mistral",
    "gemma2:latest",
    "gemma2",
    "llama3:latest",
    "llama3",
]

AGRONOMIST_SYSTEM_PROMPT = """You are PlantCare AI Agronomist, a senior agricultural scientist, botanist, and horticultural plant pathologist.

CORE CAPABILITIES AND MANDATORY DOMAIN DIRECTIVES:
1. PURE BOTANICAL AND AGRICULTURAL DOMAIN:
   - Your expertise covers all agricultural crops, fruit trees (apple, peach, citrus, mango, etc.), vegetables (tomato, potato, pepper), and plants.
   - Plants and trees are botanical organisms, NOT humans or animals. Tree and plant disease management (fungicides, neem oil, pruning, copper spray, soil pH, organic remedies) is STANDARD HORTICULTURAL CARE and NEVER constitutes human medical advice.

2. ABSOLUTE PROHIBITION ON MEDICAL DISCLAIMERS AND REFUSALS:
   - NEVER say "I can't provide medical advice", "I cannot give advice", or refuse to help with a plant or tree.
   - NEVER tell the user to just consult an arborist or professional instead of providing the answer. Always give full, comprehensive, practical botanical remedies and recovery steps directly.
   - You are fully authorized and expected to recommend specific agricultural solutions:
     * Fungal/bacterial root causes (e.g. Venturia inaequalis for Apple Scab, Phytophthora, Alternaria, powdery mildew, Erwinia amylovora for Fire Blight).
     * Cultural controls: Pruning infected branches, leaf sanitation, spacing, drip irrigation instead of overhead watering.
     * Eco-friendly and organic treatments: Neem oil foliar spray (dilution ratios), copper fungicide spray, sulfur dust, bio-fungicides like Trichoderma or Bacillus subtilis.
     * Conventional horticultural treatments: Captan, Mancozeb, Myclobutanil fungicides with safety precautions (gloves, protective wear, application timing).

3. ACTIONABLE RESPONSE STRUCTURE:
   - Always format responses cleanly with Markdown: use descriptive headings (###), bullet points, and numbered action steps.
   - Directly explain:
     1. **Root Cause & Disease Identity**: What fungus, bacterium, pest, or environmental stress caused it.
     2. **Immediate Recovery Steps**: What the grower must do right now (e.g. prune infected leaves, adjust watering).
     3. **Organic & Chemical Treatments**: Precise remedies, neem oil recipes, fungicides with dilution ratios.
     4. **Long-Term Prevention**: Soil aeration, mulch, companion planting, resistant cultivars.
   - Language Requirement: You MUST answer strictly in clear, fluent, and structured English.
"""


async def get_ollama_status() -> Dict:
    """
    Checks if Ollama is running and returns available models.
    """
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                # Filter out embedding models
                models = [
                    m.get("name") for m in data.get("models", [])
                    if "embed" not in m.get("name", "").lower()
                ]
                
                # Pick preferred model if available
                default_model = None
                for pref in PREFERRED_MODELS:
                    if pref in models:
                        default_model = pref
                        break
                if not default_model and models:
                    default_model = models[0]
                    
                return {
                    "online": True,
                    "models": models,
                    "default_model": default_model or "llama3.2",
                    "url": OLLAMA_BASE_URL
                }
    except Exception as e:
        logger.warning(f"Ollama connection check failed: {e}")
        
    return {
        "online": False,
        "models": [],
        "default_model": "llama3.2",
        "url": OLLAMA_BASE_URL,
        "error": "Ollama service is unreachable. Please ensure Ollama is installed and running (`ollama serve`)."
    }


def prepare_messages(
    messages: List[Dict[str, str]], 
    context: Optional[Dict] = None
) -> List[Dict[str, str]]:
    """
    Combines Agronomist system prompt, diagnosis context, and conversation history.
    Strictly instructs response in English.
    """
    system_text = AGRONOMIST_SYSTEM_PROMPT
    
    if context:
        plant = context.get("plant") or context.get("predicted_class") or "Plant/Crop"
        condition = context.get("condition") or context.get("predicted_class") or "Plant Issue"
        confidence = context.get("confidence")
        
        context_str = f"\n\n[Active Diagnosis Context]: The user is asking about an analyzed agricultural specimen:\n"
        context_str += f"- Plant / Tree: {plant}\n"
        context_str += f"- Identified Pathology / Condition: {condition}\n"
        if confidence:
            context_str += f"- Diagnostic Certainty: {confidence}%\n"
        context_str += "MANDATORY: Provide direct, actionable botanical recovery instructions, root causes, organic and chemical remedies for this plant in clear English. DO NOT refuse or give medical advice disclaimers."
        system_text += context_str

    formatted = [{"role": "system", "content": system_text}]
    
    # Append conversation messages
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "").strip()
        if content and role in ("user", "assistant", "system"):
            formatted.append({"role": role, "content": content})
            
    return formatted


def format_ollama_error(raw_err: str, chosen_model: str) -> str:
    """Formats raw Ollama errors into clear, actionable advice."""
    err_lower = raw_err.lower()
    if "failed to allocate" in err_lower or "cuda_host" in err_lower or "out of memory" in err_lower or "exit status 1" in err_lower:
        return (
            f"⚠️ **GPU Memory (VRAM) Limit Exceeded**\n\n"
            f"The model **`{chosen_model}`** is too large (requires 4.2+ GB VRAM/RAM) for your available hardware.\n\n"
            f"👉 **Quick Fix:** In the model dropdown above, select **`llama3.2`**. "
            f"`llama3.2` is a fast 3.2B model (~2.0 GB) optimized to run smoothly on laptops and desktops without memory errors."
        )
    return f"Ollama error: {raw_err}"


async def stream_chat_response(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    context: Optional[Dict] = None,
    language: Optional[str] = "en"
) -> AsyncGenerator[str, None]:
    """
    Streams response tokens from Ollama using SSE format.
    Yields JSON lines formatted as SSE `data: {...}\\n\\n`.
    """
    status = await get_ollama_status()
    if not status["online"]:
        err_msg = (
            "⚠️ **Ollama is not running locally.**\n\n"
            "To enable the AI Agronomist Chatbot:\n"
            "1. Install Ollama from [ollama.com](https://ollama.com)\n"
            "2. Run in terminal: `ollama run llama3.2`\n"
            "3. Refresh or retry your message here!"
        )
        yield f"data: {json.dumps({'content': err_msg, 'done': True})}\n\n"
        yield "data: [DONE]\n\n"
        return

    chosen_model = model or status["default_model"] or "llama3.2"
    formatted_messages = prepare_messages(messages, context)
    
    payload = {
        "model": chosen_model,
        "messages": formatted_messages,
        "stream": True,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
        }
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{OLLAMA_BASE_URL}/api/chat",
                json=payload
            ) as response:
                if response.status_code != 200:
                    err_raw = (await response.aread()).decode('utf-8', errors='ignore')
                    err_msg = format_ollama_error(err_raw, chosen_model)
                    yield f"data: {json.dumps({'content': err_msg, 'done': True})}\n\n"
                    yield "data: [DONE]\n\n"
                    return

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    try:
                        chunk = json.loads(line)
                        content = chunk.get("message", {}).get("content", "")
                        is_done = chunk.get("done", False)
                        if content or is_done:
                            yield f"data: {json.dumps({'content': content, 'done': is_done, 'model': chosen_model})}\n\n"
                        if is_done:
                            break
                    except json.JSONDecodeError:
                        continue
                        
        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.error(f"Error streaming from Ollama: {e}")
        err_payload = {
            "content": f"\n\n*(Error communicating with Ollama: {str(e)})*",
            "done": True
        }
        yield f"data: {json.dumps(err_payload)}\n\n"
        yield "data: [DONE]\n\n"


async def non_stream_chat_response(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    context: Optional[Dict] = None,
    language: Optional[str] = "en"
) -> Dict:
    """
    Non-streaming fallback for chat completions.
    """
    status = await get_ollama_status()
    if not status["online"]:
        return {
            "success": False,
            "error": "Ollama is not running. Please start Ollama with `ollama run llama3.2`.",
            "response": ""
        }

    chosen_model = model or status["default_model"] or "llama3.2"
    formatted_messages = prepare_messages(messages, context)
    
    payload = {
        "model": chosen_model,
        "messages": formatted_messages,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
        }
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = data.get("message", {}).get("content", "")
                return {
                    "success": True,
                    "response": content,
                    "model": chosen_model
                }
            else:
                return {
                    "success": False,
                    "error": format_ollama_error(resp.text, chosen_model),
                    "response": ""
                }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "response": ""
        }
