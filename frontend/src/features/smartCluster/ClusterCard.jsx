import React from "react";
import { Layers, MapPin, Truck, Check } from "lucide-react";
import { Card, CardTitle } from "../../components/Card";
import { Button } from "../../components/Button";

export function ClusterCard({ cluster, onJoin, onLeave, hasJoined }) {
  return (
    <Card className="border-[#d5ded0]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-[#eaf2e7] text-[#173d30]">
            <Layers className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#173d30]">Cluster: {cluster.cluster_id}</h4>
            <p className="text-[11px] text-[#698273]">Neighborhood Logistics Pool</p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-[#355342] mb-4">
        <div className="flex items-center gap-1.5 font-semibold">
          <MapPin className="size-3.5 text-[#597163]" />
          <span>Location: {cluster.location}</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold">
          <Truck className="size-3.5 text-[#597163]" />
          <span>Material: <strong className="capitalize">{cluster.material}</strong></span>
        </div>
        <div className="flex justify-between font-bold border-t border-[#edf2eb] pt-2 mt-2">
          <span>Aggregated Volume:</span>
          <span className="text-[#173d30] font-black">{cluster.total_weight} kg ({cluster.lot_count} lots)</span>
        </div>
      </div>

      {onJoin && (
        <Button
          variant={hasJoined ? "outline" : "primary"}
          size="sm"
          onClick={hasJoined ? onLeave : onJoin}
          className="w-full gap-1.5"
        >
          {hasJoined ? (
            <>
              <Check className="size-3.5" />
              <span>Joined Cluster</span>
            </>
          ) : (
            <span>Join Pickup Cluster (+5% Bonus)</span>
          )}
        </Button>
      )}
    </Card>
  );
}
