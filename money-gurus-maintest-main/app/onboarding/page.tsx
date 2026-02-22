import { Suspense } from "react";
import OnboardingClient from "./OnboardingClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--obsidian)" }} />}>
      <OnboardingClient />
    </Suspense>
  );
}
