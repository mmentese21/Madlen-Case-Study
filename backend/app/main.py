# In backend/app/main.py
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Our local modules
from app.models.chat import ChatRequest, ChatMessage
from app.core.config import settings
from app.services.telemetry import setup_telemetry

# Get the OpenTelemetry tracer
from opentelemetry import trace
tracer = trace.get_tracer(__name__)

# --- App Initialization ---
app = FastAPI(title="Madlen Case Study API")

# Setup OpenTelemetry
# We must do this *before* mounting routes
setup_telemetry(app)

# --- Middleware ---
# Set up CORS to allow our frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # React's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"Hello": "Madlen"}

@app.get("/api/v1/models")
async def get_models():
    """
    Fetches the list of available models from OpenRouter.
    We'll start with just free ones as suggested[cite: 23].
    """
    # This is a great place to create a custom span [cite: 28]
    with tracer.start_as_current_span("fetch_openrouter_models") as span:
        OPENROUTER_API_URL = "https://openrouter.ai/api/v1"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{OPENROUTER_API_URL}/models")
                response.raise_for_status() # Raise exception for 4xx/5xx
                
                all_models = response.json().get("data", [])
                
                # Filter for free models (where pricing.prompt is "0" or model id ends with ":free")
                filtered_models = [
                    model for model in all_models 
                    if (model.get("id", "").endswith(":free") or 
                        model.get("pricing", {}).get("prompt") == "0")
                ]
                
                # If no free models found, fall back to a curated list
                if not filtered_models:
                    free_model_ids = [
                        "mistralai/mistral-7b-instruct:free",
                        "google/gemma-7b-it:free",
                        "meta-llama/llama-2-13b-chat:free",
                        "nousresearch/nous-capybara-7b:free",
                        "gryphe/mythomist-7b:free",
                        "openchat/openchat-7b:free",
                        "undi95/toppy-m-7b:free",
                        "huggingfaceh4/zephyr-7b-beta:free",
                    ]
                    
                    filtered_models = [
                        model for model in all_models 
                        if model.get("id") in free_model_ids
                    ]
                
                span.set_attribute("models.count.all", len(all_models))
                span.set_attribute("models.count.filtered", len(filtered_models))
                
                return filtered_models

        except httpx.HTTPStatusError as e:
            span.record_exception(e)
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            span.record_exception(e)
            raise HTTPException(status_code=500, detail="Error fetching models from OpenRouter.")


@app.post("/api/v1/chat")
async def chat_with_model(request: ChatRequest):
    """
    Sends the user's message history to the selected OpenRouter model[cite: 19].
    """
    OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Data payload for OpenRouter
    data = {
        "model": request.model,
        "messages": [msg.dict() for msg in request.messages]
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                OPENROUTER_API_URL, 
                json=data, 
                headers=headers
            )
            response.raise_for_status()
            response_data = response.json()
            
            # Parse and clean the response
            parsed_response = _parse_model_response(response_data)
            
            return parsed_response
            
    except httpx.HTTPStatusError as e:
        # Pass OpenRouter's error directly to the frontend [cite: 42, 43]
        raise HTTPException(
            status_code=e.response.status_code, 
            detail=e.response.json()
        )
    except ValueError as e:
        # Handle parsing errors
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _parse_model_response(response_data: dict) -> dict:
    """
    Parse and clean the model response, removing unwanted tokens and handling blank responses.
    """
    try:
        # Extract the message content
        choices = response_data.get("choices", [])
        
        if not choices:
            raise ValueError("Model returned no response choices")
        
        message = choices[0].get("message", {})
        content = message.get("content", "")
        
        # Clean the content
        cleaned_content = _clean_model_output(content)
        
        # Check if content is blank after cleaning
        if not cleaned_content or cleaned_content.isspace():
            raise ValueError("Model returned a blank response. Please try again with a different prompt.")
        
        # Update the response with cleaned content
        response_data["choices"][0]["message"]["content"] = cleaned_content
        
        return response_data
        
    except (KeyError, IndexError) as e:
        raise ValueError(f"Invalid response structure from model: {str(e)}")


def _clean_model_output(text: str) -> str:
    """
    Remove unwanted tokens and artifacts from model output.
    Common tokens to remove:
    - [/s], </s>, <s> (sentence/sequence markers)
    - [INST], [/INST] (instruction markers)
    - <<SYS>>, <</SYS>> (system markers)
    - Multiple consecutive whitespaces
    """
    import re
    
    if not text:
        return ""
    
    # Remove common special tokens
    special_tokens = [
        r'\[/s\]', r'</s>', r'<s>', r'<\|endoftext\|>',
        r'\[INST\]', r'\[/INST\]', 
        r'<<SYS>>', r'<</SYS>>',
        r'<\|im_start\|>', r'<\|im_end\|>',
        r'###', r'\[PAD\]', r'<pad>',
    ]
    
    cleaned = text
    for token in special_tokens:
        cleaned = re.sub(token, '', cleaned, flags=re.IGNORECASE)
    
    # Remove multiple consecutive whitespaces
    cleaned = re.sub(r'\s+', ' ', cleaned)
    
    # Remove leading/trailing whitespace
    cleaned = cleaned.strip()
    
    return cleaned