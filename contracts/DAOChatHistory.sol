// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title DAOChatHistory
 * @dev Smart contract for storing DAO AI Assistant chat history with minimal fees
 */
contract DAOChatHistory is Ownable, ReentrancyGuard, Pausable {
    
    // Events
    event ChatStored(address indexed user, uint256 indexed chatId, uint256 timestamp);
    event FeeUpdated(uint256 newFee);
    event FundsWithdrawn(address to, uint256 amount);
    
    // Structs
    struct ChatMessage {
        address user;
        string messageType; // "summarize" or "draft"
        string inputText;
        string aiResponse;
        uint256 timestamp;
        string modelUsed;
        bool isPublic; // Users can choose to make chats public for community
    }
    
    struct UserStats {
        uint256 totalChats;
        uint256 totalFeesPaid;
        uint256 lastChatTimestamp;
        bool isPremium; // Premium users get discounts
    }
    
    // State variables
    uint256 public chatFee = 0.001 ether; // Minimal fee - $2-3 at current ETH prices
    uint256 public premiumDiscount = 50; // 50% discount for premium users
    uint256 public nextChatId = 1;
    
    mapping(uint256 => ChatMessage) public chats;
    mapping(address => uint256[]) public userChatIds;
    mapping(address => UserStats) public userStats;
    mapping(address => bool) public authorizedCallers; // Backend can call on behalf of users
    
    // Modifiers
    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        authorizedCallers[msg.sender] = true;
    }
    
    /**
     * @dev Store a chat interaction on-chain (for authorized callers like backend)
     */
    function storeChat(
        address user,
        string memory messageType,
        string memory inputText,
        string memory aiResponse,
        string memory modelUsed,
        bool isPublic
    ) external payable onlyAuthorized nonReentrant whenNotPaused {
        
        uint256 requiredFee = calculateFee(user);
        require(msg.value >= requiredFee, "Insufficient fee");
        
        // Store chat
        chats[nextChatId] = ChatMessage({
            user: user,
            messageType: messageType,
            inputText: inputText,
            aiResponse: aiResponse,
            timestamp: block.timestamp,
            modelUsed: modelUsed,
            isPublic: isPublic
        });
        
        // Update user data
        userChatIds[user].push(nextChatId);
        userStats[user].totalChats++;
        userStats[user].totalFeesPaid += requiredFee;
        userStats[user].lastChatTimestamp = block.timestamp;
        
        emit ChatStored(user, nextChatId, block.timestamp);
        
        // Refund excess payment
        if (msg.value > requiredFee) {
            payable(user).transfer(msg.value - requiredFee);
        }
        
        nextChatId++;
    }
    
    /**
     * @dev Store a chat interaction directly by user
     */
    function storeChatByUser(
        string memory messageType,
        string memory inputText,
        string memory aiResponse,
        string memory modelUsed,
        bool isPublic
    ) external payable nonReentrant whenNotPaused {
        
        uint256 requiredFee = calculateFee(msg.sender);
        require(msg.value >= requiredFee, "Insufficient fee");
        
        // Store chat
        chats[nextChatId] = ChatMessage({
            user: msg.sender,
            messageType: messageType,
            inputText: inputText,
            aiResponse: aiResponse,
            timestamp: block.timestamp,
            modelUsed: modelUsed,
            isPublic: isPublic
        });
        
        // Update user data
        userChatIds[msg.sender].push(nextChatId);
        userStats[msg.sender].totalChats++;
        userStats[msg.sender].totalFeesPaid += requiredFee;
        userStats[msg.sender].lastChatTimestamp = block.timestamp;
        
        emit ChatStored(msg.sender, nextChatId, block.timestamp);
        
        // Refund excess payment
        if (msg.value > requiredFee) {
            payable(msg.sender).transfer(msg.value - requiredFee);
        }
        
        nextChatId++;
    }
    
    /**
     * @dev Calculate fee for a user (with premium discount)
     */
    function calculateFee(address user) public view returns (uint256) {
        if (userStats[user].isPremium) {
            return (chatFee * (100 - premiumDiscount)) / 100;
        }
        return chatFee;
    }
    
    /**
     * @dev Get user's chat history
     */
    function getUserChats(address user) external view returns (uint256[] memory) {
        return userChatIds[user];
    }
    
    /**
     * @dev Get chat details by ID
     */
    function getChat(uint256 chatId) external view returns (ChatMessage memory) {
        return chats[chatId];
    }
    
    /**
     * @dev Get public chats for community browsing
     */
    function getPublicChats(uint256 limit, uint256 offset) external view returns (uint256[] memory) {
        uint256[] memory publicChatIds = new uint256[](limit);
        uint256 count = 0;
        uint256 currentId = nextChatId - 1;
        uint256 skipped = 0;
        
        while (count < limit && currentId > 0) {
            if (chats[currentId].isPublic) {
                if (skipped >= offset) {
                    publicChatIds[count] = currentId;
                    count++;
                } else {
                    skipped++;
                }
            }
            currentId--;
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = publicChatIds[i];
        }
        
        return result;
    }
    
    /**
     * @dev Set premium status for a user
     */
    function setPremiumStatus(address user, bool status) external onlyOwner {
        userStats[user].isPremium = status;
    }
    
    /**
     * @dev Update chat fee
     */
    function updateChatFee(uint256 newFee) external onlyOwner {
        chatFee = newFee;
        emit FeeUpdated(newFee);
    }
    
    /**
     * @dev Add/remove authorized caller (for backend integration)
     */
    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
    }
    
    /**
     * @dev Withdraw accumulated fees
     */
    function withdrawFees(address payable to) external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        to.transfer(balance);
        emit FundsWithdrawn(to, balance);
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get contract stats
     */
    function getContractStats() external view returns (
        uint256 totalChats,
        uint256 totalUsers,
        uint256 contractBalance,
        uint256 currentFee
    ) {
        return (
            nextChatId - 1,
            0, // Would need to track this separately for gas efficiency
            address(this).balance,
            chatFee
        );
    }
} 