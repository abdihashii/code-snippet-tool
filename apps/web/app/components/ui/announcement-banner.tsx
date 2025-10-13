import { SparklesIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './badge';
import { Button } from './button';

interface AnnouncementBannerProps {
  message: string;
  onDismiss: () => void;
  show: boolean;
}

export function AnnouncementBanner({ message, onDismiss, show }: AnnouncementBannerProps) {
  const [isExiting, setIsExiting] = useState(false);

  if (!show && !isExiting) return null;

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
      setIsExiting(false);
    }, 300); // Match animation duration
  };

  return (
    <div
      className={`w-full flex justify-center px-4 py-2 transition-all duration-300 ${
        isExiting
          ? 'animate-out fade-out slide-out-to-top-2'
          : 'animate-in fade-in slide-in-from-top-2'
      }`}
    >
      <Badge variant="default" className="inline-flex max-w-full px-3 py-1.5 pr-12 sm:pr-10 items-center relative">
        <div className="flex items-center gap-2 min-w-0">
          <SparklesIcon className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-xs font-medium break-words sm:truncate">{message}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="absolute right-2 h-8 w-8 sm:h-6 sm:w-6 p-0 hover:bg-primary-foreground/20 text-primary-foreground flex-shrink-0"
          aria-label="Dismiss announcement"
        >
          <XIcon className="h-3 w-3" />
        </Button>
      </Badge>
    </div>
  );
}
