# Growth Strategy for Snippet Share

Snippet Share is an open-source, zero-knowledge code sharing tool. Growth comes from the privacy community, developer tooling, and trust — not from SEO blog posts or keyword rankings.

---

## Foundation (Complete)

Technical SEO basics are in place: Schema.org structured data (WebApplication, FAQPage, Organization), per-page meta tags with long-tail keywords, dynamic canonical URLs, sitemap submitted to Google Search Console and Bing, and snippet routes excluded from indexing via `noindex`. No further work needed here.

---

## Pillar 1: Distribution — Be Where Privacy People Are

Privacy-focused users don't find tools through Google. They find them through community recommendations, curated lists, and forums they trust. This is the highest-leverage growth activity.

### Privacy Communities (High Priority)

- [ ] **Hacker News** — Show HN launch post. Lead with the zero-knowledge architecture, not the feature list. HN cares about how things work, not what they do.

  **Pre-launch preparation (required — do not skip):**

  A brand-new HN account posting a Show HN gets flagged or ignored. HN has sophisticated anti-manipulation detection. Build credibility first.
  - [x] Create account (`hajix007`) — username doesn't match product name (good, matching = spam signal)
  - [x] Set up profile — about section with GitHub link, keep it short and technical
  - [ ] **Build karma to ~20-50** — Spend 1-2 weeks commenting genuinely on posts about encryption, web dev, Cloudflare Workers, open-source tools, privacy. No self-promotion.
  - [ ] Target launch: **Sunday March 1st or 8th, 2026** — Sundays 11:00-14:00 UTC have the highest breakout rate (11.75%) per analysis of 157k+ HN posts. This window catches European midday + early US morning with fewer competing submissions.

  **Post structure (based on top-performing Show HN patterns):**
  - Title: first-person framing ("I built X"), include technical differentiator ("zero-knowledge", "client-side encrypted"), no superlatives or marketing language. Hard limit: 80 characters.
  - First comment: narrative prose (not bullet lists), lead with personal motivation ("I got tired of X"), explain the crypto architecture (URL fragment trick), honest comparison to Pastebin/Gist, end with specific feedback request ("audit the crypto implementation").
  - Link the GitHub repo — HN prioritizes open-source projects they can inspect.

  **After posting:**
  - Respond to every comment within the first 4-6 hours.
  - Never argue — find something to agree with in criticism before responding. The goal is convincing silent readers, not winning debates.
  - If the post gets <30 upvotes, email hn@ycombinator.com to request the [second-chance pool](https://news.ycombinator.com/pool) — moderators will resurface it on the front page.

  **Draft post (copy-paste on launch day):**

  Title (75 chars):

  ```
  Show HN: I built a code sharing tool where the server can't read your code
  ```

  URL field: `https://snippet-share.com`

  First comment (post immediately after submission):

  ```
  I got tired of pasting API keys and internal code into Pastebin and Slack,
  knowing some server out there is storing my plaintext. So I built Snippet
  Share — a code sharing tool where all encryption happens in your browser
  before anything touches the network.

  Here's how it works: when you create a snippet, your browser generates a
  random 256-bit key and encrypts your code with AES-256-GCM using the Web
  Crypto API. Only the encrypted blob gets sent to the server. The key goes
  into the URL fragment (the part after #), which browsers never send to the
  server per the HTTP spec. So a link looks like
  snippet-share.com/s/abc123#key-here — and the server only ever sees abc123.

  For password-protected snippets, there's a second layer: your password is
  run through PBKDF2 to derive a key-encrypting-key that wraps the data key.
  The server stores the encrypted key + KDF params but never the password or
  the plaintext key. The URL stays clean and the password is shared
  out-of-band.

  The server stores PostgreSQL bytea blobs. Under a subpoena, there's nothing
  meaningful to hand over.

  No account needed, no tracking cookies, no ads. Just paste code and get a
  link. It also has syntax highlighting for 19 languages, in-browser Prettier
  formatting, expiration controls, and a "burn after reading" mode that
  deletes the snippet after the first view.

  Stack: React 19 + TanStack Start on Cloudflare Pages, Hono on Cloudflare
  Workers, Supabase (Postgres). Rate limiting uses Durable Objects because
  Workers KV can only do 1 write/sec and native rate limiting is limited to
  10s/60s windows.

  Source code: https://github.com/abdihashii/snippet-share

  The decryption service is about 300 lines if anyone wants to audit the
  crypto implementation. I'd especially appreciate feedback on the encryption
  model and any edge cases I might be missing.
  ```

- [ ] **Reddit** — Post and engage authentically in communities where the audience already is:
  - r/privacy — core audience
  - r/privacytoolsIO — curated tool recommendations
  - r/selfhosted — resonates with the open-source, trust-no-one ethos
  - r/netsec — security-focused developers
  - r/opensource — the project is open-source, share the story
- [ ] **Lobsters** — Developer-focused community that values technical depth

### Curated Lists & Directories (High Priority)

These are where privacy-conscious users actually discover tools:

- [ ] **GitHub Awesome Lists** — Submit PRs to:
  - [ ] [awesome-privacy](https://github.com/pluja/awesome-privacy) — [issue #640](https://github.com/pluja/awesome-privacy/issues/640)
  - [ ] [awesome-selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) — [PR #2040](https://github.com/awesome-selfhosted/awesome-selfhosted-data/pull/2040)
- [ ] **PrivacyGuides.org** — Community-driven privacy tool recommendations
- [ ] **PRISM Break** — Alternative tools for privacy
- [ ] **AlternativeTo** — List as privacy-focused Pastebin/Gist alternative

### Developer Directories (Medium Priority)

- [ ] **Product Hunt** — Launch in the Developer Tools / Privacy category
- [ ] **SaaSHub** — Developer tools category
- [ ] **StackShare** — Developer tool stacks

---

## Pillar 2: Developer Tools — Product-Led Growth

A developer who installs a CLI tool or VS Code extension becomes a daily user. No amount of SEO can match the retention of being embedded in someone's workflow.

### CLI Tool (High Priority)

- [ ] Create NPM package (`snippet-share` or `snip`)
- [ ] Support piped input: `cat file.ts | snip`
- [ ] Flags: `--expire 1h`, `--password`, `--burn` (burn after reading)
- [ ] Output the shareable URL to stdout
- [ ] Publish to NPM, create dedicated GitHub repo with README
- [ ] Submit to Homebrew (reaches macOS/Linux developers)

### VS Code Extension (High Priority)

- [ ] Right-click or keyboard shortcut to share selected code
- [ ] Options panel: expiration, password, burn after reading
- [ ] Copies shareable URL to clipboard
- [ ] Publish to VS Code Marketplace

### Future (Lower Priority)

- [ ] Browser extension for right-click code sharing
- [ ] API documentation for third-party integrations
- [ ] JetBrains plugin

---

## Pillar 3: Trust & Credibility

For privacy tools, trust is everything. Users need proof, not promises. Being open-source is the strongest foundation — build on it.

### Leverage Open Source

- [ ] Pin the GitHub repo prominently on the website — "Don't trust us. Read the code."
- [ ] Add a "View Source" link on the encryption explanation, linking directly to the crypto service files
- [ ] Encourage community security review via GitHub Issues/Discussions

### Transparency

- [ ] **"How It Works" page** — Visual explanation of the zero-knowledge architecture. Show the encryption flow diagram. Link to the actual source code for each step.
- [ ] **Privacy policy that's human-readable** — What data is stored (encrypted blobs only), what isn't (plaintext, keys, IPs after rate limiting), and what analytics are collected (PostHog, anonymous, no cookies).
- [ ] **security.txt** (`/.well-known/security.txt`) — Standard vulnerability disclosure contact

### Security Credibility

- [ ] Publish a self-audit document: walk through the threat model, what the system protects against, and known limitations
- [ ] Invite community security review (GitHub issue template for security reports)
- [ ] Consider a formal audit when the project reaches enough traction to justify the cost

---

## What to Track

Focus on metrics that indicate real usage, not vanity SEO numbers.

| Metric                        | Why It Matters                                      |
| ----------------------------- | --------------------------------------------------- |
| Snippets created per day/week | Core usage — are people actually using the tool?    |
| GitHub stars & forks          | Community trust signal, discoverability             |
| CLI installs (NPM downloads)  | Developer adoption                                  |
| VS Code extension installs    | Developer adoption                                  |
| Organic traffic               | Secondary signal — shows if distribution is working |

Don't track: keyword rankings, bounce rate, backlink counts, word counts, or arbitrary monthly targets.

---

## Target Keywords

Only keywords that privacy-focused users would actually search for:

**Primary:**

- encrypted pastebin
- zero-knowledge code sharing
- private code sharing
- pastebin alternative privacy
- secure code snippets

**Long-tail:**

- self-destructing code snippets
- password protected pastebin
- anonymous code sharing tool
- burn after reading code
- zero-knowledge encryption pastebin
- open source encrypted pastebin

---

## Principles

1. **Distribution > SEO.** Getting listed on awesome-privacy will drive more of the right users than 10 blog posts.
2. **Product > Marketing.** A CLI tool that developers love will grow through word-of-mouth.
3. **Trust > Features.** Being open-source and transparent beats any marketing claim.
4. **Community > Content.** Engaging authentically in r/privacy and HN beats a content calendar.
5. **Proof > Promises.** Link to the source code. Show the encryption flow. Let users verify.
