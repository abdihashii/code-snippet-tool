import type { Language } from '@snippet-share/types';

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
import { useSnippetForm } from '@/hooks/use-snippet-form';
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
    language: 'JAVASCRIPT',
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
    language: 'PYTHON',
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
    language: 'SQL',
    title: 'SQL Example',
  },
};

interface InteractiveDemoProps {
  className?: string;
}

export function InteractiveDemo({ className }: InteractiveDemoProps) {
  const [demoLink, setDemoLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const posthog = usePostHog();
  const navigate = useNavigate();

  // Use the real snippet form hook with demo defaults
  const {
    // Form field states and setters
    code,
    setCode,
    language,
    setLanguage,
    setExpiresAfter,
    setMaxViews,
    isSubmitting,

    // Derived/Computed values for rendering (from useCodeHighlighting via useSnippetForm)
    highlightedHtml,
    codeClassName,

    // Actions
    handleSubmit,

    // Constants and static data
    SUPPORTED_LANGUAGES,
    MAX_CODE_LENGTH,
  } = useSnippetForm({
    onSnippetCreated: (result: { link: string; passwordWasSet: boolean }) => {
      setDemoLink(result.link);
      setShowSuccess(true);
      // Analytics will be tracked in handleCreateSnippet
    },
    initialLanguage: 'JAVASCRIPT' as Language,
  });

  useEffect(() => {
    // Set demo defaults
    setExpiresAfter('1h'); // Demo snippets expire after 1 hour
    setMaxViews('unlimited');
    // Start with a demo snippet
    const demo = DEMO_SNIPPETS.javascript;
    setCode(demo.code);
    setLanguage(demo.language as Language);
  }, [setCode, setLanguage, setExpiresAfter, setMaxViews]);

  // Track successful snippet creation
  useEffect(() => {
    if (showSuccess && demoLink) {
      posthog.capture('demo_snippet_created', {
        codeLength: code.length,
        language,
      });
    }
  }, [showSuccess, demoLink, code.length, language, posthog]);

  const handleTemplateSelect = (template: keyof typeof DEMO_SNIPPETS) => {
    const demo = DEMO_SNIPPETS[template];
    setCode(demo.code);
    setLanguage(demo.language as Language);
    posthog.capture('demo_template_selected', { template });
  };

  const handleCreateSnippet = async (e: React.FormEvent) => {
    if (!code.trim()) {
      toast.error('Please enter some code to share');
      return;
    }

    posthog.capture('demo_snippet_create_attempt', {
      hasCode: true,
      codeLength: code.length,
      language,
    });

    // Use the real handleSubmit from useSnippetForm
    await handleSubmit(e);
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
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger className="w-[145px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value} className="text-xs hover:cursor-pointer">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full">
            <pre
              aria-hidden="true"
              className="absolute inset-0 rounded-md px-3 py-2 min-h-[150px] font-mono text-sm whitespace-pre-wrap break-words overflow-hidden pointer-events-none bg-background border border-input"
            >
              <code
                className={`language-${codeClassName}`}
                dangerouslySetInnerHTML={{ __html: `${highlightedHtml}\n` }}
              />
            </pre>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="relative z-10 bg-transparent text-transparent caret-foreground min-h-[150px] font-mono text-sm resize-y"
              maxLength={Math.min(5000, MAX_CODE_LENGTH)}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <LockIcon className="h-3 w-3" />
              <span>End-to-end encrypted</span>
            </div>
            <span>
              {code.length}
              {' '}
              /
              {' '}
              {Math.min(5000, MAX_CODE_LENGTH).toLocaleString()}
              {' '}
              characters
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
              This is a real working snippet that expires in 1 hour. Try the full version for more options like password protection, custom expiration, and more.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {!showSuccess
            ? (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleCreateSnippet(e);
                  }}
                  disabled={isSubmitting || !code.trim()}
                  className="flex-1"
                  type="button"
                >
                  {isSubmitting
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
      </CardContent>
    </Card>
  );
}
