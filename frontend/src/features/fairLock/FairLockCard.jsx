import React from "react";
import { Lock, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardTitle } from "../../components/Card";
import { formatCurrency } from "../../utils";

export function FairLockCard({ lot, onLock, isRecycler }) {
  const isLocked = lot.status === "locked" || lot.status === "scheduled" || lot.status === "completed";

  return (
    <Card className="border-[#d5ded0]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-[#eaf2e7] text-[#173d30]">
            <Lock className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#173d30]">FairLock Guaranteed Rate</h4>
            <p className="text-[11px] text-[#698273]">7-day price freeze protection</p>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
            isLocked ? "bg-[#173d30] text-[#e9ff9d]" : "bg-amber-100 text-amber-900"
          }`}
        >
          {isLocked ? "Locked" : "Open for Offers"}
        </span>
      </div>

      <div className="rounded-2xl bg-[#f9fbf7] p-3 text-xs leading-5 border border-[#e8efe5]">
        <div className="flex justify-between font-bold text-[#355342]">
          <span>Material:</span>
          <span className="capitalize">{lot.material} ({lot.weight} kg)</span>
        </div>
        <div className="flex justify-between font-bold text-[#355342] mt-1">
          <span>Locked Unit Rate:</span>
          <span className="text-base font-black text-[#173d30]">
            {lot.lockedRate ? `₹${lot.lockedRate}/kg` : "Pending Lock"}
          </span>
        </div>
        {lot.validUntil && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#597163] mt-2 pt-2 border-t border-[#e8efe5]">
            <Clock className="size-3.5" />
            <span>Guaranteed until {new Date(lot.validUntil).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
