# Snippet Share Web App

A secure, zero-knowledge code snippet sharing frontend built with React and TanStack Start. This web application provides a beautiful, responsive interface for creating and viewing encrypted code snippets with client-side encryption.

## 🔐 Overview

The Snippet Share web app is the frontend for the secure code snippet sharing platform. It implements:

- **Zero-knowledge client-side encryption** - Code is encrypted in your browser before transmission
- **Beautiful syntax highlighting** - Support for 10+ programming languages
- **No account required** - Instant snippet creation and sharing
- **Auto-expiration options** - Time-based and view-based limits
- **Password protection** - Optional additional security layer
- **Dark/light themes** - Responsive design with theme switching
- **Progressive enhancement** - Works without JavaScript for basic functionality

### Key Features

- 🔒 **Client-side encryption** - AES-256-GCM encryption with Web Crypto API
- ⚡ **Instant sharing** - Create and share snippets in seconds
- 🎨 **Syntax highlighting** - Dynamic language support with highlight.js
- 🌓 **Theme support** - Light/dark mode with system preference detection
- 📱 **Responsive design** - Mobile-first design with Tailwind CSS
- 🔑 **Password protection** - Optional PBKDF2-based password security
- ⏰ **Auto-expiration** - Flexible expiration options (1h to never)
- 👁️ **View limits** - Burn-after-reading and multi-view options

## 🏗️ Tech Stack

- **Framework**: React 19 with TanStack Start (full-stack React framework)
- **Router**: TanStack Router v1.120+ (file-based routing)
- **Build Tool**: Vite with @cloudflare/vite-plugin (Workers Static Assets)
- **Styling**: Tailwind CSS v4+ with custom design system
- **Components**: Own primitives built on Radix UI
- **Icons**: Lucide React
- **Themes**: next-themes for dark/light mode
- **Encryption**: Web Crypto API (AES-256-GCM, PBKDF2)
- **Testing**: Vitest with V8 coverage
- **Deployment**: Cloudflare Workers (static assets via @cloudflare/vite-plugin)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+
- Access to the Snippet Share API (see [API documentation](../api/README.md))

