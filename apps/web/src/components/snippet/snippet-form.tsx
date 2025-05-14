import type { Language } from '@snippet-share/types';
import type React from 'react';

import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import plaintext from 'highlight.js/lib/languages/plaintext';
import { Shield } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { createSnippet } from '@/api/snippets-api';
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
import { Textarea } from '@/components/ui/textarea';

interface SnippetFormProps {
  onSnippetCreated: (link: string) => void;
}

const MAX_CODE_LENGTH = 10_000;

// Moved languageMap to be a top-level constant
const languageMap: Record<Language, string> = {
  PLAINTEXT: 'plaintext',
  JSON: 'json',
  JAVASCRIPT: 'javascript',
  PYTHON: 'python',
  HTML: 'html', // Highlight.js uses 'xml' for HTML syntax
  CSS: 'css',
  TYPESCRIPT: 'typescript',
  JAVA: 'java',
  BASH: 'bash',
  MARKDOWN: 'markdown',
  CSHARP: 'csharp',
};

// Map language identifiers to their dynamic import functions
const languageLoaders: Record<string, () => Promise<any>> = {
  // 'plaintext' is loaded statically
  json: () => import('highlight.js/lib/languages/json'),
  javascript: () => import('highlight.js/lib/languages/javascript'),
  python: () => import('highlight.js/lib/languages/python'),
  html: () => import('highlight.js/lib/languages/xml'), // HTML uses XML
  css: () => import('highlight.js/lib/languages/css'),
  typescript: () => import('highlight.js/lib/languages/typescript'),
  java: () => import('highlight.js/lib/languages/java'),
  bash: () => import('highlight.js/lib/languages/bash'),
  markdown: () => import('highlight.js/lib/languages/markdown'),
  csharp: () => import('highlight.js/lib/languages/csharp'),
};

