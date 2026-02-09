# Deployment Guide

## Wallet Setup

**Deployer Address**: `0x4a4e20fef9f2446172dd177cfd468076e9622c4f`

This address will:
- Deploy the VerifiedAgentRegistry contract
- Collect subscription fees
- Manage the contract

## Get Base Sepolia ETH

### Option 1: Base Faucet (Recommended)
1. Go to https://basefaucet.com
2. Enter: `0x4a4e20fef9f2446172dd177cfd468076e9622c4f`
3. Complete captcha
4. Receive 0.1 Sepolia ETH (enough for testing)

### Option 2: Alchemy Faucet
1. Go to https://sepoliafaucet.com
2. Login with Alchemy account
3. Request 0.5 Sepolia ETH
4. Bridge to Base Sepolia via https://bridge.base.org (Sepolia → Base Sepolia)

### Option 3: Quicknode Faucet
1. Go to https://faucet.quicknode.com/base-sepolia
2. Enter address
3. Request 0.05 ETH

## Deploy Contracts

### 1. Export Private Key
```bash
# In your terminal (with your private key)
export PRIVATE_KEY=0x...
```

### 2. Run Deployment
```bash
cd contracts
forge script script/Deploy.s.sol \
  --rpc-url https://base-sepolia.g.alchemy.com/v2/ViKdKqcr6Qz6WWzjWYYq2 \
  --broadcast \
  --verify
```

### 3. Save Contract Address
After deployment, save the output:
```
VerifiedAgentRegistry deployed to: 0x...
```

## Post-Deployment Setup

### 1. Update Environment
```bash
# In api/.env
CONTRACT_ADDRESS=0x... # From deployment output
```

### 2. Verify Contract
The `--verify` flag should auto-verify on Basescan. If not:
1. Go to https://sepolia.basescan.org
2. Search for your contract address
3. Click "Verify and Publish"
4. Upload `VerifiedAgentRegistry.sol`

### 3. Fund Contract (Optional)
For testing, you may want to fund the contract with test USDC:
1. Get test USDC from https://faucet.circle.com (Base Sepolia)
2. Transfer to contract address
3. Or keep in deployer wallet for subscription refunds

## Testing

### Register a Test Agent
```bash
# Use cast to interact with contract
cast send 0x<CONTRACT_ADDRESS> \
  "registerAgent(string,uint256)" \
  "ipfs://test-metadata" \
  1 \
  --rpc-url https://base-sepolia.g.alchemy.com/v2/ViKdKqcr6Qz6WWzjWYYq2 \
  --private-key $PRIVATE_KEY
```

### Check Deployment
```bash
# Get contract info
cast call 0x<CONTRACT_ADDRESS> "getAgentCount()" \
  --rpc-url https://base-sepolia.g.alchemy.com/v2/ViKdKqcr6Qz6WWzjWYYq2
```

## Contract Details

| Property | Value |
|----------|-------|
| **Network** | Base Sepolia |
| **Contract** | VerifiedAgentRegistry |
| **Language** | Solidity 0.8.20 |
| **Token** | USDC (0x036CbD53842c5426634e7929541eC2318f3dCF7e) |
| **Deployer** | 0x4a4e20fef9f2446172dd177cfd468076e9622c4f |
| **License** | MIT |

## Next Steps

1. ✅ Get Base Sepolia ETH
2. ⏳ Deploy contract
3. ⏳ Update API .env
4. ⏳ Start API server
5. ⏳ Test registration flow

---

**Need Help?**
- Gas issues: Increase gas limit
- Verification issues: Use Basescan UI
- RPC issues: Check Alchemy dashboard
