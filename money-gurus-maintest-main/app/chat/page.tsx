import { Suspense } from "react";
import ChatClient from "./ChatClient";

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--obsidian)" }} />}>
      <ChatClient />
    </Suspense>
  );
}
