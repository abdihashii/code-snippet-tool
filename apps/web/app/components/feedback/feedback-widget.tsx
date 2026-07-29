import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { submitFeedback } from '@/lib/api/feedback-api';
import { cn } from '@/lib/utils';

interface FeedbackWidgetProps {
  page: string;
  className?: string;
}

export function FeedbackWidget({ page, className }: FeedbackWidgetProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (rating: 0 | 1) => {
    if (submitted || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await submitFeedback({
        type: 'quick',
        rating,
        page,
      });

      if (response.success) {
        setSubmitted(true);
        toast.success('Thanks for your feedback!');
      } else {
        toast.error(response.error || 'Failed to submit feedback');
      }
    } catch {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        Thanks for your feedback!
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground">Was this helpful?</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleFeedback(1)}
        disabled={isSubmitting}
        className="h-8 px-2 hover:bg-success/10 hover:text-success"
      >
        <ThumbsUpIcon className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleFeedback(0)}
        disabled={isSubmitting}
        className="h-8 px-2 hover:bg-destructive/10 hover:text-destructive"
      >
        <ThumbsDownIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
