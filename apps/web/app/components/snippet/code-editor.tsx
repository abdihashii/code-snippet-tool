import type { Language } from '@snippet-share/types';

import { Check, ChevronsUpDown, CopyCheckIcon, CopyIcon, DownloadIcon } from 'lucide-react';
import { useState } from 'react';
import { withErrorBoundary } from 'react-error-boundary';

import { CodeEditorErrorFallback } from '@/components/error-fallback';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { usePlaceholderCycle } from '@/hooks/use-placeholder-cycle';
import { useProductAnalytics } from '@/hooks/use-product-analytics';
import { cn } from '@/lib/utils';
import { getFileExtensionForLanguage } from '@/lib/utils/language-utils';

export interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  highlightedHtml: string;
  codeClassName: string;
  isReadOnly?: boolean;
  MAX_CODE_LENGTH: number;
  placeholder?: string;
  placeholderTexts?: string[]; // Array of texts to cycle through
  title?: string;
  language?: Language;
  onLanguageChange?: (language: Language) => void;
  supportedLanguages?: readonly { value: Language; label: string; icon?: React.ComponentType<any> }[];
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
  placeholderTexts,
  title,
  language,
  onLanguageChange,
  supportedLanguages,
  isLanguageSelectDisabled,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const { trackCodeCopied, trackSnippetDownloaded } = useProductAnalytics();

  // Use cycling placeholder if placeholderTexts is provided
  const { text: cyclingPlaceholder, isVisible } = usePlaceholderCycle(
    placeholderTexts || [],
    Boolean(placeholderTexts && !code), // Only cycle when empty and placeholderTexts provided
  );

  // Determine which placeholder to use
  const effectivePlaceholder = placeholderTexts ? cyclingPlaceholder : placeholder;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackCodeCopied();
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const handleDownload = () => {
    // Sanitize title for safe filename by removing special characters and converting to lowercase
    const fileName = title ? `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}` : 'snippet';
    const fileExtension = language ? getFileExtensionForLanguage(language) : '.txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    trackSnippetDownloaded({ language: language || undefined });
  };
  return (
    <div className="relative w-full">
      <div className="absolute right-2 top-2 z-20 flex gap-2">
        {isReadOnly && (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shadow-sm border-primary text-primary hover:text-primary/90 hover:border-primary/90 hover:cursor-pointer"
              onClick={handleCopy}
            >
              {copied
                ? (
                    <>
                      <CopyCheckIcon className="mr-1 h-4 w-4 text-success" />
                      Copied!
                    </>
                  )
                : (
                    <>
                      <CopyIcon className="mr-1 h-4 w-4" />
                      Copy
                    </>
                  )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shadow-sm border-primary text-primary hover:text-primary/90 hover:border-primary/90 hover:cursor-pointer"
              onClick={handleDownload}
            >
              <DownloadIcon className="mr-1 h-4 w-4" />
              Download
            </Button>
          </>
        )}

        {/* Language Selection dropdown (only visible in edit mode) */}
        {supportedLanguages && onLanguageChange && language && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={isLanguageSelectDisabled || isReadOnly}
                className="h-8 w-[200px] justify-between bg-background/90 text-xs shadow-sm hover:bg-background"
              >
                {language
                  ? (() => {
                      const selectedLang = supportedLanguages.find((lang) => lang.value === language);
                      const Icon = selectedLang?.icon;
                      return (
                        <>
                          {Icon && <Icon size={14} color="currentColor" className="mr-1.5 shrink-0" />}
                          {selectedLang?.label}
                        </>
                      );
                    })()
                  : 'Select language'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search language..." />
                <CommandList>
                  <CommandEmpty>No language found.</CommandEmpty>
                  <CommandGroup>
                    {supportedLanguages.map((lang) => {
                      const Icon = lang.icon;
                      return (
                        <CommandItem
                          key={lang.value}
                          value={lang.value}
                          onSelect={(currentValue) => {
                            onLanguageChange(currentValue as Language);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              language === lang.value ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {Icon && <Icon size={16} color="currentColor" className="mr-2 shrink-0 text-current" />}
                          {lang.label}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
        placeholder={placeholderTexts ? '' : placeholder} // Empty when cycling, static when not
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
      {/* Custom cycling placeholder with fade animation */}
      {placeholderTexts && !code && (
        <div
          className="absolute top-0 left-0 px-3 py-2 pointer-events-none font-mono text-sm text-muted-foreground/50"
          style={{
            transition: 'opacity 200ms ease-in-out',
            opacity: isVisible ? 1 : 0,
            minWidth: '100%',
          }}
        >
          {effectivePlaceholder}
        </div>
      )}
    </div>
  );
}

export const CodeEditor = withErrorBoundary(CodeEditorComponent, {
  FallbackComponent: ({ error, resetErrorBoundary }) => (
    <CodeEditorErrorFallback error={error} resetError={resetErrorBoundary} />
  ),
});
