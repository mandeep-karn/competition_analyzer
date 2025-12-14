# Market Intelligence Agent - Project Scaffold

A competitive analysis and due diligence tool powered by Claude API, LangGraph, and Tavily Search.

## Project Structure

```
market-intelligence-agent/
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Shadcn components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AnalysisCard.tsx
│   │   │   ├── InputForm.tsx
│   │   │   ├── ReportView.tsx
│   │   │   └── LoadingState.tsx
│   │   ├── hooks/
│   │   │   └── useAnalysis.ts
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                  # FastAPI + LangGraph
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI entry point
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── graph.py     # LangGraph workflow
│   │   │   ├── nodes.py     # Agent nodes (research, analyze, synthesize)
│   │   │   └── tools.py     # Tavily search tool
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py   # Pydantic models
│   │   └── config.py        # Environment config
│   ├── requirements.txt
│   └── .env.example
│
├── docker-compose.yml        # For local development
├── .gitignore
└── README.md
```

---

## Step-by-Step Setup with Claude Code

### Prerequisites

Make sure you have:
- Node.js 18+
- Python 3.11+
- API Keys: Anthropic, Tavily

### Step 1: Initialize the Project

```bash
# Create project directory
mkdir market-intelligence-agent
cd market-intelligence-agent

# Initialize git
git init
```

### Step 2: Backend Setup

```bash
# Create backend structure
mkdir -p backend/app/agents backend/app/models

# Create virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn python-dotenv anthropic langgraph tavily-python pydantic
```

### Step 3: Frontend Setup

```bash
# From project root
cd ..
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install dependencies
npm install
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react clsx tailwind-merge class-variance-authority
npm install react-markdown

# Initialize Tailwind
npx tailwindcss init -p

# Install Shadcn UI
npx shadcn@latest init
npx shadcn@latest add button card input
```

---

## Key Files to Create

### Backend: `backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.agents.graph import run_analysis

