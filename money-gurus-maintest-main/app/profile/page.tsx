import { Suspense } from "react";
import ProfileClient from "./ProfileClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--obsidian)" }} />}>
      <ProfileClient />
    </Suspense>
  );
}
