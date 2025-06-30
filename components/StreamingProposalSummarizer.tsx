'use client'

import { useState, useRef, useEffect } from 'react'
import { useWebSocket } from '../lib/useWebSocket'
import ChatHistoryModal from './ChatHistoryModal'

export default function StreamingProposalSummarizer() {
  const [proposalText, setProposalText] = useState('')
  const [selectedModel, setSelectedModel] = useState('gemma2:2b')
  const [showThinking, setShowThinking] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  
  // Ref for auto-scrolling to AI response
  const aiResponseRef = useRef<HTMLDivElement>(null)
  
  const { 
    isConnected, 
    streamText, 
    progress, 
    status, 
    error, 
    isStreaming, 
    summarizeProposal, 
    clearStream,
    thinkingText,
    result
  } = useWebSocket()

  // Auto-scroll to AI response when streaming starts
  useEffect(() => {
    if (isStreaming && aiResponseRef.current) {
      setTimeout(() => {
        aiResponseRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest' 
        })
      }, 500) // Small delay to ensure content is rendered
    }
  }, [isStreaming])

  // Auto-scroll when new content arrives during streaming
  useEffect(() => {
    if (streamText && isStreaming && aiResponseRef.current) {
      // Scroll to bottom of the response area during streaming
      const responseContent = aiResponseRef.current.querySelector('.ai-response-content')
      if (responseContent) {
        responseContent.scrollTop = responseContent.scrollHeight
      }
    }
  }, [streamText, isStreaming])

  const modelOptions = [
    { value: 'qwen3:8b', label: 'Qwen3 8B (🎯 Best Quality)', time: '~10-20s' },
    { value: 'gemma2:2b', label: 'Gemma2 2B (⚡ Fastest)', time: '~5-10s' }
  ]

  const handleSummarize = () => {
    if (!proposalText.trim()) {
      return
    }
    summarizeProposal(proposalText.trim(), selectedModel)
  }

  const clearAll = () => {
    setProposalText('')
    clearStream()
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(streamText)
      alert('Summary copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const loadSampleProposal = () => {
    setProposalText(`# Proposal: Implement DAO Treasury Diversification Strategy

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

The treasury management will be executed by a 3-of-5 multisig controlled by elected treasury committee members.`)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">📋 Real-Time Proposal Summarizer</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? '🔌 Connected' : '🔌 Disconnected'}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          Paste a DAO proposal below and get an AI-generated summary with live streaming updates! 
          Watch as the AI analyzes and summarizes in real-time.
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
              disabled={isStreaming}
            />
            <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
              <span>{proposalText.length} characters</span>
              <button
                onClick={loadSampleProposal}
                className="text-blue-600 hover:text-blue-800 underline"
                disabled={isStreaming}
              >
                📝 Load Sample Proposal
              </button>
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
              disabled={isStreaming}
            >
              {modelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.time}
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-500 mt-1">
              💡 Gemma2 2B is fastest for real-time streaming
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleSummarize}
              disabled={isStreaming || !proposalText.trim() || !isConnected}
              className={`btn-primary flex-1 ${
                isStreaming || !proposalText.trim() || !isConnected ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isStreaming ? '⏳ AI is analyzing...' : '🚀 Start Live Summary'}
            </button>
            
            <button
              onClick={clearAll}
              disabled={isStreaming}
              className="btn-secondary"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Connection Error */}
        {!isConnected && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <div className="text-yellow-600 mr-2">⚠️</div>
              <div>
                <h4 className="text-yellow-800 font-medium">WebSocket Disconnected</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  Attempting to reconnect to streaming service...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Display */}
        {status && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-blue-600 mr-2">🔄</div>
                <span className="text-blue-800 font-medium">{status.message}</span>
              </div>
              {progress > 0 && (
                <span className="text-blue-600 text-sm">{progress}%</span>
              )}
            </div>
            {progress > 0 && (
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && !isStreaming && (
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

      {/* Live Streaming Summary - Auto-scroll target */}
      {(streamText || isStreaming) && (
        <div ref={aiResponseRef} className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">📊 Live AI Summary</h3>
            <div className="flex space-x-2">
              {isStreaming && (
                <div className="flex items-center space-x-2">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <span className="text-sm text-gray-600">Analyzing...</span>
                </div>
              )}
              {streamText && (
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm hover:bg-green-200 transition-colors"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                  >
                    💾 Save
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Thinking Section (if available) */}
          {thinkingText && (
            <div className="mb-4">
              <button
                onClick={() => setShowThinking(!showThinking)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
              >
                <span>{showThinking ? '🔽' : '▶️'}</span>
                <span>Show AI Thinking Process</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {thinkingText.split(' ').length} words
                </span>
              </button>
              
              {showThinking && (
                <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-gray-400 text-sm italic whitespace-pre-wrap leading-relaxed font-mono">
                    {thinkingText}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Main Summary with improved scrolling */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
            <div className="prose prose-sm max-w-none">
              {streamText ? (
                <div className="ai-response-content max-h-[600px] overflow-y-auto custom-scrollbar">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {streamText}
                    {isStreaming && <span className="animate-pulse">|</span>}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  Waiting for AI analysis to begin...
                </div>
              )}
            </div>
          </div>

          {streamText && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              📊 Summary: {streamText.split(' ').length} words • Model: {selectedModel}
              {thinkingText && (
                <> • 🧠 Thinking: {thinkingText.split(' ').length} words</>
              )}
            </div>
          )}
        </div>
      )}

      {/* Save Chat Modal */}
      {streamText && (
        <ChatHistoryModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          chatData={{
            type: 'summarize',
            input: proposalText,
            output: streamText,
            thinking: thinkingText,
            model: selectedModel,
            timestamp: new Date()
          }}
        />
      )}
    </div>
  )
} 