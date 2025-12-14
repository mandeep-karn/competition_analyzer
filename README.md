# Market Intelligence Agent

AI-powered competitive analysis and due diligence tool built with Claude API, LangGraph, and Tavily Search.

![Market Intelligence Agent](https://img.shields.io/badge/AI-Claude-violet)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-green)

## Features

- **Competitive Analysis** - Deep dive into market positioning, pricing strategies, and competitive landscape
- **Merchant Due Diligence** - Risk assessment, reputation analysis, and red flag detection
- **Market Trends** - Industry forecasts, regulatory landscape, and growth patterns

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- API Keys: [Anthropic](https://console.anthropic.com/) and [Tavily](https://tavily.com/)

### 1. Clone and Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys
```

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React + Vite  │────▶│     FastAPI     │────▶│    LangGraph    │
│   (Frontend)    │◀────│    (Backend)    │◀────│    (Agent)      │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                               ┌─────────┴─────────┐
                                               │                   │
                                        ┌──────▼─────┐      ┌──────▼─────┐
                                        │   Claude   │      │   Tavily   │
                                        │    API     │      │   Search   │
                                        └────────────┘      └────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI |
| AI Engine | LangGraph, Anthropic Claude |
| Search | Tavily API |

## Development with Claude Code

This project is designed to be extended using Claude Code:

```bash
# Add new features
claude "Add streaming support to show real-time analysis progress"

# Customize for your use case
claude "Add a BNPL-specific analysis type for merchant risk scoring"

# Improve the UI
claude "Add a dark/light theme toggle"
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Run analysis (returns full report) |
| `/api/analyze/stream` | POST | Stream analysis with progress updates |
| `/health` | GET | Health check |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `TAVILY_API_KEY` | Your Tavily API key |

## License

MIT
# competition_analyzer
