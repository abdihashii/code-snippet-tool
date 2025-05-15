import type { Language } from '@snippet-share/types';

import { ShieldIcon, Wand2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSnippetForm } from '@/hooks/use-snippet-form';

import { CodeEditor } from './code-editor';

interface SnippetFormProps {
  onSnippetCreated: (link: string) => void;
}

export function SnippetForm({ onSnippetCreated }: SnippetFormProps) {
  const {
    // Form field states and setters
    code,
    setCode,
    title,
    setTitle,
    language,
    setLanguage,
    uploaderInfo,
    setUploaderInfo,
    expiresAfter,
    setExpiresAfter,
    maxViews,
    setMaxViews,
    isSubmitting,
    isPrettifying,
    canPrettifyCurrentLanguage,

    // Derived/Computed values for rendering (from useCodeHighlighting via useSnippetForm)
    highlightedHtml,
    codeClassName,

    // Actions
    handleSubmit,
    prettifyCode,

    // Constants and static data
    SUPPORTED_LANGUAGES,
    MAX_CODE_LENGTH,
  } = useSnippetForm({ onSnippetCreated });

  return (
    <Card className="w-full shadow-md border-slate-200 bg-white">
      <form onSubmit={handleSubmit}>
        <CardContent className="mb-8">
          <div className="flex flex-col gap-4">
            {/* Code editor */}
            <CodeEditor
              code={code}
              onCodeChange={setCode}
              highlightedHtml={highlightedHtml}
              codeClassName={codeClassName}
              MAX_CODE_LENGTH={MAX_CODE_LENGTH}
              isReadOnly={isSubmitting}
            />

            <div className="flex justify-between items-center gap-4 text-right text-sm text-slate-500">
              {/* Prettify button */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={prettifyCode}
                        disabled={isPrettifying || (!code.trim()) || !canPrettifyCurrentLanguage}
                        className="border-teal-600 text-teal-600 hover:text-teal-700 hover:border-teal-700 hover:cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Wand2Icon className="h-4 w-4" />
                        {isPrettifying ? 'Prettifying...' : 'Prettify Code'}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {code === ''
                      ? 'Paste your code to start prettifying'
                      : canPrettifyCurrentLanguage
                        ? 'Prettify code for the current language'
                        : 'Cannot prettify code for the current language'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Character count */}
              <div>
                {code.length}
                {' '}
                /
                {' '}
                {MAX_CODE_LENGTH.toLocaleString()}
                {' '}
                characters
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Snippet Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="My awesome code"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="language"
                >
                  Language (for syntax highlighting)
                </Label>
                <Select
                  value={language}
                  onValueChange={(value) => setLanguage(value as Language)}
                >
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map(
                      (lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="uploader-info"
              >
                Your Name/Note (Optional, shown to recipient)
              </Label>
              <Input
                id="uploader-info"
                placeholder="John Doe"
                value={uploaderInfo}
                onChange={(e) => setUploaderInfo(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <h3
                className="text-sm font-medium text-slate-700"
              >
                Link Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="expires-after">Expires After</Label>
                  <Select value={expiresAfter} onValueChange={setExpiresAfter}>
                    <SelectTrigger id="expires-after" className="w-full">
                      <SelectValue placeholder="Select expiration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="max-views">Max Views</Label>
                  <Select value={maxViews} onValueChange={setMaxViews}>
                    <SelectTrigger id="max-views" className="w-full">
                      <SelectValue placeholder="Select max views" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                      <SelectItem
                        value="1"
                      >
                        1 View (Burn after reading)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 hover:cursor-pointer flex items-center justify-center gap-2"
            disabled={!code.trim() || isSubmitting}
          >
            <ShieldIcon className="h-4 w-4" />
            {isSubmitting
              ? 'Creating Secure Snippet...'
              : 'Create Secure Snippet'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
