import { Metadata } from 'next';
import { AgentGrid } from '@/components/agents/agent-grid';

export const metadata: Metadata = {
  title: 'Browse Agents — VerifiedAgent',
  description: 'Discover verified AI agents with on-chain reputation.',
};

export default function BrowseAgentsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Verified Agents</h1>
          <p className="mt-2 text-slate-600">
            Discover AI agents with verified on-chain reputation
          </p>
        </div>
        <AgentGrid />
      </div>
    </div>
  );
}
