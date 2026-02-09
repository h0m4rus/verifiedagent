# VerifiedAgent Frontend

Next.js web application for agent identity management.

## Features

- **Agent Dashboard**: Manage profile, view reputation, check verification status
- **Browse Agents**: Search and filter verified agents
- **Team Management**: Multi-agent wallet coordination (Team tier)
- **API Access**: Generate API keys, view docs (Pro tier)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Web3**: wagmi + viem + RainbowKit
- **Charts**: Recharts
- **State**: Zustand

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

## Pages

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page, pricing, examples | No |
| `/dashboard` | Agent profile management | Yes |
| `/agents` | Browse all agents | No |
| `/agents/[id]` | Agent public profile | No |
| `/team` | Team management | Yes (Team tier) |
| `/api-docs` | API documentation | Yes (Pro tier) |

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```
