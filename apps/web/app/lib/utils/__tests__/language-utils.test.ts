import type { Language } from '@snippet-share/types';

import { describe, expect, it } from 'vitest';

import { getFileExtensionForLanguage } from '@/lib/utils/language-utils';

describe('getFileExtensionForLanguage', () => {
  it('should return .js for JAVASCRIPT', () => {
    expect(getFileExtensionForLanguage('JAVASCRIPT')).toBe('.js');
  });

  it('should return .ts for TYPESCRIPT', () => {
    expect(getFileExtensionForLanguage('TYPESCRIPT')).toBe('.ts');
  });

  it('should return .py for PYTHON', () => {
    expect(getFileExtensionForLanguage('PYTHON')).toBe('.py');
  });

  it('should return .html for HTML', () => {
    expect(getFileExtensionForLanguage('HTML')).toBe('.html');
  });

  it('should return .css for CSS', () => {
    expect(getFileExtensionForLanguage('CSS')).toBe('.css');
  });

  it('should return .java for JAVA', () => {
    expect(getFileExtensionForLanguage('JAVA')).toBe('.java');
  });

  it('should return .sh for BASH', () => {
    expect(getFileExtensionForLanguage('BASH')).toBe('.sh');
  });

  it('should return .md for MARKDOWN', () => {
    expect(getFileExtensionForLanguage('MARKDOWN')).toBe('.md');
  });

  it('should return .cs for CSHARP', () => {
    expect(getFileExtensionForLanguage('CSHARP')).toBe('.cs');
  });

  it('should return .sql for SQL', () => {
    expect(getFileExtensionForLanguage('SQL')).toBe('.sql');
  });

  it('should return .rs for RUST', () => {
    expect(getFileExtensionForLanguage('RUST')).toBe('.rs');
  });

  it('should return .php for PHP', () => {
    expect(getFileExtensionForLanguage('PHP')).toBe('.php');
  });

  it('should return .rb for RUBY', () => {
    expect(getFileExtensionForLanguage('RUBY')).toBe('.rb');
  });

  it('should return .go for GO', () => {
    expect(getFileExtensionForLanguage('GO')).toBe('.go');
  });

  it('should return .c for C', () => {
    expect(getFileExtensionForLanguage('C')).toBe('.c');
  });

  it('should return .cpp for CPP', () => {
    expect(getFileExtensionForLanguage('CPP')).toBe('.cpp');
  });

  it('should return .json for JSON', () => {
    expect(getFileExtensionForLanguage('JSON')).toBe('.json');
  });

  it('should return .txt for PLAINTEXT', () => {
    expect(getFileExtensionForLanguage('PLAINTEXT')).toBe('.txt');
  });

  it('should return .txt for unknown language as fallback', () => {
    // @ts-expect-error Testing fallback behavior with invalid language
    expect(getFileExtensionForLanguage('UNKNOWN')).toBe('.txt');
  });

  it('should handle all supported languages', () => {
    const supportedLanguages: Language[] = [
      'JAVASCRIPT',
      'TYPESCRIPT',
      'PYTHON',
      'HTML',
      'CSS',
      'JAVA',
      'BASH',
      'MARKDOWN',
      'CSHARP',
      'SQL',
      'RUST',
      'PHP',
      'RUBY',
      'GO',
      'C',
      'CPP',
      'JSON',
      'PLAINTEXT',
    ];

    const expectedExtensions = [
      '.js',
      '.ts',
      '.py',
      '.html',
      '.css',
      '.java',
      '.sh',
      '.md',
      '.cs',
      '.sql',
      '.rs',
      '.php',
      '.rb',
      '.go',
      '.c',
      '.cpp',
      '.json',
      '.txt',
    ];

    supportedLanguages.forEach((lang, index) => {
      expect(getFileExtensionForLanguage(lang)).toBe(expectedExtensions[index]);
    });
  });
});
