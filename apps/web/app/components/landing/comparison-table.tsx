import { CheckIcon, XIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ComparisonTableProps {
  className?: string;
}

const FEATURES = [
  {
    feature: 'Zero-Knowledge Encryption',
    us: true,
    githubGists: false,
    pastebin: false,
    hastebin: false,
    description: 'Your code is encrypted before leaving your browser',
  },
  {
    feature: 'No Account Required',
    us: true,
    githubGists: false,
    pastebin: true,
    hastebin: true,
    description: 'Share instantly without signing up',
  },
  {
    feature: 'Password Protection',
    us: true,
    githubGists: false,
    pastebin: 'premium',
    hastebin: false,
    description: 'Add an extra layer of security',
  },
  {
    feature: 'Auto-Expiration',
    us: true,
    githubGists: false,
    pastebin: 'premium',
    hastebin: false,
    description: 'Set time or view-based limits',
  },
  {
    feature: 'Syntax Highlighting',
    us: true,
    githubGists: true,
    pastebin: true,
    hastebin: true,
    description: 'Beautiful code formatting',
  },
  {
    feature: 'Open Source',
    us: true,
    githubGists: false,
    pastebin: false,
    hastebin: true,
    description: 'Transparent and auditable code',
  },
  {
    feature: 'API Access',
    us: true,
    githubGists: true,
    pastebin: 'premium',
    hastebin: true,
    description: 'Programmatic access for automation',
  },
  {
    feature: 'Burn After Reading',
    us: true,
    githubGists: false,
    pastebin: false,
    hastebin: false,
    description: 'Auto-delete after first view',
  },
  {
    feature: 'Code Prettification',
    us: true,
    githubGists: false,
    pastebin: false,
    hastebin: false,
    description: 'Auto-format your code',
  },
  {
    feature: 'No Ads',
    us: true,
    githubGists: true,
    pastebin: 'premium',
    hastebin: true,
    description: 'Clean, distraction-free experience',
  },
];

export function ComparisonTable({ className }: ComparisonTableProps) {
  const renderFeatureValue = (value: boolean | 'premium' | string) => {
    if (value === true) {
      return <CheckIcon className="h-5 w-5 text-green-600" />;
    } else if (value === 'premium') {
      return <Badge variant="outline" className="text-xs">Premium</Badge>;
    } else {
      return <XIcon className="h-5 w-5 text-gray-300" />;
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="text-2xl lg:text-3xl text-center">
          Why Choose Snippet Share?
        </CardTitle>
        <p className="text-center text-muted-foreground mt-2">
          See how we compare to other code sharing platforms
        </p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium">Feature</th>
                <th className="text-center p-4 min-w-[120px]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold text-primary">Snippet Share</span>
                    <Badge className="text-xs">You are here</Badge>
                  </div>
                </th>
                <th className="text-center p-4 font-medium min-w-[120px]">GitHub Gists</th>
                <th className="text-center p-4 font-medium min-w-[120px]">Pastebin</th>
                <th className="text-center p-4 font-medium min-w-[120px]">Hastebin</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((item, index) => (
                <tr
                  key={item.feature}
                  className={cn(
                    'border-b transition-colors hover:bg-muted/30',
                    index === 0 && 'bg-primary/5', // Highlight our key differentiator
                  )}
                >
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{item.feature}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </td>
                  <td className="text-center p-4">
                    <div className="flex justify-center">
                      {renderFeatureValue(item.us)}
                    </div>
                  </td>
                  <td className="text-center p-4">
                    <div className="flex justify-center">
                      {renderFeatureValue(item.githubGists)}
                    </div>
                  </td>
                  <td className="text-center p-4">
                    <div className="flex justify-center">
                      {renderFeatureValue(item.pastebin)}
                    </div>
                  </td>
                  <td className="text-center p-4">
                    <div className="flex justify-center">
                      {renderFeatureValue(item.hastebin)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground">
            All our features are
            {' '}
            <span className="font-semibold text-foreground">100% free</span>
            {' '}
            and always will be.
            No premium tiers, no hidden costs.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
