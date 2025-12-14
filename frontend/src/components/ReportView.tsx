import { ArrowLeft, Download, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { AnalysisType } from '../App'

interface Report {
  content: string
  sources: string[]
  companyName: string
  analysisType: AnalysisType
}

interface ReportViewProps {
  report: Report
  onBack: () => void
  onNewAnalysis: () => void
}

const analysisLabels = {
  competition: 'Competitive Analysis',
  due_diligence: 'Due Diligence Report',
  market_trends: 'Market Trends Analysis'
}

export default function ReportView({ report, onBack, onNewAnalysis }: ReportViewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([report.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.companyName.toLowerCase().replace(/\s+/g, '-')}-${report.analysisType}-report.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors text-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={onNewAnalysis}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500 text-white hover:bg-violet-400 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              New Analysis
            </button>
          </div>
        </div>
      </header>

      {/* Report Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Report Header */}
        <div className="mb-8 pb-8 border-b border-zinc-800">
          <div className="text-sm text-violet-400 mb-2">
            {analysisLabels[report.analysisType]}
          </div>
          <h1 className="text-4xl font-display font-semibold text-white mb-2">
            {report.companyName}
          </h1>
          <p className="text-zinc-500">
            Generated {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Markdown Report */}
        <article className="prose max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-semibold text-white mt-8 mb-4 font-display">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-white mt-6 mb-3 font-display">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-medium text-zinc-100 mt-4 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-zinc-300 leading-relaxed">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-outside ml-4 mb-4 space-y-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-outside ml-4 mb-4 space-y-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-zinc-300">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="text-white font-medium">{children}</strong>
              ),
              a: ({ href, children }) => (
                <a 
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 underline"
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm text-violet-300">
                  {children}
                </code>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-zinc-700 pl-4 italic text-zinc-400 my-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {report.content}
          </ReactMarkdown>
        </article>

        {/* Sources */}
        {report.sources.length > 0 && (
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <h2 className="text-lg font-display font-medium text-white mb-4">
              Sources ({report.sources.length})
            </h2>
            <div className="space-y-2">
              {report.sources.map((source, index) => (
                <a
                  key={index}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors group"
                >
                  <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-violet-400 transition-colors flex-shrink-0" />
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-300 truncate">
                    {source}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
