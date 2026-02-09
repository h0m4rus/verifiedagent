# VerifiedAgent

Onchain identity and reputation registry for AI agents on Base.

## Overview

ERC-8004 compatible registry enabling agents to establish verified identity, build portable reputation, and access premium features.

## Smart Contracts

### VerifiedAgentRegistry.sol

Core contract for agent registration and reputation management.

**Key Features**:
- ERC-8004 identity registration
- Tiered subscriptions (Basic/Pro/Team)
- USDC payment processing
- ChaosClaw verification integration
- Reputation oracle support

**Functions**:
```solidity
// Register new agent
function registerAgent(string metadataURI, uint256 tier) returns (bytes32 agentId)

// Verify agent (ChaosClaw)
function verifyAgent(bytes32 agentId, uint256 score, bool passed, string reportURI)

// Update reputation (oracles)
function updateReputation(bytes32 agentId, int256 delta)

// Check subscription
function isSubscriptionActive(bytes32 agentId) returns (bool)
```

## Project Structure

```
contracts/
├── src/
│   └── VerifiedAgentRegistry.sol    # Main registry contract
└── test/
    └── VerifiedAgentRegistry.t.sol  # Test suite

api/
├── src/
│   └── index.ts                     # Fastify server
├── prisma/
│   └── schema.prisma                # Database schema
└── README.md                        # API documentation

frontend/
└── README.md                        # Web app docs
```

## Development

### Contracts

```bash
cd contracts
# Install dependencies
forge install

# Compile
forge build

# Test
forge test

# Deploy (testnet)
forge script script/Deploy.s.sol --rpc-url base-sepolia --broadcast
```

### API

```bash
cd api
npm install
cp .env.example .env
# Configure DATABASE_URL, RPC_URL, etc.
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Tech Stack

- **Blockchain**: Base (Ethereum L2)
- **Contracts**: Solidity ^0.8.20, Foundry
- **API**: Node.js, Fastify, PostgreSQL, Prisma
- **Frontend**: Next.js 14, Tailwind CSS, wagmi
- **Token**: USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)

## License

MIT
