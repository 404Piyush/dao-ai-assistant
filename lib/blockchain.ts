import { ethers } from 'ethers'
import { CONTRACT_CONFIG, getContractAddress } from './contract-config'

export class BlockchainChatService {
  private provider: ethers.BrowserProvider | null = null
  private contract: ethers.Contract | null = null
  private signer: ethers.Signer | null = null

  async initialize() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not available')
    }

    this.provider = new ethers.BrowserProvider(window.ethereum)
    this.signer = await this.provider.getSigner()
    
    const network = await this.provider.getNetwork()
    const contractAddress = getContractAddress(Number(network.chainId))
    
    if (!contractAddress || contractAddress === '0x...') {
      throw new Error('Contract not deployed on this network')
    }

    this.contract = new ethers.Contract(
      contractAddress,
      CONTRACT_CONFIG.ABI,
      this.signer
    )
  }

  async storeChatOnChain(
    messageType: 'summarize' | 'draft',
    inputText: string,
    aiResponse: string,
    modelUsed: string,
    isPublic: boolean = false
  ) {
    if (!this.contract || !this.signer) {
      throw new Error('Contract not initialized')
    }

    const userAddress = await this.signer.getAddress()
    const fee = await this.contract.calculateFee(userAddress)

    // Store chat on blockchain
    const tx = await this.contract.storeChat(
      userAddress,
      messageType,
      inputText,
      aiResponse,
      modelUsed,
      isPublic,
      { value: fee }
    )

    // Wait for transaction confirmation
    const receipt = await tx.wait()
    
    // Extract chat ID from event logs
    const chatStoredEvent = receipt.logs.find((log: any) => 
      log.fragment?.name === 'ChatStored'
    )
    
    const chatId = chatStoredEvent ? chatStoredEvent.args[1] : null

    return {
      success: true,
      transactionHash: receipt.hash,
      chatId: chatId ? chatId.toString() : null,
      fee: ethers.formatEther(fee),
      blockNumber: receipt.blockNumber
    }
  }

  async getUserChatHistory(userAddress: string) {
    if (!this.contract) {
      throw new Error('Contract not initialized')
    }

    const chatIds = await this.contract.getUserChats(userAddress)
    const chats = []

    for (const chatId of chatIds) {
      const chat = await this.contract.getChat(chatId)
      chats.push({
        id: chatId.toString(),
        user: chat.user,
        type: chat.messageType,
        input: chat.inputText,
        output: chat.aiResponse,
        timestamp: new Date(Number(chat.timestamp) * 1000),
        modelUsed: chat.modelUsed,
        isPublic: chat.isPublic
      })
    }

    return chats
  }

  async getUserStats(userAddress: string) {
    if (!this.contract) {
      throw new Error('Contract not initialized')
    }

    const stats = await this.contract.userStats(userAddress)
    
    return {
      totalChats: Number(stats.totalChats),
      totalFeesPaid: ethers.formatEther(stats.totalFeesPaid),
      lastChatTimestamp: new Date(Number(stats.lastChatTimestamp) * 1000),
      isPremium: stats.isPremium
    }
  }

  async getCurrentFee(userAddress: string) {
    if (!this.contract) {
      throw new Error('Contract not initialized')
    }

    const fee = await this.contract.calculateFee(userAddress)
    return ethers.formatEther(fee)
  }

  getExplorerUrl(txHash: string) {
    // This would need to be dynamic based on current network
    return `https://sepolia.etherscan.io/tx/${txHash}`
  }
}

// Singleton instance
export const blockchainService = new BlockchainChatService() 