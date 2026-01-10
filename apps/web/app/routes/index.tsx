import type { Language } from '@snippet-share/types';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CheckIcon, ChevronDownIcon, ClockIcon, CopyIcon, EyeIcon, LockIcon, MailIcon, ShieldIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { FeedbackWidget } from '@/components/feedback/feedback-widget';
import { AppLayout } from '@/components/layout/app-layout';
import { SnippetForm } from '@/components/snippet/snippet-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useProductAnalytics } from '@/hooks/use-product-analytics';

export const Route = createFileRoute('/')({
  head: () => {
    // Schema.org structured data
    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        // WebApplication schema
        {
          '@type': 'WebApplication',
          'name': 'Snippet Share',
          'url': 'https://snippet-share.com',
          'description': 'Share sensitive content securely with end-to-end encryption, self-destructing messages, and password protection.',
          'applicationCategory': 'DeveloperApplication',
          'operatingSystem': 'Any',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
          },
          'featureList': [
            'AES-256-GCM encryption',
            'Zero-knowledge architecture',
            'Self-destructing snippets',
            'Password protection',
            'Custom expiration times',
            'Syntax highlighting for 50+ languages',
          ],
        },
        // Organization schema
        {
          '@type': 'Organization',
          'name': 'Snippet Share',
          'url': 'https://snippet-share.com',
          'logo': 'https://snippet-share.com/logo.png',
          'sameAs': [],
        },
        // FAQPage schema
        {
          '@type': 'FAQPage',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'How secure is this?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'We use AES-256-GCM encryption with a randomly generated key in your browser. The key is never sent to our servers - it stays in the URL fragment. This means we literally cannot decrypt your code, even under legal compulsion. It would take all the world\'s computers over 1,000 years to crack a single snippet.',
              },
            },
            {
              '@type': 'Question',
              'name': 'Is my connection secure?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. We enforce HTTPS on all connections - HTTP requests are automatically redirected. We also use HSTS (HTTP Strict Transport Security) which tells your browser to always use encrypted connections, preventing downgrade attacks. Your data is protected in transit and at rest.',
              },
            },
            {
              '@type': 'Question',
              'name': 'What happens to my code?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Your code is encrypted before leaving your browser and stored encrypted on our servers. When the expiration time is reached or view limit is hit, it\'s permanently deleted. We also offer "burn after reading" which deletes immediately after the first view. There\'s no way to recover deleted snippets.',
              },
            },
            {
              '@type': 'Question',
              'name': 'Can I password protect snippets?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes! You can add an additional password layer on top of the encryption. You can also set custom expiration times (1 hour to never), view limits, and use syntax highlighting for 50+ programming languages. All features are free - no premium tiers, no ads.',
              },
            },
            {
              '@type': 'Question',
              'name': 'Do you track anything?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'We collect anonymous usage metrics (page views, feature usage) to improve the product. We never record your screen, keystrokes, or session activity. Most importantly, your snippet content is encrypted before it leaves your browser - we literally cannot read it, even in our analytics.',
              },
            },
          ],
        },
      ],
    };

    return {
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(structuredData),
        },
      ],
    };
  },
  component: Home,
});

const PLACEHOLDER_TEXTS = [
  'Paste an error log to debug with your team...',
  'Share SQL queries without Slack formatting issues...',
  'Send config files with proper syntax highlighting...',
  'Share code snippets during interviews...',
  'Send API responses without breaking JSON...',
];

