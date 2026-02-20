import type { Language } from '@snippet-share/types';

/**
 * Maps a Language type to its corresponding file extension.
 *
 * @param language - The programming language type
 * @returns The file extension for the language (including the dot, e.g., ".js")
 *
 * @example
 * ```ts
 * getFileExtensionForLanguage('JAVASCRIPT') // returns '.js'
 * getFileExtensionForLanguage('PYTHON') // returns '.py'
 * getFileExtensionForLanguage('PLAINTEXT') // returns '.txt'
 * ```
 */
export function getFileExtensionForLanguage(language: Language): string {
  const extensionMap: Record<Language, string> = {
    JAVASCRIPT: '.js',
    TYPESCRIPT: '.ts',
    PYTHON: '.py',
    HTML: '.html',
    CSS: '.css',
    JAVA: '.java',
    BASH: '.sh',
    MARKDOWN: '.md',
    CSHARP: '.cs',
    SQL: '.sql',
    RUST: '.rs',
    PHP: '.php',
    RUBY: '.rb',
    GO: '.go',
    C: '.c',
    CPP: '.cpp',
    JSON: '.json',
    PLAINTEXT: '.txt',
    DOTENV: '.env',
    YAML: '.yml',
    TOML: '.toml',
  };

  return extensionMap[language] || '.txt';
}
