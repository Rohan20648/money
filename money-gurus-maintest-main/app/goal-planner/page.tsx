import { Suspense } from "react";
import GoalPlannerClient from "./GoalPlannerClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--obsidian)" }} />}>
      <GoalPlannerClient />
    </Suspense>
  );
}
