// Types
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
