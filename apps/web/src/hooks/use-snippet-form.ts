import type { Language } from '@snippet-share/types';

import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import plaintext from 'highlight.js/lib/languages/plaintext';
import prettierPluginJava from 'prettier-plugin-java';
import parserBabel from 'prettier/plugins/babel';
import parserEstree from 'prettier/plugins/estree';
import parserHtml from 'prettier/plugins/html';
import parserMarkdown from 'prettier/plugins/markdown';
import parserTypescript from 'prettier/plugins/typescript';
import prettier from 'prettier/standalone';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { createSnippet } from '@/api/snippets-api';

interface UseSnippetFormProps {
  onSnippetCreated: (link: string) => void;
}

const MAX_CODE_LENGTH = 10_000;

interface LanguageOption {
  value: Language;
  label: string;
  hljsId: string;
}

// Single source of truth for supported languages
const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { value: 'PLAINTEXT', label: 'Plain Text', hljsId: 'plaintext' },
  { value: 'JSON', label: 'JSON', hljsId: 'json' },
  { value: 'JAVASCRIPT', label: 'JavaScript', hljsId: 'javascript' },
  { value: 'PYTHON', label: 'Python', hljsId: 'python' },
  { value: 'HTML', label: 'HTML', hljsId: 'xml' }, // HTML uses the 'xml' grammar in hljs
  { value: 'CSS', label: 'CSS', hljsId: 'css' },
  { value: 'TYPESCRIPT', label: 'TypeScript', hljsId: 'typescript' },
  { value: 'JAVA', label: 'Java', hljsId: 'java' },
  { value: 'BASH', label: 'Bash', hljsId: 'bash' },
  { value: 'MARKDOWN', label: 'Markdown', hljsId: 'markdown' },
  { value: 'CSHARP', label: 'C#', hljsId: 'csharp' },
];

// languageLoaders: keys are hljsId, ensure they match SUPPORTED_LANGUAGES' hljsId
const languageLoaders: Record<string, () => Promise<any>> = {
  // 'plaintext' is loaded statically
  json: () => import('highlight.js/lib/languages/json'),
  javascript: () => import('highlight.js/lib/languages/javascript'),
  python: () => import('highlight.js/lib/languages/python'),
  // Loader for 'xml' (used by HTML)
  xml: () => import('highlight.js/lib/languages/xml'),
  css: () => import('highlight.js/lib/languages/css'),
  typescript: () => import('highlight.js/lib/languages/typescript'),
  java: () => import('highlight.js/lib/languages/java'),
  bash: () => import('highlight.js/lib/languages/bash'),
  markdown: () => import('highlight.js/lib/languages/markdown'),
  csharp: () => import('highlight.js/lib/languages/csharp'),
};

interface PrettierConfig {
  parser: string;
  plugins: any[];
}

// These are the core plugins that are always available
const coreParserPlugins = [
  parserBabel,
  parserEstree,
  parserTypescript,
  parserHtml,
  parserMarkdown,
];

// Ensure external plugins are filtered for valid plugin objects and flattened
// if they are arrays
const externalCommunityPlugins = [
  prettierPluginJava,
]
  .flatMap((p) => p)
  .filter((p) => p && typeof p === 'object');

// Spread the core and external plugins together to create a single array
const allAvailablePlugins = [
  ...coreParserPlugins,
  ...externalCommunityPlugins,
];

// Map of languages to their corresponding Prettier config
const PRETTIER_SUPPORT_MAP: Partial<Record<Language, PrettierConfig>> = {
  JSON: { parser: 'json5', plugins: allAvailablePlugins },
  JAVASCRIPT: { parser: 'babel', plugins: allAvailablePlugins },
  HTML: { parser: 'html', plugins: allAvailablePlugins },
  CSS: { parser: 'css', plugins: allAvailablePlugins },
  TYPESCRIPT: { parser: 'typescript', plugins: allAvailablePlugins },
  JAVA: { parser: 'java', plugins: allAvailablePlugins },
  MARKDOWN: {
    parser: 'markdown',
    plugins: allAvailablePlugins,
  },
};

