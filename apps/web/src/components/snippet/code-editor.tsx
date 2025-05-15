import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  highlightedHtml: string;
  codeClassName: string;
  isReadOnly?: boolean;
  MAX_CODE_LENGTH: number;
  placeholder?: string;
}

export function CodeEditor({
  code,
  onCodeChange,
  highlightedHtml,
  codeClassName,
  isReadOnly = false,
  MAX_CODE_LENGTH,
  placeholder = 'Paste your code here...',
}: CodeEditorProps) {
  return (
    <div className="relative w-full">
      <pre
        aria-hidden="true"
        className={cn(
          'absolute inset-0 rounded-md px-3 py-2 min-h-[300px] font-mono text-sm whitespace-pre-wrap break-words overflow-hidden pointer-events-none text-foreground',
          isReadOnly ? 'bg-muted' : 'bg-background',
        )}
      >
        <code
          className={`language-${codeClassName}`}
          dangerouslySetInnerHTML={{ __html: `${highlightedHtml}\n` }}
        />
      </pre>
      <Textarea
        placeholder={placeholder}
        className="relative z-10 bg-transparent text-transparent caret-gray-800 dark:caret-gray-100 min-h-[300px] font-mono text-sm resize-y w-full rounded-md border border-input px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
    </div>
  );
}
