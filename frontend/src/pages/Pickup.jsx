import React from "react";
import { ClusterCard } from "../features/smartCluster/ClusterCard";
import { Card, CardTitle } from "../components/Card";
import { apiCall } from "../services/api";

export function Pickup({ platformData, session, onRefresh }) {
  const clusters = platformData?.clusters || [];

  const handleJoin = async (clusterId) => {
    try {
      const myLot = platformData.lots?.find((l) => l.status === "available");
      if (!myLot) {
        alert("Please create an available lot first before joining a cluster.");
        return;
      }
      await apiCall("joinCluster", { profileId: session.id, lotId: myLot.id });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <Card>
        <CardTitle className="mb-2">Smart Cluster Pickup Aggregation</CardTitle>
        <p className="text-xs text-[#597163] mb-4">
          Neighborhood lots are dynamically grouped into consolidated dispatches to reduce freight cost and unlock higher rates.
        </p>

        {clusters.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#f9fbf7] text-center text-xs text-[#698273]">
            No clusters active currently. As lots are published in your area, clusters form automatically.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clusters.map((c) => (
              <ClusterCard
                key={c.cluster_id}
                cluster={c}
                onJoin={() => handleJoin(c.cluster_id)}
                hasJoined={platformData.lots?.some((l) => l.cluster_id === c.cluster_id)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
