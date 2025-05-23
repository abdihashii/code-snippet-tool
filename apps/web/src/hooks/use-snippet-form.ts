import type { CreateSnippetPayload, Language } from '@snippet-share/types';

import prettierPluginJava from 'prettier-plugin-java';
import parserBabel from 'prettier/plugins/babel';
import parserEstree from 'prettier/plugins/estree';
import parserHtml from 'prettier/plugins/html';
import parserMarkdown from 'prettier/plugins/markdown';
import parserTypescript from 'prettier/plugins/typescript';
import prettier from 'prettier/standalone';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { PasswordStrengthAnalysis } from '@/lib/password-strength';

import { createSnippet } from '@/api/snippets-api';
import {
  SUPPORTED_LANGUAGES_FOR_HIGHLIGHTING,
  useCodeHighlighting,
} from '@/hooks/use-code-highlighting';
import {
  checkPasswordStrength,
  PasswordStrength,
} from '@/lib/password-strength';
import { generateStrongPassword } from '@/lib/password-utils';
import { arrayBufferToBase64, exportKeyToUrlSafeBase64 } from '@/lib/utils';

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
  onSnippetCreated?: (
    result: { link: string; passwordWasSet: boolean }
  ) => void;
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
  const [
    isPasswordProtectionEnabled,
    setIsPasswordProtectionEnabled,
  ] = useState(false);
  const [snippetPassword, setSnippetPassword] = useState('');
  const [passwordStrengthAnalysis, setPasswordStrengthAnalysis]
  = useState<PasswordStrengthAnalysis | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const { highlightedHtml, codeClassName } = useCodeHighlighting(
    { code, language },
  );

  // Effect to synchronize the internal code state if the initialCode prop
  // changes
  useEffect(() => {
    if (initialCode !== undefined) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setCode(initialCode ?? '');
    }
  }, [initialCode]);

  // Effect to check password strength
  useEffect(() => {
    if (isPasswordProtectionEnabled) {
      setPasswordStrengthAnalysis(checkPasswordStrength(snippetPassword));
    } else {
      // Reset strength if password protection is off
      setPasswordStrengthAnalysis(null);
    }
  }, [snippetPassword, isPasswordProtectionEnabled]);

  const handleGeneratePassword = useCallback(() => {
    const newPassword = generateStrongPassword();
    setSnippetPassword(newPassword);

    toast.info('Strong password generated and filled!');
  }, [setSnippetPassword]);

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
      // Generate a unique, cryptographically strong random Data Encryption Key
      // (DEK)
      const dek = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true, // exportable
        ['encrypt', 'decrypt'],
      );

      // Prepare for encryption by generating a random 12-byte initialization
      // vector (IV) for the AES-GCM algorithm.
      const ivContent = crypto.getRandomValues(
        new Uint8Array(12), // AES-GCM recommended IV size is 12 bytes
      );

      // Encode the code snippet into a buffer of bytes.
      const codeBuffer = new TextEncoder().encode(code);

      // Encrypt the raw code snippet using the DEK and the initialization
      // vector.
      // AES-GCM output is a single ArrayBuffer containing ciphertext +
      // authTag. The tag is typically the last 16 bytes (128 bits).
      const encryptedContentWithTag = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: ivContent },
        dek,
        codeBuffer,
      );

      // Assuming auth tag is 128 bits (16 bytes) and appended to the
      // ciphertext, we can extract the ciphertext and the auth tag.
      const encryptedSnippetBlob = encryptedContentWithTag.slice(
        0,
        encryptedContentWithTag.byteLength - 16,
      );
      const authTagContent = encryptedContentWithTag.slice(
        encryptedContentWithTag.byteLength - 16,
      );

      // Prepare the payload for the createSnippet API call.
      let payload: CreateSnippetPayload;
      let shareableLinkPath: string;
      let shareableLinkFragment = '';

      // If password protection is enabled and a password is provided, we
      // need to generate a unique salt and derive a Key Encryption Key
      // (KEK) from the password and the salt.
      if (isPasswordProtectionEnabled && snippetPassword) {
        // Premium Password-Protected Flow
        // Generate a unique 16-byte salt (kdf_salt)
        const kdfSalt = crypto.getRandomValues(new Uint8Array(16));

        // Derive Key Encryption Key (KEK) from user_password and kdf_salt
        const passwordKeyMaterial = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(snippetPassword),
          { name: 'PBKDF2' },
          false,
          ['deriveKey'],
        );

        // Prepare the parameters for the PBKDF2 key derivation function.
        const kdfParams = {
          name: 'PBKDF2',
          salt: kdfSalt,
          iterations: 100000, // Standard recommendation
          hash: 'SHA-256',
        };

        // Derive the Key Encryption Key (KEK) from the password and the salt.
        const kek = await crypto.subtle.deriveKey(
          kdfParams,
          passwordKeyMaterial,
          { name: 'AES-GCM', length: 256 }, // KEK for encrypting DEK
          false, // not exportable
          ['encrypt', 'decrypt'],
        );

        // Encrypt the DEK using the KEK
        const ivForDek = crypto.getRandomValues(new Uint8Array(12));

        // Export the DEK to encrypt it
        const dekExported = await crypto.subtle.exportKey('raw', dek);

        // Encrypt the DEK using the KEK and the initialization vector.
        const encryptedDekWithTag = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: ivForDek },
          kek,
          dekExported,
        );

        // Extract the ciphertext and the auth tag.
        const encryptedDek = encryptedDekWithTag.slice(
          0,
          encryptedDekWithTag.byteLength - 16,
        );
        const authTagForDek = encryptedDekWithTag.slice(
          encryptedDekWithTag.byteLength - 16,
        );

        // Prepare the payload for the createSnippet API call.
        payload = {
          // Unencrypted, required fields
          title: title === '' ? null : title,
          language,
          name: uploaderInfo === '' ? null : uploaderInfo,
          expires_at: expiresAfter === 'never' ? null : expiresAfter,
          max_views: maxViews === 'unlimited'
            ? null
            : Number.parseInt(maxViews),

          // Encrypted content and related crypto params
          encrypted_content: arrayBufferToBase64(encryptedSnippetBlob),
          initialization_vector: arrayBufferToBase64(ivContent),
          auth_tag: arrayBufferToBase64(authTagContent),

          // Encrypted DEK and related crypto params
          encrypted_dek: arrayBufferToBase64(encryptedDek),
          iv_for_dek: arrayBufferToBase64(ivForDek),
          auth_tag_for_dek: arrayBufferToBase64(authTagForDek),

          // KDF parameters
          kdf_salt: arrayBufferToBase64(kdfSalt),
          kdf_parameters: {
            iterations: kdfParams.iterations,
            hash: kdfParams.hash,
          },
        };
        shareableLinkPath = '/s/';
      } else {
        // Default/Free Flow - No password protection
        payload = {
          // Unencrypted, required fields
          title: title === '' ? null : title,
          language,
          name: uploaderInfo === '' ? null : uploaderInfo,
          expires_at: expiresAfter === 'never' ? null : expiresAfter,
          max_views: maxViews === 'unlimited'
            ? null
            : Number.parseInt(maxViews),

          // Encrypted content and related crypto params
          encrypted_content: arrayBufferToBase64(encryptedSnippetBlob),
          initialization_vector: arrayBufferToBase64(ivContent),
          auth_tag: arrayBufferToBase64(authTagContent),
        };
        shareableLinkPath = '/s/';
        shareableLinkFragment = `#${await exportKeyToUrlSafeBase64(dek)}`;
      }

      // Create the snippet by calling the createSnippet API.
      const createSnippetResponse = await createSnippet(payload);

      // If the snippet creation failed, handle error
      if (!createSnippetResponse.success) {
        throw new Error(
          createSnippetResponse.error || 'Failed to create snippet',
        );
      }

      // Extract the ID from the successful response
      const snippetId = createSnippetResponse.data.id;
      if (!snippetId) {
        throw new Error('No snippet ID returned from server');
      }

      // Construct the shareable link.
      const baseUrl = window.location.origin;
      const link = `${baseUrl}${shareableLinkPath}${snippetId}${shareableLinkFragment}`;

      // Call the callback function to notify the parent component that the
      onSnippetCreated({
        link,
        passwordWasSet: isPasswordProtectionEnabled && !!snippetPassword,
      });

      // Display a success message to the user depending on whether a password
      // was provided.
      if (isPasswordProtectionEnabled && snippetPassword) {
        toast.success(
          'Snippet created! Link copied. Remember to share the password securely.',
        );
      } else {
        toast.success(
          createSnippetResponse.message
          || 'Snippet created successfully! Link copied.',
        );
      }

      // Copy the link to the clipboard.
      navigator.clipboard.writeText(link).then(() => {
        toast.info('Shareable link copied to clipboard!');
      }).catch((err) => {
        console.warn('Failed to copy link to clipboard:', err);
        toast.warning(
          'Could not automatically copy link. Please copy it manually.',
        );
      });
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

  // Helper function for color based on strength
  function getPasswordStrengthColor(strength: PasswordStrength) {
    switch (strength) {
      case PasswordStrength.TooShort:
      case PasswordStrength.Weak:
        return 'text-red-500';
      case PasswordStrength.Medium:
        return 'text-yellow-500';
      case PasswordStrength.Strong:
        return 'text-green-500';
      case PasswordStrength.VeryStrong:
        return 'text-emerald-600'; // Or a stronger green
      default:
        return 'text-slate-500';
    }
  }

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
    isPasswordProtectionEnabled,
    setIsPasswordProtectionEnabled,
    snippetPassword,
    setSnippetPassword,
    showPassword,
    setShowPassword,
    passwordCopied,
    setPasswordCopied,

    // Derived/Computed values for rendering
    highlightedHtml,
    codeClassName,
    canPrettifyCurrentLanguage,
    passwordStrengthAnalysis,

    // Actions
    handleSubmit,
    prettifyCode,
    getPasswordStrengthColor,
    handleGeneratePassword,

    // Status
    isSubmitting,
    isPrettifying,

    // Constants
    SUPPORTED_LANGUAGES: SUPPORTED_LANGUAGES_FOR_FORM,
    MAX_CODE_LENGTH,
  };
}
