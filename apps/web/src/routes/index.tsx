import { createFileRoute, Link } from '@tanstack/react-router';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center gap-2">
        <Link to="/new">
          <Button
            variant="outline"
            className="w-[155px] border-teal-600 text-teal-600 hover:text-teal-700 hover:border-teal-700 hover:cursor-pointer flex items-center justify-center gap-2"
          >
            Start Sharing
          </Button>
        </Link>
        <Link to="/signup">
          <Button
            className="w-[155px] sm:w-auto bg-teal-600 hover:bg-teal-700 hover:cursor-pointer flex items-center justify-center gap-2"
          >
            Create an Account
          </Button>
        </Link>
      </div>
    </AppLayout>
  );
}
