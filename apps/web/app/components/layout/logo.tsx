interface LogoProps {
  /** header = wordmark in the app shell, lockup = full brand lockup */
  size?: 'header' | 'lockup';
}

export function Logo({ size = 'header' }: LogoProps) {
  return (
    <span
      className={`font-mono text-foreground ${size === 'lockup' ? 'text-lockup' : 'text-wordmark'}`}
    >
      snippet
      <span className="text-primary">://</span>
      share
    </span>
  );
}
