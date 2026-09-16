import React from "react";
import { FairLockCard } from "../features/fairLock/FairLockCard";
import { Card, CardTitle } from "../components/Card";

export function PriceOffers({ platformData, session }) {
  const lots = platformData?.lots || [];

  return (
    <div className="space-y-6 text-left">
      <Card>
        <CardTitle className="mb-2">FairLock Protected Price Commitments</CardTitle>
        <p className="text-xs text-[#597163] mb-4">
          All prices are locked for 7 days based on JNARDDC statutory benchmark rates. No arbitrary on-site deductions.
        </p>

        {lots.length === 0 ? (
          <p className="text-xs text-[#698273] py-4">No active lots currently under negotiation.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lots.map((lot) => (
              <FairLockCard key={lot.id} lot={lot} isRecycler={session?.role === "recycler"} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
