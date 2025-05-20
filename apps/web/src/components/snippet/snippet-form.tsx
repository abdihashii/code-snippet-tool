import type { Language } from '@snippet-share/types';

import {
  CopyCheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  RefreshCwIcon,
  ShieldIcon,
  Wand2Icon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
                  placeholder="My Awesome Code"
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
                placeholder="Muhammad Ali"
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

            <div className="flex flex-col gap-2">
              {/* Password Protection Toggle */}
              <div className="flex items-center space-x-2 my-4">
                <Checkbox
                  id="enablePassword"
                  checked={isPasswordProtectionEnabled}
                  onCheckedChange={
                    (checked) => setIsPasswordProtectionEnabled(
                      checked === 'indeterminate'
                        ? false
                        : checked,
                    )
                  }
                />
                <Label htmlFor="enablePassword" className="cursor-pointer">
                  Enable Password Protection (Premium Feature)
                </Label>
              </div>

              {/* Password Input Field (conditional) */}
              {isPasswordProtectionEnabled && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="snippet-password">Password</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGeneratePassword}
                      className="text-xs px-2 py-1 h-auto border-slate-300 hover:bg-slate-50 flex items-center gap-1"
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
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-3"
                    >
                      <span
                        className="cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword
                          ? <EyeIcon className="h-4 w-4" />
                          : <EyeOffIcon className="h-4 w-4" />}
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
                        {
                          passwordCopied
                            ? (
                                <CopyCheckIcon
                                  className="h-4 w-4 text-teal-600"
                                />
                              )
                            : <CopyIcon className="h-4 w-4" />
                        }
                      </span>
                    </div>
                  </div>
                  {/* Password strength and suggestions display */}
                  {isPasswordProtectionEnabled && passwordStrengthAnalysis && (
                    <div className="mt-2 text-xs">
                      {/* Overall Strength */}
                      <div className="mb-1">
                        <span className="font-medium">Strength: </span>
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
                          <span
                            className="font-medium text-slate-600"
                          >
                            We suggest:
                          </span>
                          <ul className="list-none pl-0 mt-1 space-y-0.5">
                            {passwordStrengthAnalysis.criteria.map((criterion) => (
                              <li
                                key={criterion.key}
                                className={criterion.isMet ? 'text-teal-600' : 'text-slate-500'}
                              >
                                {/* Simple checkmark or cross, or just rely on color */}
                                {criterion.isMet ? '✓' : '-'}
                                {' '}
                                {criterion.label}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
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
