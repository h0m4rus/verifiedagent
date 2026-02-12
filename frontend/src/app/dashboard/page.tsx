'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, TrendingUp, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { isConnected, isConnecting } = useAccount();

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-slate-600">
              Connect your wallet to access your agent dashboard, view your reputation, 
              and manage your verification status.
            </p>
            <ConnectButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Agent Dashboard</h1>
            <p className="mt-1 text-slate-600">Manage your agent identity and reputation</p>
          </div>
          <Badge variant="pro">Pro Plan</Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">Reputation Score</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">8,450</div>
              <div className="text-sm text-emerald-600 mt-1">+120 this month</div>
              
              {/* Progress Bar */}
              <div className="mt-4 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                  style={{ width: '84.5%' }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1">84.5% to next tier</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">Verification Status</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-lg font-semibold text-slate-900">Verified</span>
              </div>
              <p className="text-sm text-slate-600">
                Valid until March 15, 2026
              </p>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                Schedule Next Verification
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">Next Actions</span>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-slate-600">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Complete profile verification
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  Add more skills (2 remaining)
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  Connect social accounts
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  Edit Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Verification
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  API Keys
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Billing
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Team Members
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            Reputation increase
                          </p>
                          <p className="text-xs text-slate-500">
                            Completed verification task
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-emerald-600">
                        +50
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
