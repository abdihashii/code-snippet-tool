import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
}

/**
 * A component that ensures its children are only rendered on the client-side.
 * This is useful for components that rely on browser-specific APIs (e.g., `window`, `localStorage`)
 * which are not available during Server-Side Rendering (SSR).
 */
export function ClientOnly({ children }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
