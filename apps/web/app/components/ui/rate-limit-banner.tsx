import type { RateLimitInfo } from '@snippet-share/types';

import { AlertCircleIcon, ClockIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { RateLimitService } from '@/lib/services';

import { Badge } from './badge';
import { Button } from './button';

interface RateLimitBannerProps {
  rateLimitInfo: RateLimitInfo;
  onDismiss?: () => void;
  variant?: 'warning' | 'error' | 'info';
  showCountdown?: boolean;
}

export function RateLimitBanner({
  rateLimitInfo,
  onDismiss,
  variant = 'info',
  showCountdown = true,
}: RateLimitBannerProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  // Calculate time remaining for countdown
  useEffect(() => {
    if (!showCountdown || !rateLimitInfo.reset) {
      return;
    }

    const updateCountdown = () => {
      const resetDate = new Date(rateLimitInfo.reset! * 1000);
      const now = new Date();
      const diffSeconds = Math.ceil((resetDate.getTime() - now.getTime()) / 1000);

      if (diffSeconds <= 0) {
        setTimeRemaining('Now');
        return;
      }

      const minutes = Math.floor(diffSeconds / 60);
      const seconds = diffSeconds % 60;

      if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [rateLimitInfo.reset, showCountdown]);

  const handleDismiss = () => {
    if (!onDismiss) return;

    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
      setIsExiting(false);
    }, 300); // Match animation duration
  };

  const isRateLimited = rateLimitInfo.remaining === 0 || (rateLimitInfo.remaining !== null && rateLimitInfo.remaining < 0);
  const isWarning = !isRateLimited && rateLimitInfo.remaining !== null && rateLimitInfo.remaining <= 2;

  // Determine display variant
  let displayVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let Icon = ClockIcon;

  if (variant === 'error' || isRateLimited) {
    displayVariant = 'destructive';
    Icon = AlertCircleIcon;
  } else if (variant === 'warning' || isWarning) {
    displayVariant = 'outline';
    Icon = AlertCircleIcon;
  }

  // Generate message
  const getMessage = () => {
    if (isRateLimited) {
      return `Rate limit reached. ${timeRemaining ? `Resets in ${timeRemaining}` : RateLimitService.formatRateLimitMessage(rateLimitInfo)}`;
    }

    if (rateLimitInfo.remaining !== null && rateLimitInfo.limit !== null) {
      return `${rateLimitInfo.remaining} of ${rateLimitInfo.limit} requests remaining${timeRemaining ? ` (resets in ${timeRemaining})` : ''}`;
    }

    return 'Rate limit information available';
  };

  return (
    <div
      className={`w-full flex justify-center px-4 py-2 transition-all duration-300 ${
        isExiting
          ? 'animate-out fade-out slide-out-to-top-2'
          : 'animate-in fade-in slide-in-from-top-2'
      }`}
    >
      <div className="max-w-5xl mx-auto w-full flex justify-center">
        <Badge
          variant={displayVariant}
          className="inline-flex max-w-full px-3 py-1.5 pr-11 sm:pr-10 items-center relative"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-xs font-medium">
              {getMessage()}
            </span>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="absolute right-2 h-11 w-11 sm:h-9 sm:w-9 p-0 hover:bg-primary-foreground/20 text-primary-foreground flex-shrink-0"
              aria-label="Dismiss rate limit banner"
            >
              <XIcon className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
            </Button>
          )}
        </Badge>
      </div>
    </div>
  );
}
