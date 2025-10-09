# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Snippet Share is a zero-knowledge code snippet sharing platform where all encryption happens client-side. The server stores only encrypted blobs and can never read the plaintext content. Built with React, TanStack React Start, Hono, and deployed on Cloudflare.

## Monorepo Structure

- `apps/web/` - Frontend React application using TanStack React Start (SSR) with Vinxi
- `apps/api/` - Backend API using Hono framework deployed to Cloudflare Workers
- `packages/types/` - Shared TypeScript type definitions
- `packages/schemas/` - Shared Zod schemas for validation
- `packages/db/` - Database configuration and Supabase management
- `packages/eslint-config/` - Shared ESLint configuration

## Common Development Commands

### Building

```bash
# Build shared packages (required before building web)
pnpm build:types
pnpm build:schemas

# Build web application
pnpm build:web  # This runs build:types and build:schemas first
```

### Linting

```bash
pnpm lint  # Runs across all packages in parallel
```

### Testing

```bash
# Run tests for the web application
pnpm --filter @snippet-share/web test

# Run with coverage
pnpm --filter @snippet-share/web test:coverage

# Run with UI
pnpm --filter @snippet-share/web test:ui
```

Test files are located at: `apps/web/app/lib/**/__tests__/**/*.test.ts`

### Database Management

**Important**: Only run database commands if explicitly needed. Local Supabase is not required for most development work.

```bash
pnpm --filter @snippet-share/db db:start   # Start local Supabase
pnpm --filter @snippet-share/db db:stop    # Stop local Supabase
pnpm --filter @snippet-share/db db:reset   # Reset database to initial state
```

### Development Servers

**Important**: Only start dev servers if explicitly requested by the user.

```bash
pnpm dev:web  # Start web app at http://localhost:3000
pnpm dev:api  # Start API at http://localhost:8787
```

### Deployment

**Important**: Only deploy if explicitly requested by the user.

```bash
# Deploy web app to Cloudflare Pages
pnpm --filter @snippet-share/web deploy

# Deploy security worker for CSP and security headers (after Pages deployment)
pnpm --filter @snippet-share/web deploy:worker:prod
# OR from root: pnpm deploy:web:worker

# Deploy API to Cloudflare Workers
pnpm --filter @snippet-share/api deploy
```

**Deployment Order**:

1. Deploy the web app to Cloudflare Pages first
2. Deploy the security worker to inject CSP and security headers
3. Deploy the API to Cloudflare Workers

**Security Worker**: The security worker ([apps/web/worker.js](apps/web/worker.js)) is a Cloudflare Worker that intercepts all requests to the Pages application and adds CSP and other security headers. It must be deployed to the same domain as the Pages app using routes configured in [apps/web/wrangler-worker.toml](apps/web/wrangler-worker.toml).

## Architecture

### Zero-Knowledge Security Model

This is the most critical aspect of the application:

1. **Client-side encryption only**: All encryption/decryption happens in the browser using Web Crypto API
2. **Server never sees plaintext**: The API only stores and retrieves encrypted blobs
3. **Two sharing modes**:
   - **Regular snippets**: DEK (Data Encryption Key) is embedded in URL fragment (after `#`)
   - **Password-protected snippets**: DEK is encrypted with KEK (Key Encryption Key) derived from user password via PBKDF2

### Encryption Flow

#### Creating a Regular Snippet

1. Client generates random DEK (256-bit)
2. Client encrypts content with DEK using AES-256-GCM → produces `encrypted_content`, `iv`, `auth_tag`
3. Client sends encrypted blob to API (DEK never sent)
4. API stores encrypted blob in PostgreSQL as bytea
5. Client receives snippet ID and creates shareable link: `https://domain.com/s/[UUID]#[base64url-encoded-DEK]`

#### Creating a Password-Protected Snippet

