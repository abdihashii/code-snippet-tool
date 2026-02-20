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
  - [x] [awesome-privacy](https://github.com/pluja/awesome-privacy) — [issue #640](https://github.com/pluja/awesome-privacy/issues/640)
  - [ ] [awesome-selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) — has a Pastebins category, PrivateBin already listed
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
