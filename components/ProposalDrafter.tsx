'use client'

import { useState } from 'react'
import axios from 'axios'
import LoadingIndicator from './LoadingIndicator'
import StreamingResponse from './StreamingResponse'

export default function ProposalDrafter() {
  const [title, setTitle] = useState('')
  const [ideas, setIdeas] = useState('')
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedModel, setSelectedModel] = useState('qwen3:8b')

  const modelOptions = [
    { value: 'qwen3:8b', label: 'Qwen3 8B (🎯 Recommended)', time: '~10-20s' },
    { value: 'gemma2:2b', label: 'Gemma2 2B (⚡ Fastest)', time: '~5-10s' },
    { value: 'phi3:3.8b', label: 'Phi3 3.8B (💡 Smart)', time: '~8-15s' }
  ]

  const handleDraft = async () => {
    if (!ideas.trim()) {
      setError('Please enter your proposal ideas')
      return
    }

    setIsLoading(true)
    setError('')
    setDraft('')

    try {
      const response = await axios.post('/api/draft-proposal', {
        ideas: ideas.trim(),
        title: title.trim() || 'DAO Proposal',
        modelName: selectedModel
      }, {
        timeout: 30000 // 30 second timeout
      })

      if (response.data.success) {
        setDraft(response.data.draft)
      } else {
        setError(response.data.error || 'Failed to generate proposal draft')
      }
    } catch (err: any) {
      console.error('Drafting error:', err)
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out (30s). Try shortening your ideas or using the faster gemma2:2b model.')
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
    setTitle('')
    setIdeas('')
    setDraft('')
    setError('')
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Proposal Drafter</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Treasury Diversification Strategy"
              className="w-full p-3 border border-gray-300 rounded-lg"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Ideas
            </label>
            <textarea
              value={ideas}
              onChange={(e) => setIdeas(e.target.value)}
              placeholder="Describe your proposal ideas..."
              className="w-full h-48 p-3 border border-gray-300 rounded-lg"
              disabled={isLoading}
            />
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

          <div className="flex space-x-3">
            <button
              onClick={handleDraft}
              disabled={isLoading || !ideas.trim()}
              className="btn-primary flex-1"
            >
              {isLoading ? '✨ AI is crafting...' : '🚀 Generate Proposal'}
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
          <div className="mt-6 p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <LoadingIndicator type="drafting" />
          </div>
        )}

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
        response={draft}
        isLoading={isLoading}
        type="draft"
        onComplete={() => {
          // Could add analytics or other completion actions here
        }}
      />
    </div>
  )
} 