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
- **Build Tool**: Vinxi (Vite-based full-stack framework)
- **Styling**: Tailwind CSS v4+ with custom design system
- **Components**: Radix UI primitives + shadcn/ui components
- **Icons**: Lucide React
- **Themes**: next-themes for dark/light mode
- **Encryption**: Web Crypto API (AES-256-GCM, PBKDF2)
- **Testing**: Vitest with V8 coverage
- **Deployment**: Cloudflare Pages

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

   **Important**: `.env` files are only used for local development. For Cloudflare Pages deployment, environment variables must be set in `wrangler.toml` (see [Deployment](#deployment) section).

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
- **shadcn/ui**: High-quality React components built on Radix UI
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

### Cloudflare Pages

The web app is configured for deployment to Cloudflare Pages with Workers compatibility.

#### Deployment Steps

1. **Build the application**

   ```bash
   pnpm build
   ```

2. **Deploy to Cloudflare Pages**
   ```bash
   pnpm deploy
   ```

#### Configuration

**Cloudflare Pages Settings** (`wrangler.toml`):

- **Build Output**: `./dist`
- **Node.js Compatibility**: Enabled
- **Environment Variables**: Set in `wrangler.toml` (NOT in Cloudflare dashboard)

**Environment Variables Configuration**:

⚠️ **Important**: When using `wrangler.toml` with `pages_build_output_dir`, environment variables MUST be defined in the `[vars]` section of the file. The Cloudflare dashboard becomes read-only for these settings. `.env` files are NOT used by Cloudflare Pages.

Add environment variables to `wrangler.toml`:

```toml
[vars]
VITE_API_URL = "https://snippet-share-api.your-account.workers.dev"
VITE_PUBLIC_POSTHOG_KEY = "your-production-posthog-key"
VITE_PUBLIC_POSTHOG_API_HOST = "https://app.posthog.com"
```

**Environment-specific configuration** (optional):

```toml
# Default vars for all environments
[vars]
VITE_API_URL = "https://snippet-share-api.your-account.workers.dev"

# Override for preview deployments only
[env.preview.vars]
VITE_API_URL = "https://preview-api.your-account.workers.dev"

# Override for production only
[env.production.vars]
VITE_API_URL = "https://api.your-domain.com"
```

After updating `wrangler.toml`, commit and push - Cloudflare Pages will automatically redeploy with the new variables.

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
pnpm deploy               # Deploy to Cloudflare Pages
```

## 🤝 Contributing

### Development Guidelines

1. **TypeScript**: Use strict mode with proper typing
2. **Components**: Follow shadcn/ui patterns for consistency
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
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)

## 🔗 Live Demo

- **Production**: [snippet-share.com](https://snippet-share.com) (coming soon)
- **Staging**: [staging.snippet-share.com](https://staging.snippet-share.com) (coming soon)

---

Built with ❤️ for developers who value security and simplicity.
