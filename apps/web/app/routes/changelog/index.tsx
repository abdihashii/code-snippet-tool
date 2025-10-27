import { createFileRoute } from '@tanstack/react-router';
import { BugIcon, SparklesIcon, WrenchIcon } from 'lucide-react';

import type { ChangelogEntry } from '@/lib/changelog-data';

import { AppLayout } from '@/components/layout/app-layout';
import { Card } from '@/components/ui/card';
import { CHANGELOG_DATA } from '@/lib/changelog-data';

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
        {items.map((item) => (
          <li key={item}>{item}</li>
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="pt-12 pb-8 border-b">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Changelog
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Latest updates and improvements
          </p>
        </div>

        {/* Changelog Entries */}
        <div className="py-12 space-y-8">
          {CHANGELOG_DATA.map((entry) => (
            <ReleaseCard key={entry.version} entry={entry} />
          ))}

          <div className="text-center text-sm text-muted-foreground py-8">
            More updates coming soon...
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
