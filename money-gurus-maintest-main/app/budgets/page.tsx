import { Suspense } from "react";
import BudgetsClient from "./BudgetsClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--obsidian)" }} />}>
      <BudgetsClient />
    </Suspense>
  );
}
