import { PrismaClient } from '@prisma/client';
import { createPublicClient, createWalletClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Viem client
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.RPC_URL),
});

// Contract ABI (simplified - full ABI would be imported)
const CONTRACT_ABI = [
  {
    name: 'getAgent',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'agentId', type: 'bytes32' }],
    outputs: [
      { name: 'agentId', type: 'bytes32' },
      { name: 'owner', type: 'address' },
      { name: 'metadataURI', type: 'string' },
      { name: 'reputationScore', type: 'uint256' },
      { name: 'status', type: 'uint8' },
    ],
  },
  {
    name: 'registerAgent',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'metadataURI', type: 'string' },
      { name: 'tier', type: 'uint256' },
    ],
    outputs: [{ name: 'agentId', type: 'bytes32' }],
  },
  {
    name: 'isSubscriptionActive',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'agentId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'AgentRegistered',
    type: 'event',
    inputs: [
      { indexed: true, name: 'agentId', type: 'bytes32' },
      { indexed: true, name: 'owner', type: 'address' },
      { name: 'metadataURI', type: 'string' },
      { name: 'subscriptionExpiresAt', type: 'uint256' },
    ],
  },
];

// Database operations
export async function getAgentFromDB(agentId: string) {
  return await prisma.agent.findUnique({
    where: { agentId },
    include: {
      verifications: {
        orderBy: { timestamp: 'desc' },
        take: 10,
      },
      stats: true,
    },
  });
}

export async function getAgentFromChain(agentId: string) {
  try {
    const result = await publicClient.readContract({
      address: process.env.CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'getAgent',
      args: [agentId as `0x${string}`],
    });
    
    return {
      agentId: result[0],
      owner: result[1],
      metadataURI: result[2],
      reputationScore: Number(result[3]),
      status: result[4],
    };
  } catch (error) {
    console.error('Error fetching agent from chain:', error);
    return null;
  }
}

export async function listAgents(filters: any) {
  const where: any = {};
  
  if (filters.status) {
    where.status = filters.status;
  }
  
  if (filters.minReputation) {
    where.reputationScore = { gte: parseInt(filters.minReputation) };
  }
  
  if (filters.skill) {
    where.skills = { has: filters.skill };
  }
  
  const agents = await prisma.agent.findMany({
    where,
    skip: (parseInt(filters.page || '1') - 1) * parseInt(filters.limit || '20'),
    take: parseInt(filters.limit || '20'),
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
      page: parseInt(filters.page || '1'),
      limit: parseInt(filters.limit || '20'),
      total,
      pages: Math.ceil(total / parseInt(filters.limit || '20')),
    },
  };
}

export async function createAgent(data: any) {
  return await prisma.agent.create({
    data: {
      agentId: data.agentId,
      owner: data.owner,
      metadata: data.metadata,
      reputationScore: 0,
      status: 'Active',
    },
  });
}

export async function updateReputation(agentId: string, delta: number) {
  const agent = await prisma.agent.findUnique({ where: { agentId } });
  
  if (!agent) {
    throw new Error('Agent not found');
  }
  
  const newScore = Math.max(0, Math.min(10000, agent.reputationScore + delta));
  
  await prisma.$transaction([
    prisma.agent.update({
      where: { agentId },
      data: { reputationScore: newScore },
    }),
    prisma.reputationHistory.create({
      data: {
        agentId,
        score: newScore,
        delta,
        reason: 'API update',
      },
    }),
  ]);
  
  return newScore;
}

export async function recordVerification(agentId: string, data: any) {
  await prisma.verification.create({
    data: {
      agentId,
      score: data.score,
      passed: data.passed,
      reportURI: data.reportURI,
      checks: data.checks,
    },
  });
  
  if (data.passed) {
    await prisma.agent.update({
      where: { agentId },
      data: { lastVerified: new Date() },
    });
  }
}

export { prisma, publicClient, CONTRACT_ABI };
