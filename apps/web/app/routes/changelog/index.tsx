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

function Changelog() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Changelog
          </h1>
          <p className="text-lg text-muted-foreground">
            Latest updates and improvements
          </p>
        </div>

        {/* Release: 2025.10.12 */}
        <Card className="p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">2025.10.12</h2>
            <p className="text-sm text-muted-foreground">Latest Updates</p>
          </div>

          {/* New Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">New Features</h3>
            </div>
            <ul className="list-disc space-y-2 ml-7 text-muted-foreground">
              <li>
                Added syntax highlighting for PHP, Ruby, Go, C, and C++
              </li>
              <li>
                Language dropdown now shows visual icons for each language
              </li>
              <li>
                New dismissible announcement banner with smooth animations and localStorage persistence
              </li>
            </ul>
          </div>

          {/* Improvements */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <WrenchIcon className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-medium">Improvements</h3>
            </div>
            <ul className="list-disc space-y-2 ml-7 text-muted-foreground">
              <li>
                Simplified landing page experience by consolidating routes
              </li>
              <li>
                Announcement banner now shows shorter messages on mobile devices
              </li>
              <li>
                Form options now closed by default for cleaner interface
              </li>
              <li>
                Improved mobile touch targets with 44px button sizes
              </li>
            </ul>
          </div>

          {/* Bug Fixes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BugIcon className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-medium">Bug Fixes</h3>
            </div>
            <ul className="list-disc space-y-2 ml-7 text-muted-foreground">
              <li>
                Fixed import paths in Dialog component
              </li>
              <li>
                Improved AnnouncementBanner layout and styling consistency
              </li>
              <li>
                Better responsive design for announcement messages across screen sizes
              </li>
            </ul>
          </div>
        </Card>

        {/* Future releases can be added here */}
        <div className="text-center text-sm text-muted-foreground py-4">
          More updates coming soon...
        </div>
      </div>
    </AppLayout>
  );
}
