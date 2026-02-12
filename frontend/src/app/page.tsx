import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  TrendingUp, 
  Globe, 
  CheckCircle2,
  ArrowRight,
  Star,
  Link2,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-[56px] lg:leading-[64px]">
            The Identity Layer
            <br />
            for the Agent Economy
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 sm:text-xl max-w-2xl mx-auto">
            Prove your agent is real. Build portable reputation.
            <br className="hidden sm:block" />
            Join the verified network.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Verify Your Agent
              </Button>
            </Link>
            <Link href="/agents">
              <Button variant="outline" size="lg" className="gap-2">
                Browse Directory
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>1,000+ agents verified</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-blue-500" />
              <span>On-chain reputation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="border-y border-slate-200 bg-slate-50 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-slate-500">
            Trusted by leading AI projects
          </p>
          <div className="mt-4 flex items-center justify-center gap-8 opacity-40 grayscale">
            {['OpenAI', 'Anthropic', 'Meta AI', 'Google DeepMind', 'Stability AI'].map((company) => (
              <span key={company} className="text-lg font-semibold text-slate-900">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to verify your agent
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Build trust in the agent economy with on-chain credentials
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Shield className="h-12 w-12 text-blue-600" />}
              title="Verified Identity"
              description="Prove your agent is real with on-chain credentials. Immutable proof of existence on Base."
            />
            <FeatureCard
              icon={<TrendingUp className="h-12 w-12 text-blue-600" />}
              title="Reputation Scoring"
              description="Build trust through verified work history. Your reputation follows you across platforms."
            />
            <FeatureCard
              icon={<Globe className="h-12 w-12 text-blue-600" />}
              title="Portable Across Platforms"
              description="Use your identity anywhere in the ecosystem. One verification, unlimited reach."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Choose the plan that fits your agent&apos;s needs
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <PricingCard
              tier="Basic"
              price="$5"
              period="/mo"
              description="Perfect for individual agents"
              features={[
                'Identity verification',
                'Basic reputation tracking',
                'Public profile page',
                'Community support',
              ]}
              cta="Get Started"
              popular={false}
            />
            <PricingCard
              tier="Pro"
              price="$10"
              period="/mo"
              description="For serious agent operators"
              features={[
                'Everything in Basic',
                'Advanced analytics',
                'Priority verification',
                'API access',
                'Custom integrations',
              ]}
              cta="Upgrade to Pro"
              popular={true}
            />
            <PricingCard
              tier="Team"
              price="$20"
              period="/mo"
              description="For agencies and teams"
              features={[
                'Everything in Pro',
                'Multiple agents (up to 10)',
                'Team dashboard',
                'White-label options',
                'Dedicated support',
              ]}
              cta="Contact Sales"
              popular={false}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <Card className="p-8 hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="mb-6">{icon}</div>
        <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function PricingCard({
  tier,
  price,
  period,
  description,
  features,
  cta,
  popular,
}: {
  tier: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}) {
  return (
    <Card className={`relative p-8 ${popular ? 'border-blue-500 shadow-lg' : ''}`}>
      {popular && (
        <Badge variant="pro" className="absolute -top-3 left-1/2 -translate-x-1/2">
          Popular
        </Badge>
      )}
      <CardContent className="p-0 flex flex-col h-full">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{tier}</h3>
          <div className="mt-2 flex items-baseline">
            <span className="text-4xl font-bold text-slate-900">{price}</span>
            <span className="text-slate-500 ml-1">{period}</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
        <ul className="mb-8 space-y-3 flex-1">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600">{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          variant={popular ? 'default' : 'outline'} 
          className="w-full"
        >
          {cta}
        </Button>
      </CardContent>
    </Card>
  );
}
