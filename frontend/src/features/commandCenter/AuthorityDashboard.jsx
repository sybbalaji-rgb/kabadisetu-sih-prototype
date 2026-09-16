import React, { useState } from "react";
import { ShieldCheck, TrendingUp, Users, CheckCircle, XCircle } from "lucide-react";
import { Card, CardTitle } from "../../components/Card";
import { Button } from "../../components/Button";
import { apiCall } from "../../services/api";

export function AuthorityDashboard({ session, platformData, onRefresh }) {
  const [updating, setUpdating] = useState(false);

  const toggleVerify = async (recyclerId, currentStatus) => {
    setUpdating(true);
    try {
      await apiCall("verifyRecycler", {
        profileId: session.id,
        recyclerId,
        verified: !currentStatus,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const metrics = platformData?.metrics || {
    total_lots: 0,
    total_kg: 0,
    completed: 0,
    clustered: 0,
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#f9fbf7]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#698273]">Total Lots Registered</p>
          <p className="text-2xl font-black text-[#173d30] mt-1">{metrics.total_lots}</p>
        </Card>
        <Card className="p-4 bg-[#f9fbf7]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#698273]">Total Scrap Diverted</p>
          <p className="text-2xl font-black text-[#173d30] mt-1">{metrics.total_kg} kg</p>
        </Card>
        <Card className="p-4 bg-[#f9fbf7]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#698273]">Completed Handover</p>
          <p className="text-2xl font-black text-[#173d30] mt-1">{metrics.completed}</p>
        </Card>
        <Card className="p-4 bg-[#f9fbf7]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#698273]">Clustered Logistics</p>
          <p className="text-2xl font-black text-[#173d30] mt-1">{metrics.clustered}</p>
        </Card>
      </div>

      {/* Recycler Accreditation Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#2f6a40]" />
            <CardTitle>Registered Recycler KYC Verification</CardTitle>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#355342]">
            <thead className="border-b border-[#e8efe5] text-[10px] uppercase font-black text-[#698273]">
              <tr>
                <th className="py-2.5">Recycler Name</th>
                <th className="py-2.5">Service Area</th>
                <th className="py-2.5">Authorization ID</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ee]">
              {(platformData?.recyclers || []).map((rec) => (
                <tr key={rec.id} className="hover:bg-[#f9fcf7]">
                  <td className="py-3 font-bold text-[#173d30]">{rec.name}</td>
                  <td className="py-3">{rec.serviceArea || "Pune District"}</td>
                  <td className="py-3 font-mono text-[11px]">{rec.authorizationId || "CPCB-PENDING"}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        rec.verified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {rec.verified ? "Verified" : "Pending Audit"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      variant={rec.verified ? "outline" : "primary"}
                      size="sm"
                      onClick={() => toggleVerify(rec.id, rec.verified)}
                      disabled={updating}
                    >
                      {rec.verified ? "Revoke" : "Approve License"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
