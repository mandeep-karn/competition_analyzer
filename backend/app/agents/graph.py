from langgraph.graph import StateGraph, END
from typing import TypedDict, AsyncGenerator
from anthropic import Anthropic
from tavily import TavilyClient
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Initialize clients
anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


class AgentState(TypedDict):
    company_name: str
    analysis_type: str
    search_results: list
    report: str
    sources: list[str]


# Analysis prompts for different types
ANALYSIS_PROMPTS = {
    "competition": """You are a senior competitive intelligence analyst. Analyze the competitive landscape for {company}.

Your report MUST include:
1. **Executive Summary** - Key findings in 3-4 bullet points
2. **Key Competitors** - Identify top 5 competitors with brief profiles
3. **Market Positioning** - How does {company} position itself vs competitors?
4. **Pricing & Business Model** - Compare pricing strategies
5. **Strengths & Weaknesses** - SWOT-style analysis
6. **Strategic Recommendations** - 3-5 actionable insights

Be specific, cite data where available, and focus on actionable intelligence.""",

    "due_diligence": """You are a risk analyst conducting merchant due diligence. Assess {company} thoroughly.

Your report MUST include:
1. **Company Overview** - Background, founding, leadership
2. **Business Model Assessment** - How they make money, sustainability
3. **Red Flags & Concerns** - Any warning signs from news/reviews
4. **Reputation Analysis** - Customer sentiment, industry standing
5. **Financial Health Indicators** - Any public financial signals
6. **Risk Score** - Low/Medium/High with justification
7. **Recommendation** - Partner/Caution/Avoid with reasoning

Be objective and evidence-based. Flag uncertainties clearly.""",

    "market_trends": """You are a market research analyst. Analyze macro trends affecting {company} and its sector.

Your report MUST include:
1. **Industry Overview** - Current state and size of the market
2. **Growth Trends** - Historical and projected growth rates
3. **Key Drivers** - What's fueling industry changes?
4. **Emerging Trends** - New technologies, business models, consumer behaviors
5. **Regulatory Landscape** - Current and upcoming regulations
6. **Competitive Dynamics** - How is the market structure evolving?
7. **Future Outlook** - 3-5 year forecast and key uncertainties

Support claims with data. Distinguish between established trends and speculation.""",

    "bnpl_merchant_risk": """You are a BNPL (Buy Now Pay Later) risk assessment specialist. Conduct a comprehensive merchant risk analysis for {company}.

Your report MUST include:
1. **Executive Summary** - Risk level and key findings in 3-4 bullet points
2. **Merchant Profile** - Business model, products/services, target market
3. **BNPL-Specific Risk Factors**:
   - Average Order Value (AOV) and basket size trends
   - Return rates and customer disputes
   - Seasonal sales patterns and cash flow stability
   - Customer demographics and credit risk
4. **Financial Health & Fraud Risk**:
   - Revenue stability and growth trajectory
   - Chargeback rates and payment disputes
   - Signs of potential fraud or suspicious activity
5. **Regulatory & Compliance**:
   - Industry regulations and licensing requirements
   - Consumer protection compliance
   - Data privacy and security standards
6. **Reputation Analysis**:
   - Customer reviews and satisfaction scores
   - BBB ratings, trustpilot scores, complaints
   - Social media sentiment and controversies
7. **Risk Score & Recommendation**:
   - Overall risk level: Low / Medium / High / Very High
   - Recommended credit limit or partnership terms
   - Key monitoring metrics and red flags to watch

Be thorough in fraud detection and focus on BNPL-specific concerns like returns, chargebacks, and default risk.""",

    "payment_processor_comparison": """You are a payments industry consultant. Analyze and compare payment processors for {company}'s business needs.

Your report MUST include:
1. **Executive Summary** - Top 3 recommended processors and why
2. **Business Requirements Analysis**:
   - {company}'s industry, transaction volume, and business model
   - Geographic reach and currency requirements
   - Integration and technical needs
3. **Processor Comparison** - Analyze top 5-7 payment processors:
   - **Stripe** - Developer-friendly, global reach
   - **PayPal / Braintree** - Consumer trust, wide adoption
   - **Square** - In-person + online, SMB focus
   - **Adyen** - Enterprise-grade, global
   - **Authorize.net** - Traditional, established
   - Others relevant to {company}
4. **Feature Comparison**:
   - Supported payment methods (cards, wallets, BNPL, crypto)
   - Recurring billing and subscription support
   - Fraud prevention and chargeback protection
   - Reporting and analytics capabilities
5. **Pricing Analysis**:
   - Transaction fees (percentage + fixed)
   - Monthly fees and setup costs
   - Hidden costs and fee escalations
   - Total cost of ownership estimates
6. **Integration & Developer Experience**:
   - API quality and documentation
   - SDKs and pre-built integrations
   - Time to implement and go-live
7. **Risk & Compliance**:
   - PCI DSS compliance support
   - Fraud detection tools
   - Reserve requirements and payout terms
8. **Final Recommendation**:
   - Best fit processor(s) for {company}
   - Pros/cons of each option
   - Implementation roadmap

Provide data-driven comparisons with actual fee structures and capability matrices where possible."""
}