app = FastAPI(title="Market Intelligence Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    company_name: str
    analysis_type: str  # "competition" | "due_diligence" | "market_trends"

class AnalysisResponse(BaseModel):
    report: str
    sources: list[str]

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    result = await run_analysis(
        company_name=request.company_name,
        analysis_type=request.analysis_type
    )
    return result

@app.get("/health")
async def health():
    return {"status": "ok"}
```

### Backend: `backend/app/agents/graph.py`

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
from anthropic import Anthropic
from tavily import TavilyClient
import os

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

class AgentState(TypedDict):
    company_name: str
    analysis_type: str
    search_results: list
    analysis: str
    report: str
    sources: list[str]

def research_node(state: AgentState) -> AgentState:
    """Search for relevant information using Tavily"""
    queries = {
        "competition": f"{state['company_name']} competitors market share pricing strategy",
        "due_diligence": f"{state['company_name']} company risk fraud reputation news",
        "market_trends": f"{state['company_name']} industry trends market growth forecast"
    }
    
    query = queries.get(state["analysis_type"], queries["competition"])
    results = tavily.search(query=query, max_results=10)
    
    return {
        **state,
        "search_results": results.get("results", []),
        "sources": [r["url"] for r in results.get("results", [])]
    }

def analyze_node(state: AgentState) -> AgentState:
    """Analyze search results using Claude"""
    prompts = {
        "competition": """Analyze the competitive landscape for {company}. 
        Include: key competitors, market positioning, pricing strategies, 
        strengths/weaknesses, and strategic recommendations.""",
        "due_diligence": """Conduct due diligence on {company}.
        Include: company background, red flags, reputation analysis,
        financial health indicators, and risk assessment.""",
        "market_trends": """Analyze market trends affecting {company}.
        Include: industry growth, emerging trends, regulatory changes,
        technology shifts, and future outlook."""
    }
    
    context = "\n\n".join([
        f"Source: {r['url']}\n{r['content']}" 
        for r in state["search_results"]
    ])
    
    prompt = prompts.get(state["analysis_type"], prompts["competition"])
    
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[{
            "role": "user",
            "content": f"""Based on the following research, {prompt.format(company=state['company_name'])}

Research Data:
{context}

Provide a comprehensive, well-structured markdown report."""
        }]
    )
    
    return {
        **state,
        "report": message.content[0].text
    }

def build_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("research", research_node)
    workflow.add_node("analyze", analyze_node)
    
    workflow.set_entry_point("research")
    workflow.add_edge("research", "analyze")
    workflow.add_edge("analyze", END)
    
    return workflow.compile()

graph = build_graph()

async def run_analysis(company_name: str, analysis_type: str) -> dict:
    initial_state = {
        "company_name": company_name,
        "analysis_type": analysis_type,
        "search_results": [],
        "analysis": "",
        "report": "",
        "sources": []
    }
    
    result = graph.invoke(initial_state)
    
    return {
        "report": result["report"],
        "sources": result["sources"]
    }
```

### Backend: `backend/.env.example`

```
ANTHROPIC_API_KEY=your-anthropic-key
TAVILY_API_KEY=your-tavily-key
```

### Backend: `backend/requirements.txt`

```
fastapi==0.109.0
uvicorn==0.27.0
python-dotenv==1.0.0
anthropic==0.18.0
langgraph==0.0.28
tavily-python==0.3.0
pydantic==2.5.3
```

---

## Frontend Key Components

### `frontend/src/App.tsx`

```tsx
import { useState } from 'react'
import Dashboard from './components/Dashboard'
import InputForm from './components/InputForm'
import ReportView from './components/ReportView'
import LoadingState from './components/LoadingState'

type AnalysisType = 'competition' | 'due_diligence' | 'market_trends' | null
type ViewState = 'dashboard' | 'input' | 'loading' | 'report'

function App() {
  const [view, setView] = useState<ViewState>('dashboard')
  const [analysisType, setAnalysisType] = useState<AnalysisType>(null)
  const [report, setReport] = useState<{ content: string; sources: string[] } | null>(null)

  const handleCardClick = (type: AnalysisType) => {
    setAnalysisType(type)
    setView('input')
  }

  const handleSubmit = async (companyName: string) => {
    setView('loading')
    
    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          analysis_type: analysisType
        })
      })
      
      const data = await response.json()
      setReport({ content: data.report, sources: data.sources })
      setView('report')
    } catch (error) {
      console.error('Analysis failed:', error)
      setView('dashboard')
    }
  }

  const handleBack = () => {
    setView('dashboard')
    setAnalysisType(null)
    setReport(null)
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {view === 'dashboard' && <Dashboard onCardClick={handleCardClick} />}
      {view === 'input' && <InputForm analysisType={analysisType!} onSubmit={handleSubmit} onBack={handleBack} />}
      {view === 'loading' && <LoadingState />}
      {view === 'report' && report && <ReportView report={report} onBack={handleBack} />}
    </main>
  )
}

export default App
```

### `frontend/src/components/Dashboard.tsx`

```tsx
import { Swords, ShieldAlert, TrendingUp } from 'lucide-react'

type AnalysisType = 'competition' | 'due_diligence' | 'market_trends'

interface DashboardProps {
  onCardClick: (type: AnalysisType) => void
}

const cards = [
  {
    type: 'competition' as const,
    title: 'Analyze Competition',
    description: 'Deep dive into strategies & pricing',
    icon: Swords,
    gradient: 'from-amber-500/20 to-orange-600/20',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400'
  },
  {
    type: 'due_diligence' as const,
    title: 'Merchant Due Diligence',
    description: 'Risk, fraud checks & reputation',
    icon: ShieldAlert,
    gradient: 'from-emerald-500/20 to-teal-600/20',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400'
  },
  {
    type: 'market_trends' as const,
    title: 'Market Trends',
    description: 'Macro trends affecting the sector',
    icon: TrendingUp,
    gradient: 'from-violet-500/20 to-purple-600/20',
    border: 'border-violet-500/30',
    iconColor: 'text-violet-400'
  }
]

export default function Dashboard({ onCardClick }: DashboardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-light tracking-tight mb-2">
        Market Intelligence
      </h1>
      <p className="text-zinc-500 mb-16">AI-powered competitive analysis</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        {cards.map((card) => (
          <button
            key={card.type}
            onClick={() => onCardClick(card.type)}
            className={`
              group relative p-6 rounded-2xl border ${card.border}
              bg-gradient-to-br ${card.gradient}
              backdrop-blur-sm transition-all duration-300
              hover:scale-105 hover:border-opacity-60
              text-left
            `}
          >
            <card.icon className={`w-8 h-8 ${card.iconColor} mb-4`} />
            <h3 className="text-lg font-medium mb-1">{card.title}</h3>
            <p className="text-sm text-zinc-400">{card.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
```

### `frontend/src/components/LoadingState.tsx`

```tsx
export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-zinc-800 border-t-violet-500 rounded-full animate-spin" />
      </div>
      <p className="mt-8 text-zinc-400 animate-pulse">
        Agent is researching...
      </p>
    </div>
  )
}
```

---

## Running the Application

### Terminal 1: Backend
```bash
cd backend
source venv/bin/activate
cp .env.example .env  # Add your API keys
uvicorn app.main:app --reload --port 8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173`

---

## Using Claude Code

Once you have this scaffold, use Claude Code to:

1. **Initialize the project:**
   ```bash
   claude "Set up this project following the scaffold in PROJECT_SCAFFOLD.md"
   ```

2. **Iterate on features:**
   ```bash
   claude "Add streaming support to the analysis endpoint"
   claude "Improve the loading animation with a progress indicator"
   claude "Add error handling and retry logic"
   ```

3. **Customize for Riverty:**
   ```bash
   claude "Add a BNPL-specific analysis type for merchant risk scoring"
   ```

---

## Environment Variables

Create a `.env` file in the backend directory:

```
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=tvly-...
```

Get your keys:
- Anthropic: https://console.anthropic.com/
- Tavily: https://tavily.com/

---

## Next Steps

1. Add streaming responses for real-time report generation
2. Implement caching to avoid redundant API calls
3. Add export functionality (PDF, DOCX)
4. Build a history/saved reports feature
5. Add authentication if needed for team use
