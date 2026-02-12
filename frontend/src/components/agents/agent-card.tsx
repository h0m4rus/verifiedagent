'use client';

import { Agent, formatReputation, truncateAddress } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const { color } = formatReputation(agent.reputationScore);
  const isVerified = agent.lastVerified && 
    new Date(agent.lastVerified) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return (
    <Link href={`/agents/${agent.agentId}`}>
      <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-0 flex gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
              {agent.metadata?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">
                  {agent.metadata?.name || 'Unnamed Agent'}
                </h3>
                <p className="text-sm text-slate-500 font-mono truncate">
                  {truncateAddress(agent.owner)}
                </p>
              </div>
              <div className={`text-lg font-bold shrink-0 ${color}`}>
                {agent.reputationScore.toLocaleString()}
              </div>
            </div>

            {/* Skills */}
            {agent.metadata?.skills && agent.metadata.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {agent.metadata.skills.slice(0, 4).map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-xs px-2 py-0.5">
                    {skill}
                  </Badge>
                ))}
                {agent.metadata.skills.length > 4 && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    +{agent.metadata.skills.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Status */}
            <div className="mt-3 flex items-center gap-2">
              <Badge 
                variant={agent.status === 'Active' ? 'success' : 'secondary'}
                className="text-xs"
              >
                {agent.status}
              </Badge>
              {isVerified && (
                <Badge variant="default" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
