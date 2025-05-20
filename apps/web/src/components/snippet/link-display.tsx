import { ArrowLeftIcon, Check, Copy, Shield } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface LinkDisplayProps {
  link: string;
  onCreateAnother: () => void;
  passwordWasSet: boolean;
}

export function LinkDisplay(
  { link, onCreateAnother, passwordWasSet }: LinkDisplayProps,
) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="animate-fadeIn">
      <Card className="w-full shadow-md border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-teal-600 flex items-center justify-center">
            <Shield className="mr-2 h-5 w-5" />
            Your Secure Link is Ready!
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <Input value={link} readOnly className="pr-10 font-mono text-sm bg-slate-50" />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="absolute right-[1.5rem] text-slate-500 hover:text-teal-600"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {copied && <p className="text-xs text-green-600 ml-1">Copied to clipboard!</p>}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <p className="text-sm text-amber-800">
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
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 hover:cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Create Another Snippet
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
