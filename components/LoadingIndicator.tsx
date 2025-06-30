'use client'

import { useState, useEffect } from 'react'

interface LoadingIndicatorProps {
  type: 'summarizing' | 'drafting' | 'analyzing' | 'thinking'
  className?: string
}

export default function LoadingIndicator({ type, className = '' }: LoadingIndicatorProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [dots, setDots] = useState('')

  // Different message sets based on the type of operation
  const messages = {
    summarizing: [
      "🔍 Reading through your proposal...",
      "🧠 Analyzing key points...",
      "📊 Identifying important details...",
      "💡 Finding the main objectives...",
      "⚖️ Weighing pros and cons...",
      "🎯 Extracting actionable insights...",
      "📝 Crafting your summary...",
      "✨ Adding the finishing touches..."
    ],
    drafting: [
      "💭 Brainstorming ideas...",
      "🏗️ Building proposal structure...",
      "📐 Designing the framework...",
      "🎨 Crafting compelling content...",
      "⚡ Energizing the motivation section...",
      "🔧 Fine-tuning implementation details...",
      "🎪 Adding governance best practices...",
      "🚀 Preparing for launch..."
    ],
    analyzing: [
      "🔬 Deep diving into the data...",
      "🤔 Processing complex information...",
      "🎭 Understanding nuances...",
      "📚 Cross-referencing best practices...",
      "🌟 Discovering insights...",
      "🧩 Connecting the dots...",
      "⚙️ Running analysis algorithms...",
      "🎯 Finalizing recommendations..."
    ],
    thinking: [
      "🤖 AI neurons firing...",
      "🧠 Deep thinking in progress...",
      "💫 Consulting the blockchain wisdom...",
      "🎪 Performing digital magic...",
      "🚀 Launching thought rockets...",
      "🌈 Painting ideas with data...",
      "⚡ Charging up creativity circuits...",
      "🎭 Orchestrating digital brilliance..."
    ]
  }

  const currentMessages = messages[type]

  // Cycle through messages every 2 seconds
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % currentMessages.length)
    }, 2000)

    return () => clearInterval(messageInterval)
  }, [currentMessages.length])

  // Animate dots every 500ms
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(dotsInterval)
  }, [])

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Animated Spinner */}
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-500 rounded-full animate-spin-reverse"></div>
      </div>

      {/* Dynamic Message */}
      <div className="text-center space-y-2">
        <div className="text-lg font-medium text-gray-800 min-h-[28px] flex items-center justify-center">
          {currentMessages[messageIndex]}
          <span className="ml-1 w-8 text-left text-blue-600 font-bold">
            {dots}
          </span>
        </div>
        
        {/* Progress indicator */}
        <div className="flex space-x-1 justify-center">
          {currentMessages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === messageIndex 
                  ? 'bg-blue-600 scale-125' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        {/* Fun subtitle */}
        <div className="text-sm text-gray-500 italic">
          {type === 'summarizing' && "Making complex proposals digestible 🍽️"}
          {type === 'drafting' && "Turning ideas into governance gold 🏆"}
          {type === 'analyzing' && "Crunching data like a digital scholar 📖"}
          {type === 'thinking' && "Computing at the speed of thought 💨"}
        </div>
      </div>

      {/* Floating particles animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-20"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-30" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce opacity-25" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  )
} 