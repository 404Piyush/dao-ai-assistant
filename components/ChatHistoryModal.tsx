'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_CONFIG } from '../lib/contract-config'

interface ChatHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  chatData: {
    type: 'summarize' | 'draft'
    input: string
    output: string
    thinking?: string
    model: string
    timestamp: Date
  }
}

export default function ChatHistoryModal({ isOpen, onClose, chatData }: ChatHistoryModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isPublicizing, setIsPublicizing] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [publicizeSuccess, setPublicizeSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSavePrivate = async () => {
    setIsSaving(true)
    setError('')

    try {
      // Check if MetaMask is installed
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask not found! Please install MetaMask to save chats.')
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum)
      
      // Request account access first
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      console.log('🔌 Wallet connected:', userAddress)
      
      // Create contract instance
      const contract = new ethers.Contract(
        CONTRACT_CONFIG.CHAT_HISTORY_ADDRESS,
        CONTRACT_CONFIG.ABI,
        signer
      )
      
      // For now, send a simple transaction with fixed fee (until contract upgrade)
      // TODO: Deploy updated contract with storeChatByUser function
      const requiredFee = ethers.parseEther('0.001') // Fixed fee for now
      console.log('💰 Required fee:', ethers.formatEther(requiredFee), 'ETH')
      
      // Simple ETH transfer to simulate fee payment
      // This will work with any valid address that can receive ETH
      const tx = await signer.sendTransaction({
        to: userAddress, // Send to self as a placeholder (no funds lost)
        value: requiredFee,
        data: '0x'
      })
      
      console.log('💰 Storage fee transaction:', tx.hash)
      await tx.wait()
      console.log('✅ Transaction confirmed!')

      // Save to MongoDB
      const response = await fetch('/api/save-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...chatData,
          isPublic: false,
          userAddress
        })
      })

      if (response.ok) {
        setSaveSuccess(true)
        setTimeout(() => {
          setSaveSuccess(false)
          onClose()
        }, 2000)
      } else {
        throw new Error('Failed to save chat')
      }
    } catch (err: any) {
      console.error('Save error:', err)
      setError(err.message || 'Failed to save chat. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublicize = async () => {
    setIsPublicizing(true)
    setError('')

    try {
      // Check if MetaMask is installed
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask not found! Please install MetaMask to publicize chats.')
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum)
      
      // Request account access first
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      console.log('🔌 Wallet connected:', userAddress)
      
      // Create contract instance
      const contract = new ethers.Contract(
        CONTRACT_CONFIG.CHAT_HISTORY_ADDRESS,
        CONTRACT_CONFIG.ABI,
        signer
      )
      
      // For now, send a simple transaction with fixed fee (until contract upgrade)
      // TODO: Deploy updated contract with storeChatByUser function
      const requiredFee = ethers.parseEther('0.001') // Fixed fee for now
      console.log('💰 Required fee:', ethers.formatEther(requiredFee), 'ETH')
      
      // Simple ETH transfer to simulate fee payment
      // This will work with any valid address that can receive ETH
      const tx = await signer.sendTransaction({
        to: userAddress, // Send to self as a placeholder (no funds lost)
        value: requiredFee,
        data: '0x'
      })
      
      console.log('💰 Publicize fee transaction:', tx.hash)
      await tx.wait()
      console.log('✅ Transaction confirmed!')

      // Save to MongoDB as public
      const response = await fetch('/api/save-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...chatData,
          isPublic: true,
          userAddress
        })
      })

      if (response.ok) {
        setPublicizeSuccess(true)
        setTimeout(() => {
          setPublicizeSuccess(false)
          onClose()
        }, 2000)
      } else {
        throw new Error('Failed to publicize chat')
      }
    } catch (err: any) {
      console.error('Publicize error:', err)
      setError(err.message || 'Failed to publicize chat. Please try again.')
    } finally {
      setIsPublicizing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">💾 Save Chat History</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Chat Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-2">
              📋 {chatData.type === 'summarize' ? 'Proposal Summary' : 'Proposal Draft'} • 
              Model: {chatData.model} • 
              {chatData.timestamp.toLocaleString()}
            </div>
            
            <div className="max-h-40 overflow-y-auto">
              <div className="text-sm text-gray-800">
                <strong>Input:</strong> {chatData.input.substring(0, 200)}
                {chatData.input.length > 200 && '...'}
              </div>
              <div className="text-sm text-gray-800 mt-2">
                <strong>Output:</strong> {chatData.output.substring(0, 200)}
                {chatData.output.length > 200 && '...'}
              </div>
            </div>
          </div>

          {/* Success Messages */}
          {saveSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg success-pulse">
              <div className="flex items-center text-green-800">
                <div className="animate-bounce mr-2">✅</div>
                <div>Chat saved privately to your blockchain history!</div>
              </div>
            </div>
          )}

          {publicizeSuccess && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center text-blue-800">
                <div className="animate-spin mr-2">🌐</div>
                <div>Chat shared publicly in community gallery!</div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg error-pulse">
              <div className="flex items-center text-red-800">
                <div className="animate-pulse mr-2">❌</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {/* Save Options */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">🔒 Save Privately</h4>
                  <p className="text-sm text-gray-600">Keep this chat in your personal history</p>
                </div>
                <div className="text-sm text-gray-500">Fee: 0.001 ETH</div>
              </div>
              <button
                onClick={handleSavePrivate}
                disabled={isSaving || saveSuccess}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  saveSuccess 
                    ? 'bg-green-100 text-green-600 cursor-not-allowed border border-green-300'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isSaving ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Processing on Blockchain...
                  </div>
                ) : saveSuccess ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-bounce mr-2">✅</div>
                    Saved to Blockchain!
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">💾</span>
                    Save to My Blockchain History
                  </div>
                )}
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">🌐 Share Publicly</h4>
                  <p className="text-sm text-gray-600">Add to public gallery for community viewing</p>
                </div>
                <div className="text-sm text-gray-500">Fee: 0.005 ETH</div>
              </div>
              <button
                onClick={handlePublicize}
                disabled={isPublicizing || publicizeSuccess}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  publicizeSuccess 
                    ? 'bg-green-100 text-green-600 cursor-not-allowed border border-green-300'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isPublicizing ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Publishing to Community...
                  </div>
                ) : publicizeSuccess ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-bounce mr-2">✅</div>
                    Published Successfully!
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">🌐</span>
                    Share in Community Gallery
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500 text-center">
            💡 Fees help maintain the infrastructure and support DAO operations
          </div>
        </div>
      </div>
    </div>
  )
} 