export function SnippetForm({ onSnippetCreated }: SnippetFormProps) {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<Language>('PLAINTEXT');
  const [uploaderInfo, setUploaderInfo] = useState('');
  const [expiresAfter, setExpiresAfter] = useState('24h');
  const [maxViews, setMaxViews] = useState('unlimited');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedLanguages, setLoadedLanguages] = useState(() => new Set(['plaintext']));

  // Function to dynamically load and register a highlight.js language
  const loadHljsLanguage = useCallback(async (langIdentifier: string) => {
    // If language is already loaded by hljs or is plaintext (handled statically/initially)
    if (hljs.getLanguage(langIdentifier) || langIdentifier === 'plaintext') {
      // Ensure it's in our tracking set if not already
      if (!loadedLanguages.has(langIdentifier)) {
        setLoadedLanguages((prev) => new Set(prev).add(langIdentifier));
      }
      return;
    }

    const loader = languageLoaders[langIdentifier];
    if (loader) {
      try {
        const module = await loader();
        if (module && module.default) {
          hljs.registerLanguage(langIdentifier, module.default);
          setLoadedLanguages((prev) => new Set(prev).add(langIdentifier));
        } else {
          console.warn(`Module for ${langIdentifier} loaded but has no default export.`);
        }
      } catch (error) {
        console.error(`Failed to load language ${langIdentifier}:`, error);
      }
    } else {
      console.warn(`No dynamic loader defined for language: ${langIdentifier}`);
    }
  }, [loadedLanguages]);

  // Effect for initial plaintext registration. This is run once on mount.
  useEffect(() => {
    // Ensure plaintext is registered (it's imported statically)
    if (!hljs.getLanguage('plaintext')) {
      hljs.registerLanguage('plaintext', plaintext);
      // loadedLanguages is initialized with plaintext, so no state update
      // needed here
    }
    // No need to explicitly load initial language here, as the effect below
    // will handle it
    // based on the initial `language` state.
  }, []);

  // Effect to load a language when the `language` state changes
  useEffect(() => {
    const targetHljsLang = languageMap[language];
    if (targetHljsLang && !hljs.getLanguage(targetHljsLang)) {
      loadHljsLanguage(targetHljsLang);
    }
  }, [language, loadHljsLanguage]);

  // Get the actual language for hljs, considering loaded languages
  const actualLangForHljs = useMemo(() => {
    const mappedLang = languageMap[language];
    if (mappedLang && hljs.getLanguage(mappedLang)) {
      return mappedLang;
    }
    return 'plaintext'; // Fallback to plaintext
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, loadedLanguages]);

  // Highlight the code with the actual language for hljs by using the
  // actualLangForHljs value.
  const highlightedHtml = useMemo(() => {
    const codeToHighlight = code || '';
    // CRITICAL: Only attempt to highlight if highlight.js has the language
    // loaded. actualLangForHljs provides the *name* of the language we want.
    if (hljs.getLanguage(actualLangForHljs)) {
      try {
        const rawHtml = hljs.highlight(
          codeToHighlight,
          { language: actualLangForHljs, ignoreIllegals: true },
        ).value;
        return DOMPurify.sanitize(rawHtml);
      } catch (error) {
        console.error(`Highlight.js error during highlight for language '${actualLangForHljs}':`, error);
        // Fallback to plain code on an unexpected error during highlighting
        // No need to sanitize here as it's plain text
        return codeToHighlight;
      }
    }
    // If the language isn't registered yet, return the unhighlighted code.
    // No need to sanitize here as it's plain text
    return codeToHighlight;
  }, [code, actualLangForHljs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const snippet = await createSnippet({
        encrypted_content: code,
        // title is optional, make it null if empty
        title: title === '' ? null : title,
        language,
        // name is optional, make it null if empty
        name: uploaderInfo === '' ? null : uploaderInfo,
        // expires_at is optional, make it null if never
        expires_at: expiresAfter === 'never' ? null : expiresAfter,
        // max_views is optional, make it null if unlimited
        max_views: maxViews === 'unlimited' ? null : Number.parseInt(maxViews),
      });

      const link = `http://localhost:3000/s/${snippet.id}/${snippet.secret_key}`;

      onSnippetCreated(link);
    } catch (error) {
      console.error('Error creating snippet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-md border-slate-200 bg-white">
      <form onSubmit={handleSubmit}>
        <CardContent className="py-6">
          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <pre
                aria-hidden="true"
                className="absolute inset-0 rounded-md bg-background px-3 py-2 min-h-[300px] font-mono text-sm whitespace-pre-wrap break-words overflow-hidden pointer-events-none text-foreground"
              >
                <code
                  className={`language-${actualLangForHljs}`}
                  dangerouslySetInnerHTML={{ __html: `${highlightedHtml}\n` }}
                />
              </pre>
              <Textarea
                placeholder="Paste your code here..."
                className="relative z-10 bg-transparent text-transparent caret-gray-800 dark:caret-gray-100 min-h-[300px] font-mono text-sm resize-y w-full rounded-md border border-input px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={code}
                onChange={(e) => {
                  const newCode = e.target.value;
                  if (newCode.length <= MAX_CODE_LENGTH) {
                    setCode(newCode);
                  } else {
                    setCode(newCode.substring(0, MAX_CODE_LENGTH));
                  }
                }}
                required
                spellCheck="false"
              />
            </div>

            <div className="text-right text-sm text-slate-500">
              {code.length}
              {' '}
              /
              {MAX_CODE_LENGTH}
              {' '}
              characters
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
                    <SelectItem value="PLAINTEXT">Plain Text</SelectItem>
                    <SelectItem value="JSON">JSON</SelectItem>
                    <SelectItem value="JAVASCRIPT">JavaScript</SelectItem>
                    <SelectItem value="PYTHON">Python</SelectItem>
                    <SelectItem value="HTML">HTML</SelectItem>
                    <SelectItem value="CSS">CSS</SelectItem>
                    <SelectItem value="TYPESCRIPT">TypeScript</SelectItem>
                    <SelectItem value="JAVA">Java</SelectItem>
                    <SelectItem value="BASH">Bash</SelectItem>
                    <SelectItem value="MARKDOWN">Markdown</SelectItem>
                    <SelectItem value="CSHARP">C#</SelectItem>
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

        <CardFooter className="flex justify-center pb-6">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700"
            disabled={!code.trim() || isSubmitting}
          >
            <Shield className="mr-2 h-4 w-4" />
            {isSubmitting
              ? 'Creating Secure Snippet...'
              : 'Create Secure Snippet'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
