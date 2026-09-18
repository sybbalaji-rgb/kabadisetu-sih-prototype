"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, Loader2 } from "lucide-react";

export function PublicPickupTracker({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<any[] | null>(null);

  const lookup = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchKey.trim()) return setError("Please enter your Mobile Number or Request ID.");
    
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "lookupPublicPickup", searchKey: searchKey.trim() })
      });
      const data = await res.json() as any;
      if (!res.ok) throw new Error(data.error || "Failed to lookup request.");
      setResults(data.requests);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[24px] bg-[#f5f5f5] shadow-2xl mt-8 mb-24">
        
        {/* Header */}
        <div className="relative p-6 text-center border-b border-gray-200">
          <button onClick={onClose} className="absolute right-6 top-6 rounded-full bg-black/5 p-2 hover:bg-black/10 transition">
            <X className="size-5 text-black" />
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#173d30] mb-2">Track Your Pickup</h2>
          <p className="text-sm font-semibold text-gray-700">Enter your Mobile Number or Request ID to view your booking.</p>
        </div>

        <div className="p-6">
          <form onSubmit={lookup} className="flex gap-3 mb-6">
            <Input 
              value={searchKey} 
              onChange={e => setSearchKey(e.target.value)} 
              placeholder="e.g. 9876543210 or REQ-XYZ..." 
              className="h-12 flex-1 rounded-xl border-gray-300 bg-white shadow-sm text-lg" 
            />
            <Button type="submit" disabled={loading} className="h-12 w-32 rounded-xl bg-[#173d30] font-bold text-white hover:bg-[#204e3e]">
              {loading ? <Loader2 className="animate-spin" /> : <><Search className="mr-2 size-4" /> Track</>}
            </Button>
          </form>
          
          {error && <p className="mb-4 text-center text-sm font-bold text-red-600">{error}</p>}

          {results !== null && (
            <div className="space-y-4">
              {results.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-semibold">
                  No pickup requests found for "{searchKey}".
                </div>
              ) : (
                results.map(req => (
                  <div key={req.id} className="rounded-2xl bg-white p-5 border border-gray-200 shadow-sm text-left">
                    <div className="border-b border-gray-100 pb-3 mb-3 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Request ID</p>
                        <p className="text-lg font-black text-[#173d30]">{req.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                        <span className={`inline-block text-xs font-black px-3 py-1 rounded-full uppercase ${req.status === 'completed' || req.status === 'collected' ? 'bg-green-100 text-green-800' : req.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">Scheduled Date</p>
                        <p className="font-bold text-gray-800">{req.pickupDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">Time Slot</p>
                        <p className="font-bold text-gray-800">{req.pickupTime}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500 font-semibold mb-1">Pickup Address</p>
                        <p className="font-bold text-gray-800">{req.address}, {req.city} - {req.pinCode}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">Name</p>
                        <p className="font-bold text-gray-800">{req.fullName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">Mobile</p>
                        <p className="font-bold text-gray-800">{req.mobile}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
