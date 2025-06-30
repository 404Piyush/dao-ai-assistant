const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying DAOChatHistory contract...\n');

  // Get the contract factory
  const DAOChatHistory = await ethers.getContractFactory('DAOChatHistory');

  // Deploy the contract
  console.log('📦 Deploying contract...');
  const daoChat = await DAOChatHistory.deploy();
  
  // Wait for deployment to be mined
  await daoChat.waitForDeployment();
  
  const contractAddress = await daoChat.getAddress();
  
  console.log('✅ DAOChatHistory deployed to:', contractAddress);
  console.log('🔗 Etherscan URL:', `https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Get initial contract info
  const chatFee = await daoChat.chatFee();
  const premiumDiscount = await daoChat.premiumDiscount();
  
  console.log('\n📊 Contract Configuration:');
  console.log('💰 Chat Fee:', ethers.formatEther(chatFee), 'ETH');
  console.log('⭐ Premium Discount:', premiumDiscount.toString(), '%');
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: 'sepolia',
    chatFee: ethers.formatEther(chatFee),
    premiumDiscount: premiumDiscount.toString(),
    deployedAt: new Date().toISOString(),
    deployer: (await ethers.getSigners())[0].address
  };
  
  console.log('\n💾 Save this contract address for frontend integration:');
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }); 