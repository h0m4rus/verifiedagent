# VerifiedAgent — Managed Infrastructure Setup
*Zero-ops deployment guide using managed services*

## Philosophy

**You manage**: Business logic, contracts, code  
**Services manage**: Servers, databases, scaling, security

Estimated monthly cost at launch: **$50-100**  
Estimated monthly cost at scale (1000 agents): **$300-500**

---

## Service Stack

| Layer | Service | Cost | Why |
|-------|---------|------|-----|
| **Blockchain RPC** | Alchemy | Free tier → $49/mo | Reliable, fast |
| **Database** | Supabase | Free tier → $25/mo | Managed Postgres |
| **Cache** | Upstash | Free tier → $20/mo | Managed Redis |
| **API Hosting** | Railway | $5/mo per service | Zero-config deploy |
| **Frontend** | Vercel | Free tier → $20/mo | Optimized for Next.js |
| **Contracts** | ThirdWeb | Free | Deploy + monitor |
| **Storage** | IPFS (Pinata) | Free tier → $20/mo | Decentralized files |

---

## Step-by-Step Setup

### 1. Alchemy — Blockchain RPC

**Purpose**: Connect to Base (L2) without running your own node

**Setup**:
1. Go to https://dashboard.alchemy.com
2. Sign up (free)
3. Create new app:
   - Name: `verifiedagent`
   - Chain: `Base`
   - Network: `Base Sepolia` (testnet)
4. Copy the HTTPS API key
5. Save in `.env`:
   ```
   RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   ```

**Cost**: Free tier = 300M compute units/month (plenty for development)

---

### 2. Supabase — Database

**Purpose**: Managed PostgreSQL with auto-backups, auth, and API

**Setup**:
1. Go to https://supabase.com
2. Sign up (free tier)
3. Create new project:
   - Name: `verifiedagent`
   - Password: Generate strong password (save in 1Password)
   - Region: `US East` (closest to your users)
4. Wait ~2 minutes for provisioning
5. Get connection string:
   - Go to Settings → Database
   - Copy connection string (PostgreSQL 15)
   - Save in `.env`:
     ```
     DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```

**Features you get free**:
- 500MB database (enough for ~10K agents)
- 2GB bandwidth
- Automatic backups
- Row-level security
- REST API auto-generated

**Cost**: Free tier sufficient for months

---

### 3. Upstash — Redis Cache

**Purpose**: Managed Redis for caching and session storage

**Setup**:
1. Go to https://console.upstash.com
2. Sign up (free, no credit card)
3. Create new database:
   - Name: `verifiedagent`
   - Region: `US East`
   - Eviction: `AllKeysLRU` (auto-remove old data)
4. Copy the Redis URL:
   ```
   REDIS_URL=rediss://default:[PASSWORD]@[HOST]:6379
   ```

**Features**:
- 10,000 commands/day free
- TLS encryption
- Automatic failover
- Global replication (if needed later)

**Cost**: Free tier = 10K commands/day

---

### 4. Railway — API Hosting

**Purpose**: Deploy Node.js API with zero configuration

**Setup**:
1. Go to https://railway.app
2. Sign up with GitHub (connects to h0m4rus repos)
3. New Project → Deploy from GitHub repo
4. Select `h0m4rus/verifiedagent`
5. Railway auto-detects:
   - Node.js app in `/api`
   - Package.json requirements
   - Environment variables needed
6. Add environment variables in Railway dashboard:
   - `DATABASE_URL` (from Supabase)
   - `REDIS_URL` (from Upstash)
   - `RPC_URL` (from Alchemy)
   - `JWT_SECRET` (generate random string)
7. Deploy

**Features**:
- Auto-deploys on every git push
- Automatic HTTPS
- Custom domains (free)
- Scaling: $5/mo per 512MB RAM instance
- Logs, metrics, rollbacks built-in

**Cost**: $5/mo minimum (scales with usage)

---

### 5. Vercel — Frontend Hosting

**Purpose**: Deploy Next.js frontend optimized for performance

**Setup**:
1. Go to https://vercel.com
2. Sign up with GitHub
3. New Project → Import GitHub repo
4. Select `h0m4rus/verifiedagent`
5. Configure:
   - Framework: `Next.js`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Environment Variables:
     - `NEXT_PUBLIC_API_URL` (Railway URL from step 4)
     - `NEXT_PUBLIC_RPC_URL` (Alchemy URL)
6. Deploy

**Features**:
- Global CDN (fast worldwide)
- Preview deployments (per PR)
- Analytics included
- Edge functions
- Automatic HTTPS + custom domains

**Cost**: Free tier = 100GB bandwidth, 10K requests/day

---

### 6. ThirdWeb — Contract Deployment

**Purpose**: Deploy and manage smart contracts without writing deployment scripts

**Setup**:
1. Go to https://thirdweb.com
2. Connect wallet (MetaMask with Base Sepolia ETH)
3. Click "Deploy Contract"
4. Select "Custom Contract"
5. Upload `VerifiedAgentRegistry.sol`
6. Configure:
   - Network: Base Sepolia
   - Constructor args: USDC address
   - Deploy
7. ThirdWeb generates:
   - Contract address
   - SDK integration code
   - Dashboard for monitoring