1. Client generates random DEK
2. Client encrypts content with DEK (same as above)
3. User provides password
4. Client generates random salt
5. Client derives KEK from password + salt using PBKDF2 (configurable iterations)
6. Client encrypts DEK with KEK using AES-256-GCM → produces `encrypted_dek`, `iv_for_dek`, `auth_tag_for_dek`
7. Client sends encrypted content + encrypted DEK + salt + KDF params to API
8. Shareable link is clean: `https://domain.com/s/[UUID]` (password shared out-of-band)

### Functional Programming Pattern

**IMPORTANT**: This codebase uses functional programming for services, NOT OOP classes.

See [apps/web/docs/architecture/why-functional-services.md](apps/web/docs/architecture/why-functional-services.md) for the full rationale.

#### Service Export Pattern

```typescript
// In service file (e.g., decryption-service.ts)
// Usage
import { DecryptionService } from '@/lib/services';

export async function decryptSnippet(params: DecryptSnippetParams): Promise<string> {
  // implementation
}

// In services/index.ts
export * as DecryptionService from './decryption-service';
export * as PasswordService from './password-service';
const content = await DecryptionService.decryptSnippet(params);
```

**Why functional?**

- All services are stateless
- Better tree-shaking for smaller bundles
- Simpler testing (no instantiation needed)
- Aligns with React/TanStack functional patterns
- Module system provides encapsulation

**Exception**: Custom error classes like `RateLimitError` appropriately use classes.

### Database: PostgreSQL with bytea Storage

The API converts between Base64 (client) and PostgreSQL bytea hex strings (database).

**Key helper functions** in [apps/api/src/routes/snippet-routes.ts](apps/api/src/routes/snippet-routes.ts):

```typescript
// Converts Buffer to PostgreSQL bytea format (e.g., "\\x[hex_string]")
function bufferToPostgresByteaString(buffer: Buffer): string {
  return `\\x${buffer.toString('hex')}`;
}

// Converts PostgreSQL bytea hex string back to Buffer
function postgresByteaStringToBuffer(byteaString: string): Buffer {
  if (!byteaString.startsWith('\\x')) {
    throw new Error('Invalid bytea string format');
  }
  return Buffer.from(byteaString.substring(2), 'hex');
}
```

**Flow**:

1. Client sends Base64 encrypted data
2. API converts Base64 → Buffer → bytea hex string → store in PostgreSQL
3. On retrieval: PostgreSQL bytea → Buffer → Base64 → send to client
4. Client converts Base64 → ArrayBuffer → decrypt with Web Crypto API

### Rate Limiting Strategy

Tiered rate limiting based on user type:

- **Global**: 100 requests per 15 minutes (all users)
- **Snippet creation**:
  - Anonymous: 5/day
  - Free users: 25/day (TODO)
  - Premium: 100/day (TODO)
- **Snippet retrieval**:
  - Anonymous: 50/minute
  - Free users: 100/minute (TODO)
  - Premium: 500/minute (TODO)

Implementation uses `hono-rate-limiter` with Cloudflare KV store.

### Client-Side Crypto Utilities

Important patterns in [apps/web/app/lib/services/decryption-service.ts](apps/web/app/lib/services/decryption-service.ts):

```typescript
// Convert Base64 to ArrayBuffer for Web Crypto API
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Convert base64url (URL-safe) to standard base64
function base64urlToBase64(base64url: string): string {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (base64.length % 4)) % 4;
  return base64 + '='.repeat(padding);
}
```

**AES-GCM Pattern**: Authentication tag is stored separately but must be concatenated with ciphertext before decryption:

```typescript
const encryptedDataWithAuthTag = new Uint8Array(
  encryptedContent.byteLength + authTag.byteLength
);
encryptedDataWithAuthTag.set(new Uint8Array(encryptedContent), 0);
encryptedDataWithAuthTag.set(new Uint8Array(authTag), encryptedContent.byteLength);

const decrypted = await crypto.subtle.decrypt(
  { name: 'AES-GCM', iv },
  key,
  encryptedDataWithAuthTag
);
```

