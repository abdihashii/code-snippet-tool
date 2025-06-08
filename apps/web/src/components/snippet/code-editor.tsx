import type { Language } from '@snippet-share/types';

import { CopyCheckIcon, CopyIcon, DownloadIcon } from 'lucide-react';
import { useState } from 'react';
import { withErrorBoundary } from 'react-error-boundary';

import { CodeEditorErrorFallback } from '@/components/error-fallback';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  highlightedHtml: string;
  codeClassName: string;
  isReadOnly?: boolean;
  MAX_CODE_LENGTH: number;
  placeholder?: string;
  title?: string;
  language?: Language;
  onLanguageChange?: (language: Language) => void;
  supportedLanguages?: readonly { value: Language; label: string }[];
  isLanguageSelectDisabled?: boolean;
}

function CodeEditorComponent({
  code,
  onCodeChange,
  highlightedHtml,
  codeClassName,
  isReadOnly = false,
  MAX_CODE_LENGTH,
  placeholder = 'Paste your code here...',
  title,
  language,
  onLanguageChange,
  supportedLanguages,
  isLanguageSelectDisabled,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const handleDownload = () => {
    // Sanitize title for safe filename by removing special characters and converting to lowercase
    const fileName = title ? `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}` : 'snippet';
    // TODO: Add proper file extensions based on language
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="relative w-full">
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        {isReadOnly && (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="bg-background/90 hover:bg-background shadow-sm"
              onClick={handleCopy}
            >
              {copied
                ? (
                    <>
                      <CopyCheckIcon className="h-4 w-4 mr-1 text-emerald-500" />
                      Copied!
                    </>
                  )
                : (
                    <>
                      <CopyIcon className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="bg-background/90 hover:bg-background shadow-sm"
              onClick={handleDownload}
            >
              <DownloadIcon className="h-4 w-4 mr-1" />
              Download
            </Button>
          </>
        )}

        {/* Language Selection dropdown (only visible in edit mode) */}
        {supportedLanguages && onLanguageChange && language && (
          <Select
            value={language}
            onValueChange={onLanguageChange}
            disabled={isLanguageSelectDisabled || isReadOnly}
          >
            <SelectTrigger
              size="sm"
              className="w-[145px] bg-background/90 hover:bg-background shadow-sm text-xs h-8 hover:cursor-pointer"
            >
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="text-xs hover:cursor-pointer">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <pre
        aria-hidden="true"
        className={cn(
          'absolute inset-0 rounded-md px-3 py-2 min-h-[300px] font-mono text-sm whitespace-pre-wrap break-words overflow-hidden pointer-events-none text-foreground',
          isReadOnly ? 'bg-accent' : 'bg-background',
        )}
      >
        <code
          className={`language-${codeClassName}`}
          dangerouslySetInnerHTML={{ __html: `${highlightedHtml}\n` }}
        />
      </pre>
      <Textarea
        placeholder={placeholder}
        className="relative z-10 bg-transparent text-transparent caret-foreground min-h-[300px] font-mono text-sm resize-y w-full rounded-md border border-input px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        value={code}
        onChange={(e) => {
          const newCode = e.target.value;
          if (newCode.length <= MAX_CODE_LENGTH) {
            onCodeChange(newCode);
          } else {
            onCodeChange(newCode.substring(0, MAX_CODE_LENGTH));
          }
        }}
        required
        spellCheck="false"
        disabled={isReadOnly}
      />
    </div>
  );
}

export const CodeEditor = withErrorBoundary(CodeEditorComponent, {
  FallbackComponent: ({ error, resetErrorBoundary }) => (
    <CodeEditorErrorFallback error={error} resetError={resetErrorBoundary} />
  ),
});
