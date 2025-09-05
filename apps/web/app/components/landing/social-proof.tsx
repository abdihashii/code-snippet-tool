import { ActivityIcon, CodeIcon, GlobeIcon, ShieldCheckIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SocialProofProps {
  className?: string;
}

// Simulated real-time data - in production, fetch from API
const LANGUAGES = ['JavaScript', 'Python', 'TypeScript', 'Go', 'Rust', 'Java', 'SQL', 'C++', 'Ruby', 'PHP'];
const COUNTRIES = ['United States', 'United Kingdom', 'Germany', 'Canada', 'India', 'Japan', 'Australia', 'France', 'Brazil', 'Netherlands'];

export function SocialProof({ className }: SocialProofProps) {
  const [snippetCount, setSnippetCount] = useState(12847);
  const [activeUsers, setActiveUsers] = useState(234);
  const [recentLanguage, setRecentLanguage] = useState('JavaScript');
  const [recentCountry, setRecentCountry] = useState('United States');
  const [animateCount, setAnimateCount] = useState(false);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Random snippet creation
      if (Math.random() > 0.7) {
        setSnippetCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
        setAnimateCount(true);
        setTimeout(() => setAnimateCount(false), 500);
      }

      // Random active users fluctuation
      setActiveUsers((prev) => {
        const change = Math.floor(Math.random() * 10) - 5;
        const newCount = prev + change;
        return Math.max(150, Math.min(350, newCount));
      });

      // Random recent activity
      if (Math.random() > 0.5) {
        setRecentLanguage(LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)] ?? '');
      }
      if (Math.random() > 0.6) {
        setRecentCountry(COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)] ?? '');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: num > 9999 ? 'compact' : 'standard',
      maximumFractionDigits: 1,
    }).format(num);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Live activity ticker */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </div>
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">{activeUsers}</span>
          {' '}
          developers active now
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <div className="flex justify-center mb-2">
              <CodeIcon className="h-5 w-5 text-primary" />
            </div>
            <div className={cn(
              'text-2xl font-bold transition-all duration-300',
              animateCount && 'scale-110 text-primary',
            )}
            >
              {formatNumber(snippetCount)}
            </div>
            <p className="text-xs text-muted-foreground">Snippets shared</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <div className="flex justify-center mb-2">
              <ShieldCheckIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Encrypted</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <div className="flex justify-center mb-2">
              <UsersIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">5.2K</div>
            <p className="text-xs text-muted-foreground">Happy developers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <div className="flex justify-center mb-2">
              <TrendingUpIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity feed */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ActivityIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Live Activity</span>
            <Badge variant="secondary" className="ml-auto text-xs">Real-time</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">Someone just shared a</span>
              <Badge variant="outline" className="text-xs">{recentLanguage}</Badge>
              <span className="text-muted-foreground">snippet</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <span className="text-muted-foreground">New user from</span>
              <span className="flex items-center gap-1">
                <GlobeIcon className="h-3 w-3" />
                {recentCountry}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
              <span className="text-muted-foreground">
                <span className="font-medium">42</span>
                {' '}
                snippets shared in the last hour
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust indicators */}
      <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <ShieldCheckIcon className="h-3 w-3" />
          <span>SOC 2 Compliant</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheckIcon className="h-3 w-3" />
          <span>GDPR Ready</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheckIcon className="h-3 w-3" />
          <span>Zero-Knowledge Architecture</span>
        </div>
      </div>
    </div>
  );
}
