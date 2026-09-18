"use client";

import { useTranslation } from "react-i18next";
import { CheckCircle2, Navigation, PackageCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CollectorTasks({
  plans = [],
  requests = [],
  act
}: {
  plans: any[];
  requests: any[];
  act: (action: string, values?: Record<string, unknown>) => Promise<any>;
}) {
  const { t } = useTranslation();
  
  if (plans.length === 0) return null;

  const updateStatus = async (planId: string, status: string) => {
    try {
      await act("updateCollectionStatus", { planId, status });
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
        <Navigation className="text-[#173d30]" />
        {t("assigned_collection_tasks") || "Assigned Collection Tasks"}
      </h2>
      
      <div className="space-y-4">
        {plans.map(plan => {
          const planRequests = requests.filter(r => r.planId === plan.id);
          return (
            <div key={plan.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 mb-3">
                <div>
                  <h3 className="text-lg font-black text-[#173d30] flex items-center gap-2">
                    <MapPin className="size-5" /> {plan.area}
                  </h3>
                  <p className="text-sm font-semibold text-gray-500">
                    {plan.pickupDate} • {plan.pickupTime}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t("plan_id") || "Plan ID"}: {plan.id} • {t("assigned_by_recycler") || "Assigned by Recycler"}: {plan.recyclerId}
                  </p>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-black rounded-full uppercase ${plan.status === 'completed' || plan.status === 'collected' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {t(plan.status) || plan.status}
                  </span>
                  {plan.status !== 'completed' && plan.status !== 'collected' && (
                    <select 
                      className="border-gray-200 rounded-lg text-sm bg-gray-50 font-semibold p-2 outline-none"
                      value={plan.status}
                      onChange={(e) => updateStatus(plan.id, e.target.value)}
                    >
                      <option value="assigned">{t("assigned") || "Assigned"}</option>
                      <option value="accepted">{t("accepted") || "Accepted"}</option>
                      <option value="in_progress">{t("in_progress") || "In Progress"}</option>
                      <option value="collected">{t("collected") || "Collected"}</option>
                      <option value="completed">{t("completed") || "Completed"}</option>
                    </select>
                  )}
                </div>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                {planRequests.map(req => (
                  <div key={req.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="font-bold text-gray-800">{req.fullName}</p>
                    <p className="text-xs text-gray-500 mt-1">{req.address}</p>
                    <p className="text-xs font-semibold text-[#173d30] mt-2">{req.mobile}</p>
                    {req.instructions && <p className="text-xs text-amber-700 font-medium mt-1">{t("note") || "Note"}: {req.instructions}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
