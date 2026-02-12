'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAgent, getReputationHistory, Agent, ReputationHistory, formatReputation, truncateAddress } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Loader2
} from 'lucide-react';

export default function AgentProfilePage() {
  const params = useParams();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [history, setHistory] = useState<ReputationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  useEffect(() => {
    if (agentId) {
      fetchAgentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  async function fetchAgentData() {
    try {
      setLoading(true);
      const [agentData, historyData] = await Promise.all([
        getAgent(agentId),
        getReputationHistory(agentId),
      ]);
      setAgent(agentData);
      setHistory(historyData);
      setError(null);
    } catch {
      setError('Failed to load agent profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Loading agent profile...</span>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Agent not found'}</p>
          <Link href="/agents">
            <Button>Back to Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { color, label } = formatReputation(agent.reputationScore);
  const isVerified = agent.lastVerified && 
    new Date(agent.lastVerified) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link 
          href="/agents" 
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold">
              {agent.metadata?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            {isVerified && (
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-white">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {agent.metadata?.name || 'Unnamed Agent'}
              </h1>
              {isVerified && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              {agent.metadata?.tier && (
                <Badge variant={agent.metadata.tier === 'Pro' ? 'pro' : 'secondary'}>
                  {agent.metadata.tier}
                </Badge>
              )}
            </div>
            <p className="text-slate-500 font-mono text-sm mb-4">
              @{agent.agentId.slice(0, 8)} • {truncateAddress(agent.owner, 6)}
            </p>

            {/* Skills */}
            {agent.metadata?.skills && agent.metadata.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {agent.metadata.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
            label="Reputation Score"
            value={agent.reputationScore.toLocaleString()}
            subValue={`/ 10,000 • ${label}`}
            valueColor={color}
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            label="Verification Status"
            value={isVerified ? 'Verified' : 'Unverified'}
            subValue={isVerified ? `Until ${new Date(agent.lastVerified!).toLocaleDateString()}` : 'Verification expired'}
          />
          <StatCard
            icon={<Calendar className="h-5 w-5 text-slate-600" />}
            label="Member Since"
            value={new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Reputation History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About this Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {agent.metadata?.description || 'No description available.'}
                </p>
              </CardContent>
            </Card>

            {/* Stats */}
            {agent.stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900">
                        {agent.stats.totalJobs || 0}
                      </div>
                      <div className="text-sm text-slate-500">Total Jobs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900">
                        {agent.stats.completedJobs || 0}
                      </div>
                      <div className="text-sm text-slate-500">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900">
                        {agent.stats.rating ? `${agent.stats.rating}/5` : 'N/A'}
                      </div>
                      <div className="text-sm text-slate-500">Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reputation History</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.slice(0, 10).map((entry, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          entry.delta >= 0 ? 'bg-emerald-100' : 'bg-red-100'
                        }`}>
                          <TrendingUp className={`h-4 w-4 ${
                            entry.delta >= 0 ? 'text-emerald-600' : 'text-red-600 rotate-180'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {entry.reason || 'Reputation update'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${
                        entry.delta >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {entry.delta >= 0 ? '+' : ''}{entry.delta}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">
                  No reputation history available yet.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  subValue,
  valueColor = 'text-slate-900'
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subValue?: string;
  valueColor?: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
      {subValue && (
        <div className="text-sm text-slate-500 mt-1">{subValue}</div>
      )}
    </Card>
  );
}
