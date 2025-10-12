# Language Support Roadmap

This document tracks programming language support in Snippet Share, including both syntax highlighting and code prettification features.

Last updated: 2025-10-12

## Currently Supported Languages (14)

| Language   | Syntax Highlighting | Code Prettification | Notes                            |
| ---------- | ------------------- | ------------------- | -------------------------------- |
| JavaScript | ✅                  | ✅                  | Parser: babel                    |
| TypeScript | ✅                  | ✅                  | Parser: typescript               |
| Python     | ✅                  | ❌                  | No browser-compatible formatter  |
| HTML       | ✅                  | ✅                  | Parser: html                     |
| CSS        | ✅                  | ✅                  | Parser: css                      |
| Java       | ✅                  | ✅                  | Plugin: prettier-plugin-java     |
| C#         | ✅                  | ❌                  | No browser-compatible formatter  |
| Bash       | ✅                  | ❌                  | No browser-compatible formatter  |
| SQL        | ✅                  | ❌                  | No browser-compatible formatter  |
| JSON       | ✅                  | ✅                  | Parser: json5                    |
| Markdown   | ✅                  | ✅                  | Parser: markdown                 |
| Rust       | ✅                  | ❌                  | Plugin incompatible with browser |
| Plaintext  | ✅                  | ❌                  | N/A                              |

## Missing Popular Languages

Based on 2025 programming language rankings (TIOBE, PYPL, RedMonk, Stack Overflow).

### Tier 1: High Priority (Top 10 Globally)

Languages in the top 10 of major programming language indexes.

| Language | Global Rank | Use Cases                     | Highlight.js | Prettier Support          | Status |
| -------- | ----------- | ----------------------------- | ------------ | ------------------------- | ------ |
| PHP      | #6-7        | Web backend, WordPress        | ✅           | ✅ `@prettier/plugin-php` | TODO   |
| C        | #2-3        | Systems, embedded             | ✅           | ❌ (uses clang-format)    | TODO   |
| C++      | #3-5        | Game dev, high-performance    | ✅           | ❌ (uses clang-format)    | TODO   |
| Go       | #8-12       | Cloud, backend, microservices | ✅           | ❌ (uses gofmt)           | TODO   |

### Tier 2: Medium Priority (Top 15-20 Globally)

Languages frequently used in specific domains or platforms.

| Language | Global Rank | Use Cases                    | Highlight.js | Prettier Support               | Status |
| -------- | ----------- | ---------------------------- | ------------ | ------------------------------ | ------ |
| Ruby     | #9-15       | Web (Rails), scripting       | ✅           | ✅ `prettier-plugin-ruby`      | TODO   |
| Kotlin   | #12-15      | Android, JVM                 | ✅           | ⚠️ Community plugin (untested) | TODO   |
| Swift    | #11-15      | iOS, macOS                   | ✅           | ⚠️ Plugin deprecated/unstable  | TODO   |
| R        | #15-18      | Data science, statistics     | ✅           | ❌ No plugin                   | TODO   |
| Scala    | #15-20      | Big data (Spark), functional | ✅           | ❌ (uses Scalafmt)             | TODO   |
| Dart     | #16-20      | Flutter mobile               | ✅           | ❌ (uses dart format)          | TODO   |

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

- ✅ **@prettier/plugin-php** - Official, well-maintained
- ✅ **prettier-plugin-ruby** - Official, well-maintained
- ✅ **prettier-plugin-java** - Already implemented

### Plugins with Unknown Browser Compatibility

These may or may not work with `prettier/standalone`:

- ⚠️ **prettier-plugin-kotlin** - Community plugin, needs testing
- ⚠️ **prettier-plugin-swift** - Deprecated/unstable per GitHub

### Native Formatters (Not Browser-Compatible)

These languages use native binaries that cannot run in browsers:

- ❌ **C/C++** - Uses `clang-format` (C++ native tool)
- ❌ **Go** - Uses `gofmt` (Go native tool)
- ❌ **Rust** - Uses `rustfmt` (Rust native tool)
- ❌ **Scala** - Uses Scalafmt (Scala native tool)
- ❌ **Dart** - Uses `dart format` (Dart native tool)
- ❌ **Python** - Uses `black`, `autopep8`, etc. (Python native)

For these languages, we can only provide syntax highlighting.

## Implementation Checklist

When adding a new language:

### For All Languages (Syntax Highlighting)

1. [ ] Add language constant to `packages/types/src/language.types.ts`
2. [ ] Add to `SUPPORTED_LANGUAGES_FOR_HIGHLIGHTING` in `apps/web/app/hooks/use-code-highlighting.tsx`
3. [ ] Add language loader import in `use-code-highlighting.tsx`
4. [ ] Run `pnpm build:types` to rebuild the types package
5. [ ] Test syntax highlighting works in the UI

### Additional Steps for Prettification Support

6. [ ] Install Prettier plugin: `pnpm --filter @snippet-share/web add -D <plugin-name>`
7. [ ] Import plugin in `apps/web/app/hooks/use-snippet-form.tsx`
8. [ ] Add to `externalCommunityPlugins` array
9. [ ] Add entry to `PRETTIER_SUPPORT_MAP` with correct parser name
10. [ ] Test prettification works in the browser
11. [ ] If it fails, remove prettification support (steps 6-9)

## Recommended Implementation Order

Based on popularity and ease of implementation:

1. **Phase 1 - Quick Wins** (High Priority + Easy)

   - PHP (with prettify)
   - Ruby (with prettify)
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

## Status Legend

- ✅ **Fully Supported** - Works as expected
- ⚠️ **Needs Testing** - Implementation uncertain
- ❌ **Not Supported** - Technical limitation
- 🔄 **In Progress** - Currently being implemented
- TODO - Not yet implemented
