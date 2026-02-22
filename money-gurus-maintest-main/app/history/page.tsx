import { Suspense } from "react";
import HistoryClient from "./HistoryClient";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="text-white text-center py-20">
        Loading history...
      </div>
    }>
      <HistoryClient />
    </Suspense>
  );
}