**Features**:
- One-click deploy
- Contract dashboard (view transactions, events)
- Gasless transactions (optional)
- Built-in analytics

**Cost**: Free for contract deployment + monitoring

---

### 7. Pinata — IPFS Storage

**Purpose**: Store agent metadata and deliverables on IPFS

**Setup**:
1. Go to https://pinata.cloud
2. Sign up (free tier)
3. Get API keys:
   - JWT key for uploads
   - Gateway URL for reads
4. Save in `.env`:
   ```
   PINATA_JWT=your-jwt-token
   PINATA_GATEWAY=https://gateway.pinata.cloud
   ```

**Features**:
- 1GB storage free
- 100 uploads/month free
- Dedicated gateway (faster access)

**Cost**: Free tier sufficient for launch

---

## Complete Environment Configuration

Create `.env` file in `/api`:

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Cache (Upstash)
REDIS_URL=rediss://default:[PASSWORD]@[HOST]:6379

# Blockchain (Alchemy)
RPC_URL=https://base-sepolia.g.alchemy.com/v2/[API-KEY]

# Contracts (ThirdWeb deployed)
CONTRACT_ADDRESS=0x...
USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# Storage (Pinata)
PINATA_JWT=your-jwt
PINATA_GATEWAY=https://gateway.pinata.cloud

# Security
JWT_SECRET=generate-random-64-char-string
CHAOSCLAW_API_KEY=will-generate-later

# Optional: Production overrides
# PORT=3000
# NODE_ENV=production
```

---

## Deployment Workflow

### Local Development
```bash
cd /home/adam/clawd/projects/verifiedagent/api
npm install
cp .env.example .env
# Fill in .env with values from services
npm run dev
# Local: http://localhost:3000
```

### Deploy to Production
```bash
# 1. Push to GitHub
git add .
git commit -m "Feature: new functionality"
git push origin main

# 2. Railway auto-deploys (takes 2-3 minutes)
# 3. Vercel auto-deploys frontend (takes 1-2 minutes)
# 4. Test production URL
```

**That's it.** No server management, no database administration, no DevOps.

---

## Monitoring & Alerts

### Railway Dashboard
- Live logs (streaming)
- Metrics (CPU, memory, requests)
- Automatic alerts if service crashes

### Vercel Dashboard
- Analytics (traffic, performance)
- Error tracking
- Preview deployments

### Alchemy Dashboard
- Request volume
- Method breakdown
- Webhook status

### Supabase Dashboard
- Database performance
- Connection health
- Storage usage

---

## Scaling Path

### Phase 1: Launch (0-100 agents)
- All free tiers sufficient
- Cost: ~$5/mo (Railway only)

### Phase 2: Growth (100-1000 agents)
- Supabase: Upgrade to $25/mo (8GB database)
- Railway: Scale to $20/mo (2GB RAM)
- Vercel: Pro plan $20/mo (1TB bandwidth)
- **Total**: ~$65/mo

### Phase 3: Scale (1000+ agents)
- Supabase: $25/mo → dedicated instance
- Railway: Multiple instances ($50/mo)
- Redis: Upstash paid ($20/mo)
- **Total**: ~$100-150/mo

---

## Disaster Recovery

### Database (Supabase)
- Automatic daily backups (free tier)
- Point-in-time recovery (Pro plan)
- Export anytime: `pg_dump` or dashboard

### Code
- GitHub repository (already done)
- Railway/Vercel maintain deployment history
- Rollback to previous deploy: one click

### Contracts
- Immutable onchain (no backup needed)
- ThirdWeb maintains deployment records

---

## Security Checklist

- ✅ Database: TLS encrypted (Supabase)
- ✅ Redis: TLS encrypted (Upstash)
- ✅ API: HTTPS only (Railway/Vercel)
- ✅ Contracts: Audited (TBD)
- ✅ Secrets: Environment variables only (never in code)
- ✅ Admin access: Multi-sig or hardware wallet

---

## Cost Summary

| Phase | Agents | Monthly Cost | Revenue Target |
|-------|--------|--------------|----------------|
| Launch | 0-100 | $5 | $500 |
| Growth | 100-1000 | $65 | $10,000 |
| Scale | 1000+ | $150 | $60,000 |

**Profit margin**: 90%+ (infrastructure is cheap at scale)

---

## Next Steps

1. **Create accounts** (30 min):
   - Alchemy
   - Supabase
   - Upstash
   - Railway
   - Vercel
   - ThirdWeb
   - Pinata

2. **Get testnet ETH** (5 min):
   - basefaucet.com (Sepolia)
   - Or I can bridge from your existing wallet

3. **Deploy contracts** (15 min):
   - Use ThirdWeb or Foundry
   - I'll write the deployment script

4. **Connect services** (15 min):
   - Copy connection strings to `.env`
   - Deploy API to Railway
   - Deploy frontend to Vercel

5. **Test** (ongoing):
   - Register first agent
   - Verify it works end-to-end

**Total setup time**: ~2 hours  
**Ongoing maintenance**: Near zero (services auto-manage)

---

Want me to walk through any of these steps in detail, or should I generate the deployment scripts now?
