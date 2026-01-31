import type { Language } from '@snippet-share/types';

import { Check, ChevronsUpDown, CopyCheckIcon, CopyIcon, DownloadIcon } from 'lucide-react';
import { useState } from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import Editor from 'react-simple-code-editor';

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
import { usePlaceholderCycle } from '@/hooks/use-placeholder-cycle';
import { useProductAnalytics } from '@/hooks/use-product-analytics';
import { cn } from '@/lib/utils';
import { getFileExtensionForLanguage } from '@/lib/utils/language-utils';

export interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  highlightCode: (code: string) => string;
  isReadOnly?: boolean;
  MAX_CODE_LENGTH: number;
  placeholder?: string;
  placeholderTexts?: string[];
  title?: string;
  language?: Language;
  onLanguageChange?: (language: Language) => void;
  supportedLanguages?: readonly { value: Language; label: string; icon?: React.ComponentType<any> }[];
  isLanguageSelectDisabled?: boolean;
  ctaButton?: React.ReactNode;
  onCopy?: () => void;
  onDownload?: () => void;
}

function CodeEditorComponent({
  code,
  onCodeChange,
  highlightCode,
  isReadOnly = false,
  MAX_CODE_LENGTH,
  placeholder = 'Paste your code here...',
  placeholderTexts,
  title,
  language,
  onLanguageChange,
  supportedLanguages,
  isLanguageSelectDisabled,
  ctaButton,
  onCopy,
  onDownload,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const { trackCodeCopied, trackSnippetDownloaded } = useProductAnalytics();

  const { text: cyclingPlaceholder, isVisible } = usePlaceholderCycle(
    placeholderTexts || [],
    Boolean(placeholderTexts && !code),
  );

  const effectivePlaceholder = placeholderTexts ? cyclingPlaceholder : placeholder;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackCodeCopied();
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const handleDownload = () => {
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
    onDownload?.();
  };

  const handleCodeChange = (newCode: string) => {
    if (newCode.length <= MAX_CODE_LENGTH) {
      onCodeChange(newCode);
    } else {
      onCodeChange(newCode.substring(0, MAX_CODE_LENGTH));
    }
  };

  return (
    <div className="relative w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2 mb-2">
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
            {ctaButton && (
              <>
                <div className="h-4 w-px bg-border mx-1" />
                {ctaButton}
              </>
            )}
          </>
        )}

        {supportedLanguages && onLanguageChange && language && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={isLanguageSelectDisabled || isReadOnly}
                className="h-8 w-[200px] justify-between bg-background text-xs shadow-sm hover:bg-background/90"
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

      {/* Editor */}
      <div
        className={cn(
          'ph-no-capture relative rounded-md border border-input',
          isReadOnly ? 'bg-accent' : 'bg-background',
        )}
      >
        <Editor
          value={code}
          onValueChange={handleCodeChange}
          highlight={highlightCode}
          disabled={isReadOnly}
          placeholder={effectivePlaceholder}
          padding={12}
          className="min-h-[300px]"
          textareaClassName="focus:outline-none"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
        />

        {/* Cycling placeholder overlay */}
        {placeholderTexts && !code && (
          <div
            className="absolute top-0 left-0 p-3 pointer-events-none font-mono text-sm text-muted-foreground/50"
            style={{
              transition: 'opacity 200ms ease-in-out',
              opacity: isVisible ? 1 : 0,
            }}
          >
            {effectivePlaceholder}
          </div>
        )}
      </div>
    </div>
  );
}

export const CodeEditor = withErrorBoundary(CodeEditorComponent, {
  FallbackComponent: ({ error, resetErrorBoundary }) => (
    <CodeEditorErrorFallback error={error} resetError={resetErrorBoundary} />
  ),
});
