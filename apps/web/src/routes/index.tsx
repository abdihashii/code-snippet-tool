import { createFileRoute, Link } from '@tanstack/react-router';
import { CheckIcon, CodeIcon, LockIcon, ShieldIcon, TimerIcon, ZapIcon } from 'lucide-react';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <AppLayout>
      <div className="space-y-16 lg:space-y-20 py-8 lg:py-12">
        {/* Hero Section */}
        <section className="text-center space-y-8 px-4 lg:px-6">
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Share Code Snippets
              <span className="block text-primary">Securely & Instantly</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              The secure, zero-knowledge code snippet sharing platform built for developers.
              Your code is encrypted in your browser before it reaches our servers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
            <Link to="/new" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto min-h-[48px] bg-primary hover:bg-primary/90 flex items-center gap-2 justify-center font-semibold">
                <ZapIcon className="h-5 w-5" />
                Start Sharing Now
              </Button>
            </Link>
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto min-h-[48px] border-primary text-primary hover:text-primary/90 hover:border-primary/90 hover:bg-primary/5">
                Create Free Account
              </Button>
            </Link>
          </div>
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

        {/* Why Choose Us */}
        <section className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl">Why Choose Snippet Share?</CardTitle>
            </CardHeader>
            <CardContent className="p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">No Account Required</h4>
                      <p className="text-sm text-muted-foreground">Share code instantly without creating an account</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Open Source</h4>
                      <p className="text-sm text-muted-foreground">Transparent, auditable code you can trust</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Fast & Reliable</h4>
                      <p className="text-sm text-muted-foreground">Powered by Cloudflare Workers for global performance</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Privacy Focused</h4>
                      <p className="text-sm text-muted-foreground">Zero-knowledge architecture means we never see your code</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Developer Friendly</h4>
                      <p className="text-sm text-muted-foreground">Built by developers, for developers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Free to Use</h4>
                      <p className="text-sm text-muted-foreground">Core features are completely free</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-8 py-16 lg:py-20 px-4 lg:px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Ready to Share Securely?</h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Join thousands of developers who trust Snippet Share for secure code sharing.
            Start sharing your code snippets today - no account required.
          </p>
          <div className="flex justify-center">
            <Link to="/new" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto min-h-[48px] bg-primary hover:bg-primary/90 flex items-center gap-2 justify-center px-8 font-semibold">
                <ZapIcon className="h-5 w-5" />
                Create Your First Snippet
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
