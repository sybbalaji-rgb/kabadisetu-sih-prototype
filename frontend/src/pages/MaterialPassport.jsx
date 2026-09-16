import React from "react";
import { PassportViewer } from "../features/materialPassport/PassportViewer";
import { Card, CardTitle } from "../components/Card";

export function MaterialPassport({ platformData }) {
  const completedLots = (platformData?.lots || []).filter((l) => l.passportId);

  return (
    <div className="space-y-6 text-left">
      <Card>
        <CardTitle className="mb-2">Digital Material Passports (EPR Traceability)</CardTitle>
        <p className="text-xs text-[#597163] mb-4">
          Every verified handover generates a cryptographically traceable passport enabling recyclers to claim statutory CPCB EPR credits.
        </p>

        {completedLots.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#f9fbf7] text-center text-xs text-[#698273]">
            No completed material passports yet. Passports are generated immediately upon on-site handover completion.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedLots.map((lot) => (
              <PassportViewer key={lot.id} lot={lot} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