function Home() {
  const [faqOpen, setFaqOpen] = useState<string | null>(null);
  const [snippetLink, setSnippetLink] = useState('');
  const [snippetMetadata, setSnippetMetadata] = useState<{ expiresAfter: string; maxViews: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();
  const { trackSnippetCreated } = useProductAnalytics();

  const handleSnippetCreated = (result: { link: string; passwordWasSet: boolean; expiresAfter: string; maxViews: string }) => {
    setSnippetLink(result.link);
    setSnippetMetadata({ expiresAfter: result.expiresAfter, maxViews: result.maxViews });
    setShowSuccess(true);
    trackSnippetCreated({
      passwordProtected: result.passwordWasSet,
    });
  };

  const handleCopyLink = () => {
    if (snippetLink) {
      navigator.clipboard.writeText(snippetLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateAnother = () => {
    setShowSuccess(false);
    setSnippetLink('');
    setSnippetMetadata(null);
  };

  // Helper to format expiration for display
  const formatExpiration = (expiresAfter: string) => {
    switch (expiresAfter) {
      case '1h': return '1 hour';
      case '24h': return '24 hours';
      case '7d': return '7 days';
      case 'never': return 'Never';
      default: return expiresAfter;
    }
  };

  // Helper to format max views for display
  const formatMaxViews = (maxViews: string) => {
    return maxViews === 'unlimited' ? 'Unlimited' : `${maxViews} view${maxViews === '1' ? '' : 's'}`;
  };

  // Generate mailto link for email sharing
  const getEmailShareLink = () => {
    const subject = encodeURIComponent('Secure snippet shared with you');
    const body = encodeURIComponent(`I've shared a secure, encrypted snippet with you:\n\n${snippetLink}\n\nThis link contains encrypted content that only you can view.`);
    return `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <AppLayout>
      {/* Hero Section with Integrated Demo */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Minimalist header */}
        <div className="text-center mb-8 space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Share sensitive content. Truly private.
          </h1>
          <p className="text-lg text-muted-foreground">
            End-to-end encrypted in your browser. We can't read it, even if we wanted to.
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

        {/* Snippet Form - Main Focus */}
        <div className="w-full">
          {!showSuccess
            ? (
                <SnippetForm
                  onSnippetCreated={handleSnippetCreated}
                  initialLanguage={'PLAINTEXT' as Language}
                  placeholderTexts={PLACEHOLDER_TEXTS}
                />
              )
            : (
                <div className="rounded-lg border-2 shadow-xl bg-card p-6 space-y-5">
                  {/* Success header */}
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckIcon className="h-5 w-5" />
                    <span className="font-medium">Snippet created & encrypted!</span>
                  </div>

                  {/* Link input with copy */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={snippetLink}
                      readOnly
                      className="ph-no-capture flex-1 px-3 py-2 text-sm font-mono bg-background border rounded-md"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyLink}
                    >
                      {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                      <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
                    </Button>
                  </div>

                  {/* Share via email */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Share via:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a href={getEmailShareLink()}>
                        <MailIcon className="h-4 w-4 mr-1" />
                        Email
                      </a>
                    </Button>
                  </div>

                  {/* Metadata display */}
                  {snippetMetadata && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>
                          Expires:
                          {' '}
                          {formatExpiration(snippetMetadata.expiresAfter)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>
                          Views:
                          {' '}
                          {formatMaxViews(snippetMetadata.maxViews)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Feedback widget */}
                  <FeedbackWidget page="home-success" />

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleCreateAnother}
                      variant="outline"
                      className="flex-1"
                    >
                      Create Another
                    </Button>
                    <Button
                      onClick={() => navigate({ to: snippetLink.replace(window.location.origin, '') })}
                      className="flex-1"
                    >
                      View Snippet
                    </Button>
                  </div>
                </div>
              )}
        </div>

        {/* Single line trust statement */}
        {!showSuccess && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Code, configs, credentials, notes—encrypted before it leaves your device.
          </p>
        )}
      </section>

      {/* Minimal FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t">
        <h2 className="text-xl font-semibold text-center mb-6">Questions?</h2>

        <div className="space-y-4">
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
            open={faqOpen === 'connection'}
            onOpenChange={(open) => setFaqOpen(open ? 'connection' : null)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-4 rounded-lg hover:bg-muted/50 transition-colors">
              <span className="font-medium">Is my connection secure?</span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                faqOpen === 'connection' ? 'rotate-180' : ''
              }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <p className="text-muted-foreground">
                Yes. We enforce HTTPS on all connections - HTTP requests are automatically redirected.
                We also use HSTS (HTTP Strict Transport Security) which tells your browser to always use
                encrypted connections, preventing downgrade attacks. Your data is protected in transit and at rest.
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
                All features are free - no premium tiers, no ads.
              </p>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={faqOpen === 'analytics'}
            onOpenChange={(open) => setFaqOpen(open ? 'analytics' : null)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-4 rounded-lg hover:bg-muted/50 transition-colors">
              <span className="font-medium">Do you track anything?</span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                faqOpen === 'analytics' ? 'rotate-180' : ''
              }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <p className="text-muted-foreground">
                We collect anonymous usage metrics (page views, feature usage) to improve the product.
                We never record your screen, keystrokes, or session activity.
                Most importantly, your snippet content is encrypted before it leaves your browser -
                we literally cannot read it, even in our analytics.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </section>
    </AppLayout>
  );
}
