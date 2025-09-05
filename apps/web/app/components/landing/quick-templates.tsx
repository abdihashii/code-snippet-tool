import { useNavigate } from '@tanstack/react-router';
import {
  BugIcon,
  CodeIcon,
  DatabaseIcon,
  FileJsonIcon,
  GitBranchIcon,
  MessageSquareIcon,
  TerminalIcon,
  TestTubeIcon,
} from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickTemplatesProps {
  className?: string;
}

const TEMPLATES = [
  {
    id: 'debug-log',
    icon: BugIcon,
    title: 'Debug Log',
    description: 'Share error logs and stack traces',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800',
    template: `// Error Log - [Date]
// Environment: Development
// Component: UserAuthentication

Error: Authentication failed
    at authenticate (auth.js:42:15)
    at async handleLogin (login.js:18:5)
    at async onSubmit (form.js:33:9)
    
Stack trace:
    TypeError: Cannot read property 'token' of undefined
    
Context:
- User email: user@example.com
- Timestamp: 2024-01-15T10:30:45Z
- Request ID: abc-123-def`,
    language: 'javascript',
  },
  {
    id: 'code-review',
    icon: GitBranchIcon,
    title: 'Code Review',
    description: 'Share code for review or feedback',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    template: `// PR #123: Add user authentication
// Please review this implementation

class AuthService {
  constructor(private db: Database) {}
  
  async authenticate(email: string, password: string): Promise<User> {
    const user = await this.db.users.findOne({ email });
    
    if (!user || !await bcrypt.compare(password, user.hashedPassword)) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    return { ...user, token };
  }
  
  // TODO: Add refresh token logic
  // TODO: Add rate limiting
}

// Questions for reviewer:
// 1. Should we add caching for user lookups?
// 2. Is the error message too specific?`,
    language: 'typescript',
  },
  {
    id: 'api-response',
    icon: FileJsonIcon,
    title: 'API Response',
    description: 'Share API responses and payloads',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800',
    template: `{
  "status": "success",
  "data": {
    "user": {
      "id": "usr_2fG8kL9mN3",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "admin",
      "createdAt": "2024-01-15T08:00:00Z",
      "lastLogin": "2024-01-15T10:30:00Z"
    },
    "permissions": [
      "users:read",
      "users:write",
      "posts:manage",
      "analytics:view"
    ],
    "session": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600,
      "refreshToken": "rft_8hJ3kL9mN2"
    }
  },
  "timestamp": "2024-01-15T10:30:45Z",
  "requestId": "req_4fG8kL9mN3"
}`,
    language: 'json',
  },
  {
    id: 'sql-query',
    icon: DatabaseIcon,
    title: 'SQL Query',
    description: 'Share database queries',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-200 dark:border-purple-800',
    template: `-- Get user activity report for the last 30 days
WITH user_activity AS (
  SELECT 
    u.id,
    u.email,
    u.created_at,
    COUNT(DISTINCT s.id) as session_count,
    COUNT(DISTINCT p.id) as post_count,
    MAX(s.created_at) as last_active
  FROM users u
  LEFT JOIN sessions s ON u.id = s.user_id
  LEFT JOIN posts p ON u.id = p.author_id
  WHERE s.created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY u.id, u.email, u.created_at
)
SELECT 
  email,
  DATE(created_at) as signup_date,
  session_count,
  post_count,
  DATE(last_active) as last_active_date,
  CASE 
    WHEN session_count > 10 THEN 'High'
    WHEN session_count > 5 THEN 'Medium'
    ELSE 'Low'
  END as engagement_level
FROM user_activity
ORDER BY session_count DESC
LIMIT 100;`,
    language: 'sql',
  },
  {
    id: 'terminal-output',
    icon: TerminalIcon,
    title: 'Terminal Output',
    description: 'Share command outputs',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    borderColor: 'border-gray-200 dark:border-gray-800',
    template: `$ npm run build

> my-app@1.0.0 build
> vite build

vite v5.0.0 building for production...
✓ 234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-5f3d2a1b.css   23.60 kB │ gzip:  7.82 kB
dist/assets/index-a8b3f2c1.js   142.60 kB │ gzip: 45.23 kB

✓ built in 2.34s

$ npm run test

> my-app@1.0.0 test
> jest

 PASS  src/components/Button.test.tsx
 PASS  src/utils/auth.test.ts
 PASS  src/hooks/useUser.test.ts

Test Suites: 3 passed, 3 total
Tests:       12 passed, 12 total
Snapshots:   2 passed, 2 total
Time:        3.456s
Ran all test suites.`,
    language: 'bash',
  },
  {
    id: 'unit-test',
    icon: TestTubeIcon,
    title: 'Unit Test',
    description: 'Share test cases',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    borderColor: 'border-orange-200 dark:border-orange-800',
    template: `import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { AuthService } from '../services/auth';

jest.mock('../services/auth');

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should display validation errors for empty fields', async () => {
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  test('should call auth service on valid submission', async () => {
    const mockAuth = jest.spyOn(AuthService.prototype, 'login');
    mockAuth.mockResolvedValue({ token: 'fake-token' });
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@test.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockAuth).toHaveBeenCalledWith('user@test.com', 'password123');
    });
  });
});`,
    language: 'typescript',
  },
  {
    id: 'config-file',
    icon: CodeIcon,
    title: 'Config File',
    description: 'Share configuration snippets',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    template: `# Docker Compose Configuration
version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache
    volumes:
      - ./src:/app/src
      - node_modules:/app/node_modules

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data

  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  node_modules:`,
    language: 'yaml',
  },
  {
    id: 'interview',
    icon: MessageSquareIcon,
    title: 'Interview Question',
    description: 'Share interview coding challenges',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-950',
    borderColor: 'border-teal-200 dark:border-teal-800',
    template: `// Interview Question: Implement a LRU (Least Recently Used) Cache
// Requirements:
// - get(key): Get the value (will always be positive) of the key if exists, otherwise return -1
// - put(key, value): Set or insert the value if the key is not already present
// - When the cache reached its capacity, it should invalidate the least recently used item

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    
    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    // Remove old value
    this.cache.delete(key);
    
    // Add new value
    this.cache.set(key, value);
    
    // Check capacity
    if (this.cache.size > this.capacity) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

// Example usage:
const lru = new LRUCache(2);
lru.put(1, 1);      // cache is {1=1}
lru.put(2, 2);      // cache is {1=1, 2=2}
console.log(lru.get(1));  // returns 1, cache is {2=2, 1=1}
lru.put(3, 3);      // removes key 2, cache is {1=1, 3=3}
console.log(lru.get(2));  // returns -1 (not found)`,
    language: 'javascript',
  },
];

export function QuickTemplates({ className }: QuickTemplatesProps) {
  const navigate = useNavigate();
  const posthog = usePostHog();

  const handleTemplateClick = (template: typeof TEMPLATES[0]) => {
    posthog.capture('template_selected', {
      templateId: template.id,
      templateTitle: template.title,
    });

    // Navigate to /new with the template pre-filled
    navigate({
      to: '/new',
      search: {
        prefill: true,
        code: template.template,
        language: template.language,
        title: template.title,
      },
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          Start with a Template
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose from common use cases to get started instantly
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <Card
              key={template.id}
              className={cn(
                'cursor-pointer transition-all hover:scale-105 hover:shadow-lg',
                template.borderColor,
              )}
              onClick={() => handleTemplateClick(template)}
            >
              <CardContent className="p-4">
                <div className={cn('rounded-lg p-3 mb-3 w-fit', template.bgColor)}>
                  <Icon className={cn('h-6 w-6', template.color)} />
                </div>
                <h3 className="font-semibold mb-1">{template.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Click any template to start with pre-filled content
        </p>
      </div>
    </div>
  );
}
