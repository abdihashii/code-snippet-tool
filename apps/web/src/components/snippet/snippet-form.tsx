import type { Language } from '@snippet-share/types';

import {
  ChevronDownIcon,
  ChevronRightIcon,
  CopyCheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  RefreshCwIcon,
  ShieldIcon,
  Wand2Icon,
} from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import { useState } from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';

import { FormErrorFallback } from '@/components/error-fallback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSnippetForm } from '@/hooks/use-snippet-form';
import { cn } from '@/lib/utils';

import { CodeEditor } from './code-editor';

interface SnippetFormProps {
  onSnippetCreated: (
    result: { link: string; passwordWasSet: boolean },
  ) => void;
}

function SnippetFormComponent({ onSnippetCreated }: SnippetFormProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

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
    isPasswordProtectionEnabled,
    setIsPasswordProtectionEnabled,
    snippetPassword,
    setSnippetPassword,
    passwordStrengthAnalysis,
    handleGeneratePassword,
    showPassword,
    setShowPassword,
    passwordCopied,
    setPasswordCopied,
    selectedTab,
    setSelectedTab,

    // Derived/Computed values for rendering (from useCodeHighlighting via useSnippetForm)
    highlightedHtml,
    codeClassName,

    // Actions
    handleSubmit,
    prettifyCode,
    getPasswordStrengthColor,

    // Constants and static data
    SUPPORTED_LANGUAGES,
    MAX_CODE_LENGTH,
  } = useSnippetForm({ onSnippetCreated });
  const posthog = usePostHog();

  return (
    <Card className="w-full shadow-md">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6">
          <div className="space-y-6">
            <Tabs
              value={selectedTab}
              onValueChange={(value) => {
                posthog.capture('snippet_tab_change', { tab: value });
                setSelectedTab(value as 'code' | 'text');
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="code"
                  className="data-[state=active]:text-primary hover:cursor-pointer"
                >
                  Code
                </TabsTrigger>
                <TabsTrigger
                  value="text"
                  className="data-[state=active]:text-primary hover:cursor-pointer"
                >
                  Text
                </TabsTrigger>
              </TabsList>
              <TabsContent value="code">
                <CodeEditor
                  code={code}
                  onCodeChange={setCode}
                  highlightedHtml={highlightedHtml}
                  codeClassName={codeClassName}
                  MAX_CODE_LENGTH={MAX_CODE_LENGTH}
                  isReadOnly={isSubmitting}
                  language={language}
                  onLanguageChange={(value) => setLanguage(value as Language)}
                  supportedLanguages={SUPPORTED_LANGUAGES}
                  isLanguageSelectDisabled={selectedTab === 'text'}
                />
              </TabsContent>
              <TabsContent value="text">
                <div className="relative w-full">
                  <pre
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-0 rounded-md px-3 py-2 min-h-[150px] font-mono text-sm whitespace-pre-wrap break-words overflow-hidden pointer-events-none text-foreground',
                      isSubmitting ? 'bg-accent' : 'bg-background',
                    )}
                  >
                    <code>{`${code}\n`}</code>
                  </pre>
                  <Textarea
                    id="text-content"
                    placeholder="Paste your text here..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isSubmitting}
                    className="relative z-10 bg-transparent text-transparent caret-foreground min-h-[150px] font-mono text-sm resize-y"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center gap-4 text-right text-sm text-muted-foreground">
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
                        className="border-primary text-primary hover:text-primary/90 hover:border-primary/90 hover:cursor-pointer flex items-center justify-center gap-2"
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
              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="max-views">Max Views</Label>
                <Select value={maxViews} onValueChange={setMaxViews}>
                  <SelectTrigger id="max-views" className="w-full">
                    <SelectValue placeholder="Select max views" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                    <SelectItem value="1">1 View (Burn after reading)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Collapsible open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="link"
                  className="flex items-center gap-2 !p-0 text-sm text-primary hover:cursor-pointer hover:text-primary/90"
                >
                  {isOptionsOpen
                    ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      )
                    : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                  Optional Settings
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Snippet Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Snippet Title (Optional)</Label>
                      <Input
                        id="title"
                        placeholder="My Awesome Code"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    {/* Uploader Info */}
                    <div className="space-y-2">
                      <Label htmlFor="uploader-info">
                        Your Name/Note (Optional, shown to recipient)
                      </Label>
                      <Input
                        id="uploader-info"
                        placeholder="Muhammad Ali"
                        value={uploaderInfo}
                        onChange={(e) => setUploaderInfo(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password Protection Toggle */}
                  <div className="flex items-center space-x-2 pt-4">
                    <Checkbox
                      id="enablePassword"
                      checked={isPasswordProtectionEnabled}
                      onCheckedChange={(checked) => {
                        posthog.capture('password_protection_checkbox_click', { checked });

                        setIsPasswordProtectionEnabled(
                          checked === 'indeterminate' ? false : checked,
                        );
                      }}
                      className="hover:cursor-pointer"
                    />
                    <Label htmlFor="enablePassword" className="cursor-pointer">
                      Enable Password Protection (Premium Feature)
                    </Label>
                  </div>

                  {/* Password Input Field (conditional) */}
                  {isPasswordProtectionEnabled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="snippet-password">Password</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleGeneratePassword}
                          className="flex h-auto items-center gap-1 border border-primary px-2 py-1 text-xs text-primary hover:border-primary/90 hover:text-primary/90 hover:cursor-pointer"
                        >
                          <RefreshCwIcon className="h-3 w-3" />
                          Generate
                        </Button>
                      </div>
                      <div className="relative">
                        <Input
                          id="snippet-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter a strong password"
                          value={snippetPassword}
                          onChange={(e) => setSnippetPassword(e.target.value)}
                          disabled={isSubmitting}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-3">
                          <span
                            className="cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword
                              ? (
                                  <EyeIcon className="h-4 w-4" />
                                )
                              : (
                                  <EyeOffIcon className="h-4 w-4" />
                                )}
                          </span>
                          <span
                            className="cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(snippetPassword);
                              setPasswordCopied(true);
                              toast.success('Password copied to clipboard');
                              setTimeout(() => setPasswordCopied(false), 1500);
                            }}
                          >
                            {passwordCopied
                              ? (
                                  <CopyCheckIcon className="h-4 w-4 text-primary" />
                                )
                              : (
                                  <CopyIcon className="h-4 w-4" />
                                )}
                          </span>
                        </div>
                      </div>
                      {/* Password strength and suggestions display */}
                      {isPasswordProtectionEnabled
                        && passwordStrengthAnalysis && (
                        <div className="pt-2 text-xs">
                          {/* Overall Strength */}
                          <div className="mb-1">
                            <span className="font-medium">
                              Strength:
                              {' '}
                            </span>
                            <span
                              className={getPasswordStrengthColor(
                                passwordStrengthAnalysis.strength,
                              )}
                            >
                              {passwordStrengthAnalysis.strength}
                            </span>
                          </div>

                          {/* Suggestions List */}
                          {passwordStrengthAnalysis.criteria.length > 0 && (
                            <div>
                              <span className="font-medium text-muted-foreground">
                                We suggest:
                              </span>
                              <ul className="list-none pl-0 pt-1 space-y-0.5">
                                {passwordStrengthAnalysis.criteria.map(
                                  (criterion) => (
                                    <li
                                      key={criterion.key}
                                      className={
                                        criterion.isMet
                                          ? 'text-success'
                                          : 'text-muted-foreground'
                                      }
                                    >
                                      {/* Simple checkmark or cross, or just rely on color */}
                                      {criterion.isMet ? '✓' : '-'}
                                      {' '}
                                      {criterion.label}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center p-6 pt-0">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 hover:cursor-pointer flex items-center justify-center gap-2"
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

export const SnippetForm = withErrorBoundary(SnippetFormComponent, {
  FallbackComponent: ({ error, resetErrorBoundary }) => (
    <FormErrorFallback error={error} resetError={resetErrorBoundary} />
  ),
});
