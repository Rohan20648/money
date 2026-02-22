"use client";

import { Suspense } from "react";
import PortfolioClient from "./PortfolioClient";

export default function PortfolioPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading portfolio...</div>}>
      <PortfolioClient />
    </Suspense>
  );
}
