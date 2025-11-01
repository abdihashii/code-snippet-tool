import { ArrowLeftIcon, CopyCheckIcon, CopyIcon, ShieldIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useProductAnalytics } from '@/hooks/use-product-analytics';

interface LinkDisplayProps {
  link: string;
  onCreateAnother: () => void;
  passwordWasSet: boolean;
}

export function LinkDisplay(
  { link, onCreateAnother, passwordWasSet }: LinkDisplayProps,
) {
  const [copied, setCopied] = useState(false);
  const { trackLinkCopied } = useProductAnalytics();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackLinkCopied({ source: 'link_display' });
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="animate-fadeIn">
      <Card className="w-full shadow-md">
        <CardHeader className="pb-4">
          <CardTitle
            className="text-center text-primary flex items-center justify-center"
          >
            <ShieldIcon className="mr-2 h-5 w-5" />
            Your Secure Link is Ready!
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <Input
                value={link}
                readOnly
                className="pr-10 font-mono text-sm bg-muted"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="absolute right-[1.5rem] text-muted-foreground hover:text-primary"
                onClick={handleCopy}
              >
                {copied
                  ? <CopyCheckIcon className="h-4 w-4 text-success" />
                  : <CopyIcon className="h-4 w-4" />}
              </Button>
            </div>
            {copied
              && (
                <p className="ml-1 text-xs text-success">
                  Copied to clipboard!
                </p>
              )}
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Important:</strong>
              {' '}
              Share this link with your recipient(s). This link is secret and will not be
              shown again. Keep it safe!
              {passwordWasSet && (
                <span className="block mt-1">
                  Remember to share the password securely and separately with the recipient.
                </span>
              )}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center pb-6 pt-2">
          <Button
            size="lg"
            onClick={onCreateAnother}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 hover:cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Create Another Snippet
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
