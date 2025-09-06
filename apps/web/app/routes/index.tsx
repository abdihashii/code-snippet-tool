import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRightIcon, ChevronDownIcon, LockIcon, ShieldIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { InteractiveDemo } from '@/components/landing/interactive-demo';
import { AppLayout } from '@/components/layout/app-layout';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useLandingAnalytics } from '@/hooks/use-landing-analytics';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [faqOpen, setFaqOpen] = useState<string | null>(null);

  // Track landing page analytics
  const { trackFunnelStep } = useLandingAnalytics();

  // Track funnel start
  useEffect(() => {
    trackFunnelStep('view_landing');
  }, [trackFunnelStep]);

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col">
        {/* Hero Section with Integrated Demo */}
        <section className="flex-1 flex flex-col justify-center px-4 lg:px-6 py-8 lg:py-12 max-w-5xl mx-auto w-full">
          {/* Minimalist header */}
          <div className="text-center mb-8 space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Paste code. Get unbreakable link. Share with confidence.
            </h1>
            <p className="text-lg text-muted-foreground">
              Your code is encrypted so strongly, we couldn't read it if we tried.
            </p>

            {/* Trust indicators without numbers */}
            <div className="flex justify-center items-center gap-4 sm:gap-6 text-sm">
              <Badge variant="secondary" className="px-3 py-1">
                <LockIcon className="h-3 w-3 mr-1" />
                AES-256 Encryption
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <ShieldIcon className="h-3 w-3 mr-1" />
                Zero-Knowledge
              </Badge>
            </div>
          </div>

          {/* Interactive Demo - Main Focus */}
          <div className="w-full">
            <InteractiveDemo className="border-2 shadow-xl" />
          </div>

          {/* Single line trust statement with CTA */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Expires when you want. Deleted forever after.
            {' '}
            <Link
              to="/new"
              className="inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              Need more control?
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </p>
        </section>

        {/* Minimal FAQ Section */}
        <section className="px-4 lg:px-6 py-12 border-t">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-xl font-semibold text-center mb-6">Questions?</h2>

            <Collapsible
              open={faqOpen === 'secure'}
              onOpenChange={(open) => setFaqOpen(open ? 'secure' : null)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="font-medium">How secure is this?</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                  faqOpen === 'secure' ? 'rotate-180' : ''
                }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <p className="text-muted-foreground">
                  We use AES-256-GCM encryption with a randomly generated key in your browser.
                  The key is never sent to our servers - it stays in the URL fragment.
                  This means we literally cannot decrypt your code, even under legal compulsion.
                  It would take all the world's computers over 1,000 years to crack a single snippet.
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              open={faqOpen === 'data'}
              onOpenChange={(open) => setFaqOpen(open ? 'data' : null)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="font-medium">What happens to my code?</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                  faqOpen === 'data' ? 'rotate-180' : ''
                }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <p className="text-muted-foreground">
                  Your code is encrypted before leaving your browser and stored encrypted on our servers.
                  When the expiration time is reached or view limit is hit, it's permanently deleted.
                  We also offer "burn after reading" which deletes immediately after the first view.
                  There's no way to recover deleted snippets.
                  {' '}
                  <Link
                    to="/new"
                    className="inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    Create your first snippet
                    <ArrowRightIcon className="h-3 w-3" />
                  </Link>
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              open={faqOpen === 'features'}
              onOpenChange={(open) => setFaqOpen(open ? 'features' : null)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="font-medium">Can I password protect snippets?</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                  faqOpen === 'features' ? 'rotate-180' : ''
                }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <p className="text-muted-foreground">
                  Yes! You can add an additional password layer on top of the encryption.
                  You can also set custom expiration times (1 hour to never),
                  view limits, and use syntax highlighting for 50+ programming languages.
                  All features are free - no premium tiers, no ads, no tracking.
                  {' '}
                  <Link
                    to="/new"
                    className="inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    Try it now
                    <ArrowRightIcon className="h-3 w-3" />
                  </Link>
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
