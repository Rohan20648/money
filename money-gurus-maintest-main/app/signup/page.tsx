"use client";

import { Suspense } from "react";
import SignupContent from "./SignupContent";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
