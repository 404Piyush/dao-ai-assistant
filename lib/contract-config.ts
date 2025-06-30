// Contract configuration after deployment
export const CONTRACT_CONFIG = {
  // Your deployed contract address on Sepolia
  CHAT_HISTORY_ADDRESS: '0x1af521B98B1Dee594C7fC0ca157e4Ecb007AC5a2', // DAOAssistantV2 - Latest deployment!
  
  // Network configurations
  NETWORKS: {
    sepolia: {
      chainId: 11155111,
      name: 'Sepolia Testnet',
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
      blockExplorer: 'https://sepolia.etherscan.io'
    },
    mainnet: {
      chainId: 1,
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      blockExplorer: 'https://etherscan.io'
    },
    polygon: {
      chainId: 137,
      name: 'Polygon Mainnet',
      rpcUrl: 'https://polygon-rpc.com',
      blockExplorer: 'https://polygonscan.com'
    }
  },
  
  // Contract ABI (DAOAssistantV2 essential methods)
  ABI: [
    "function storeChatByUser(string messageType, string inputText, string aiResponse, string modelUsed, bool isPublic) external payable",
    "function calculateFee(address user) external view returns (uint256)",
    "function createProposal(string title, string content, uint256 votingDuration) external payable",
    "function vote(uint256 proposalId, bool support) external",
    "function upgradeToPremium() external payable",
    "function getUserChats(address user) external view returns (uint256[])",
    "function getChat(uint256 chatId) external view returns (address user, string chatType, string modelUsed, uint256 inputLength, uint256 outputLength, bool isPublic, uint256 fee, uint256 timestamp, string ipfsHash)",
    "function getPublicChats(uint256 offset, uint256 limit) external view returns (uint256[])",
    "function getAnalytics() external view returns (uint256 totalChats, uint256 totalFees, uint256 totalProposals, uint256 nextChatId, uint256 nextProposalId)",
    "function privateChatFee() external view returns (uint256)",
    "function publicChatFee() external view returns (uint256)",
    "function proposalSubmissionFee() external view returns (uint256)",
    "event ChatSaved(uint256 indexed chatId, address indexed user, string chatType, bool isPublic, uint256 fee)",
    "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title)",
    "event VoteCast(uint256 indexed proposalId, address indexed voter, bool support)"
  ]
}

// Helper function to get the correct contract address for current network
export function getContractAddress(chainId: number): string | null {
  const addresses: { [key: number]: string } = {
    11155111: CONTRACT_CONFIG.CHAT_HISTORY_ADDRESS, // Sepolia
    1: CONTRACT_CONFIG.CHAT_HISTORY_ADDRESS, // Mainnet (update when deploying to mainnet)
    137: CONTRACT_CONFIG.CHAT_HISTORY_ADDRESS, // Polygon (update when deploying to polygon)
  }
  
  return addresses[chainId] || null
} 