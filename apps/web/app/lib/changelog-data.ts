export interface ChangelogEntry {
  version: string;
  date: string;
  description?: string;
  features?: string[];
  improvements?: string[];
  bugFixes?: string[];
}

// Changelog Data - Add new releases here
export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: '2026.01.27',
    date: 'January 27, 2026',
    description: 'UI Polish',
    improvements: [
      'Improved code editor layout with better spacing and text wrapping',
    ],
  },
  {
    version: '2026.01.10',
    date: 'January 10, 2026',
    description: 'Privacy Enhancement Update',
    improvements: [
      'Disabled session recordings - we only collect anonymous page view metrics now',
      'Removed all tracking cookies - GDPR-compliant by design, no consent banner needed',
      'Blocked AI training bots from crawling the site',
    ],
  },
  {
    version: '2026.01.01',
    date: 'January 1, 2026',
    description: 'Feedback & Trust Enhancements',
    features: [
      'Encryption progress indicator showing real-time status during snippet creation',
      'Quick feedback widget (thumbs up/down) after creating a snippet',
      'Detailed feedback form with star ratings accessible from footer',
    ],
    improvements: [
      'Updated messaging to appeal to broader audience beyond developers',
      'Enhanced success state with email sharing option',
      'Success state now displays snippet expiration time and view limits',
    ],
  },
  {
    version: '2025.10.16',
    date: 'October 16, 2025',
    description: 'Rate Limiting System Overhaul',
    features: [
      'New rate limit banner component to inform users of their usage limits',
    ],
    improvements: [
      'Complete rate limiting system refactor with better error handling',
      'Updated rate limiting documentation with troubleshooting guide',
      'Enhanced API response types for rate limit information',
    ],
    bugFixes: [
      'Fixed rate limiting implementation across frontend and backend',
      'Corrected Durable Object bindings in wrangler configuration',
      'Fixed rate limit counter collisions with unique key prefixes',
    ],
  },
  {
    version: '2025.10.15',
    date: 'October 15, 2025',
    description: 'Download Experience Enhancement',
    features: [
      'Language-specific file extensions for snippet downloads (e.g., .js, .py, .rs, .html instead of .txt)',
      'Added comprehensive test suite with 100% coverage for language utilities',
    ],
    improvements: [
      'Improved IDE integration by using proper file extensions for downloaded snippets',
    ],
  },
  {
    version: '2025.10.13',
    date: 'October 13, 2025',
    description: 'Layout & Responsive Design Updates',
    improvements: [
      'Enhanced responsive layout across announcement banner and multiple pages',
      'Improved mobile and desktop layout consistency',
    ],
  },
  {
    version: '2025.10.12',
    date: 'October 12, 2025',
    description: 'Latest Updates',
    features: [
      'Added syntax highlighting for PHP, Ruby, Go, C, and C++',
      'Language dropdown now shows visual icons for each language',
      'New dismissible announcement banner with smooth animations and localStorage persistence',
    ],
    improvements: [
      'Simplified landing page experience by consolidating routes',
      'Announcement banner now shows shorter messages on mobile devices',
      'Form options now closed by default for cleaner interface',
      'Improved mobile touch targets with 44px button sizes',
    ],
    bugFixes: [
      'Fixed import paths in Dialog component',
      'Improved AnnouncementBanner layout and styling consistency',
      'Better responsive design for announcement messages across screen sizes',
    ],
  },
  // Add new releases here - newest first:
  // {
  //   version: '2025.10.20',
  //   date: 'October 20, 2025',
  //   description: 'Performance Update',
  //   features: ['New feature...'],
  //   improvements: ['Some improvement...'],
  //   bugFixes: ['Fixed bug...'],
  // },
];
