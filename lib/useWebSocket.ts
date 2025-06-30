'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketState {
  isConnected: boolean
  streamText: string
  progress: number
  status: string
  error: string | null
  isStreaming: boolean
  thinkingText: string
  result: any
}

interface UseWebSocketReturn extends WebSocketState {
  summarizeProposal: (text: string, model: string) => void
  draftProposal: (ideas: string, title: string, model: string) => void
  clearStream: () => void
  socket: Socket | null
}

export function useWebSocket(): UseWebSocketReturn {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    streamText: '',
    progress: 0,
    status: 'idle',
    error: null,
    isStreaming: false,
    thinkingText: '',
    result: null
  })

  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize WebSocket connection with better error handling
    const socket = io('http://localhost:3002', {
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('🔌 WebSocket connected')
      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        error: null,
        status: 'connected'
      }))
    })

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected')
      setState(prev => ({ 
        ...prev, 
        isConnected: false,
        status: 'disconnected'
      }))
    })

    socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error)
      setState(prev => ({ 
        ...prev, 
        isConnected: false,
        error: 'Connection failed: ' + error.message,
        status: 'error'
      }))
    })

    // Streaming events for proposal summarization
    socket.on('status', (data) => {
      setState(prev => ({ 
        ...prev, 
        status: data.message,
        progress: data.progress || prev.progress
      }))
    })

    socket.on('stream-chunk', (data) => {
      setState(prev => ({ 
        ...prev, 
        streamText: data.fullText || prev.streamText + data.chunk,
        thinkingText: data.thinking || prev.thinkingText,
        progress: data.progress || prev.progress,
        isStreaming: true
      }))
    })

    socket.on('stream-complete', (data) => {
      setState(prev => ({ 
        ...prev, 
        streamText: data.summary || prev.streamText,
        thinkingText: data.thinking || prev.thinkingText,
        result: data,
        isStreaming: false,
        progress: 100,
        status: 'completed'
      }))
    })

    socket.on('stream-error', (data) => {
      setState(prev => ({ 
        ...prev, 
        error: data.error,
        isStreaming: false,
        status: 'error'
      }))
    })

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  const summarizeProposal = (text: string, model: string = 'gemma2:2b') => {
    if (!socketRef.current?.connected) {
      setState(prev => ({ 
        ...prev, 
        error: 'WebSocket not connected' 
      }))
      return
    }

    // Reset state for new request
    setState(prev => ({ 
      ...prev, 
      streamText: '',
      thinkingText: '',
      error: null,
      isStreaming: true,
      progress: 0,
      status: 'processing',
      result: null
    }))

    // Send summarization request
    socketRef.current.emit('summarize-proposal', {
      proposalText: text,
      modelName: model
    })
  }

  const draftProposal = (ideas: string, title: string = '', model: string = 'gemma2:2b') => {
    if (!socketRef.current?.connected) {
      setState(prev => ({ 
        ...prev, 
        error: 'WebSocket not connected' 
      }))
      return
    }

    // Reset state for new request
    setState(prev => ({ 
      ...prev, 
      streamText: '',
      thinkingText: '',
      error: null,
      isStreaming: true,
      progress: 0,
      status: 'processing',
      result: null
    }))

    // Send proposal drafting request
    socketRef.current.emit('draft-proposal', {
      ideas: ideas,
      title: title,
      modelName: model
    })
  }

  const clearStream = () => {
    setState(prev => ({ 
      ...prev, 
      streamText: '',
      thinkingText: '',
      error: null,
      isStreaming: false,
      progress: 0,
      status: 'idle',
      result: null
    }))
  }

  return {
    ...state,
    summarizeProposal,
    draftProposal,
    clearStream,
    socket: socketRef.current
  }
} 