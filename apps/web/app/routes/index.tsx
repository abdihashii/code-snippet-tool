import { createFileRoute, Link } from '@tanstack/react-router';
import { ClockIcon, CodeIcon, LockIcon, RocketIcon, ShieldIcon, TimerIcon, ZapIcon } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

import { ComparisonTable } from '@/components/landing/comparison-table';
import { InteractiveDemo } from '@/components/landing/interactive-demo';
import { QuickTemplates } from '@/components/landing/quick-templates';
import { SocialProof } from '@/components/landing/social-proof';
import { AppLayout } from '@/components/layout/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLandingAnalytics } from '@/hooks/use-landing-analytics';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const posthog = usePostHog();

  // Track landing page analytics
  const { trackFunnelStep } = useLandingAnalytics();

  // Track funnel start
  useEffect(() => {
    trackFunnelStep('view_landing');
  }, []);

  return (
    <AppLayout>
      <div className="space-y-16 lg:space-y-24 py-8 lg:py-12">
        {/* Hero Section */}
        <section className="text-center space-y-8 px-4 lg:px-6">
          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="px-3 py-1">
                <RocketIcon className="h-3 w-3 mr-1" />
                Share code in 10 seconds - No signup required
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Share Code Snippets
              <span className="block text-primary">Securely & Instantly</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              The
              {' '}
              <span className="font-semibold text-foreground">only</span>
              {' '}
              code sharing platform with true zero-knowledge encryption.
              Your code is encrypted
              {' '}
              <span className="font-semibold text-foreground">before</span>
              {' '}
              it leaves your browser.
            </p>

            {/* Trust indicators */}
            <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ShieldIcon className="h-4 w-4 text-green-600" />
                <span>100% Encrypted</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4 text-blue-600" />
                <span>&lt; 10s to share</span>
              </div>
              {/* <div className="flex items-center gap-1">
                <CodeIcon className="h-4 w-4 text-purple-600" />
                <span>12K+ snippets shared</span>
              </div> */}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
            <Link to="/new" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto min-h-[48px] bg-primary hover:bg-primary/90 flex items-center gap-2 justify-center font-semibold shadow-lg hover:shadow-xl transition-all"
                onClick={() => posthog.capture('landing_cta_click', { button: 'start_sharing_instantly', location: 'hero' })}
              >
                <ZapIcon className="h-5 w-5" />
                Start Sharing Instantly
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-h-[48px]"
              onClick={() => {
                posthog.capture('landing_cta_click', { button: 'scroll_to_demo', location: 'hero' });
                document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See How It Works
            </Button>
          </div>
        </section>

        {/* Live Social Proof */}
        {/* <section className="px-4 lg:px-6">
          <SocialProof />
        </section> */}

        {/* Interactive Demo Section */}
        <section id="demo-section" className="px-4 lg:px-6 scroll-mt-20">
          <InteractiveDemo />
        </section>

        {/* Quick Templates */}
        <section className="px-4 lg:px-6">
          <QuickTemplates />
        </section>

        {/* Security Highlight */}
        <section className="px-4 lg:px-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 lg:p-8">
              <div className="flex items-center gap-4 mb-6">
                <ShieldIcon className="h-6 w-6 text-primary flex-shrink-0" />
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold">Zero-Knowledge Security</h2>
              </div>
              <p className="text-muted-foreground text-lg">
                Your code is encrypted with AES-256-GCM in your browser before transmission.
                We never see your plaintext code - even if we wanted to, we couldn't read it.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Features Grid */}
        <section className="px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LockIcon className="h-5 w-5 text-primary" />
                  Client-Side Encryption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All encryption happens in your browser using the Web Crypto API.
                  Your encryption keys never leave your device.
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CodeIcon className="h-5 w-5 text-primary" />
                  Syntax Highlighting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Support for popular programming languages with beautiful syntax highlighting
                  and code prettification features.
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TimerIcon className="h-5 w-5 text-primary" />
                  Auto-Expiration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Set time-based or view-based limits. From 1 hour to never,
                  or burn-after-reading for maximum security.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-8 px-4 lg:px-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Share your code in three simple steps while maintaining complete privacy and security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold text-lg">1</span>
              </div>
              <h3 className="text-xl font-semibold">Paste Your Code</h3>
              <p className="text-muted-foreground">
                Paste your code or text, select the programming language, and set expiration options.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold text-lg">2</span>
              </div>
              <h3 className="text-xl font-semibold">Encrypt & Share</h3>
              <p className="text-muted-foreground">
                Your code is encrypted in your browser and uploaded. Get a secure shareable link instantly.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold text-lg">3</span>
              </div>
              <h3 className="text-xl font-semibold">Secure Access</h3>
              <p className="text-muted-foreground">
                Recipients decrypt and view your code securely. Optionally protect with a password.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="px-4 lg:px-6">
          <ComparisonTable />
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-8 py-16 lg:py-20 px-4 lg:px-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl">
          <div className="space-y-4">
            <Badge className="mb-2">
              <ClockIcon className="h-3 w-3 mr-1" />
              Takes less than 10 seconds
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Ready to Share Your Code?
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Join
              {' '}
              <span className="font-semibold text-foreground">5,200+ developers</span>
              {' '}
              who trust Snippet Share.
              Share your first snippet in seconds -
              {' '}
              <span className="font-semibold text-foreground">no signup, no BS</span>
              .
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/new" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto min-h-[56px] bg-primary hover:bg-primary/90 flex items-center gap-2 justify-center px-8 font-semibold shadow-xl hover:shadow-2xl transition-all text-lg"
                onClick={() => posthog.capture('landing_cta_click', { button: 'share_code_now', location: 'bottom' })}
              >
                <RocketIcon className="h-5 w-5" />
                Share Code Now →
              </Button>
            </Link>
            <div className="text-sm text-muted-foreground">
              No signup • Free forever • Zero-knowledge encryption
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
