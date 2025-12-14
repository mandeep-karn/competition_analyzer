from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.agents.graph import run_analysis, stream_analysis
import os

app = FastAPI(
    title="Market Intelligence Agent",
    description="AI-powered competitive analysis and due diligence",
    version="1.0.0"
)

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalysisRequest(BaseModel):
    company_name: str
    analysis_type: str  # "competition" | "due_diligence" | "market_trends"

    class Config:
        json_schema_extra = {
            "example": {
                "company_name": "Klarna",
                "analysis_type": "competition"
            }
        }


class AnalysisResponse(BaseModel):
    report: str
    sources: list[str]
    company_name: str
    analysis_type: str


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    """
    Run a comprehensive market intelligence analysis.
    
    Analysis types:
    - competition: Competitive landscape analysis
    - due_diligence: Risk and reputation assessment
    - market_trends: Industry trends and forecasts
    """
    if request.analysis_type not in ["competition", "due_diligence", "market_trends"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid analysis_type. Must be one of: competition, due_diligence, market_trends"
        )
    
    try:
        result = await run_analysis(
            company_name=request.company_name,
            analysis_type=request.analysis_type
        )
        return AnalysisResponse(
            report=result["report"],
            sources=result["sources"],
            company_name=request.company_name,
            analysis_type=request.analysis_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze/stream")
async def analyze_stream(request: AnalysisRequest):
    """
    Stream analysis results in real-time.
    Returns Server-Sent Events (SSE) with progress updates.
    """
    if request.analysis_type not in ["competition", "due_diligence", "market_trends"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid analysis_type"
        )
    
    return StreamingResponse(
        stream_analysis(request.company_name, request.analysis_type),
        media_type="text/event-stream"
    )


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "api_configured": bool(os.getenv("ANTHROPIC_API_KEY")),
        "search_configured": bool(os.getenv("TAVILY_API_KEY"))
    }


@app.get("/")
async def root():
    return {
        "name": "Market Intelligence Agent",
        "docs": "/docs",
        "health": "/health"
    }
