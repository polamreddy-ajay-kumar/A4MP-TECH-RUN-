import os
from typing import List, Literal
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from huggingface_hub import InferenceClient

APP_DIR = os.path.dirname(os.path.abspath(__file__))
HF_MODEL = os.getenv("HF_MODEL", "openai/gpt-oss-120b:fastest")

app = FastAPI(title="A4MP TECH RIDE API", version="1.0.0")
app.mount("/static", StaticFiles(directory=os.path.join(APP_DIR, "static")), name="static")


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=6000)


class ChatRequest(BaseModel):
    messages: List[Message] = Field(min_length=1, max_length=16)


@app.get("/")
def home():
    return FileResponse(os.path.join(APP_DIR, "static", "index.html"))


@app.get("/api/health")
def health():
    return {"ok": True, "service": "A4MP TECH RIDE", "model": HF_MODEL}


@app.post("/api/chat")
def chat(payload: ChatRequest):
    token = os.getenv("HF_TOKEN")
    if not token:
        raise HTTPException(
            status_code=503,
            detail="AI is not configured yet. Add HF_TOKEN in your Hugging Face Space Settings → Secrets."
        )

    # Only accept user/assistant messages from the browser. The system prompt stays server-side.
    conversation = [
        {
            "role": "system",
            "content": (
                "You are A4MP AI, the helpful assistant inside A4MP TECH RIDE. "
                "Be accurate, friendly, practical, and concise. "
                "If a request is unclear, ask one focused question. "
                "Do not claim to have performed actions you cannot perform."
            )
        }
    ]
    conversation.extend(
        {"role": item.role, "content": item.content.strip()}
        for item in payload.messages
    )

    try:
        client = InferenceClient(api_key=token, provider="auto")
        result = client.chat.completions.create(
            model=HF_MODEL,
            messages=conversation,
            max_tokens=700,
            temperature=0.65,
        )
        answer = result.choices[0].message.content
        if not answer:
            raise ValueError("The model returned an empty response.")
        return {"reply": answer}
    except Exception as exc:
        # Avoid returning credentials or internal stack traces to the browser.
        message = str(exc)
        if "401" in message or "403" in message:
            detail = "Hugging Face rejected the token. Check the HF_TOKEN secret and Inference Providers permission."
        elif "402" in message or "billing" in message.lower() or "credit" in message.lower():
            detail = "The selected inference provider may require available credits or billing. Check your Hugging Face Inference Providers usage."
        else:
            detail = "The AI provider is temporarily unavailable. Check your Space Logs and try again."
        raise HTTPException(status_code=502, detail=detail)
