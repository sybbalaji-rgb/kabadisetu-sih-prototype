import React from "react";
import { ScannerCard } from "../features/scrapScanner/ScannerCard";

export function ScrapScanner({ onScanned }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      <ScannerCard onScanned={onScanned} />
    </div>
  );
}
