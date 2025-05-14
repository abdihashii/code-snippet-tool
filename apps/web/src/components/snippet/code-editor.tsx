import type { Language } from '@snippet-share/types';

import { useSnippetForm } from '@/hooks/use-snippet-form';

import { Textarea } from '../ui/textarea';

export function CodeEditor({
  isReadOnly = false,
  initialCode,
  initialLanguage,
}: {
  onSnippetCreated: (link: string) => void;
  isReadOnly: boolean;
  initialCode?: string;
  initialLanguage?: Language;
}) {
  const {
    // Form field states and setters
    code,
    setCode,

    // Derived/Computed values for rendering
    codeClassName,
    highlightedHtml,

    // Constants and static data
    MAX_CODE_LENGTH,
  } = useSnippetForm({ initialCode, initialLanguage });

  return (
    <div className="relative w-full">
      <pre
        aria-hidden="true"
        className="absolute inset-0 rounded-md bg-background px-3 py-2 min-h-[300px] font-mono text-sm whitespace-pre-wrap break-words overflow-hidden pointer-events-none text-foreground"
      >
        <code
          className={`language-${codeClassName}`}
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
        disabled={isReadOnly}
      />
    </div>
  );
}
