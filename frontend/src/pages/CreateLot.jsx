import React, { useState } from "react";
import { Plus, Check, ArrowRight } from "lucide-react";
import { Button } from "../components/Button";
import { Card, CardTitle } from "../components/Card";
import { apiCall } from "../services/api";
import { MATERIAL_LABELS } from "../utils";

export function CreateLot({ session, onCreated, prefillData }) {
  const [material, setMaterial] = useState(prefillData?.material || "cables");
  const [weight, setWeight] = useState(prefillData?.suggestedWeight || "");
  const [condition, setCondition] = useState("Sorted");
  const [location, setLocation] = useState(session.serviceArea || "Pimpri, Pune");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiCall("createLot", {
        profileId: session.id,
        material,
        weight: Number(weight),
        condition,
        location,
        imageName: prefillData?.object || "scrap-photo.jpg",
        aiConfidence: prefillData?.confidence || 0,
      });
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message || "Failed to publish lot");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto text-left">
      <Card>
        <CardTitle className="mb-2">Publish New Scrap Lot</CardTitle>
        <p className="text-xs text-[#597163] mb-4">
          Provide material specs. Your listing becomes instantly visible to verified recyclers under FairLock price protection.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#355342] mb-1">Material Category</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full rounded-xl border border-[#ccd9c6] bg-white px-3.5 py-2.5 text-xs text-[#173d30] font-semibold"
            >
              {Object.entries(MATERIAL_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#355342] mb-1">Approximate Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              placeholder="e.g. 5.5"
              className="w-full rounded-xl border border-[#ccd9c6] bg-white px-3.5 py-2.5 text-xs text-[#173d30] font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#355342] mb-1">Condition</label>
            <div className="grid grid-cols-3 gap-2">
              {["Sorted", "Mixed", "Damaged"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    condition === c
                      ? "bg-[#173d30] text-[#e9ff9d] border-[#173d30]"
                      : "bg-white text-[#597163] border-[#ccd9c6]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#355342] mb-1">Collection Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full rounded-xl border border-[#ccd9c6] bg-white px-3.5 py-2.5 text-xs text-[#173d30] font-semibold"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full gap-2 mt-2">
            <span>{submitting ? "Publishing..." : "Publish to Recyclers"}</span>
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
