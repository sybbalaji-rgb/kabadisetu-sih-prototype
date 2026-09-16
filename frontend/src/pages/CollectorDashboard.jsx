import React from "react";
import { Plus, Camera, Lock, Layers, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "../components/Button";
import { Card, CardTitle } from "../components/Card";
import { formatCurrency, MATERIAL_LABELS } from "../utils";

export function CollectorDashboard({ session, platformData, onNavigate }) {
  const lots = platformData?.lots || [];
  const completedLots = lots.filter((l) => l.status === "completed");
  const activeLots = lots.filter((l) => l.status !== "completed");
  const totalEarnings = completedLots.reduce((acc, l) => acc + (l.finalWeight || l.weight) * (l.finalRate || l.lockedRate || 0), 0);

  return (
    <div className="space-y-6 text-left">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-[#d5ded0] bg-linear-to-r from-[#173d30] to-[#245b46] p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-[#e9ff9d]/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#e9ff9d]">
              Informal Collector Portal
            </span>
            <h2 className="text-2xl font-black mt-2">Good morning, {session.displayName}</h2>
            <p className="text-xs text-white/80 mt-1 max-w-md">
              Your collection area is <strong>{session.serviceArea || "Pimpri, Pune"}</strong>. Turn daily scrap into verified fair earnings.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="accent"
              size="md"
              onClick={() => onNavigate("scan")}
              className="gap-1.5"
            >
              <Camera className="size-4" />
              <span>Scan Scrap</span>
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => onNavigate("create")}
              className="gap-1.5"
            >
              <Plus className="size-4" />
              <span>Create Lot</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white">
          <p className="text-[11px] font-bold uppercase text-[#698273]">Total Earnings</p>
          <p className="text-xl font-black text-[#173d30] mt-1">{formatCurrency(totalEarnings)}</p>
        </Card>
        <Card className="p-4 bg-white">
          <p className="text-[11px] font-bold uppercase text-[#698273]">Active Lots</p>
          <p className="text-xl font-black text-[#173d30] mt-1">{activeLots.length}</p>
        </Card>
        <Card className="p-4 bg-white">
          <p className="text-[11px] font-bold uppercase text-[#698273]">Completed Handover</p>
          <p className="text-xl font-black text-[#173d30] mt-1">{completedLots.length}</p>
        </Card>
        <Card className="p-4 bg-white">
          <p className="text-[11px] font-bold uppercase text-[#698273]">FairLock Protection</p>
          <p className="text-xl font-black text-emerald-700 mt-1">Active (100%)</p>
        </Card>
      </div>

      {/* Recent Scrap Lots Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>My Scrap Inventory</CardTitle>
          <Button variant="outline" size="sm" onClick={() => onNavigate("create")}>
            New Lot
          </Button>
        </div>

        {lots.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#698273]">
            No scrap lots created yet. Tap <strong>Scan Scrap</strong> or <strong>Create Lot</strong> to publish your first lot.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#355342]">
              <thead className="border-b border-[#e8efe5] text-[10px] uppercase font-black text-[#698273]">
                <tr>
                  <th className="py-2.5">Lot ID</th>
                  <th className="py-2.5">Material</th>
                  <th className="py-2.5">Weight</th>
                  <th className="py-2.5">Est. Value</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4ee]">
                {lots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-[#f9fcf7]">
                    <td className="py-3 font-mono font-bold text-[#173d30]">{lot.id}</td>
                    <td className="py-3 capitalize font-semibold">{MATERIAL_LABELS[lot.material] || lot.material}</td>
                    <td className="py-3 font-bold">{lot.weight} kg</td>
                    <td className="py-3 text-[#173d30] font-black">
                      ₹{lot.estimatedMin} - ₹{lot.estimatedMax}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                          lot.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : lot.status === "locked"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {lot.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {lot.passportId ? (
                        <Button variant="outline" size="sm" onClick={() => onNavigate("passport")}>
                          View Passport
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm" onClick={() => onNavigate("fairlock")}>
                          Details
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
