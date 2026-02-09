#!/bin/bash
# VerifiedAgentRegistry Deployment Script
# Run this after Foundry is installed

set -e

echo "🦞 Deploying VerifiedAgentRegistry to Base Sepolia..."

# Configuration
export PRIVATE_KEY="YOUR_PRIVATE_KEY_HERE"  # Replace with actual private key
export RPC_URL="https://base-sepolia.g.alchemy.com/v2/ViKdKqcr6Qz6WWzjWYYq2"
export USDC_ADDRESS="0x036CbD53842c5426634e7929541eC2318f3dCF7e"

# Check prerequisites
echo "Checking prerequisites..."
command -v forge >/dev/null 2>&1 || { echo "❌ Foundry not installed. Run: foundryup"; exit 1; }

# Compile contracts
echo "📦 Compiling contracts..."
forge build

# Deploy
echo "🚀 Deploying contract..."
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify \
  -vvvv

# Extract contract address from output
CONTRACT_ADDRESS=$(grep "VerifiedAgentRegistry deployed to:" out.txt | awk '{print $4}')

echo ""
echo "✅ Deployment complete!"
echo "Contract Address: $CONTRACT_ADDRESS"
echo ""
echo "Next steps:"
echo "1. Update api/.env with: CONTRACT_ADDRESS=$CONTRACT_ADDRESS"
echo "2. Run: cd api && npm run dev"
echo "3. Test: curl http://localhost:3000/health"
