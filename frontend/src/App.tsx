import { useState } from 'react'
import Dashboard from './components/Dashboard'
import InputForm from './components/InputForm'
import ReportView from './components/ReportView'
import LoadingState from './components/LoadingState'

export type AnalysisType = 'competition' | 'due_diligence' | 'market_trends' | 'bnpl_merchant_risk' | 'payment_processor_comparison'
type ViewState = 'dashboard' | 'input' | 'loading' | 'report'

interface Report {
  content: string
  sources: string[]
  companyName: string
  analysisType: AnalysisType
}

function App() {
  const [view, setView] = useState<ViewState>('dashboard')
  const [analysisType, setAnalysisType] = useState<AnalysisType | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCardClick = (type: AnalysisType) => {
    setAnalysisType(type)
    setError(null)
    setView('input')
  }

  const handleSubmit = async (companyName: string) => {
    if (!analysisType) return
    
    setView('loading')
    setError(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          analysis_type: analysisType
        })
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const data = await response.json()
      setReport({
        content: data.report,
        sources: data.sources,
        companyName: companyName,
        analysisType: analysisType
      })
      setView('report')
    } catch (err) {
      console.error('Analysis failed:', err)
      setError(err instanceof Error ? err.message : 'Analysis failed')
      setView('input')
    }
  }

  const handleBack = () => {
    setView('dashboard')
    setAnalysisType(null)
    setReport(null)
    setError(null)
  }

  const handleBackToInput = () => {
    setView('input')
    setReport(null)
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {view === 'dashboard' && (
        <Dashboard onCardClick={handleCardClick} />
      )}
      
      {view === 'input' && analysisType && (
        <InputForm
          analysisType={analysisType}
          onSubmit={handleSubmit}
          onBack={handleBack}
          error={error}
        />
      )}
      
      {view === 'loading' && (
        <LoadingState analysisType={analysisType} />
      )}
      
      {view === 'report' && report && (
        <ReportView
          report={report}
          onBack={handleBack}
          onNewAnalysis={handleBackToInput}
        />
      )}
    </main>
  )
}

export default App
