import { Suspense } from "react";
import NewMonthClient from "./NewMonthClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--obsidian)" }} />}>
      <NewMonthClient />
    </Suspense>
  );
}
