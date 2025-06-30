'use client'

import { useState } from 'react'
import Navbar from '../components/Navbar'
import StreamingProposalSummarizer from '../components/StreamingProposalSummarizer'
import ProposalDrafter from '../components/ProposalDrafter'
import ChatHistory from '../components/ChatHistory'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import SystemStatus from '../components/SystemStatus'

export default function Home() {
  const [activeTab, setActiveTab] = useState('summarize')
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        connectedAddress={connectedAddress}
        setConnectedAddress={setConnectedAddress}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'summarize' && <StreamingProposalSummarizer />}
          {activeTab === 'draft' && <ProposalDrafter />}
          {activeTab === 'history' && <ChatHistory userAddress={connectedAddress} />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <p>Powered by local open-source AI models</p>
          <p className="text-sm mt-2">Smart Contract: 0x52Ddcc9d3fBfb183718210B04da9ecd4165fa86f (Sepolia)</p>
        </div>
      </footer>

      {/* Floating System Status */}
      <SystemStatus />
    </div>
  )
} 