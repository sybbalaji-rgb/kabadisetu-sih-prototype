import React, { useState, useRef } from "react";
import { Camera, Sparkles, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../../components/Button";
import { Card, CardTitle, CardContent } from "../../components/Card";
import { scanScrapImage } from "../../services/api";

export function ScannerCard({ onScanned }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError(null);
    setResult(null);
    setScanning(true);

    try {
      const data = await scanScrapImage(selected);
      setResult(data);
      if (onScanned) onScanned(data);
    } catch (err) {
      setError(err.message || "Failed to scan image");
    } finally {
      setScanning(false);
    }
  };

  return (
    <Card className="border-[#cde0a6] bg-[#f9fcf6]">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="size-5 text-[#2f6a40]" />
        <CardTitle>AI E-Waste Scrap Scanner</CardTitle>
      </div>
      <p className="text-xs text-[#597163] mb-4">
        Photograph your scrap. Our AI identifies the item, statutory CPCB category, and estimated weight.
      </p>

      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#ccd9c6] bg-white p-6 text-center">
        {preview ? (
          <div className="relative mb-4">
            <img src={preview} alt="Scrap preview" className="h-44 w-44 rounded-2xl object-cover shadow-sm" />
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 text-white font-bold text-xs backdrop-blur-xs">
                <RefreshCw className="size-5 animate-spin mr-1.5" />
                Analyzing Pixels...
              </div>
            )}
          </div>
        ) : (
          <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-[#eaf2e7] text-[#173d30]">
            <Camera className="size-7" />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />

        <Button
          variant="primary"
          size="md"
          onClick={() => fileInputRef.current?.click()}
          disabled={scanning}
          className="gap-2"
        >
          <Camera className="size-4" />
          <span>{preview ? "Take Another Photo" : "Upload or Take Photo"}</span>
        </Button>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-2xl border border-[#cde0a6] bg-[#f2f9e4] p-4 text-xs leading-5">
          <div className="flex items-center justify-between font-black text-[#173d30] text-sm mb-2">
            <span>{result.object}</span>
            <span className="rounded-full bg-[#173d30] px-2.5 py-0.5 text-[11px] text-[#e9ff9d]">
              {result.confidence}% confidence
            </span>
          </div>
          <p className="font-bold text-[#355342]">Category: {result.category}</p>
          <p className="text-[#597163] mt-1">{result.explanation}</p>
          <div className="mt-2.5 border-t border-[#dce8d5] pt-2 font-semibold text-[#255239]">
            Safety: {result.safetyTip}
          </div>
        </div>
      )}
    </Card>
  );
}
