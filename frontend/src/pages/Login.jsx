import React, { useState } from "react";
import { Recycle, ArrowRight, ShieldCheck, Truck, User } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { loginUser } from "../services/auth";

export function Login({ onLoginSuccess }) {
  const [role, setRole] = useState("collector");
  const [contact, setContact] = useState("+919876543210");
  const [displayName, setDisplayName] = useState("Ravi Kumar");
  const [authorizationId, setAuthorizationId] = useState("");
  const [serviceArea, setServiceArea] = useState("Pimpri, Pune");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const profile = await loginUser(role, contact, displayName, authorizationId, serviceArea);
      onLoginSuccess(profile);
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-[#d5ded0] p-8 shadow-lg">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex size-14 items-center justify-center rounded-3xl bg-[#173d30] text-[#e9ff9d] shadow-sm mb-3">
            <Recycle className="size-8" />
          </div>
          <h2 className="text-2xl font-black text-[#173d30]">Welcome to KabadiSetu</h2>
          <p className="text-xs text-[#597163] mt-1">
            Bringing Informal Collectors into the Formal Recycling Chain (SIH26229)
          </p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-[#edf3ea] rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setRole("collector");
              setDisplayName("Ravi Kumar");
              setContact("+919876543210");
            }}
            className={`flex flex-col items-center py-2 rounded-xl text-xs font-bold transition ${
              role === "collector" ? "bg-white text-[#173d30] shadow-xs" : "text-[#597163]"
            }`}
          >
            <User className="size-4 mb-1" />
            <span>Collector</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("recycler");
              setDisplayName("GreenLoop Recyclers");
              setContact("ops@greenloop.in");
              setAuthorizationId("CPCB-REC-2024-089");
            }}
            className={`flex flex-col items-center py-2 rounded-xl text-xs font-bold transition ${
              role === "recycler" ? "bg-white text-[#173d30] shadow-xs" : "text-[#597163]"
            }`}
          >
            <Truck className="size-4 mb-1" />
            <span>Recycler</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("authority");
              setDisplayName("JNARDDC Officer");
              setContact("compliance@jnarddc.gov.in");
              setAuthorizationId("JNARDDC2026");
            }}
            className={`flex flex-col items-center py-2 rounded-xl text-xs font-bold transition ${
              role === "authority" ? "bg-white text-[#173d30] shadow-xs" : "text-[#597163]"
            }`}
          >
            <ShieldCheck className="size-4 mb-1" />
            <span>JNARDDC</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-[#355342] mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full rounded-xl border border-[#ccd9c6] bg-white px-3.5 py-2.5 text-xs text-[#173d30] font-semibold focus:outline-[#173d30]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#355342] mb-1">Mobile Number / Email</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className="w-full rounded-xl border border-[#ccd9c6] bg-white px-3.5 py-2.5 text-xs text-[#173d30] font-semibold focus:outline-[#173d30]"
            />
          </div>

          {role !== "collector" && (
            <div>
              <label className="block text-xs font-bold text-[#355342] mb-1">
                {role === "authority" ? "Authority Access Passcode" : "CPCB / State Authorization ID"}
              </label>
              <input
                type="password"
                value={authorizationId}
                onChange={(e) => setAuthorizationId(e.target.value)}
                required
                placeholder={role === "authority" ? "Enter JNARDDC2026" : "e.g. CPCB-REC-2024-089"}
                className="w-full rounded-xl border border-[#ccd9c6] bg-white px-3.5 py-2.5 text-xs text-[#173d30] font-semibold focus:outline-[#173d30]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#355342] mb-1">Service Area / City</label>
            <input
              type="text"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              className="w-full rounded-xl border border-[#ccd9c6] bg-white px-3.5 py-2.5 text-xs text-[#173d30] font-semibold focus:outline-[#173d30]"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full gap-2 mt-2">
            <span>{loading ? "Signing In..." : "Enter Workspace"}</span>
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
