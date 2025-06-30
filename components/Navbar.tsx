'use client'

import { useState } from 'react'
import WalletConnection from './WalletConnection'

interface NavbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  connectedAddress: string | null
  setConnectedAddress: (address: string | null) => void
}

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  connectedAddress, 
  setConnectedAddress 
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'summarize', label: '📋 Summarize', description: 'Summarize proposals' },
    { id: 'draft', label: '✍️ Draft', description: 'Draft new proposals' },
    { id: 'history', label: '💬 History', description: 'View chat history' },
    { id: 'analytics', label: '📊 Analytics', description: 'Usage analytics & insights' }
  ]

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DAO</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Smart DAO Governance</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={item.description}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {/* Smart Contract Info */}
            <div className="hidden lg:block text-right">
              <div className="text-xs text-gray-500">Smart Contract</div>
              <div className="text-xs font-mono text-blue-600">
                0x1af5...C5a2
              </div>
            </div>

            {/* Wallet Connection Component */}
            <WalletConnection onConnect={setConnectedAddress} compact={true} />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div>{item.label}</div>
                  <div className="text-sm opacity-75">{item.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {connectedAddress && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-t border-green-200 px-4 py-2">
          <div className="container mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-800 font-medium">Connected</span>
              <span className="text-gray-600">
                {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-4 text-xs text-gray-600">
              <span>🌐 Sepolia Testnet</span>
              <span>⚡ Ollama Ready</span>
              <span>🔗 Contract Active</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
} 