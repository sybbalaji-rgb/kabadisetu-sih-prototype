import React from "react";
import { History, CheckCircle, Clock } from "lucide-react";
import { Card, CardTitle } from "../components/Card";
import { formatCurrency, MATERIAL_LABELS } from "../utils";

export function Transactions({ platformData, session }) {
  const lots = platformData?.lots || [];

  return (
    <div className="space-y-6 text-left">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <History className="size-5 text-[#2f6a40]" />
          <CardTitle>Digital Transaction Ledger</CardTitle>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#355342]">
            <thead className="border-b border-[#e8efe5] text-[10px] uppercase font-black text-[#698273]">
              <tr>
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Lot ID</th>
                <th className="py-2.5">Material</th>
                <th className="py-2.5">Weight</th>
                <th className="py-2.5">Unit Rate</th>
                <th className="py-2.5">Net Payout</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ee]">
              {lots.map((lot) => {
                const payout = (lot.finalWeight || lot.weight) * (lot.finalRate || lot.lockedRate || 0);
                return (
                  <tr key={lot.id} className="hover:bg-[#f9fcf7]">
                    <td className="py-3 font-semibold text-[#597163]">
                      {new Date(lot.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 font-mono font-bold text-[#173d30]">{lot.id}</td>
                    <td className="py-3 capitalize font-semibold">{MATERIAL_LABELS[lot.material] || lot.material}</td>
                    <td className="py-3 font-bold">{lot.finalWeight || lot.weight} kg</td>
                    <td className="py-3 font-bold">₹{lot.finalRate || lot.lockedRate || "-"}/kg</td>
                    <td className="py-3 font-black text-[#173d30]">
                      {payout > 0 ? formatCurrency(payout) : "Pending"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                          lot.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {lot.paymentStatus || lot.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
