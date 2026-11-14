---
title: A4MP TECH RIDE
emoji: 🚀
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# A4MP TECH RIDE — AI SaaS Starter

A premium dark-themed AI SaaS landing page with a working AI chat endpoint powered by Hugging Face Inference Providers.

## Features
- Responsive premium dark landing page
- Interactive AI chat panel
- Server-side Hugging Face token handling (never exposed to browser)
- FastAPI backend and Docker configuration for Hugging Face Docker Spaces

## 1. Create a Hugging Face Space
1. Sign in at https://huggingface.co/
2. Open https://huggingface.co/new-space
3. Name: `a4mp-tech-ride` (or another available name)
4. SDK: **Docker**
5. Visibility: Public for a public demo, or Private if you want restricted access (availability depends on your account).

## 2. Add your Hugging Face token as a Secret
1. Create a fine-grained token at https://huggingface.co/settings/tokens
2. Grant the token permission **Make calls to Inference Providers**.
3. In your Space, open **Settings → Variables and secrets → New secret**.
4. Name: `HF_TOKEN`
5. Paste the token as the secret value. Never paste it into `app.py`, HTML, JavaScript, GitHub, or a public message.

## 3. Upload the project
Upload all files and folders from this ZIP to the root of your Space repository. Keep the `static` folder.

The Space reads the Docker configuration and starts the FastAPI app on port 7860.

## 4. Test
When the Space build finishes, open its App page. Type a question in the chat and press Send.
If you see an authentication or provider error, check the `HF_TOKEN` secret and whether the selected model has an available Inference Provider.

## Local run (optional)
Python 3.10+ recommended.

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Set the environment variable:
- Windows PowerShell: `$env:HF_TOKEN="hf_your_token"`
- macOS/Linux: `export HF_TOKEN="hf_your_token"`

Then run:

```bash
uvicorn app:app --host 127.0.0.1 --port 7860
```

Open http://127.0.0.1:7860

## Important
- Hugging Face Inference Providers may have usage limits, included credits, or pay-as-you-go billing depending on your account and provider. Check current pricing before public launch.
- This starter includes a working chat feature, not production authentication, payments, persistent chat history, or a database.
- Before taking real customers, add authentication, rate limiting, abuse protection, privacy terms, monitoring, and billing.
