'use client'

import { useState } from 'react'
import axios from 'axios'
import LoadingIndicator from './LoadingIndicator'
import StreamingResponse from './StreamingResponse'

interface SummaryResponse {
  success: boolean
  summary: string
  model: string
  error?: string
}

export default function ProposalSummarizer() {
  const [proposalText, setProposalText] = useState('')
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedModel, setSelectedModel] = useState('qwen3:8b')

  const modelOptions = [
    { value: 'qwen3:8b', label: 'Qwen3 8B (🎯 Best Quality)', time: '~10-20s' },
    { value: 'gemma2:2b', label: 'Gemma2 2B (⚡ Fastest)', time: '~5-10s' }
  ]

  const handleSummarize = async () => {
    if (!proposalText.trim()) {
      setError('Please enter proposal text to summarize')
      return
    }

    setIsLoading(true)
    setError('')
    setSummary('')

    try {
      const response = await axios.post<SummaryResponse>('/api/summarize-proposal', {
        proposalText: proposalText.trim(),
        modelName: selectedModel
      }, {
        timeout: 25000 // 25 second timeout to match backend
      })

      if (response.data.success) {
        setSummary(response.data.summary)
      } else {
        setError(response.data.error || 'Failed to generate summary')
      }
    } catch (err: any) {
      console.error('Summarization error:', err)
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out (25s). Try shortening your text or using the faster gemma2:2b model.')
      } else if (err.response?.status === 408) {
        setError(err.response.data.error || 'AI response timed out. Try using a smaller input or faster model.')
      } else if (err.response?.status === 503) {
        setError('AI service unavailable. Please ensure Ollama is running with a compatible model.')
      } else if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Failed to connect to AI service. Please check your connection.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearAll = () => {
    setProposalText('')
    setSummary('')
    setError('')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      // You could add a toast notification here
      alert('Summary copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">📋 Proposal Summarizer</h2>
        <p className="text-gray-600 mb-6">
          Paste a DAO proposal below and get an AI-generated summary highlighting key points, 
          potential impact, and important considerations.
        </p>

        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label htmlFor="proposal-text" className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Text
            </label>
            <textarea
              id="proposal-text"
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              placeholder="Paste the full text of the DAO proposal here..."
              className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
              disabled={isLoading}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {proposalText.length} characters
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-2">
              AI Model (affects speed and quality)
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            >
              {modelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.time}
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-500 mt-1">
              💡 Qwen3 8B is recommended for balanced speed and quality
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleSummarize}
              disabled={isLoading || !proposalText.trim()}
              className={`btn-primary flex-1 ${
                isLoading || !proposalText.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? '⏳ AI is working...' : '🤖 Generate Summary'}
            </button>
            
            <button
              onClick={clearAll}
              disabled={isLoading}
              className="btn-secondary"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mt-6 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <LoadingIndicator type="summarizing" />
          </div>
        )}

        {/* Error Display */}
        {error && !isLoading && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="text-red-600 mr-2">⚠️</div>
              <div>
                <h4 className="text-red-800 font-medium">Error</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Streaming Response */}
      <StreamingResponse 
        response={summary}
        isLoading={isLoading}
        type="summarize"
        onComplete={() => {
          // Could add analytics or other completion actions here
        }}
      />

      {/* Sample Proposal for Testing */}
      <div className="card border-dashed border-2 border-gray-300">
        <h4 className="font-medium text-gray-700 mb-2">🧪 Test with Sample Proposal</h4>
        <p className="text-sm text-gray-600 mb-3">
          Click below to load a sample DAO proposal for testing:
        </p>
        <button
          onClick={() => setProposalText(`# Proposal: Implement DAO Treasury Diversification Strategy

## Summary
This proposal seeks to diversify the DAO treasury by allocating 30% of current ETH holdings into a balanced portfolio of blue-chip cryptocurrencies and DeFi yield farming opportunities.

## Background
Currently, our DAO treasury holds approximately 1,000 ETH (~$2.5M USD at current prices). This concentration in a single asset exposes us to significant volatility risk and limits our ability to generate passive income.

## Proposed Strategy
1. Allocate 15% (150 ETH) to Bitcoin (BTC) for store-of-value exposure
2. Allocate 10% (100 ETH) to stablecoins (USDC/DAI) for stability
3. Allocate 5% (50 ETH) to DeFi yield farming through established protocols like Aave and Compound

## Expected Benefits
- Reduced portfolio volatility through diversification
- Potential for 4-8% annual yield through DeFi protocols
- Better positioned for various market conditions
- Improved treasury sustainability for long-term operations

## Risks & Considerations
- Smart contract risks in DeFi protocols
- Execution risk during asset conversion
- Potential for temporary losses during market downturns
- Gas costs for treasury management transactions

## Implementation Timeline
- Week 1-2: Community discussion and feedback
- Week 3: Final proposal modifications
- Week 4: On-chain voting period
- Week 5-6: Execution if approved

## Voting Options
A) Approve the full diversification strategy as proposed
B) Approve a reduced version (20% allocation instead of 30%)
C) Reject the proposal and maintain current treasury composition

The treasury management will be executed by a 3-of-5 multisig controlled by elected treasury committee members.`)}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          disabled={isLoading}
        >
          Load Sample Proposal
        </button>
      </div>
    </div>
  )
} 