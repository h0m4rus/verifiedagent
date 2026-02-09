const { ethers } = require('ethers');
const fs = require('fs');

// Configuration
const RPC_URL = 'https://base-sepolia.g.alchemy.com/v2/ViKdKqcr6Qz6WWzjWYYq2';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// VerifiedAgentRegistry contract bytecode and ABI (simplified for deployment)
// This is the actual compiled bytecode from the contract
const CONTRACT_BYTECODE = '0x' + fs.readFileSync('./out/VerifiedAgentRegistry.sol/VerifiedAgentRegistry.bin', 'utf8');
const CONTRACT_ABI = JSON.parse(fs.readFileSync('./out/VerifiedAgentRegistry.sol/VerifiedAgentRegistry.abi', 'utf8'));

async function deploy() {
  if (!PRIVATE_KEY) {
    console.error('❌ Set PRIVATE_KEY environment variable');
    process.exit(1);
  }

  console.log('🦞 Deploying VerifiedAgentRegistry to Base Sepolia...');
  
  // Connect to network
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`Deployer: ${wallet.address}`);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance < ethers.parseEther('0.001')) {
    console.error('❌ Insufficient balance. Need at least 0.001 ETH');
    process.exit(1);
  }

  // Deploy
  console.log('Deploying contract...');
  const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, wallet);
  
  const contract = await factory.deploy(USDC_ADDRESS);
  
  console.log(`Transaction hash: ${contract.deploymentTransaction().hash}`);
  
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  
  console.log('');
  console.log('✅ DEPLOYMENT SUCCESSFUL!');
  console.log('═══════════════════════════════════════');
  console.log(`Contract Address: ${address}`);
  console.log(`Network: Base Sepolia`);
  console.log(`USDC Token: ${USDC_ADDRESS}`);
  console.log(`Deployer: ${wallet.address}`);
  console.log(`Transaction: ${contract.deploymentTransaction().hash}`);
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('Next steps:');
  console.log(`1. Update api/.env with: CONTRACT_ADDRESS=${address}`);
  console.log('2. Verify on Basescan: https://sepolia.basescan.org/address/' + address);
  console.log('3. Run: cd api && npm run dev');
  
  // Save deployment info
  const deploymentInfo = {
    network: 'base-sepolia',
    contractAddress: address,
    deployer: wallet.address,
    usdcAddress: USDC_ADDRESS,
    timestamp: new Date().toISOString(),
    transactionHash: contract.deploymentTransaction().hash
  };
  
  fs.writeFileSync('./deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('');
  console.log('✅ Deployment info saved to: contracts/deployment.json');
}

deploy().catch(err => {
  console.error('❌ Deployment failed:', err.message);
  process.exit(1);
});
