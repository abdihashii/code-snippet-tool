# Language Support Roadmap

This document tracks programming language support in Snippet Share, including syntax highlighting, code prettification, and language icon support.

Last updated: 2025-10-12

## Language Icon Support

### Icon Library

We use **@icons-pack/react-simple-icons** for programming language brand icons:

- 3,000+ brand and technology icons
- Tree-shakable (only imported icons bundled)
- TypeScript support
- Consistent design and sizing
- Official recommendation from Lucide (which doesn't support brand logos)

### Installation

```bash
pnpm --filter @snippet-share/web add @icons-pack/react-simple-icons
```

### Implementation

Icons are integrated into the language dropdown (`code-editor.tsx`) to help users:

- Quickly identify languages visually
- Navigate long language lists more easily
- Enjoy a more modern, professional UX

## Currently Supported Languages (16)

| Language   | Syntax Highlighting | Code Prettification | Icon Available | Icon Import         | Notes                                  |
| ---------- | ------------------- | ------------------- | -------------- | ------------------- | -------------------------------------- |
| JavaScript | ✅                  | ✅                  | ✅             | `SiJavascript`      | Parser: babel                          |
| TypeScript | ✅                  | ✅                  | ✅             | `SiTypescript`      | Parser: typescript                     |
| Python     | ✅                  | ❌                  | ✅             | `SiPython`          | No browser-compatible formatter        |
| HTML       | ✅                  | ✅                  | ✅             | `SiHtml5`           | Parser: html                           |
| CSS        | ✅                  | ✅                  | ✅             | `SiCss3`            | Parser: css                            |
| Java       | ✅                  | ✅                  | ✅             | `SiOpenjdk`         | Plugin: prettier-plugin-java           |
| PHP        | ✅                  | ❌                  | ✅             | `SiPhp`             | Plugin uses Node.js APIs (process.cwd) |
| Ruby       | ✅                  | ❌                  | ✅             | `SiRuby`            | Plugin requires Ruby runtime process   |
| C#         | ✅                  | ❌                  | ✅             | `SiCsharp`          | No browser-compatible formatter        |
| Bash       | ✅                  | ❌                  | ✅             | `SiGnubash`         | No browser-compatible formatter        |
| SQL        | ✅                  | ❌                  | ✅             | `SiMysql`           | No browser-compatible formatter        |
| JSON       | ✅                  | ✅                  | ✅             | `SiJson`            | Parser: json5                          |
| Markdown   | ✅                  | ✅                  | ✅             | `SiMarkdown`        | Parser: markdown                       |
| Rust       | ✅                  | ❌                  | ✅             | `SiRust`            | Plugin incompatible with browser       |
| Plaintext  | ✅                  | ❌                  | ⚠️             | `FileCode` (lucide) | N/A                                    |

## Missing Popular Languages

Based on 2025 programming language rankings (TIOBE, PYPL, RedMonk, Stack Overflow).

### Tier 1: High Priority (Top 10 Globally)

Languages in the top 10 of major programming language indexes.

| Language | Global Rank | Use Cases                     | Highlight.js | Prettier Support       | Status   |
| -------- | ----------- | ----------------------------- | ------------ | ---------------------- | -------- |
| PHP      | #6-7        | Web backend, WordPress        | ✅           | ❌ (uses Node.js APIs) | ✅ ADDED |
| C        | #2-3        | Systems, embedded             | ✅           | ❌ (uses clang-format) | TODO     |
| C++      | #3-5        | Game dev, high-performance    | ✅           | ❌ (uses clang-format) | TODO     |
| Go       | #8-12       | Cloud, backend, microservices | ✅           | ❌ (uses gofmt)        | TODO     |

### Tier 2: Medium Priority (Top 15-20 Globally)

Languages frequently used in specific domains or platforms.

| Language | Global Rank | Use Cases                    | Highlight.js | Prettier Support               | Status      |
| -------- | ----------- | ---------------------------- | ------------ | ------------------------------ | ----------- |
| Ruby     | #9-15       | Web (Rails), scripting       | ✅           | ❌ (requires Ruby runtime)     | ✅ ADDED    |
| Kotlin   | #12-15      | Android, JVM                 | ✅           | ⚠️ Community plugin (untested) | TODO        |
| Swift    | #11-15      | iOS, macOS                   | ✅           | ⚠️ Plugin deprecated/unstable  | TODO        |
| R        | #15-18      | Data science, statistics     | ✅           | ❌ No plugin                   | TODO        |
| Scala    | #15-20      | Big data (Spark), functional | ✅           | ❌ (uses Scalafmt)             | TODO        |
| Dart     | #16-20      | Flutter mobile               | ✅           | ❌ (uses dart format)          | TODO        |

### Tier 3: Lower Priority (Top 20-30 or Niche)

Languages with specific use cases or legacy support.

| Language | Global Rank | Use Cases                    | Highlight.js | Prettier Support | Status |
| -------- | ----------- | ---------------------------- | ------------ | ---------------- | ------ |
| Perl     | #18-22      | Legacy systems, text parsing | ✅           | ❌               | TODO   |
| Lua      | #20-25      | Game scripting, embedded     | ✅           | ❌               | TODO   |
| Elixir   | #25-30      | Web backends, real-time      | ✅           | ❌               | TODO   |
| Haskell  | #25-30      | Functional programming       | ✅           | ❌               | TODO   |

## Prettier Plugin Compatibility Notes

### Plugins That Work with `prettier/standalone` (Browser)

These can provide full prettification support:

- ✅ **prettier-plugin-java** - Already implemented and working

### Plugins with Unknown Browser Compatibility

These may or may not work with `prettier/standalone`:

- ⚠️ **prettier-plugin-kotlin** - Community plugin, needs testing
- ⚠️ **prettier-plugin-swift** - Deprecated/unstable per GitHub

### Native Formatters (Not Browser-Compatible)

These languages use native binaries or Node.js-specific APIs that cannot run in browsers:

- ❌ **@prettier/plugin-php** - Uses `process.cwd()`, requires `fs` and `path` modules (Node.js APIs)
  - **Note**: Despite having a `standalone.js` file, the plugin's dependency `php-parser` v3.2.5 calls Node.js APIs
  - The standalone build includes `require("fs")` and `require("path")` which don't exist in browsers
  - Error: `TypeError: process.cwd is not a function`
- ❌ **@prettier/plugin-ruby** - Requires Ruby runtime process (spawns Ruby server)
  - **Note**: The plugin keeps a Ruby server running in the background that Prettier communicates with
  - Uses the Syntax Tree gem which requires Ruby (version 2.7+) to be installed
  - The parse function spawns a Ruby process using Ruby's own parser (Ripper)
  - Cannot work in browser: spawning Ruby processes is impossible in browser environments
- ❌ **C/C++** - Uses `clang-format` (C++ native tool)
- ❌ **Go** - Uses `gofmt` (Go native tool)
- ❌ **Rust** - Uses `rustfmt` (Rust native tool)
- ❌ **Scala** - Uses Scalafmt (Scala native tool)
- ❌ **Dart** - Uses `dart format` (Dart native tool)
- ❌ **Python** - Uses `black`, `autopep8`, etc. (Python native)

For these languages, we can only provide syntax highlighting.

## Implementation Checklists

### Adding Icon Support to Existing Languages (One-Time Setup)

This is a one-time implementation to add icon support to the language dropdown.

1. [x] **Install icon package**: `pnpm --filter @snippet-share/web add @icons-pack/react-simple-icons`

2. [x] **Update LanguageOption interface** in `apps/web/app/hooks/use-code-highlighting.tsx`:

   ```typescript
   interface LanguageOption {
     value: Language;
     label: string;
     hljsId: string;
     icon?: React.ComponentType<{ size?: number; className?: string }>; // Add this
   }
   ```

3. [x] **Import all language icons** at top of `use-code-highlighting.tsx`:

   ```typescript
   import {
     SiCsharp,
     SiCss3,
     SiGnubash,
     SiHtml5,
     SiJavascript,
     SiJson,
     SiMarkdown,
     SiMysql,
     SiOpenjdk,
     SiPython,
     SiRust,
     SiTypescript
   } from '@icons-pack/react-simple-icons';
   import { FileCode } from 'lucide-react';
   ```

4. [x] **Add icon property to each language** in `SUPPORTED_LANGUAGES_FOR_HIGHLIGHTING` array:

   ```typescript
   export const SUPPORTED_LANGUAGES_FOR_HIGHLIGHTING: LanguageOption[] = [
     { value: 'JAVASCRIPT', label: 'JavaScript / JSX', hljsId: 'javascript', icon: SiJavascript },
     { value: 'TYPESCRIPT', label: 'TypeScript / TSX', hljsId: 'typescript', icon: SiTypescript },
     // ... etc for all languages
     { value: 'PLAINTEXT', label: 'Plain Text', hljsId: 'plaintext', icon: FileCode },
   ];
   ```

5. [x] **Update CodeEditor component** in `apps/web/app/components/snippet/code-editor.tsx`:

   a. Update the `supportedLanguages` prop type (line 36):

   ```typescript
   supportedLanguages?: readonly { value: Language; label: string; icon?: React.ComponentType<any> }[];
   ```

   b. Modify CommandItem rendering (around line 143-159):

   ```typescript
   {supportedLanguages.map((lang) => {
     const Icon = lang.icon;
     return (
       <CommandItem
         key={lang.value}
         value={lang.value}
         onSelect={(currentValue) => {
           onLanguageChange(currentValue as Language);
           setOpen(false);
         }}
       >
         <Check
           className={cn(
             'mr-2 h-4 w-4',
             language === lang.value ? 'opacity-100' : 'opacity-0',
           )}
         />
         {Icon && <Icon size={16} className="mr-2 shrink-0" />}
         {lang.label}
       </CommandItem>
     );
   })}
   ```

   c. Update Popover trigger button to show icon (around line 130-134):

   ```typescript
   {language
     ? (() => {
         const selectedLang = supportedLanguages.find((lang) => lang.value === language);
         const Icon = selectedLang?.icon;
         return (
           <>
             {Icon && <Icon size={14} className="mr-1.5 shrink-0" />}
             {selectedLang?.label}
           </>
         );
       })()
     : 'Select language'}
   ```

6. [x] **Test in browser**: Verify icons appear in dropdown and in selected button

### Adding a New Language (Syntax Highlighting Only)

When adding a new language without prettification support:

1. [ ] Add language constant to `packages/types/src/language.types.ts`
2. [ ] Find icon from [@icons-pack/react-simple-icons](https://react-icons.github.io/react-icons/icons/si/)
3. [ ] Import icon in `apps/web/app/hooks/use-code-highlighting.tsx`
4. [ ] Add to `SUPPORTED_LANGUAGES_FOR_HIGHLIGHTING` with all properties: `value`, `label`, `hljsId`, `icon`
5. [ ] Add language loader import in `use-code-highlighting.tsx` `languageLoaders` object
6. [ ] Run `pnpm build:types` to rebuild the types package
7. [ ] Test syntax highlighting and icon display work in the UI

### Adding a New Language with Prettification Support

When adding a new language WITH prettification support:

Follow steps 1-7 above, then:

8. [ ] Install Prettier plugin: `pnpm --filter @snippet-share/web add -D <plugin-name>`
9. [ ] Import plugin in `apps/web/app/hooks/use-snippet-form.tsx`
10. [ ] Add to `externalCommunityPlugins` array
11. [ ] Add entry to `PRETTIER_SUPPORT_MAP` with correct parser name
12. [ ] Test prettification works in the browser
13. [ ] If it fails, remove prettification support (undo steps 8-11)

## Recommended Implementation Order

Based on popularity and ease of implementation:

1. **Phase 1 - Quick Wins** (High Priority + Easy)

   - ✅ ~~PHP (highlighting only)~~ - **COMPLETED**
   - ✅ ~~Ruby (highlighting only)~~ - **COMPLETED**
   - Go (highlighting only)
   - C (highlighting only)
   - C++ (highlighting only)

2. **Phase 2 - Mobile Development** (Medium Priority)

   - Kotlin (highlighting only, test prettify)
   - Swift (highlighting only)
   - Dart (highlighting only)

3. **Phase 3 - Data Science & Functional** (Medium Priority)

   - R (highlighting only)
   - Scala (highlighting only)

4. **Phase 4 - Niche/Legacy** (Lower Priority)
   - Perl
   - Lua
   - Elixir
   - Haskell

## References

### Programming Language Rankings (2025)

- [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/)
- [TIOBE Index](https://www.tiobe.com/tiobe-index/)
- [PYPL PopularitY of Programming Language](https://pypl.github.io/)
- [RedMonk Programming Language Rankings](https://redmonk.com/sogrady/category/programming-languages/)

### Technical Documentation

- [Highlight.js Supported Languages](https://highlightjs.readthedocs.io/en/latest/supported-languages.html)
- [Prettier Plugins List](https://prettier.io/docs/plugins)
- [Prettier Browser Usage](https://prettier.io/docs/browser.html)

### Plugin Repositories

- [@prettier/plugin-php](https://github.com/prettier/plugin-php)
- [prettier-plugin-ruby](https://github.com/prettier/plugin-ruby)
- [prettier-plugin-java](https://github.com/jhipster/prettier-plugin-java)
- [prettier-plugin-kotlin](https://github.com/Angry-Potato/prettier-plugin-kotlin)

### Icon Libraries

- [@icons-pack/react-simple-icons](https://github.com/icons-pack/react-simple-icons) - React wrapper for Simple Icons
- [Simple Icons](https://simpleicons.org/) - 3000+ SVG icons for popular brands
- [Lucide Brand Logo Statement](https://github.com/lucide-icons/lucide/blob/main/BRAND_LOGOS_STATEMENT.md) - Why Lucide doesn't support brand logos

## Status Legend

- ✅ **Fully Supported** - Works as expected
- ⚠️ **Needs Testing** - Implementation uncertain
- ❌ **Not Supported** - Technical limitation
- 🔄 **In Progress** - Currently being implemented
- TODO - Not yet implemented
