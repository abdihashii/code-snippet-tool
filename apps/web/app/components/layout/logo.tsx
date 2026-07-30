interface LogoProps {
  /**
   * header = wordmark in the app shell, lockup = full brand lockup,
   * footer = quieter wordmark that sits in the footer's muted row
   */
  size?: 'header' | 'lockup' | 'footer';
}

const TONE = {
  header: 'text-wordmark text-foreground',
  lockup: 'text-lockup text-foreground',
  footer: 'text-caption text-muted-foreground',
};

export function Logo({ size = 'header' }: LogoProps) {
  // The mark never breaks across lines: the DS keeps `://` intact at every size.
  return (
    <span className={`whitespace-nowrap font-mono ${TONE[size]}`}>
      snippet
      <span className="text-primary">://</span>
      share
    </span>
  );
}
