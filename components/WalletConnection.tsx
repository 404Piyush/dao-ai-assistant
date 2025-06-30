'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// Extend window interface for ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

interface WalletState {
  account: string | null
  isConnected: boolean
  chainId: number | null
  isLoading: boolean
}

interface WalletConnectionProps {
  onConnect?: (address: string | null) => void
  compact?: boolean
}

export default function WalletConnection({ onConnect, compact = false }: WalletConnectionProps = {}) {
  const [wallet, setWallet] = useState<WalletState>({
    account: null,
    isConnected: false,
    chainId: null,
    isLoading: false
  })

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork()
          const address = accounts[0].address
          setWallet({
            account: address,
            isConnected: true,
            chainId: Number(network.chainId),
            isLoading: false
          })
          onConnect?.(address)
        }
      } catch (error) {
        console.log('No wallet connected')
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet')
      return
    }

    setWallet(prev => ({ ...prev, isLoading: true }))

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      
      // Request account access
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      setWallet({
        account: address,
        isConnected: true,
        chainId: Number(network.chainId),
        isLoading: false
      })

      onConnect?.(address)

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setWallet(prev => ({ ...prev, account: accounts[0] }))
        }
      })

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        setWallet(prev => ({ ...prev, chainId: parseInt(chainId, 16) }))
      })

    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setWallet(prev => ({ ...prev, isLoading: false }))
    }
  }

  const disconnectWallet = () => {
    setWallet({
      account: null,
      isConnected: false,
      chainId: null,
      isLoading: false
    })
    onConnect?.(null)
  }

  const getChainName = (chainId: number) => {
    const chains: { [key: number]: string } = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      80001: 'Polygon Mumbai'
    }
    return chains[chainId] || `Chain ID: ${chainId}`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {!wallet.isConnected ? (
          <button
            onClick={connectWallet}
            disabled={wallet.isLoading}
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
              wallet.isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {wallet.isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </div>
            ) : (
              '🔗 Connect Wallet'
            )}
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-green-50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-700 text-sm font-medium">
                {formatAddress(wallet.account!)}
              </span>
            </div>
            <button
              onClick={disconnectWallet}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              title="Disconnect"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="card max-w-md w-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-4">Wallet Connection</h2>
          
          {!wallet.isConnected ? (
            <div>
              <p className="text-gray-600 mb-4">
                Connect your Web3 wallet to participate in DAO governance
              </p>
              <button
                onClick={connectWallet}
                disabled={wallet.isLoading}
                className={`btn-primary w-full ${wallet.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {wallet.isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </div>
                ) : (
                  'Connect Wallet'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-mono text-sm">{formatAddress(wallet.account!)}</p>
              </div>
              
              {wallet.chainId && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Network</p>
                  <p className="text-sm">{getChainName(wallet.chainId)}</p>
                </div>
              )}
              
              <button
                onClick={disconnectWallet}
                className="btn-secondary w-full"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 