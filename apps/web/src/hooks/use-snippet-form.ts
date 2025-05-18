import type { Language } from '@snippet-share/types';

import prettierPluginJava from 'prettier-plugin-java';
import parserBabel from 'prettier/plugins/babel';
import parserEstree from 'prettier/plugins/estree';
import parserHtml from 'prettier/plugins/html';
import parserMarkdown from 'prettier/plugins/markdown';
import parserTypescript from 'prettier/plugins/typescript';
import prettier from 'prettier/standalone';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { createSnippet } from '@/api/snippets-api';
import {
  SUPPORTED_LANGUAGES_FOR_HIGHLIGHTING,
  useCodeHighlighting,
} from '@/hooks/use-code-highlighting';

const MAX_CODE_LENGTH = 10_000;

interface LanguageOption {
  value: Language;
  label: string;
}

export const SUPPORTED_LANGUAGES_FOR_FORM: LanguageOption[]
= SUPPORTED_LANGUAGES_FOR_HIGHLIGHTING
  .map(
    ({ value, label }) => ({ value, label }),
  );

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

interface UseSnippetFormProps {
  onSnippetCreated?: (link: string) => void;
  initialCode?: string;
  initialLanguage?: Language;
}

export function useSnippetForm({
  onSnippetCreated,
  initialCode,
  initialLanguage,
}: UseSnippetFormProps) {
  const [code, setCode] = useState(initialCode ?? '');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<Language>(
    initialLanguage
    || SUPPORTED_LANGUAGES_FOR_FORM.find(
      (l) => l.value === 'PLAINTEXT',
    )?.value || SUPPORTED_LANGUAGES_FOR_FORM[0].value,
  );
  const [uploaderInfo, setUploaderInfo] = useState('');
  const [expiresAfter, setExpiresAfter] = useState('24h');
  const [maxViews, setMaxViews] = useState('unlimited');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrettifying, setIsPrettifying] = useState(false);

  const { highlightedHtml, codeClassName } = useCodeHighlighting(
    { code, language },
  );

  const canPrettifyCurrentLanguage = useMemo(() => {
    return !!PRETTIER_SUPPORT_MAP[language];
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (!onSnippetCreated) {
      throw new Error('onSnippetCreated is required');
    }

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
        // We can add global Prettier options here if needed
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

    // Constants
    SUPPORTED_LANGUAGES: SUPPORTED_LANGUAGES_FOR_FORM,
    MAX_CODE_LENGTH,
  };
}
