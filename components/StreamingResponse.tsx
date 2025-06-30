'use client'

import { useState, useEffect, useRef } from 'react'

interface StreamingResponseProps {
  response: string
  isLoading: boolean
  type: 'summarize' | 'draft'
  onComplete?: () => void
}

export default function StreamingResponse({ 
  response, 
  isLoading, 
  type,
  onComplete 
}: StreamingResponseProps) {
  const [currentText, setCurrentText] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [showThinking, setShowThinking] = useState(true)
  const [thinkingTime, setThinkingTime] = useState(0)
  const [streamingTime, setStreamingTime] = useState(0)
  const [isStreamingComplete, setIsStreamingComplete] = useState(false)
  
  const thinkingStartTime = useRef<number>(0)
  const streamingStartTime = useRef<number>(0)
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Thinking messages that cycle
  const thinkingMessages = {
    summarize: [
      "Analyzing the proposal structure...",
      "Identifying key governance points...",
      "Extracting main objectives and impacts...",
      "Evaluating risks and considerations...",
      "Structuring the summary framework...",
      "Finalizing insights and recommendations..."
    ],
    draft: [
      "Understanding your ideas...",
      "Researching DAO governance best practices...",
      "Structuring the proposal framework...",
      "Crafting motivation and specification sections...",
      "Adding implementation details...",
      "Polishing the final proposal format..."
    ]
  }

  const [currentThinkingIndex, setCurrentThinkingIndex] = useState(0)

  // Start thinking phase when loading begins
  useEffect(() => {
    if (isLoading && !isThinking) {
      setIsThinking(true)
      setCurrentText('')
      setIsStreamingComplete(false)
      thinkingStartTime.current = Date.now()
      
      // Cycle through thinking messages
      const thinkingInterval = setInterval(() => {
        setCurrentThinkingIndex(prev => 
          (prev + 1) % thinkingMessages[type].length
        )
      }, 1500)
      thinkingIntervalRef.current = thinkingInterval

      // Update thinking time
      const timeInterval = setInterval(() => {
        setThinkingTime(Math.floor((Date.now() - thinkingStartTime.current) / 1000))
      }, 100)

      return () => {
        clearInterval(thinkingInterval)
        clearInterval(timeInterval)
      }
    }
  }, [isLoading, type])

  // Start streaming when response is available
  useEffect(() => {
    if (!isLoading && response && isThinking) {
      setIsThinking(false)
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current)
      }
      
      // Start streaming
      streamingStartTime.current = Date.now()
      setCurrentText('')
      
      const words = response.split(' ')
      let currentIndex = 0

      const streamInterval = setInterval(() => {
        if (currentIndex < words.length) {
          setCurrentText(prev => 
            prev + (currentIndex === 0 ? '' : ' ') + words[currentIndex]
          )
          currentIndex++
          
          // Update streaming time
          setStreamingTime(Math.floor((Date.now() - streamingStartTime.current) / 1000))
        } else {
          clearInterval(streamInterval)
          setIsStreamingComplete(true)
          onComplete?.()
        }
      }, 50) // Stream at ~20 words per second

      streamingIntervalRef.current = streamInterval

      return () => clearInterval(streamInterval)
    }
  }, [isLoading, response, isThinking, onComplete])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current)
      }
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current)
      }
    }
  }, [])

  if (!isLoading && !response) return null

  return (
    <div className="space-y-4">
      {/* Thinking Phase */}
      {(isThinking || thinkingTime > 0) && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowThinking(!showThinking)}
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-sm font-medium text-gray-700"
          >
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span>
                {isThinking ? 'Thinking...' : 'Thinking complete'}
              </span>
              <span className="text-gray-500">({thinkingTime}s)</span>
            </div>
            <div className={`transform transition-transform ${showThinking ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </button>
          
          {showThinking && (
            <div className="px-4 py-3 bg-white border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {isThinking && (
                  <>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="italic">
                      {thinkingMessages[type][currentThinkingIndex]}
                    </span>
                  </>
                )}
                {!isThinking && (
                  <span className="text-green-600 italic">
                    ✓ Analysis complete, generating response...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Streaming Response */}
      {(!isThinking && (currentText || isStreamingComplete)) && (
        <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {type === 'summarize' ? '📄 AI Summary' : '📝 AI Proposal Draft'}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {!isStreamingComplete && (
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Generating...</span>
                </div>
              )}
              <span>({streamingTime}s)</span>
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <div className="text-gray-700 leading-relaxed">
              {currentText.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {paragraph}
                  {/* Cursor effect while streaming */}
                  {!isStreamingComplete && index === currentText.split('\n').length - 1 && (
                    <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                  )}
                </p>
              ))}
            </div>
          </div>

          {isStreamingComplete && (
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                ✅ Response generated successfully
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigator.clipboard.writeText(response)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  📋 Copy
                </button>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  🔗 Save to Blockchain
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 