## Tech Stack

- **Frontend**: React 19, TanStack React Start (SSR), Vinxi, Tailwind CSS, shadcn/ui
- **Backend**: Hono, Cloudflare Workers
- **Database**: PostgreSQL (Supabase)
- **Encryption**: Web Crypto API (AES-256-GCM, PBKDF2)
- **Testing**: Vitest with coverage
- **Linting**: ESLint 9 (flat config)
- **Package Manager**: pnpm 10+ with workspaces
- **Deployment**: Cloudflare Pages (frontend), Cloudflare Workers (API)

## Important Files & Patterns

### API Structure

- [apps/api/src/index.ts](apps/api/src/index.ts) - Main Hono app with CORS, CSRF, rate limiting
- [apps/api/src/routes/snippet-routes.ts](apps/api/src/routes/snippet-routes.ts) - Snippet CRUD with bytea conversion
- [apps/api/src/routes/auth-routes.ts](apps/api/src/routes/auth-routes.ts) - Authentication endpoints

### Web App Structure

- [apps/web/app/routes/](apps/web/app/routes/) - TanStack Router file-based routing
- [apps/web/app/lib/services/](apps/web/app/lib/services/) - Functional services (encryption, password, theme, rate limit)
- [apps/web/app/lib/api/](apps/web/app/lib/api/) - API client functions
- [apps/web/app/components/](apps/web/app/components/) - React components (functional only)

### Configuration

- [apps/web/app.config.ts](apps/web/app.config.ts) - TanStack React Start config (Cloudflare Pages preset)
- [apps/web/vitest.config.ts](apps/web/vitest.config.ts) - Test configuration
- [tsconfig.json](tsconfig.json) - Root TypeScript configuration

## Security Considerations

1. **Zero-knowledge architecture**: The server cannot decrypt snippets. This is not a feature—it's the core design.
2. **CSRF protection**: Enabled via `hono/csrf` middleware
3. **CORS**: Restricted to `FRONTEND_URL` environment variable
4. **Rate limiting**: Prevents abuse with Cloudflare KV-backed storage
5. **Input validation**: Partial implementation (see [docs/todo.md](docs/todo.md) for gaps)
6. **No plaintext storage**: All sensitive data stored as PostgreSQL bytea

**Security gaps** (from todo.md):

- Content Security Policy (CSP) headers not implemented
- Input validation needs Zod schemas
- XSS sanitization needed

## Testing Strategy

Tests use Vitest with the following setup:

```text
Test location pattern:
apps/web/app/lib/**/__tests__/**/*.test.ts

Example:
apps/web/app/lib/services/__tests__/decryption-service.test.ts
```

Coverage configuration in [apps/web/vitest.config.ts](apps/web/vitest.config.ts):

- Provider: v8
- Reports: text, json, html
- Includes: `app/lib/**`
- Excludes: node_modules, dist, build, `**/*.d.ts`, config files

## Key Insights for Development

1. **Always build shared packages first**: `pnpm build:types && pnpm build:schemas` before building web
2. **Services are functions, not classes**: Don't create class-based services (see architecture doc)
3. **Bytea conversion is critical**: Base64 ↔ Buffer ↔ bytea hex - wrong conversion breaks encryption
4. **URL fragments for DEKs**: The `#` part of URLs never sent to server (browser behavior)
5. **AES-GCM auth tags**: Must be concatenated with ciphertext before decryption
6. **Rate limiting is tiered**: Different limits for anonymous/free/premium (premium features TODO)
7. **Test coverage matters**: Crypto and validation code must be tested thoroughly

## References

- [Product Requirements Document](docs/PRD.md) - Complete feature specifications
- [Why Functional Services](apps/web/docs/architecture/why-functional-services.md) - Architecture decision
- [Security Documentation](docs/customer-facing/understanding-our-security.md) - User-facing security explanation
- [Development Todo](docs/todo.md) - Current priorities and gaps
