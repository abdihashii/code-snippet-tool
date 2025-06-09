import { createFileRoute, useRouter } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
  loader: () => 'Hello World',
});

function Home() {
  const router = useRouter();
  const state = Route.useLoaderData();

  return (
    <>
      <h1>Hello World</h1>
      <p>{state}</p>
      <button
        type="button"
        onClick={() => {
          router.invalidate();
        }}
      >
        Invalidate
      </button>
    </>
  );
}
