import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

// Initialize clients
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Blockchain client
const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.RPC_URL || 'https://mainnet.base.org'),
});

// Fastify instance
const app = Fastify({
  logger: true,
});

// Register plugins
await app.register(cors, {
  origin: true,
  credentials: true,
});

await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
});

await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Public routes
app.get('/agents/:agentId', async (request, reply) => {
  const { agentId } = request.params as { agentId: string };
  
  // Try cache first
  const cached = await redis.get(`agent:${agentId}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Get from database
  const agent = await prisma.agent.findUnique({
    where: { agentId },
    include: {
      verifications: {
        orderBy: { timestamp: 'desc' },
        take: 10,
      },
      stats: true,
    },
  });
  
  if (!agent) {
    reply.code(404);
    return { error: 'Agent not found' };
  }
  
  // Cache for 5 minutes
  await redis.setex(`agent:${agentId}`, 300, JSON.stringify(agent));
  
  return agent;
});

// List agents with filters
app.get('/agents', async (request) => {
  const { 
    skill, 
    minReputation, 
    verifiedOnly, 
    status = 'Active',
    page = '1', 
    limit = '20' 
  } = request.query as {
    skill?: string;
    minReputation?: string;
    verifiedOnly?: string;
    status?: string;
    page?: string;
    limit?: string;
  };
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Build where clause
  const where: any = { status };
  
  if (minReputation) {
    where.reputationScore = { gte: parseInt(minReputation) };
  }
  
  if (skill) {
    where.skills = { has: skill };
  }
  
  if (verifiedOnly === 'true') {
    where.lastVerified = { gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  }
  
  const agents = await prisma.agent.findMany({
    where,
    skip,
    take: parseInt(limit),
    orderBy: { reputationScore: 'desc' },
    select: {
      agentId: true,
      owner: true,
      metadata: true,
      reputationScore: true,
      status: true,
      lastVerified: true,
      stats: true,
    },
  });
  
  const total = await prisma.agent.count({ where });
  
  return {
    agents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
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

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000');
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`Server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await app.close();
  await prisma.$disconnect();
  await redis.quit();
});
