import { createFileRoute, Link } from '@tanstack/react-router';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <AppLayout>
      <Card className="w-full max-w-md shadow-lg mx-auto">
        <CardContent>
          <div className="flex flex-col gap-4">
            <Link to="/new" className="w-full">
              <Button
                variant="outline"
                className="w-full border-primary text-primary hover:text-primary/90 hover:border-primary/90 hover:cursor-pointer"
              >
                Start Sharing
              </Button>
            </Link>
            {/* <Link to="/signup" className="w-full">
              <Button
                className="w-full bg-primary hover:bg-primary/90 hover:cursor-pointer"
              >
                Create an Account
              </Button>
            </Link> */}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
