"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, UsersRound, Calendar, Clock, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function PickupRequestsManager({
  requests = [],
  collectors = [],
  act
}: {
  requests: any[];
  collectors: any[];
  act: (action: string, values?: Record<string, unknown>) => Promise<any>;
}) {
  const { t } = useTranslation();
  const [selectedCollector, setSelectedCollector] = useState<string>("");
  const [assigning, setAssigning] = useState<string | null>(null);

  // Grouping requests by: City + PinCode + Date + Time
  const groups: Record<string, any[]> = {};
  requests.filter(r => r.status === "pending").forEach(req => {
    const key = `${req.city} (${req.pinCode}) | ${req.pickupDate} | ${req.pickupTime}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(req);
  });

  const handleAssign = async (groupKey: string, reqs: any[]) => {
    if (!selectedCollector) return alert("Select a collector first");
    setAssigning(groupKey);
    try {
      const parts = groupKey.split(" | ");
      await act("assignPickupRequests", {
        collectorId: selectedCollector,
        requestIds: reqs.map(r => r.id),
        area: parts[0],
        pickupDate: parts[1],
        pickupTime: parts[2]
      });
      alert("Collection Plan created and assigned!");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
        <MapPin className="text-[#173d30]" />
        {t("area_wise_collection_planning") || "Area-wise Collection Planning"}
      </h2>
      <p className="text-sm text-gray-600 mb-6">{t("grouped_pickup_requests") || "Grouped pickup requests from public users."}</p>

      {Object.keys(groups).length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          {t("no_pending_pickup_requests") || "No pending pickup requests."}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([key, reqs]) => (
            <div key={key} className="rounded-2xl border border-[#d5ded0] bg-white p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                <div>
                  <h3 className="font-black text-lg text-[#173d30]">{key.split(" | ")[0]}</h3>
                  <p className="text-sm text-gray-600 font-semibold flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="size-4" /> {key.split(" | ")[1]}</span>
                    <span className="flex items-center gap-1"><Clock className="size-4" /> {key.split(" | ")[2]}</span>
                    <span className="flex items-center gap-1"><UsersRound className="size-4" /> {reqs.length} {t("requests") || "Requests"}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={selectedCollector} onValueChange={setSelectedCollector}>
                    <SelectTrigger className="w-48 bg-gray-50">
                      <SelectValue placeholder={t("select_collector") || "Select Collector"} />
                    </SelectTrigger>
                    <SelectContent>
                      {collectors.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => handleAssign(key, reqs)} 
                    disabled={assigning === key || !selectedCollector}
                    className="bg-[#173d30] text-white hover:bg-[#225741] font-bold"
                  >
                    {assigning === key ? (t("assigning") || "Assigning...") : (t("assign_and_create_plan") || "Assign & Create Plan")}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {reqs.map(req => (
                  <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div>
                      <p className="font-bold">{req.fullName}</p>
                      <p className="text-xs text-gray-500">{req.address}</p>
                      {req.instructions && <p className="text-xs mt-1 text-amber-700 font-medium">{t("note") || "Note"}: {req.instructions}</p>}
                    </div>
                    <div className="mt-2 sm:mt-0 text-right">
                      <p className="text-sm font-semibold">{req.mobile}</p>
                      <p className="text-xs text-gray-400">{req.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
