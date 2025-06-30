'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import LoadingIndicator from './LoadingIndicator'

interface ChatHistoryItem {
  id: string
  type: 'summarize' | 'draft'
  input: string
  output: string
  timestamp: Date
  modelUsed: string
  fee: string
  txHash?: string
  isPublic: boolean
}

interface ChatHistoryProps {
  userAddress: string | null
}

export default function ChatHistory({ userAddress }: ChatHistoryProps) {
  const [chats, setChats] = useState<ChatHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedChat, setSelectedChat] = useState<ChatHistoryItem | null>(null)
  const [showPublicChats, setShowPublicChats] = useState(false)
  const [userStats, setUserStats] = useState({
    totalChats: 0,
    totalFees: '0',
    isPremium: false
  })

  // Mock data for demonstration
  useEffect(() => {
    if (userAddress) {
      loadChatHistory()
      loadUserStats()
    }
  }, [userAddress])

  const loadChatHistory = async () => {
    setIsLoading(true)
    // In real implementation, this would call the smart contract
    const mockChats: ChatHistoryItem[] = [
      {
        id: '1',
        type: 'summarize',
        input: 'Proposal for treasury diversification...',
        output: 'This proposal aims to diversify the DAO treasury by allocating 30% of ETH holdings...',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        modelUsed: 'qwen3:8b',
        fee: '0.001',
        txHash: '0x1234...5678',
        isPublic: false
      },
      {
        id: '2',
        type: 'draft',
        input: 'Ideas for community grants program...',
        output: '# Community Grants Program\n\n## Summary\nEstablish a 100 ETH grants program...',
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        modelUsed: 'qwen3:8b',
        fee: '0.0005', // Premium discount
        txHash: '0x5678...9012',
        isPublic: true
      }
    ]
    setChats(mockChats)
    setIsLoading(false)
  }

  const loadUserStats = async () => {
    setUserStats({
      totalChats: 15,
      totalFees: '0.0125',
      isPremium: true
    })
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="space-y-6">
      {/* User Stats Card */}
      <div className="card-premium">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold gradient-text">💬 Chat History</h2>
          {userStats.isPremium && (
            <span className="status-badge bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800">
              ⭐ Premium
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white/50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{userStats.totalChats}</div>
            <div className="text-sm text-gray-600">Total Chats</div>
          </div>
          <div className="p-3 bg-white/50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">{userStats.totalFees} ETH</div>
            <div className="text-sm text-gray-600">Fees Paid</div>
          </div>
          <div className="p-3 bg-white/50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {userStats.isPremium ? '50%' : '0%'}
            </div>
            <div className="text-sm text-gray-600">Discount</div>
          </div>
        </div>
      </div>

      {/* Chat Toggle */}
      <div className="flex space-x-4">
        <button
          onClick={() => setShowPublicChats(false)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            !showPublicChats
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📱 My Chats
        </button>
        <button
          onClick={() => setShowPublicChats(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            showPublicChats
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🌍 Public Gallery
        </button>
      </div>

      {/* Chat List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
            <div className="py-8">
              <LoadingIndicator type="analyzing" />
            </div>
          </div>
        ) : chats.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-6xl mb-4">💭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No chats yet</h3>
            <p className="text-gray-600">Start using the AI assistant to build your history!</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div key={chat.id} className="card hover:shadow-lg cursor-pointer transition-all duration-300"
                 onClick={() => setSelectedChat(chat)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      chat.type === 'summarize' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {chat.type === 'summarize' ? '📋 Summary' : '✍️ Draft'}
                    </span>
                    {chat.isPublic && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        🌍 Public
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">
                    {truncateText(chat.input, 80)}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {truncateText(chat.output, 120)}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(chat.timestamp)}</span>
                    <div className="flex items-center space-x-3">
                      <span>⚡ {chat.modelUsed}</span>
                      <span>💰 {chat.fee} ETH</span>
                      {chat.txHash && (
                        <a 
                          href={`https://etherscan.io/tx/${chat.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          🔗 TX
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Detail Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedChat.type === 'summarize' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {selectedChat.type === 'summarize' ? '📋 Summary' : '✍️ Draft'}
                  </span>
                  <span className="text-sm text-gray-500">{formatDate(selectedChat.timestamp)}</span>
                </div>
                <button
                  onClick={() => setSelectedChat(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">📝 Input</h4>
                  <div className="chat-bubble-user">
                    <p className="whitespace-pre-wrap">{selectedChat.input}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">🤖 AI Response</h4>
                  <div className="chat-bubble-ai">
                    <pre className="whitespace-pre-wrap font-sans">{selectedChat.output}</pre>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <span>⚡ Model: {selectedChat.modelUsed}</span>
                    <span>💰 Fee: {selectedChat.fee} ETH</span>
                  </div>
                  {selectedChat.txHash && (
                    <a 
                      href={`https://etherscan.io/tx/${selectedChat.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 font-medium"
                    >
                      View on Etherscan 🔗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 