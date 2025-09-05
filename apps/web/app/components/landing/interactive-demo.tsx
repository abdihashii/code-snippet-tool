import { useNavigate } from '@tanstack/react-router';
import { ArrowRightIcon, CheckIcon, CopyIcon, LockIcon, SparklesIcon, ZapIcon } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const DEMO_SNIPPETS = {
  javascript: {
    code: `// Quick sorting algorithm
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}

console.log(quickSort([3, 6, 8, 10, 1, 2, 1]));`,
    language: 'javascript',
    title: 'JavaScript Example',
  },
  python: {
    code: `# Fibonacci sequence generator
def fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[-1] + fib[-2])
    return fib

print(fibonacci(10))`,
    language: 'python',
    title: 'Python Example',
  },
  sql: {
    code: `-- Get top customers by order value
SELECT 
    c.customer_name,
    COUNT(o.order_id) as total_orders,
    SUM(o.total_amount) as total_spent
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY c.customer_id, c.customer_name
ORDER BY total_spent DESC
LIMIT 10;`,
    language: 'sql',
    title: 'SQL Example',
  },
};

interface InteractiveDemoProps {
  className?: string;
}

export function InteractiveDemo({ className }: InteractiveDemoProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [demoLink, setDemoLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const posthog = usePostHog();
  const navigate = useNavigate();

  useEffect(() => {
    // Start with a demo snippet
    const demo = DEMO_SNIPPETS.javascript;
    setCode(demo.code);
    setLanguage(demo.language);
  }, []);

  const handleTemplateSelect = (template: keyof typeof DEMO_SNIPPETS) => {
    const demo = DEMO_SNIPPETS[template];
    setCode(demo.code);
    setLanguage(demo.language);
    posthog.capture('demo_template_selected', { template });
  };

  const handleCreateSnippet = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to share');
      return;
    }

    setIsEncrypting(true);
    posthog.capture('demo_snippet_create_attempt', {
      hasCode: true,
      codeLength: code.length,
      language,
    });

    // Simulate encryption process
    setTimeout(() => {
      const fakeId = Math.random().toString(36).substring(2, 9);
      const fakeKey = Math.random().toString(36).substring(2, 15);
      const link = `${window.location.origin}/s/${fakeId}#${fakeKey}`;

      setDemoLink(link);
      setIsEncrypting(false);
      setShowSuccess(true);

      posthog.capture('demo_snippet_created', {
        codeLength: code.length,
        language,
      });
    }, 800);
  };

  const handleCopyLink = () => {
    if (demoLink) {
      navigator.clipboard.writeText(demoLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      posthog.capture('demo_link_copied');

      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTryFullVersion = () => {
    posthog.capture('demo_try_full_version_clicked', {
      hadCreatedSnippet: !!demoLink,
      currentCode: code.substring(0, 100),
    });

    // Navigate to /new with the current code pre-filled
    navigate({
      to: '/new',
      search: {
        prefill: true,
        code,
        language,
      },
    });
  };

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div className="absolute top-0 right-0 p-4">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          <SparklesIcon className="h-3 w-3 mr-1" />
          Live Demo
        </Badge>
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Try it now - No signup required!</h3>
          <p className="text-sm text-muted-foreground">
            Paste your code below or try an example. See how easy it is to share code securely.
          </p>
        </div>

        {/* Quick templates */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Quick examples:</span>
          {Object.entries(DEMO_SNIPPETS).map(([key, demo]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => handleTemplateSelect(key as keyof typeof DEMO_SNIPPETS)}
              className="h-7 text-xs"
            >
              {demo.title}
            </Button>
          ))}
        </div>

        {/* Code input area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Your code</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
                <SelectItem value="sql">SQL</SelectItem>
                <SelectItem value="plaintext">Plain Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            className="min-h-[150px] font-mono text-sm"
            maxLength={5000}
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <LockIcon className="h-3 w-3" />
              <span>End-to-end encrypted</span>
            </div>
            <span>
              {code.length}
              {' '}
              / 5000 characters
            </span>
          </div>
        </div>

        {/* Success state with link */}
        {showSuccess && demoLink && (
          <div className="rounded-lg border bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 p-4 space-y-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckIcon className="h-4 w-4" />
              <span className="font-medium text-sm">Snippet created successfully!</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={demoLink}
                readOnly
                className="flex-1 px-3 py-1.5 text-xs font-mono bg-white dark:bg-gray-900 border rounded-md"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyLink}
                className="h-8"
              >
                {copied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              This is a demo link. For real sharing with expiration options, password protection, and more,
              try the full version.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {!showSuccess
            ? (
                <Button
                  onClick={handleCreateSnippet}
                  disabled={isEncrypting || !code.trim()}
                  className="flex-1"
                >
                  {isEncrypting
                    ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          Encrypting...
                        </>
                      )
                    : (
                        <>
                          <ZapIcon className="h-4 w-4 mr-2" />
                          Create Secure Link
                        </>
                      )}
                </Button>
              )
            : (
                <>
                  <Button
                    onClick={() => {
                      setShowSuccess(false);
                      setDemoLink('');
                      setCode('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Create Another
                  </Button>
                  <Button
                    onClick={handleTryFullVersion}
                    className="flex-1"
                  >
                    <ArrowRightIcon className="h-4 w-4 mr-2" />
                    Try Full Version
                  </Button>
                </>
              )}
        </div>

        {/* Feature callouts */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">10s</div>
            <div className="text-xs text-muted-foreground">To share</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">100%</div>
            <div className="text-xs text-muted-foreground">Encrypted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-xs text-muted-foreground">Sign-ups</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
