import { SparklesIcon, XIcon } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';

interface AnnouncementBannerProps {
  message: string;
  onDismiss: () => void;
  show: boolean;
}

export function AnnouncementBanner({ message, onDismiss, show }: AnnouncementBannerProps) {
  if (!show) return null;

  return (
    <div className="w-full flex justify-center animate-in fade-in slide-in-from-top-2 duration-300 px-4 py-2">
      <Badge variant="default" className="inline-flex max-w-full px-3 py-1.5 pr-10 items-center justify-center relative">
        <div className="flex items-center gap-2 min-w-0">
          <SparklesIcon className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-xs font-medium truncate">{message}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="absolute right-2 h-6 w-6 p-0 hover:bg-primary-foreground/20 text-primary-foreground flex-shrink-0"
          aria-label="Dismiss announcement"
        >
          <XIcon className="h-3 w-3" />
        </Button>
      </Badge>
    </div>
  );
}
