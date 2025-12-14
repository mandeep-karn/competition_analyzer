import { useState, useEffect } from 'react'
import type { AnalysisType } from '../App'

interface LoadingStateProps {
  analysisType: AnalysisType | null
}

const loadingMessages = {
  competition: [
    'Searching for competitor information...',
    'Analyzing market positioning...',
    'Comparing pricing strategies...',
    'Evaluating competitive advantages...',
    'Synthesizing intelligence report...'
  ],
  due_diligence: [
    'Gathering company background...',
    'Scanning for red flags...',
    'Analyzing reputation signals...',
    'Assessing business model risks...',
    'Compiling due diligence report...'
  ],
  market_trends: [
    'Researching industry trends...',
    'Analyzing market dynamics...',
    'Reviewing regulatory landscape...',
    'Forecasting growth patterns...',
    'Preparing trends report...'
  ],
  bnpl_merchant_risk: [
    'Researching merchant background...',
    'Analyzing chargeback and return patterns...',
    'Scanning for fraud indicators...',
    'Reviewing customer complaints...',
    'Assessing BNPL-specific risks...',
    'Compiling risk assessment report...'
  ],
  payment_processor_comparison: [
    'Researching payment processors...',
    'Comparing pricing and fees...',
    'Analyzing integration options...',
    'Evaluating feature sets...',
    'Assessing fraud protection...',
    'Preparing comparison report...'
  ]
}

export default function LoadingState({ analysisType }: LoadingStateProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [dots, setDots] = useState('')

  const messages = analysisType 
    ? loadingMessages[analysisType] 
    : loadingMessages.competition

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [messages.length])

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      {/* Animated spinner */}
      <div className="relative mb-8">
        {/* Outer ring */}
        <div className="w-20 h-20 rounded-full border-2 border-zinc-800" />
        
        {/* Spinning gradient arc */}
        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-transparent border-t-violet-500 border-r-violet-500/50 animate-spin" />
        
        {/* Inner pulse */}
        <div className="absolute inset-4 w-12 h-12 rounded-full bg-violet-500/10 animate-pulse-slow" />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        <h2 className="text-xl font-display font-medium text-white mb-2">
          Agent is researching{dots}
        </h2>
        <p className="text-zinc-500 transition-all duration-500">
          {messages[messageIndex]}
        </p>
      </div>

      {/* Progress indicators */}
      <div className="flex gap-1.5 mt-8">
        {messages.map((_, index) => (
          <div
            key={index}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${index <= messageIndex ? 'bg-violet-500' : 'bg-zinc-800'}
              ${index === messageIndex ? 'scale-125' : ''}
            `}
          />
        ))}
      </div>

      {/* Time estimate */}
      <p className="mt-8 text-zinc-600 text-sm">
        This typically takes 30-60 seconds
      </p>
    </div>
  )
}
