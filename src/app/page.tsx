export const dynamic = "force-dynamic";

import { AppShell } from "@/components/layout/AppShell";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { loadLatestSnapshot } from "@/lib/snapshot";

export default async function HomePage() {
  const snapshot = await loadLatestSnapshot();

  return (
    <>
      <AppShell date={snapshot.date} source={snapshot.source} />
      <main className="min-h-screen pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-14 md:pb-10 md:pl-64 md:pt-0">
        <Dashboard snapshot={snapshot} />
      </main>
    </>
  );
}
