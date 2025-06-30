'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

interface ModelInfo {
  name: string
  size: string
  status: 'loaded' | 'available' | 'downloading'
  modified_at: string
}

interface SystemStatus {
  backend: 'online' | 'offline' | 'error'
  ollama: 'connected' | 'disconnected' | 'error'
  models: ModelInfo[]
  lastChecked: Date
  responseTime: number
}

export default function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    backend: 'offline',
    ollama: 'disconnected',
    models: [],
    lastChecked: new Date(),
    responseTime: 0
  })
  const [isVisible, setIsVisible] = useState(false)

  const checkSystemStatus = async () => {
    const startTime = Date.now()
    
    try {
      // Check backend health
      const healthResponse = await axios.get('http://localhost:3001/health', { timeout: 5000 })
      
      // Check Ollama status
      const ollamaResponse = await axios.get('http://localhost:3001/api/ollama-status', { timeout: 5000 })
      
      const responseTime = Date.now() - startTime
      
      setStatus({
        backend: healthResponse.status === 200 ? 'online' : 'error',
        ollama: ollamaResponse.data.connected ? 'connected' : 'disconnected',
        models: ollamaResponse.data.models || [],
        lastChecked: new Date(),
        responseTime
      })
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        backend: 'offline',
        ollama: 'disconnected',
        lastChecked: new Date(),
        responseTime: Date.now() - startTime
      }))
    }
  }

  useEffect(() => {
    checkSystemStatus()
    const interval = setInterval(checkSystemStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'loaded':
        return 'text-green-600 bg-green-100'
      case 'offline':
      case 'disconnected':
      case 'error':
        return 'text-red-600 bg-red-100'
      case 'available':
      case 'downloading':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'loaded':
        return '🟢'
      case 'offline':
      case 'disconnected':
      case 'error':
        return '🔴'
      case 'available':
      case 'downloading':
        return '🟡'
      default:
        return '⚪'
    }
  }

  const formatModelSize = (size: string) => {
    const bytes = parseInt(size)
    if (bytes > 1e9) return `${(bytes / 1e9).toFixed(1)}GB`
    if (bytes > 1e6) return `${(bytes / 1e6).toFixed(1)}MB`
    return `${(bytes / 1e3).toFixed(1)}KB`
  }

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
        title="System Status"
      >
        📊
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center">
            📊 System Status
          </h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/80 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>
        <p className="text-white/80 text-sm mt-1">
          Last updated: {status.lastChecked.toLocaleTimeString()}
        </p>
      </div>

      {/* Status Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Core Services */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Core Services</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="flex items-center">
                {getStatusIcon(status.backend)} <span className="ml-2">Backend API</span>
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.backend)}`}>
                {status.backend}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="flex items-center">
                {getStatusIcon(status.ollama)} <span className="ml-2">Ollama AI</span>
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.ollama)}`}>
                {status.ollama}
              </span>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Performance</h4>
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="font-medium text-blue-600">
                {formatResponseTime(status.responseTime)}
              </span>
            </div>
          </div>
        </div>

        {/* AI Models */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">AI Models ({status.models.length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {status.models.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No models available
              </div>
            ) : (
              status.models.map((model, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{model.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatModelSize(model.size)} • Modified {new Date(model.modified_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('loaded')}`}>
                    ready
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2 border-t border-gray-200">
          <button
            onClick={checkSystemStatus}
            className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            🔄 Refresh
          </button>
          <a
            href="http://localhost:11434"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors text-center"
          >
            🔧 Ollama
          </a>
        </div>
      </div>
    </div>
  )
} 