// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DAOAssistantV2 {
    address public owner;
    uint256 public totalChats;
    uint256 public totalFees;
    
    // Fee structure
    uint256 public privateChatFee = 0.001 ether;
    uint256 public publicChatFee = 0.005 ether;
    uint256 public proposalSubmissionFee = 0.01 ether;
    
    // Chat storage
    struct ChatRecord {
        address user;
        string chatType; // 'summarize', 'draft'
        string modelUsed;
        uint256 inputLength;
        uint256 outputLength;
        bool isPublic;
        uint256 fee;
        uint256 timestamp;
        string ipfsHash; // For storing large content off-chain
    }
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string content;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    // Mappings
    mapping(uint256 => ChatRecord) public chats;
    mapping(address => uint256[]) public userChats;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => bool) public premiumUsers;
    
    uint256 public nextChatId = 1;
    uint256 public nextProposalId = 1;
    
    // Events
    event ChatSaved(uint256 indexed chatId, address indexed user, string chatType, bool isPublic, uint256 fee);
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event FeesWithdrawn(address indexed owner, uint256 amount);
    event PremiumUpgrade(address indexed user, uint256 fee);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier validFee(uint256 requiredFee) {
        require(msg.value >= requiredFee, "Insufficient fee");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Save chat with fee
    function saveChatPrivate(
        string memory chatType,
        string memory modelUsed,
        uint256 inputLength,
        uint256 outputLength,
        string memory ipfsHash
    ) external payable validFee(privateChatFee) {
        uint256 chatId = nextChatId++;
        
        chats[chatId] = ChatRecord({
            user: msg.sender,
            chatType: chatType,
            modelUsed: modelUsed,
            inputLength: inputLength,
            outputLength: outputLength,
            isPublic: false,
            fee: msg.value,
            timestamp: block.timestamp,
            ipfsHash: ipfsHash
        });
        
        userChats[msg.sender].push(chatId);
        totalChats++;
        totalFees += msg.value;
        
        emit ChatSaved(chatId, msg.sender, chatType, false, msg.value);
    }
    
    // Publicize chat with higher fee
    function saveChatPublic(
        string memory chatType,
        string memory modelUsed,
        uint256 inputLength,
        uint256 outputLength,
        string memory ipfsHash
    ) external payable validFee(publicChatFee) {
        uint256 chatId = nextChatId++;
        
        chats[chatId] = ChatRecord({
            user: msg.sender,
            chatType: chatType,
            modelUsed: modelUsed,
            inputLength: inputLength,
            outputLength: outputLength,
            isPublic: true,
            fee: msg.value,
            timestamp: block.timestamp,
            ipfsHash: ipfsHash
        });
        
        userChats[msg.sender].push(chatId);
        totalChats++;
        totalFees += msg.value;
        
        emit ChatSaved(chatId, msg.sender, chatType, true, msg.value);
    }
    
    // Create proposal
    function createProposal(
        string memory title,
        string memory content,
        uint256 votingDuration
    ) external payable validFee(proposalSubmissionFee) {
        uint256 proposalId = nextProposalId++;
        
        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.proposer = msg.sender;
        newProposal.title = title;
        newProposal.content = content;
        newProposal.deadline = block.timestamp + votingDuration;
        newProposal.executed = false;
        
        totalFees += msg.value;
        
        emit ProposalCreated(proposalId, msg.sender, title);
    }
    
    // Vote on proposal
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp <= proposal.deadline, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
        
        emit VoteCast(proposalId, msg.sender, support);
    }
    
    // Premium membership
    function upgradeToPremium() external payable validFee(0.05 ether) {
        premiumUsers[msg.sender] = true;
        totalFees += msg.value;
        
        emit PremiumUpgrade(msg.sender, msg.value);
    }
    
    // Get user's chat history
    function getUserChats(address user) external view returns (uint256[] memory) {
        return userChats[user];
    }
    
    // Get public chats (for gallery)
    function getPublicChats(uint256 offset, uint256 limit) external view returns (uint256[] memory) {
        uint256[] memory publicChatIds = new uint256[](limit);
        uint256 count = 0;
        uint256 currentId = nextChatId - 1;
        
        while (currentId > 0 && count < limit) {
            if (chats[currentId].isPublic) {
                if (offset == 0) {
                    publicChatIds[count] = currentId;
                    count++;
                } else {
                    offset--;
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
    
    // Get chat details
    function getChat(uint256 chatId) external view returns (
        address user,
        string memory chatType,
        string memory modelUsed,
        uint256 inputLength,
        uint256 outputLength,
        bool isPublic,
        uint256 fee,
        uint256 timestamp,
        string memory ipfsHash
    ) {
        ChatRecord memory chat = chats[chatId];
        require(chat.user != address(0), "Chat does not exist");
        require(chat.isPublic || chat.user == msg.sender, "Access denied");
        
        return (
            chat.user,
            chat.chatType,
            chat.modelUsed,
            chat.inputLength,
            chat.outputLength,
            chat.isPublic,
            chat.fee,
            chat.timestamp,
            chat.ipfsHash
        );
    }
    
    // Analytics
    function getAnalytics() external view returns (
        uint256 _totalChats,
        uint256 _totalFees,
        uint256 _totalProposals,
        uint256 _nextChatId,
        uint256 _nextProposalId
    ) {
        return (totalChats, totalFees, nextProposalId - 1, nextChatId, nextProposalId);
    }
    
    // Fee management
    function updateFees(
        uint256 _privateChatFee,
        uint256 _publicChatFee,
        uint256 _proposalFee
    ) external onlyOwner {
        privateChatFee = _privateChatFee;
        publicChatFee = _publicChatFee;
        proposalSubmissionFee = _proposalFee;
    }
    
    // Withdraw collected fees
    function withdrawFees() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "No fees to withdraw");
        
        payable(owner).transfer(amount);
        emit FeesWithdrawn(owner, amount);
    }
    
    // Emergency functions
    function pause() external onlyOwner {
        // Could implement pausable functionality
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
    
    // Receive function to accept direct ETH transfers
    receive() external payable {
        totalFees += msg.value;
    }
} 