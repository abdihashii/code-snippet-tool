interface LogoProps {
  /** header = 17px (app shell), lockup = 28px (full brand lockup) */
  size?: 'header' | 'lockup';
}

export function Logo({ size = 'header' }: LogoProps) {
  return (
    <span
      className={`font-mono font-semibold text-foreground ${size === 'lockup' ? 'text-[28px]' : 'text-[17px]'}`}
    >
      snippet
      <span className="text-primary">://</span>
      share
    </span>
  );
}
