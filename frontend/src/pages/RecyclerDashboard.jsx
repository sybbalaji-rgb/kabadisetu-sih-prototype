import React from "react";
import { Lock, Truck, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Card, CardTitle } from "../components/Card";
import { Button } from "../components/Button";
import { MATERIAL_LABELS } from "../utils";

export function RecyclerDashboard({ session, platformData, onNavigate, onLockLot }) {
  const lots = platformData?.lots || [];
  const availableLots = lots.filter((l) => l.status === "available");
  const myLockedLots = lots.filter((l) => l.recycler_id === session.id);

  return (
    <div className="space-y-6 text-left">
      <div className="rounded-3xl border border-[#d5ded0] bg-linear-to-r from-[#1c4735] to-[#2b684f] p-6 text-white shadow-md">
        <span className="rounded-full bg-[#e9ff9d]/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#e9ff9d]">
          Authorized Recycler Workspace
        </span>
        <h2 className="text-2xl font-black mt-2">{session.displayName}</h2>
        <p className="text-xs text-white/80 mt-1">
          Authorization: <strong>{session.authorizationId || "CPCB Authorized"}</strong> | Coverage: <strong>{session.serviceArea || "Pune & PCMC"}</strong>
        </p>
      </div>

      {/* Available Marketplace Lots */}
      <Card>
        <CardTitle className="mb-4">Available Scrap Lots in Service Area</CardTitle>
        {availableLots.length === 0 ? (
          <p className="text-xs text-[#698273] py-4">No open lots available right now. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableLots.map((lot) => (
              <div key={lot.id} className="rounded-2xl border border-[#e5ece3] p-4 bg-[#fbfdfa] text-xs">
                <div className="flex justify-between font-black text-[#173d30]">
                  <span>{lot.id} - {MATERIAL_LABELS[lot.material] || lot.material}</span>
                  <span>{lot.weight} kg</span>
                </div>
                <p className="text-[#597163] mt-1">Location: {lot.location}</p>
                <p className="font-bold text-[#204936] mt-1">Estimated: ₹{lot.estimatedMin} - ₹{lot.estimatedMax}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => onNavigate("fairlock")}
                  >
                    Lock FairPrice Offer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
