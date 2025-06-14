# Snippet Share API

A secure, zero-knowledge code snippet sharing API built with Hono.js and deployed on Cloudflare Workers. This API provides end-to-end encrypted snippet storage and retrieval with optional password protection.

## 🔐 Overview

The Snippet Share API is the backend service for the secure code snippet sharing platform. It implements:

- **Zero-knowledge encryption** - All code is encrypted client-side before reaching the server
- **AES-256-GCM encryption** with cryptographically secure random keys *(Note: Current implementation is for development/demo purposes)*
- **Optional password protection** using PBKDF2 key derivation
- **Automatic expiration** with time-based and view-based limits
- **User registration** (login and snippet management not yet implemented)
- **11 programming languages** supported with language detection metadata for client-side syntax highlighting

### Core Features

- 🔒 **Client-side encryption** - Server never sees plaintext code
- ⏰ **Auto-expiration** - Snippets expire after set time or view limits
- 🔑 **Password protection** - Optional zero-knowledge password security
- 👤 **User registration** - User signup capability (login/management not yet implemented)
- 🌍 **Edge deployment** - Fast global access via Cloudflare Workers
- 📊 **View tracking** - Automatic view counting with limits

## 🏗️ Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js v4.7.9
- **Database**: PostgreSQL via Supabase
- **Encryption**: AES-256-GCM, PBKDF2
- **Types**: TypeScript with strict type checking
- **Package Manager**: pnpm (monorepo workspace)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+
- Wrangler CLI (`npm install -g wrangler`)
- Supabase CLI (for local development)

### Installation

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Set up Supabase locally**

   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase

   # Start local Supabase (from project root)
   supabase start
   ```

3. **Configure environment variables**

   The API uses Cloudflare Workers environment variables. For local development, these are configured in `wrangler.jsonc`:

   ```json
   {
     "vars": {
       "FRONTEND_URL": "http://localhost:3000",
       "SUPABASE_API_URL": "http://localhost:54321",
       "SUPABASE_ANON_KEY": "your-local-anon-key"
     }
   }
   ```

   For production, set these as Cloudflare Workers secrets:

   ```bash
   wrangler secret put SUPABASE_DB_URL
   wrangler secret put SUPABASE_JWT_SECRET
   wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   ```

### Development

```bash
# Start development server
pnpm dev

# Run type checking
pnpm typecheck

# Generate Cloudflare types
pnpm cf-typegen

# Lint code
pnpm lint
```

The API will be available at `http://localhost:8787`.

## 📡 API Endpoints

### Health Check

```http
GET /ping
```

**Response**: `200 OK`

```
Pong
```

### Authentication

#### User Registration

```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response**: `201 Created`

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  },
  "success": true,
  "message": "User created successfully"
}
```

### Snippets

#### Create Snippet

```http
POST /snippets
Content-Type: application/json

{
  "encrypted_content": "base64-encoded-encrypted-content",
  "initialization_vector": "base64-encoded-iv",
  "auth_tag": "base64-encoded-auth-tag",
  "title": "My Code Snippet",
  "language": "JAVASCRIPT",
  "name": "John Doe",
  "max_views": 5,
  "expires_at": "2024-12-31T23:59:59Z",
  "encrypted_dek": "base64-encoded-encrypted-dek", // Optional for password protection
  "iv_for_dek": "base64-encoded-iv-for-dek", // Optional
  "auth_tag_for_dek": "base64-encoded-auth-tag-for-dek", // Optional
  "kdf_salt": "base64-encoded-salt", // Optional
  "kdf_parameters": { // Optional
    "algorithm": "pbkdf2",
    "iterations": 100000,
    "hash": "sha256"
  }
}
```

**Response**: `201 Created`

```json
{
  "data": {
    "id": "snippet-uuid"
  },
  "success": true,
  "message": "Snippet created successfully"
}
```

#### Retrieve Snippet

```http
GET /snippets/{id}
```

**Response**: `200 OK`

```json
{
  "id": "snippet-uuid",
  "encrypted_content": "base64-encoded-encrypted-content",
  "initialization_vector": "base64-encoded-iv",
  "auth_tag": "base64-encoded-auth-tag",
  "title": "My Code Snippet",
  "language": "JAVASCRIPT",
  "name": "John Doe",
  "current_views": 3,
  "max_views": 5,
  "expires_at": "2024-12-31T23:59:59Z",
  "created_at": "2024-01-01T12:00:00Z",
  "encrypted_dek": "base64-encoded-encrypted-dek", // Only if password protected
  "iv_for_dek": "base64-encoded-iv-for-dek", // Only if password protected
  "auth_tag_for_dek": "base64-encoded-auth-tag-for-dek", // Only if password protected
  "kdf_salt": "base64-encoded-salt", // Only if password protected
  "kdf_parameters": { // Only if password protected
    "algorithm": "pbkdf2",
    "iterations": 100000,
    "hash": "sha256"
  }
}
```

