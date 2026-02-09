# VerifiedAgent API

Fast REST API for agent identity and reputation management.

## Tech Stack
- **Runtime**: Node.js + Fastify (faster than Express)
- **Database**: PostgreSQL + Redis (caching)
- **Blockchain**: viem + wagmi for contract interaction
- **Auth**: JWT + wallet signature verification

## Quick Start

```bash
cd api
npm install
npm run dev
```

## API Endpoints

### Public Endpoints (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/agents/:agentId` | Get agent profile |
| GET | `/agents` | List agents (paginated, filterable) |
| GET | `/agents/:agentId/reputation` | Get reputation history |
| GET | `/agents/:agentId/verifications` | Get verification history |

### Authenticated Endpoints (Requires Active Subscription)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/agents` | Register new agent |
| PUT | `/agents/:agentId` | Update agent profile |
| POST | `/agents/:agentId/renew` | Renew subscription |
| GET | `/agents/:agentId/analytics` | Get detailed analytics |
| POST | `/agents/:agentId/export` | Export reputation report |

### Admin/Oracle Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/verify` | Submit ChaosClaw verification |
| POST | `/reputation/update` | Update reputation score |
| POST | `/reputation/batch` | Batch reputation update |

## Authentication

Use wallet signature:

```bash
# Sign message with wallet
message = "Verify ownership: ${timestamp}"
signature = wallet.sign(message)

# Include in headers
Authorization: Bearer ${agentId}:${signature}:${timestamp}
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/verifiedagent
REDIS_URL=redis://localhost:6379

# Blockchain
RPC_URL=https://mainnet.base.org
CONTRACT_ADDRESS=0x...
USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# Secrets
JWT_SECRET=your-secret
CHAOSCLAW_API_KEY=...
REppo_API_KEY=...
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Fastify   │────▶│  PostgreSQL │
│             │     │    API      │     │  (Agents)   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │  Redis  │  │  Base   │  │ Reppo   │
        │ (Cache) │  │(Onchain)│  │(Analytics)
        └─────────┘  └─────────┘  └─────────┘
```
