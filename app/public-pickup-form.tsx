"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";

export function PublicPickupForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Delhi");
  const [pinCode, setPinCode] = useState("");
  const [email, setEmail] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [instructions, setInstructions] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !mobile.trim() || !address.trim() || !city.trim() || !pinCode.trim() || !pickupDate || !pickupTime) {
      return setError("Please fill in all required fields.");
    }
    
    if (mobile.replace(/\D/g, "").length !== 10) {
      return setError("Please enter a valid 10-digit mobile number.");
    }

    setLoading(true);
    try {
      const result = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedulePublicPickup",
          fullName, mobile, email, address, city, pinCode,
          pickupDate, pickupTime, instructions
        })
      });
      const data = (await result.json()) as Record<string, string>;
      if (!result.ok) throw new Error(data.error || "Failed to submit request.");
      setSuccessId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[24px] bg-[#f5f5f5] shadow-2xl my-8">
        
        {/* Header */}
        <div className="relative p-6 sm:p-8 text-center border-b border-gray-200">
          <button onClick={onClose} className="absolute right-6 top-6 rounded-full bg-black/5 p-2 hover:bg-black/10 transition">
            <X className="size-5 text-black" />
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#173d30] mb-2">Please Fill form to Schedule a Scrap Pickup</h2>
          <p className="text-sm font-semibold text-gray-700">For Any Query Contact us on +91-8920666322</p>
        </div>

        <div className="p-6 sm:p-8">
          {successId ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <h3 className="mb-4 text-3xl font-black text-[#173d30]">Success!</h3>
              <p className="mb-6 max-w-md text-gray-700 font-medium">
                Your pickup request has been received. Our team will contact you shortly.
              </p>
              <div className="mb-8 rounded-xl bg-white p-6 border border-gray-200 shadow-sm">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Request ID</p>
                <p className="text-2xl font-black text-[#173d30] tracking-widest">{successId}</p>
              </div>
              <Button onClick={onClose} size="lg" className="h-12 rounded-lg bg-[#173d30] px-10 font-bold text-white hover:bg-[#204e3e]">
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Name *">
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your Name" className="h-12 rounded-lg border-gray-300 bg-white shadow-sm" />
                </Field>
                <Field label="Mobile Number *">
                  <div className="flex h-12 rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-center bg-gray-50 px-4 border-r border-gray-300 font-medium text-gray-700">
                      🇮🇳 +91
                    </div>
                    <input 
                      type="tel"
                      value={mobile} 
                      onChange={e => setMobile(e.target.value.replace(/\D/g, ""))} 
                      maxLength={10} 
                      placeholder="Enter your Mobile ..." 
                      className="flex-1 px-3 outline-none text-sm"
                    />
                  </div>
                </Field>
              </div>

              <Field label="Address *">
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter your address" className="h-12 rounded-lg border-gray-300 bg-white shadow-sm" />
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Select City *">
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger className="h-12 rounded-lg border-gray-300 bg-white shadow-sm">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Gurugram">Gurugram</SelectItem>
                      <SelectItem value="Noida">Noida</SelectItem>
                      <SelectItem value="Faridabad">Faridabad</SelectItem>
                      <SelectItem value="Ghaziabad">Ghaziabad</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Pin Code *">
                  <Input value={pinCode} onChange={e => setPinCode(e.target.value)} placeholder="Enter Pin Code" className="h-12 rounded-lg border-gray-300 bg-white shadow-sm" />
                </Field>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Email">
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="h-12 rounded-lg border-gray-300 bg-white shadow-sm" />
                </Field>
                <Field label="Pickup date *">
                  <Input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="h-12 rounded-lg border-gray-300 bg-white shadow-sm" placeholder="Choose a date" />
                </Field>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Pickup Time *">
                  <Input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="h-12 rounded-lg border-gray-300 bg-white shadow-sm" placeholder="HH:MM AM" />
                </Field>
              </div>

              <Field label="Any Instructions">
                <Textarea value={instructions} onChange={e => setInstructions(e.target.value)} className="min-h-[120px] rounded-lg border-gray-300 bg-white shadow-sm p-3 resize-y" />
              </Field>

              {error && <p className="text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}

              <div className="pt-4 flex flex-col items-center">
                <Button type="submit" disabled={loading} className="w-full sm:w-64 h-12 rounded-lg bg-[#173d30] text-white font-bold text-lg shadow-md hover:bg-[#204e3e] transition-colors">
                  {loading ? <Loader2 className="mr-2 animate-spin size-5" /> : null}
                  Submit
                </Button>
                <p className="mt-6 text-sm font-semibold text-gray-700">Facing Problems? Call us at 1800-889-1450</p>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-black">{label}</span>
      {children}
    </label>
  );
}
