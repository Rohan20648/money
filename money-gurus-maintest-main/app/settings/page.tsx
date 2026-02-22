import { Suspense } from "react";
import SettingsClient from "./SettingsClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--obsidian)" }} />}>
      <SettingsClient />
    </Suspense>
  );
}