def research_node(state: AgentState) -> AgentState:
    """Search for relevant information using Tavily"""
    
    # Construct targeted search queries based on analysis type
    search_queries = {
        "competition": [
            f"{state['company_name']} competitors market share",
            f"{state['company_name']} pricing strategy business model",
            f"{state['company_name']} vs competitors comparison"
        ],
        "due_diligence": [
            f"{state['company_name']} company background leadership",
            f"{state['company_name']} reviews complaints issues",
            f"{state['company_name']} funding revenue financials"
        ],
        "market_trends": [
            f"{state['company_name']} industry trends 2024",
            f"{state['company_name']} market growth forecast",
            f"{state['company_name']} sector regulation news"
        ],
        "bnpl_merchant_risk": [
            f"{state['company_name']} merchant reviews complaints fraud",
            f"{state['company_name']} return rate chargeback disputes",
            f"{state['company_name']} business model revenue financials",
            f"{state['company_name']} BBB rating trustpilot customer reviews"
        ],
        "payment_processor_comparison": [
            f"{state['company_name']} payment processor options pricing fees",
            f"Stripe vs PayPal vs Square vs Adyen comparison {state['company_name']}",
            f"best payment gateway for {state['company_name']} industry",
            f"payment processor fees integration {state['company_name']}"
        ]
    }
    
    queries = search_queries.get(state["analysis_type"], search_queries["competition"])
    
    all_results = []
    all_sources = []
    
    for query in queries:
        try:
            results = tavily_client.search(
                query=query,
                max_results=5,
                search_depth="advanced"
            )
            for r in results.get("results", []):
                if r["url"] not in all_sources:
                    all_results.append(r)
                    all_sources.append(r["url"])
        except Exception as e:
            print(f"Search error for '{query}': {e}")
    
    return {
        **state,
        "search_results": all_results[:15],  # Cap at 15 results
        "sources": all_sources[:15]
    }


def analyze_node(state: AgentState) -> AgentState:
    """Synthesize research into a comprehensive report using Claude"""
    
    # Build context from search results
    context_parts = []
    for i, result in enumerate(state["search_results"], 1):
        context_parts.append(
            f"[Source {i}] {result.get('title', 'Untitled')}\n"
            f"URL: {result['url']}\n"
            f"Content: {result.get('content', 'No content')}\n"
        )
    
    context = "\n---\n".join(context_parts)
    
    # Get the appropriate prompt template
    prompt_template = ANALYSIS_PROMPTS.get(
        state["analysis_type"], 
        ANALYSIS_PROMPTS["competition"]
    )
    
    system_prompt = """You are an expert market intelligence analyst. 
Your reports are thorough, well-structured, and actionable.
Always cite your sources using [Source N] notation.
Use markdown formatting for clear structure.
Be direct and avoid filler language."""

    user_prompt = f"""{prompt_template.format(company=state['company_name'])}

## Research Data

{context}

---

Generate a comprehensive markdown report based on the research above.
Cite sources where applicable using [Source N] notation."""

    message = anthropic_client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[
            {"role": "user", "content": user_prompt}
        ],
        system=system_prompt
    )
    
    return {
        **state,
        "report": message.content[0].text
    }


def build_graph():
    """Construct the LangGraph workflow"""
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("research", research_node)
    workflow.add_node("analyze", analyze_node)
    
    # Define flow
    workflow.set_entry_point("research")
    workflow.add_edge("research", "analyze")
    workflow.add_edge("analyze", END)
    
    return workflow.compile()


# Compile the graph once at module load
graph = build_graph()


async def run_analysis(company_name: str, analysis_type: str) -> dict:
    """Run the full analysis pipeline"""
    initial_state: AgentState = {
        "company_name": company_name,
        "analysis_type": analysis_type,
        "search_results": [],
        "report": "",
        "sources": []
    }
    
    result = graph.invoke(initial_state)
    
    return {
        "report": result["report"],
        "sources": result["sources"]
    }


async def stream_analysis(company_name: str, analysis_type: str) -> AsyncGenerator[str, None]:
    """Stream analysis progress as Server-Sent Events"""

    # Phase 1: Research
    data = {'phase': 'research', 'message': 'Searching for information...'}
    yield f"data: {json.dumps(data)}\n\n"

    state: AgentState = {
        "company_name": company_name,
        "analysis_type": analysis_type,
        "search_results": [],
        "report": "",
        "sources": []
    }

    state = research_node(state)
    data = {'phase': 'research', 'message': f'Found {len(state["sources"])} sources'}
    yield f"data: {json.dumps(data)}\n\n"

    # Phase 2: Analysis
    data = {'phase': 'analyze', 'message': 'Analyzing data...'}
    yield f"data: {json.dumps(data)}\n\n"

    state = analyze_node(state)

    # Phase 3: Complete
    data = {'phase': 'complete', 'report': state['report'], 'sources': state['sources']}
    yield f"data: {json.dumps(data)}\n\n"
