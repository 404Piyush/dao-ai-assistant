'use client'

import { useState } from 'react'
import LoadingIndicator from '../../components/LoadingIndicator'

export default function TestLoadingPage() {
  const [activeDemo, setActiveDemo] = useState<'summarizing' | 'drafting' | 'analyzing' | 'thinking'>('summarizing')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎭 Loading Animation Showcase
          </h1>
          <p className="text-gray-600">
            See the engaging loading indicators in action!
          </p>
        </div>

        {/* Demo Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(['summarizing', 'drafting', 'analyzing', 'thinking'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveDemo(type)}
              className={`p-4 rounded-xl font-medium transition-all ${
                activeDemo === type
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'summarizing' && '📋 Summarizing'}
              {type === 'drafting' && '✍️ Drafting'}
              {type === 'analyzing' && '🔬 Analyzing'}
              {type === 'thinking' && '🤖 Thinking'}
            </button>
          ))}
        </div>

        {/* Demo Display */}
        <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
          <div className="py-12">
            <LoadingIndicator type={activeDemo} />
          </div>
        </div>

        {/* Features List */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">✨ Animation Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Dynamic message cycling every 2 seconds</li>
              <li>• Animated dots that grow and shrink</li>
              <li>• Progress indicators showing current message</li>
              <li>• Dual spinning rings with different directions</li>
              <li>• Floating particle effects</li>
              <li>• Context-specific messages for each operation</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">🎯 User Experience</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Keeps users engaged during wait times</li>
              <li>• Shows progress and what's happening</li>
              <li>• Adds personality to the AI interactions</li>
              <li>• Reduces perceived loading time</li>
              <li>• Makes waiting fun and informative</li>
              <li>• Builds trust through transparency</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/"
            className="btn-primary inline-flex items-center"
          >
            ← Back to DAO Assistant
          </a>
          <div className="mt-4">
            <a 
              href="/test-streaming"
              className="btn-secondary inline-flex items-center ml-4"
            >
              🚀 View Streaming Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 