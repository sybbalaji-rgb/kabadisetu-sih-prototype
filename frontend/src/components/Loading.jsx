import React from "react";
import { Loader2 } from "lucide-react";

export function Loading({ label = "Loading data..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className="size-8 animate-spin text-[#173d30]" />
      <p className="mt-2 text-sm font-semibold text-[#597163]">{label}</p>
    </div>
  );
}
