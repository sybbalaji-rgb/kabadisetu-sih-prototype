"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, CheckCircle2, Truck, Loader2, Calendar } from "lucide-react";
import { materials } from "./kabadi-data";

export function PublicPickupForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [weight, setWeight] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [notes, setNotes] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !mobile.trim() || !address.trim() || !city.trim() || !category || !weight || !pickupDate || !timeSlot) {
      return setError("Please fill in all required fields.");
    }
    
    if (mobile.replace(/\D/g, "").length !== 10) {
      return setError("Please enter a valid 10-digit mobile number.");
    }
    
    const numWeight = Number(weight);
    if (!Number.isFinite(numWeight) || numWeight <= 0) {
      return setError("Please enter a valid estimated weight.");
    }

    const selectedDate = new Date(pickupDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return setError("Pickup date cannot be in the past.");
    }

    setLoading(true);
    try {
      const result = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedulePublicPickup",
          fullName, mobile, email, address, city, category,
          weight: numWeight, pickupDate, timeSlot, notes
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17312a]/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[34px] bg-[#f9fbf7] shadow-2xl my-8">
        
        <div className="flex items-center justify-between border-b border-[#d1dccb] bg-[#173d30] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <Truck className="size-6 text-[#e9ff9d]" />
            <h2 className="text-xl font-black">Schedule a Pickup</h2>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {successId ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-[#e9ff9d] text-[#173d30]">
                <CheckCircle2 className="size-10" />
              </div>
              <h3 className="mb-2 text-3xl font-black text-[#173d30]">Request Received!</h3>
              <p className="mb-6 max-w-md text-[#465b51]">
                Your pickup has been scheduled successfully. Our local collection partner will contact you shortly.
              </p>
              <div className="mb-8 rounded-2xl bg-[#edf2e9] p-4 border border-[#cbe1a9]">
                <p className="text-sm font-semibold text-[#65736c] uppercase tracking-wider">Request ID</p>
                <p className="text-xl font-black text-[#1c4735] tracking-widest">{successId}</p>
              </div>
              <Button onClick={onClose} size="lg" className="h-12 rounded-xl bg-[#173d30] px-8 text-white">
                Back to Home
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full Name *">
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" className="h-12 rounded-xl border-[#cbd5c5] bg-white" />
                </Field>
                <Field label="Mobile Number *">
                  <div className="flex gap-2">
                    <div className="flex h-12 items-center justify-center rounded-xl border border-[#cbd5c5] bg-[#f0f4ed] px-3 font-semibold text-[#465b51]">+91</div>
                    <Input value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ""))} maxLength={10} placeholder="10-digit number" className="h-12 flex-1 rounded-xl border-[#cbd5c5] bg-white" />
                  </div>
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email Address (Optional)">
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="h-12 rounded-xl border-[#cbd5c5] bg-white" />
                </Field>
                <Field label="City / Area *">
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Bhosari, Pune" className="h-12 rounded-xl border-[#cbd5c5] bg-white" />
                </Field>
              </div>

              <Field label="Pickup Address *">
                <Textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Complete address with landmark" className="min-h-24 rounded-xl border-[#cbd5c5] bg-white p-3 resize-none" />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="E-Waste Category *">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 rounded-xl border-[#cbd5c5] bg-white">
                      <SelectValue placeholder="Select material type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(materials).map(([key, meta]) => (
                        <SelectItem key={key} value={key}>{meta.icon} {meta.label}</SelectItem>
                      ))}
                      <SelectItem value="other">📦 Other / Mixed Scrap</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Estimated Weight (kg) *">
                  <Input type="number" step="0.1" min="0" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 5.5" className="h-12 rounded-xl border-[#cbd5c5] bg-white" />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Preferred Date *">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#65736c]" />
                    <Input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="h-12 pl-10 rounded-xl border-[#cbd5c5] bg-white" />
                  </div>
                </Field>
                <Field label="Preferred Time Slot *">
                  <Select value={timeSlot} onValueChange={setTimeSlot}>
                    <SelectTrigger className="h-12 rounded-xl border-[#cbd5c5] bg-white">
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9 AM - 12 PM">9 AM – 12 PM</SelectItem>
                      <SelectItem value="12 PM - 3 PM">12 PM – 3 PM</SelectItem>
                      <SelectItem value="3 PM - 6 PM">3 PM – 6 PM</SelectItem>
                      <SelectItem value="6 PM - 8 PM">6 PM – 8 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field label="Additional Notes (Optional)">
                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions for the pickup vehicle?" className="h-12 rounded-xl border-[#cbd5c5] bg-white" />
              </Field>

              {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#d1dccb]">
                <Button type="button" variant="outline" onClick={onClose} className="h-12 rounded-xl border-[#cbd5c5] bg-white px-6">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="h-12 rounded-xl bg-[#173d30] px-8 text-[#e9ff9d] hover:bg-[#204e3e]">
                  {loading ? <Loader2 className="mr-2 animate-spin size-5" /> : null}
                  Schedule Pickup
                </Button>
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
      <span className="mb-2 block text-sm font-bold text-[#465b51]">{label}</span>
      {children}
    </label>
  );
}
