import type { Language } from '@snippet-share/types';

import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import plaintext from 'highlight.js/lib/languages/plaintext';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface LanguageOption {
  value: Language;
  label: string;
  hljsId: string;
}

// Single source of truth for supported languages, primarily for hljsId here
export const SUPPORTED_LANGUAGES_FOR_HIGHLIGHTING: LanguageOption[] = [
  { value: 'PLAINTEXT', label: 'Plain Text', hljsId: 'plaintext' },
  { value: 'JSON', label: 'JSON', hljsId: 'json' },
  { value: 'JAVASCRIPT', label: 'JavaScript / JSX', hljsId: 'javascript' },
  { value: 'PYTHON', label: 'Python', hljsId: 'python' },
  // HTML uses the 'xml' grammar in hljs
  { value: 'HTML', label: 'HTML', hljsId: 'xml' },
  { value: 'CSS', label: 'CSS', hljsId: 'css' },
  { value: 'TYPESCRIPT', label: 'TypeScript / TSX', hljsId: 'typescript' },
  { value: 'JAVA', label: 'Java', hljsId: 'java' },
  { value: 'BASH', label: 'Bash', hljsId: 'bash' },
  { value: 'MARKDOWN', label: 'Markdown', hljsId: 'markdown' },
  { value: 'CSHARP', label: 'C#', hljsId: 'csharp' },
];

// languageLoaders: keys are hljsId, ensure they match
// SUPPORTED_LANGUAGES_FOR_HIGHLIGHTING' hljsId
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

interface UseCodeHighlightingProps {
  code: string;
  language: Language;
}

export function useCodeHighlighting({
  code,
  language,
}: UseCodeHighlightingProps) {
  const [loadedLanguages, setLoadedLanguages] = useState(
    () => new Set(['plaintext']),
  );

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
      console.warn(
        `No dynamic loader defined for language: ${langIdentifier}`,
      );
    }
  }, [loadedLanguages]);

  // Effect called when the component mounts to ensure the plaintext language
  // is registered
  useEffect(() => {
    if (!hljs.getLanguage('plaintext')) {
      hljs.registerLanguage('plaintext', plaintext);
    }
  }, []);

  // Effect called when the language prop changes to ensure the correct
  // language is registered (i.e. the language is available in the
  // SUPPORTED_LANGUAGES_FOR_HIGHLIGHTING array)
  useEffect(() => {
    const langOption = SUPPORTED_LANGUAGES_FOR_HIGHLIGHTING
      .find((l) => l.value === language);
    const targetHljsId = langOption?.hljsId;
    if (targetHljsId && !hljs.getLanguage(targetHljsId)) {
      loadHljsLanguage(targetHljsId);
    }
  }, [language, loadHljsLanguage]);

  // Memoized value that returns the actual language identifier for hljs
  // based on the language prop. This is used to ensure the correct language
  // is used for highlighting.
  const actualLangForHljs = useMemo(() => {
    const langOption = SUPPORTED_LANGUAGES_FOR_HIGHLIGHTING
      .find((l) => l.value === language);
    const currentHljsId = langOption?.hljsId;
    if (currentHljsId && hljs.getLanguage(currentHljsId)) {
      return currentHljsId;
    }
    return 'plaintext';
    // loadedLanguages ensures re-evaluation when a new lang is loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, loadedLanguages]);

  // Memoized value that sets the class name for the code element based on the
  // language prop. This is used to ensure the correct language is used for
  // highlighting.
  const codeClassName = useMemo(() => {
    // Special case for HTML to ensure it gets 'html' class if 'xml' is used by
    // hljs
    if (language === 'HTML') {
      return 'html';
    }
    const langOption = SUPPORTED_LANGUAGES_FOR_HIGHLIGHTING
      .find((l) => l.value === language);
    if (langOption?.hljsId && hljs.getLanguage(langOption.hljsId)) {
      return langOption.hljsId;
    }
    // Fallback to actualLangForHljs if specific language option isn't found or
    // loaded
    return actualLangForHljs;
    // loadedLanguages ensures re-evaluation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, actualLangForHljs, loadedLanguages]);

  // Memoized value that returns the highlighted HTML for the code. This is
  // used to ensure the correct language is used for highlighting.
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
        // Fallback to unhighlighted code on error
        return DOMPurify.sanitize(codeToHighlight);
      }
    }
    // Fallback to unhighlighted code if language not available
    return DOMPurify.sanitize(codeToHighlight);
  }, [code, actualLangForHljs]);

  return {
    // Derived/Computed values for rendering
    actualLangForHljs,
    codeClassName,
    highlightedHtml,

    // Constants
    SUPPORTED_LANGUAGES: SUPPORTED_LANGUAGES_FOR_HIGHLIGHTING,
  };
}