**Error Responses**:

- `404 Not Found` - Snippet not found, expired, or view limit reached
- `410 Gone` - Snippet has expired or reached max views

### Supported Languages

- `PLAINTEXT`
- `JSON`
- `JAVASCRIPT`
- `PYTHON`
- `HTML`
- `CSS`
- `TYPESCRIPT`
- `JAVA`
- `BASH`
- `MARKDOWN`
- `CSHARP`

## 🔒 Security Architecture

### Encryption Flow

1. **Client-side encryption**: Content encrypted with AES-256-GCM using random DEK
2. **Data transmission**: Only encrypted blob, IV, and auth tag sent to server
3. **Storage**: PostgreSQL BYTEA columns store encrypted binary data
4. **Retrieval**: Server returns encrypted data, client decrypts locally

### Password Protection (Zero-Knowledge)

For password-protected snippets:

1. **DEK generation**: Random data encryption key generated client-side
2. **Content encryption**: Code encrypted with DEK using AES-256-GCM
3. **Password-based encryption**: DEK encrypted with password-derived key (PBKDF2)
4. **Server storage**: Only encrypted DEK stored, never plaintext password or DEK
5. **Retrieval**: Client re-derives key from password to decrypt DEK, then content

### Database Security

- **Encrypted storage**: All sensitive data stored as encrypted BYTEA
- **No plaintext exposure**: Server cannot decrypt any user content
- **Secure authentication**: JWT-based user sessions
- **Input validation**: Zod schema validation for all endpoints

## 🗄️ Database Schema

### Snippets Table

```sql
CREATE TYPE language AS ENUM (
  'PLAINTEXT', 'JSON', 'JAVASCRIPT', 'PYTHON', 'HTML', 
  'CSS', 'TYPESCRIPT', 'JAVA', 'BASH', 'MARKDOWN', 'CSHARP'
);

CREATE TABLE snippets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  encrypted_content TEXT NOT NULL,
  initialization_vector TEXT NOT NULL,
  auth_tag TEXT NOT NULL,
  title VARCHAR(255),
  language language NOT NULL DEFAULT 'PLAINTEXT',
  name VARCHAR(255),
  max_views INTEGER NOT NULL DEFAULT 1,
  current_views INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Password protection fields (optional)
  encrypted_dek TEXT,
  iv_for_dek TEXT,
  auth_tag_for_dek TEXT,
  kdf_salt TEXT,
  kdf_parameters JSONB
);
```

## 🚀 Deployment

### Production Deployment

1. **Set up secrets**

   ```bash
   wrangler secret put SUPABASE_DB_URL
   wrangler secret put SUPABASE_JWT_SECRET
   wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Configure environment variables**

   Update `wrangler.jsonc` with production values:

   ```json
   {
     "vars": {
       "FRONTEND_URL": "https://your-frontend-domain.com",
       "SUPABASE_API_URL": "https://your-project.supabase.co",
       "SUPABASE_ANON_KEY": "your-production-anon-key"
     }
   }
   ```

3. **Deploy**
   ```bash
   pnpm deploy
   ```

### Environment Variables

**Public Variables** (wrangler.jsonc):

- `FRONTEND_URL` - Frontend URL for CORS configuration
- `SUPABASE_API_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

**Secrets** (Cloudflare Workers secrets):

- `SUPABASE_DB_URL` - Direct database connection string
- `SUPABASE_JWT_SECRET` - JWT verification secret
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## 🛠️ Development Scripts

```bash
# Start development server with hot reload
pnpm dev

# Deploy to Cloudflare Workers (production)
pnpm deploy

# Build without deploying (dry run)
pnpm build

# Type checking
pnpm typecheck

# Generate Cloudflare Workers type definitions
pnpm cf-typegen

# Clean dependencies and Wrangler cache
pnpm clean

# Lint code
pnpm lint
```

## 📝 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

Common error scenarios:

- `404 Not Found` - Snippet doesn't exist, expired, or view limit reached
- `410 Gone` - Snippet has expired or reached max views  
- `400 Bad Request` - Invalid request data or validation errors
- `500 Internal Server Error` - Server processing errors

*Note: Standardized error codes are not yet implemented - errors return generic HTTP status codes with descriptive messages.*

## 🧪 Testing

Testing is not yet implemented for this API. This is a planned feature for future development.

## 📚 Related Documentation

- [Main Project README](../../README.md)
- [Frontend README](../web/README.md)
- [Product Requirements](../../docs/PRD.md)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Hono.js Documentation](https://hono.dev/)
