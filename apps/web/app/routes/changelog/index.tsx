import { createFileRoute } from '@tanstack/react-router';
import { BugIcon, SparklesIcon, WrenchIcon } from 'lucide-react';

import { AppLayout } from '@/components/layout/app-layout';
import { Card } from '@/components/ui/card';

export const Route = createFileRoute('/changelog/')({
  head: () => ({
    meta: [
      {
        title: 'Changelog - Snippet Share',
      },
      {
        name: 'description',
        content: 'Latest updates, features, and improvements to Snippet Share.',
      },
    ],
  }),
  component: Changelog,
});

// Types
interface ChangelogEntry {
  version: string;
  date: string;
  description?: string;
  features?: string[];
  improvements?: string[];
  bugFixes?: string[];
}

// Changelog Data - Add new releases here
const CHANGELOG_DATA: ChangelogEntry[] = [
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

// Export the current version (latest release)
export const CURRENT_VERSION = CHANGELOG_DATA[0]?.version ?? '';

// Components
function ChangeSection({
  icon: Icon,
  title,
  items,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  iconColor: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <ul className="list-disc space-y-2 ml-7 text-muted-foreground">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ReleaseCard({ entry }: { entry: ChangelogEntry }) {
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">{entry.version}</h2>
        {entry.description && (
          <p className="text-sm text-muted-foreground">{entry.description}</p>
        )}
      </div>

      {entry.features && (
        <ChangeSection
          icon={SparklesIcon}
          title="New Features"
          items={entry.features}
          iconColor="text-primary"
        />
      )}

      {entry.improvements && (
        <ChangeSection
          icon={WrenchIcon}
          title="Improvements"
          items={entry.improvements}
          iconColor="text-blue-500"
        />
      )}

      {entry.bugFixes && (
        <ChangeSection
          icon={BugIcon}
          title="Bug Fixes"
          items={entry.bugFixes}
          iconColor="text-orange-500"
        />
      )}
    </Card>
  );
}

function Changelog() {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Changelog
          </h1>
          <p className="text-lg text-muted-foreground">
            Latest updates and improvements
          </p>
        </div>

        {/* Render all releases */}
        {CHANGELOG_DATA.map((entry) => (
          <ReleaseCard key={entry.version} entry={entry} />
        ))}

        <div className="text-center text-sm text-muted-foreground py-4">
          More updates coming soon...
        </div>
      </div>
    </AppLayout>
  );
}
