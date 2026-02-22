import { Suspense } from "react";
import LeaderboardClient from "./LeaderboardClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--obsidian)" }} />}>
      <LeaderboardClient />
    </Suspense>
  );
}