### Installation

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Set up environment variables**

   Create `.env.local` file for local development:

   ```bash
   # Required - API endpoint
   VITE_API_URL=http://localhost:8787

   # Optional - Analytics (PostHog)
   VITE_PUBLIC_POSTHOG_KEY=your-posthog-key
   VITE_PUBLIC_POSTHOG_API_HOST=https://app.posthog.com
   ```

   **Important**: `.env` files are only used for local development. Vite inlines `VITE_*` variables into the bundle at build time, so production values are injected by the deploy script (see [Deployment](#deployment) section). Wrangler `[vars]` are runtime-only and never reach browser code.

### Development

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui

# Lint code
pnpm lint

# Clean build artifacts
pnpm clean
```

The web app will be available at `http://localhost:3000`.

## 📁 Project Structure

```
apps/web/
├── app/                    # Main application code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── routes/            # File-based routing
│   └── __tests__/         # Test files
├── public/                # Static assets
└── *.config.*            # Configuration files
```

## 🔒 Security Implementation

### Client-Side Encryption Flow

1. **Snippet Creation**:
   - Generate random 256-bit Data Encryption Key (DEK)
   - Encrypt content with AES-256-GCM using DEK
   - Include DEK in shareable URL fragment
   - Send only encrypted content + metadata to server

2. **Password Protection** (Optional):
   - Derive Key Encryption Key (KEK) from password using PBKDF2
   - Encrypt DEK with KEK using AES-256-GCM
   - Store encrypted DEK on server, never the password or plaintext DEK
   - Share clean URL + password out-of-band

3. **Snippet Retrieval**:
   - Extract DEK from URL fragment or decrypt from password
   - Retrieve encrypted content from server
   - Decrypt content client-side using DEK
   - Display with syntax highlighting

### Security Features

- **Zero-knowledge architecture**: Server never sees plaintext content
- **URL fragment keys**: Encryption keys never sent to server
- **Content sanitization**: DOMPurify prevents XSS attacks
- **HTTPS enforcement**: All communications encrypted in transit
- **Auto-expiration**: Time and view-based limits
- **Password strength validation**: Secure password requirements

## 🎨 UI/UX Features

### Design System

- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Own primitives**: Built on Radix UI, styled to the design system
- **Responsive design**: Mobile-first approach with breakpoint optimization
- **Dark/light themes**: Automatic system preference detection
- **Accessibility**: WCAG-compliant with keyboard navigation support

### User Experience

- **No registration required**: Instant snippet creation
- **Progressive enhancement**: Core functionality works without JavaScript
- **Loading states**: Skeleton screens and smooth transitions
- **Error boundaries**: Graceful error handling with user feedback
- **Toast notifications**: Real-time feedback with Sonner
- **Copy to clipboard**: One-click link sharing

## 📡 API Integration

The web app communicates with the Snippet Share API for:

- **Snippet storage**: Encrypted content and metadata
- **User registration**: Optional account creation
- **Expiration management**: Time and view-based limits
- **Error handling**: Consistent error responses

### API Client Structure

```typescript
// Authentication APIs
export const authApis = {
  signup: (email: string, password: string) => Promise<AuthResponse>
};

// Snippet APIs
export const snippetApis = {
  create: (data: CreateSnippetRequest) => Promise<CreateSnippetResponse>,
  retrieve: (id: string) => Promise<RetrieveSnippetResponse>
};
```

## 🧪 Testing

### Test Setup

- **Framework**: Vitest with V8 coverage provider
- **Location**: `app/__tests__/lib/*.test.ts`
- **Coverage**: HTML, JSON, and text reports
- **Target**: Business logic and utility functions

### Test Categories

- **Crypto utilities**: Encryption/decryption functions
- **Date utilities**: Expiration and timestamp handling
- **Password utilities**: Strength validation and generation
- **Theme system**: Dark/light mode functionality
- **Business logic**: Core application utilities

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage report
pnpm test:coverage

# Run with visual UI
pnpm test:ui

# Watch mode during development
pnpm test:watch
```

## 🚀 Deployment

### Cloudflare Workers

The web app deploys as the Cloudflare Worker `snippet-share-web`, serving `snippet-share.com` and `www.snippet-share.com`. Static assets and SSR are bundled by Vite with [`@cloudflare/vite-plugin`](https://developers.cloudflare.com/workers/vite-plugin/) (Workers Static Assets); Worker config lives in `wrangler.jsonc`.

#### Deployment

```bash
# From repo root
pnpm deploy:web
```

The deploy script (`apps/web/package.json`) builds with `VITE_API_URL=https://api.snippet-share.com` exported, verifies the production API URL made it into the built bundles, then runs `wrangler deploy`.

**Environment variables come in two kinds here, don't mix them up:**

- **Build-time (`VITE_*`)**: inlined into the JS bundle by `vite build`. Production values come from the deploy script; local values from `.env` (copy `.env.example`).
- **Runtime (Wrangler `[vars]`)**: only visible to the Worker's server code via `env`/`process.env` ([docs](https://developers.cloudflare.com/workers/configuration/environment-variables/)). They never reach the browser, so `VITE_API_URL` must NOT be set there.

### Performance Optimizations

- **Code splitting**: Route-based lazy loading
- **Tree shaking**: Dead code elimination
- **Asset optimization**: Compressed images and static assets
- **Edge caching**: Global CDN with Cloudflare
- **Bundle analysis**: Optimized chunk sizes

## 🎯 Supported Languages

The web app provides syntax highlighting for 10+ programming languages including JavaScript, TypeScript, Python, Java, C#, HTML, CSS, JSON, Markdown, Bash, and Plain Text. Languages are dynamically loaded to reduce initial bundle size.

## 🔧 Development Scripts

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Testing
pnpm test                   # Run tests
pnpm test:coverage          # Run tests with coverage
pnpm test:ui               # Visual test runner
pnpm test:watch            # Watch mode

# Quality
pnpm lint                  # Lint code
pnpm typecheck            # TypeScript checking
pnpm clean                # Clean build artifacts

# Deployment
pnpm deploy               # Deploy to Cloudflare Workers
```

## 🤝 Contributing

### Development Guidelines

1. **TypeScript**: Use strict mode with proper typing
2. **Components**: Match the design system, not upstream defaults
3. **Testing**: Add tests for business logic and utilities
4. **Accessibility**: Ensure WCAG compliance
5. **Performance**: Optimize for mobile and slow connections

### Code Style

- **ESLint**: Shared configuration in monorepo
- **Prettier**: Automatic code formatting
- **Import order**: Organized with path aliases
- **Component structure**: Consistent file organization

## 📚 Related Documentation

- [Main Project README](../../README.md)
- [API Documentation](../api/README.md)
- [Product Requirements](../../docs/PRD.md)
- [TanStack Start Documentation](https://tanstack.com/start)
- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) and the [Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/)

## 🔗 Live Demo

- **Production**: [snippet-share.com](https://snippet-share.com) (coming soon)
- **Staging**: [staging.snippet-share.com](https://staging.snippet-share.com) (coming soon)

---

Built with ❤️ for developers who value security and simplicity.