export function useSnippetForm({ onSnippetCreated }: UseSnippetFormProps) {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<Language>(
    SUPPORTED_LANGUAGES.find(
      (l) => l.value === 'PLAINTEXT',
    )?.value || SUPPORTED_LANGUAGES[0].value,
  );
  const [uploaderInfo, setUploaderInfo] = useState('');
  const [expiresAfter, setExpiresAfter] = useState('24h');
  const [maxViews, setMaxViews] = useState('unlimited');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedLanguages, setLoadedLanguages] = useState(
    () => new Set(['plaintext']),
  );
  const [isPrettifying, setIsPrettifying] = useState(false);

  const canPrettifyCurrentLanguage = useMemo(() => {
    return !!PRETTIER_SUPPORT_MAP[language];
  }, [language]);

  const loadHljsLanguage = useCallback(async (langIdentifier: string) => {
    if (hljs.getLanguage(langIdentifier) || langIdentifier === 'plaintext') {
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
          console.warn(
            `Module for ${langIdentifier} loaded but has no default export.`,
          );
        }
      } catch (error) {
        console.error(`Failed to load language ${langIdentifier}:`, error);
      }
    } else {
      console.warn(`No dynamic loader defined for language: ${langIdentifier}`);
    }
  }, [loadedLanguages]);

  useEffect(() => {
    if (!hljs.getLanguage('plaintext')) {
      hljs.registerLanguage('plaintext', plaintext);
    }
  }, []);

  useEffect(() => {
    const langOption = SUPPORTED_LANGUAGES.find((l) => l.value === language);
    const targetHljsId = langOption?.hljsId;
    if (targetHljsId && !hljs.getLanguage(targetHljsId)) {
      loadHljsLanguage(targetHljsId);
    }
  }, [language, loadHljsLanguage]);

  const actualLangForHljs = useMemo(() => {
    const langOption = SUPPORTED_LANGUAGES.find((l) => l.value === language);
    const currentHljsId = langOption?.hljsId;
    if (currentHljsId && hljs.getLanguage(currentHljsId)) {
      return currentHljsId;
    }
    return 'plaintext';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, loadedLanguages]);

  const codeClassName = useMemo(() => {
    if (language === 'HTML') {
      return 'html';
    }
    const langOption = SUPPORTED_LANGUAGES.find((l) => l.value === language);
    if (langOption?.hljsId && hljs.getLanguage(langOption.hljsId)) {
      return langOption.hljsId;
    }
    return actualLangForHljs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, actualLangForHljs, loadedLanguages]);

  const highlightedHtml = useMemo(() => {
    const codeToHighlight = code || '';
    if (hljs.getLanguage(actualLangForHljs)) {
      try {
        const rawHtml = hljs.highlight(codeToHighlight, {
          language: actualLangForHljs,
          ignoreIllegals: true,
        }).value;
        return DOMPurify.sanitize(rawHtml);
      } catch (error) {
        console.error(
          `Highlight.js error during highlight for language '${actualLangForHljs}':`,
          error,
        );
        return codeToHighlight;
      }
    }
    return codeToHighlight;
  }, [code, actualLangForHljs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const createSnippetResponse = await createSnippet({
        content: code,
        title: title === '' ? null : title,
        language,
        name: uploaderInfo === '' ? null : uploaderInfo,
        expires_at: expiresAfter === 'never' ? null : expiresAfter,
        max_views: maxViews === 'unlimited' ? null : Number.parseInt(maxViews),
      });

      if (!createSnippetResponse.success) {
        throw new Error(createSnippetResponse.message);
      }

      const link = `http://localhost:3000/s/${createSnippetResponse.id}`;
      onSnippetCreated(link);

      toast.success(createSnippetResponse.message);
    } catch (error) {
      console.error('Error creating snippet:', error);
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const prettifyCode = useCallback(async () => {
    const config = PRETTIER_SUPPORT_MAP[language];
    if (!config) {
      console.warn(
        `Prettifying is not supported for ${language}.`,
      );
      return;
    }

    setIsPrettifying(true);
    try {
      const formattedCode = await prettier.format(code, {
        parser: config.parser,
        plugins: config.plugins,
        // You can add global Prettier options here if needed
        // e.g., semi: true, singleQuote: true
      });
      setCode(formattedCode);
      toast.success('Code prettified successfully');
    } catch (error) {
      console.error(`Error prettifying ${language} code:`, error);
      toast.error('Error prettifying code');
    } finally {
      setIsPrettifying(false);
    }
  }, [code, language, setCode]);

  return {
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

    // Derived/Computed values for rendering
    highlightedHtml,
    codeClassName,
    canPrettifyCurrentLanguage,

    // Actions
    handleSubmit,
    prettifyCode,

    // Status
    isSubmitting,
    isPrettifying,

    // Constants and static data
    SUPPORTED_LANGUAGES,
    MAX_CODE_LENGTH,
  };
}
