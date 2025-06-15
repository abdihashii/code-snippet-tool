# Snippet Share

A secure, zero-knowledge code snippet sharing platform built for developers who need to share code quickly and safely.

## 🔐 Security First

Snippet Share uses **client-side encryption** to ensure your code is encrypted in your browser before it ever reaches our servers. This means:

- **Zero-knowledge architecture** - We can't read your code, even if we wanted to
- **AES-256-GCM encryption** with cryptographically secure random keys
- **No plaintext storage** - Only encrypted blobs are stored on our servers

## ✨ Features

### Core Functionality

- **Instant sharing** - Create and share encrypted code snippets in seconds
- **Syntax highlighting** - Support for popular programming languages
- **Copy & download** - Easy code retrieval with one-click copying
- **Automatic expiration** - Set time-based or view-based limits on your snippets

### Sharing Options

- **Free sharing** - Share via secure links with encryption keys embedded
- **Password protection** - Premium feature for additional security layer
- **Anonymous or authenticated** - Create snippets without an account or manage them with a free account

### User Management

- **Optional free accounts** - Track and manage your snippets
- **No tracking** - Anonymous snippet creation supported
- **Secure authentication** - Industry-standard password hashing

## 🏗️ Architecture

This is a monorepo containing:

- **Web App** (`apps/web`) - React frontend with TanStack React Start
- **API** (`apps/api`) - Hono backend deployed to Cloudflare Workers
- **Shared Packages** (`packages/`) - Database config, ESLint config, shared types and schemas

### Tech Stack

- **Frontend**: React, TanStack React Start (with SSR), Vinxi, Tailwind CSS, shadcn/ui
- **Backend**: Hono, Cloudflare Workers
- **Database**: PostgreSQL via Supabase
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Deployment**: Cloudflare Pages (frontend), Cloudflare Workers (API)
- **Package Manager**: pnpm (workspace)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd code-snippet-tool
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   For the API (`apps/api`):

   ```bash
   cd apps/api
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

   For the Web app (`apps/web`):

   ```bash
   cd apps/web
   cp .env.example .env.local
   # Edit .env.local with your API endpoint
   ```

### Development

Start both applications in development mode:

```bash
# Start the web app (frontend)
pnpm dev:web

# In another terminal, start the API (backend)
pnpm dev:api
```

The web app will be available at `http://localhost:3000` and the API at `http://localhost:8787`.

### Building

Build all applications:

```bash
# Build shared packages first
pnpm build:types
pnpm build:schemas

# Build and deploy web app to Cloudflare Pages
cd apps/web
pnpm run build
pnpm run deploy

# Build and deploy api app to Cloudflare Workers
cd apps/api
pnpm run deploy
```

## 📁 Project Structure

```
├── apps/
│   ├── api/          # Hono API (Cloudflare Workers)
│   └── web/          # React frontend
├── packages/         # Shared packages
├── docs/            # Documentation
└── README.md        # This file
```

## 🔒 Security Model

1. **Client-side encryption**: All encryption happens in your browser
2. **Zero-knowledge**: Server never sees plaintext code
3. **Secure key management**: Encryption keys are never transmitted to the server
4. **HTTPS everywhere**: All communications are encrypted in transit
5. **Minimal data collection**: We only store what's necessary for functionality

## 📖 Documentation

- [Product Requirements Document](docs/PRD.md) - Detailed feature specifications
- [FAQ](docs/faqs.md) - Common questions and answers
- [Development Todo](docs/todo.md) - Current development priorities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🔗 Links

- [Live Demo](https://your-domain.com) (coming soon)
- [Documentation](docs/)
- [Issues](https://github.com/your-username/snippet-share/issues)
