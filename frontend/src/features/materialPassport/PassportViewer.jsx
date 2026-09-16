import React from "react";
import { QrCode, ShieldCheck, CheckCircle2, FileCheck } from "lucide-react";
import { Card, CardTitle } from "../../components/Card";
import { formatCurrency } from "../../utils";

export function PassportViewer({ lot }) {
  if (!lot.passportId) {
    return (
      <Card className="border-dashed border-gray-300 text-center p-8">
        <p className="text-xs text-gray-500">
          Digital Material Passport is generated upon successful verified physical handover.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-[#cde0a6] bg-[#f9fcf6]">
      <div className="flex items-center justify-between border-b border-[#e5efdf] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-[#173d30] text-[#e9ff9d]">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#173d30]">Digital Material Passport</h4>
            <p className="text-[10px] font-bold text-[#597163] uppercase tracking-wider">
              ID: {lot.passportId}
            </p>
          </div>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-white border border-[#cde0a6] text-[#173d30]">
          <QrCode className="size-6" />
        </div>
      </div>

      <div className="space-y-2 text-xs text-[#355342]">
        <div className="flex justify-between border-b border-[#edf2eb] pb-1.5">
          <span className="text-[#698273]">Handover Code:</span>
          <span className="font-mono font-black text-[#173d30]">{lot.handoverCode}</span>
        </div>
        <div className="flex justify-between border-b border-[#edf2eb] pb-1.5">
          <span className="text-[#698273]">Verified Weight:</span>
          <span className="font-bold text-[#173d30]">{lot.finalWeight || lot.weight} kg</span>
        </div>
        <div className="flex justify-between border-b border-[#edf2eb] pb-1.5">
          <span className="text-[#698273]">Final Rate:</span>
          <span className="font-bold text-[#173d30]">₹{lot.finalRate || lot.lockedRate}/kg</span>
        </div>
        <div className="flex justify-between border-b border-[#edf2eb] pb-1.5">
          <span className="text-[#698273]">Settlement Status:</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-800">
            {lot.paymentStatus || "Paid"}
          </span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-[#698273]">EPR Compliance:</span>
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
            <CheckCircle2 className="size-3.5" />
            <span>Audited for CPCB Credits</span>
          </span>
        </div>
      </div>
    </Card>
  );
}
