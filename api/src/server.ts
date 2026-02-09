import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { 
  getAgentFromDB, 
  getAgentFromChain, 
  listAgents, 
  updateReputation,
  recordVerification 
} from './db.js';

dotenv.config();

const app = Fastify({ logger: true });

// Register plugins
await app.register(cors, { origin: true, credentials: true });
await app.register(jwt, { secret: process.env.JWT_SECRET || 'dev-secret' });
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

// Health check
app.get('/health', async () => ({ 
  status: 'ok', 
  timestamp: new Date().toISOString(),
  contract: process.env.CONTRACT_ADDRESS 
}));

// PUBLIC ENDPOINTS

// Get agent profile
app.get('/agents/:agentId', async (request, reply) => {
  const { agentId } = request.params as { agentId: string };
  
  // Try database first
  const agent = await getAgentFromDB(agentId);
  
  if (!agent) {
    // Try blockchain
    const chainAgent = await getAgentFromChain(agentId);
    
    if (!chainAgent) {
      reply.code(404);
      return { error: 'Agent not found' };
    }
    
    return { agent: chainAgent, source: 'blockchain' };
  }
  
  return { agent, source: 'database' };
});

// List agents with filters
app.get('/agents', async (request) => {
  const { skill, minReputation, status, page, limit } = request.query as any;
  return await listAgents({ skill, minReputation, status, page, limit });
});

// Get reputation history
app.get('/agents/:agentId/reputation', async (request, reply) => {
  const { agentId } = request.params as { agentId: string };
  
  const history = await prisma.reputationHistory.findMany({
    where: { agentId },
    orderBy: { timestamp: 'desc' },
    take: 100,
  });
  
  return { history };
});

// Get verification history
app.get('/agents/:agentId/verifications', async (request, reply) => {
  const { agentId } = request.params as { agentId: string };
  
  const verifications = await prisma.verification.findMany({
    where: { agentId },
    orderBy: { timestamp: 'desc' },
    take: 10,
  });
  
  return { verifications };
});

// AUTHENTICATED ENDPOINTS (require JWT)

// Register new agent (simulated - actual registration is on-chain)
app.post('/agents', {
  onRequest: [async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  }],
}, async (request, reply) => {
  const { agentId, metadata, tier } = request.body as any;
  
  // In production, this would call the smart contract
  // For now, just record in database
  
  reply.code(201);
  return { 
    message: 'Agent registration submitted',
    agentId,
    status: 'pending',
    note: 'On-chain registration required'
  };
});

// Update reputation (oracle only)
app.post('/reputation/update', {
  onRequest: [async (request, reply) => {
    try {
      await request.jwtVerify();
      // Check if user is authorized oracle
      // if (!request.user.isOracle) { reply.code(403); return { error: 'Not authorized' }; }
    } catch (err) {
      reply.send(err);
    }
  }],
}, async (request, reply) => {
  const { agentId, delta } = request.body as { agentId: string; delta: number };
  
  const newScore = await updateReputation(agentId, delta);
  
  return { 
    agentId, 
    newScore,
    delta,
    timestamp: new Date().toISOString()
  };
});

// Record verification (ChaosClaw)
app.post('/verify', {
  onRequest: [async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  }],
}, async (request, reply) => {
  const { agentId, score, passed, reportURI, checks } = request.body as any;
  
  await recordVerification(agentId, { score, passed, reportURI, checks });
  
  return { 
    agentId, 
    verified: passed,
    score,
    timestamp: new Date().toISOString()
  };
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000');
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`Server running on port ${port}`);
    app.log.info(`Contract: ${process.env.CONTRACT_ADDRESS}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await app.close();
});
