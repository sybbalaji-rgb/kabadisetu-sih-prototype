"use client";

import { useState } from "react";
import {
  AlertTriangle, ArrowRight, Boxes, ClipboardCheck, Factory, History, IndianRupee, LockKeyhole,
  PackageCheck, Scale, ShieldCheck, Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Lot, RecyclerView, formatDate, materials, money } from "./kabadi-data";
import { EmptyState, Field, InfoCell, MetricCard, ReceiptCell, StatusPill } from "./kabadi-ui";

export function RecyclerDashboard({
  lots, view, setView, onUpdate, onBanner, onCollectorReceipt,
}: {
  lots: Lot[];
  view: RecyclerView;
  setView: (view: RecyclerView) => void;
  onUpdate: (lot: Lot) => void;
  onBanner: (message: string) => void;
  onCollectorReceipt: (lot: Lot) => void;
}) {
  const [handoverId, setHandoverId] = useState("");
  const activeHandover = lots.find((lot) => lot.id === handoverId) ?? lots.find((lot) => lot.status === "scheduled" || lot.status === "locked") ?? lots.find((lot) => lot.status !== "completed");
  const pendingLots = lots.filter((lot) => lot.status !== "completed");
  const completedLots = lots.filter((lot) => lot.status === "completed");
  const totalKg = completedLots.reduce((sum, lot) => sum + (lot.finalWeight ?? lot.weight), 0);
  const openHandover = (lot: Lot) => { setHandoverId(lot.id); setView("handover"); };

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#617269]"><Factory className="size-4" /> Recycler interface</div><h2 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">GreenLoop E-Waste</h2><p className="mt-2 text-sm text-[#6a7871]">Verified demo recycler • Pune service area</p></div>
        <div className="flex flex-wrap gap-2 rounded-2xl border border-[#d5ded0] bg-[#f9fbf7] p-2 shadow-sm">
          {(["lots", "handover", "history"] as RecyclerView[]).map((item) => <Button key={item} variant="ghost" className={`rounded-xl capitalize ${view === item ? "bg-[#173d30] text-white hover:bg-[#173d30] hover:text-white" : ""}`} onClick={() => setView(item)}>{item === "lots" ? <Boxes /> : item === "handover" ? <ClipboardCheck /> : <History />}{item}</Button>)}
        </div>
      </div>
      <section className="mt-6 grid gap-4 sm:grid-cols-3"><MetricCard icon={Boxes} label="Open lots" value={String(pendingLots.length)} detail="Available and scheduled" tone="lime" /><MetricCard icon={Truck} label="Pickup queue" value={String(lots.filter((lot) => lot.status === "scheduled").length)} detail="Confirmed collector visits" tone="white" /><MetricCard icon={Scale} label="Verified material" value={`${totalKg.toFixed(1)} kg`} detail="Completed handovers" tone="white" /></section>
      <div className="mt-6">
        {view === "lots" && <RecyclerLots lots={pendingLots} onOpen={openHandover} onUpdate={onUpdate} onBanner={onBanner} />}
        {view === "handover" && activeHandover && <HandoverForm lot={activeHandover} onUpdate={(updated) => { onUpdate(updated); setHandoverId(updated.id); }} onBanner={onBanner} onComplete={() => setView("history")} />}
        {view === "handover" && !activeHandover && <EmptyState title="No handovers waiting" text="Accepted collector lots will appear here." />}
        {view === "history" && <RecyclerHistory lots={completedLots} onReceipt={onCollectorReceipt} />}
      </div>
    </div>
  );
}

function RecyclerLots({ lots, onOpen, onUpdate, onBanner }: { lots: Lot[]; onOpen: (lot: Lot) => void; onUpdate: (lot: Lot) => void; onBanner: (message: string) => void }) {
  if (!lots.length) return <EmptyState title="No open lots" text="New synced collector lots will appear here." />;
  const accept = (lot: Lot) => {
    const rate = Math.round(((lot.estimatedMin + lot.estimatedMax) / 2) / Math.max(lot.weight, 1)) + 4;
    const updated: Lot = {
      ...lot, selectedRecyclerId: "greenloop", lockedRate: rate,
      fairLockId: lot.fairLockId ?? `FL-${String(Date.now()).slice(-4)}`,
      validUntil: lot.validUntil ?? new Date(Date.now() + 86400000).toISOString(),
      pickupDate: lot.pickupDate ?? new Date(Date.now() + 86400000).toISOString(), status: "scheduled",
    };
    onUpdate(updated); onBanner("Lot accepted with FairLock and pickup confirmation"); onOpen(updated);
  };
  return (
    <section className="rounded-[30px] border border-[#d5ded0] bg-[#f9fbf7] p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between px-2 pb-5"><div><h3 className="text-xl font-black">Collector lots</h3><p className="mt-1 text-xs text-[#718078]">Rates and identities are illustrative prototype data.</p></div><span className="rounded-full bg-[#e8f2b7] px-3 py-1 text-xs font-bold">{lots.length} open</span></div>
      <div className="space-y-3">{lots.map((lot) => <article key={lot.id} className="grid gap-4 rounded-[24px] border border-[#dbe2d6] bg-white p-4 md:grid-cols-[1.4fr_0.7fr_0.7fr_auto] md:items-center"><div className="flex items-center gap-4"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#edf2e9] text-xl font-black text-[#3b5c48]">{materials[lot.material].icon}</div><div><p className="font-black">{materials[lot.material].label}</p><p className="mt-1 text-xs text-[#6d7b73]">{lot.id} • {lot.location}</p></div></div><div><p className="text-xs text-[#718078]">Approx. weight</p><p className="mt-1 font-black">{lot.weight} kg</p></div><div><p className="text-xs text-[#718078]">Expected value</p><p className="mt-1 font-black">{money(lot.estimatedMin)}–{money(lot.estimatedMax)}</p></div><div className="flex items-center gap-2"><StatusPill status={lot.status} />{lot.status === "available" || lot.status === "offline" ? <Button className="rounded-xl bg-[#173d30]" disabled={lot.status === "offline"} onClick={() => accept(lot)}>Accept <ArrowRight /></Button> : <Button variant="outline" className="rounded-xl" onClick={() => onOpen(lot)}>Open <ArrowRight /></Button>}</div></article>)}</div>
    </section>
  );
}

function HandoverForm({ lot, onUpdate, onBanner, onComplete }: { lot: Lot; onUpdate: (lot: Lot) => void; onBanner: (message: string) => void; onComplete: () => void }) {
  const defaultRate = lot.lockedRate ?? Math.round(((lot.estimatedMin + lot.estimatedMax) / 2) / Math.max(lot.weight, 1));
  const [finalWeight, setFinalWeight] = useState(String(lot.finalWeight ?? lot.weight));
  const [finalRate, setFinalRate] = useState(String(lot.finalRate ?? defaultRate));
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [payment, setPayment] = useState<"paid" | "pending" | "partial">("paid");
  const [collectorApproved, setCollectorApproved] = useState(false);
  const priceChanged = Number(finalRate) !== defaultRate;
  const weightChanged = Math.abs(Number(finalWeight) - lot.weight) > 0.01;
  const finalAmount = (Number(finalWeight) || 0) * (Number(finalRate) || 0);
  const complete = () => {
    const updated: Lot = {
      ...lot, status: "completed", finalWeight: Number(finalWeight), finalRate: Number(finalRate), paymentStatus: payment,
      handoverCode: `KBS-${String(Date.now()).slice(-4)}`, completedAt: new Date().toISOString(),
      priceChangeReason: priceChanged ? `${reason}${evidence ? ` — ${evidence}` : ""}` : undefined,
    };
    onUpdate(updated); onBanner("Verified handover completed — collector ledger updated"); onComplete();
  };
  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
      <div className="rounded-[30px] border border-[#d5ded0] bg-[#f9fbf7] p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#708078]">Final handover</p><h3 className="mt-1 text-2xl font-black">{lot.id} · {materials[lot.material].label}</h3><p className="mt-2 text-sm text-[#6b7971]">Collector: Ravi • {lot.location}</p></div>{lot.fairLockId && <span className="rounded-full bg-[#fff0b9] px-3 py-1.5 text-xs font-bold text-[#654d00]"><LockKeyhole className="mr-1 inline size-3" /> {lot.fairLockId}</span>}</div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Final scale weight"><div className="relative"><Input type="number" step="0.1" min="0.1" value={finalWeight} onChange={(event) => setFinalWeight(event.target.value)} className="h-12 rounded-xl border-[#cbd5c5] bg-white pr-12" /><span className="absolute right-4 top-3.5 text-sm font-semibold">kg</span></div></Field><Field label="Final rate"><div className="relative"><IndianRupee className="absolute left-4 top-3.5 size-4" /><Input type="number" value={finalRate} onChange={(event) => setFinalRate(event.target.value)} className="h-12 rounded-xl border-[#cbd5c5] bg-white pl-11 pr-14" /><span className="absolute right-4 top-3.5 text-sm font-semibold">/kg</span></div></Field></div>
        {(priceChanged || weightChanged) && <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><div className="flex items-center gap-2 font-bold"><AlertTriangle className="size-4" /> Variance detected</div><p className="mt-1 text-xs leading-5">Original: {lot.weight} kg at ₹{defaultRate}/kg. Collector approval is required.</p></div>}
        {priceChanged && <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Mandatory rate-change reason"><Select value={reason} onValueChange={setReason}><SelectTrigger className="h-12 w-full rounded-xl border-[#cbd5c5] bg-white"><SelectValue placeholder="Select a reason" /></SelectTrigger><SelectContent><SelectItem value="Condition differs from photo">Condition differs from photo</SelectItem><SelectItem value="Category corrected">Category corrected</SelectItem><SelectItem value="Moisture or contamination">Moisture or contamination</SelectItem><SelectItem value="Material purity lower">Material purity lower</SelectItem></SelectContent></Select></Field><Field label="Evidence note"><Input value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="Photo/ref or short observation" className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></Field></div>}
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Payment status"><Select value={payment} onValueChange={(value) => setPayment(value as typeof payment)}><SelectTrigger className="h-12 w-full rounded-xl border-[#cbd5c5] bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="paid">Paid — cash confirmed</SelectItem><SelectItem value="pending">Payment pending</SelectItem><SelectItem value="partial">Partially paid</SelectItem></SelectContent></Select></Field><div className="flex items-end"><div className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cbd5c5] bg-white px-4"><span className="text-sm font-bold">Collector approved values</span><Switch checked={collectorApproved} onCheckedChange={setCollectorApproved} aria-label="Collector approved final handover values" /></div></div></div>
        <Button size="lg" className="mt-6 h-12 w-full rounded-xl bg-[#173d30]" disabled={!collectorApproved || Number(finalWeight) <= 0 || Number(finalRate) <= 0 || (priceChanged && !reason)} onClick={complete}><PackageCheck /> Complete verified handover</Button>
      </div>
      <div className="rounded-[30px] bg-[#173d30] p-6 text-white shadow-sm sm:p-7"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e9ff9d]">Final settlement</p><h3 className="mt-2 text-4xl font-black">{money(finalAmount)}</h3></div><div className="grid size-12 place-items-center rounded-2xl bg-white/10 text-[#e9ff9d]"><IndianRupee /></div></div><div className="mt-7 space-y-3"><ReceiptCell label="Locked rate" value={`${money(defaultRate)}/kg`} /><ReceiptCell label="Final scale weight" value={`${finalWeight || 0} kg`} /><ReceiptCell label="Rate variance" value={priceChanged ? `${Number(finalRate) - defaultRate > 0 ? "+" : ""}${money(Number(finalRate) - defaultRate)}/kg` : "No change"} /><ReceiptCell label="Payment" value={payment === "paid" ? "Cash confirmed" : payment} /></div><div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-white/65"><LockKeyhole className="mb-2 size-5 text-[#e9ff9d]" /> FairLock prevents an unexplained last-minute rate change. Variances stay visible in the receipt.</div></div>
    </section>
  );
}

function RecyclerHistory({ lots, onReceipt }: { lots: Lot[]; onReceipt: (lot: Lot) => void }) {
  if (!lots.length) return <EmptyState title="No completed handovers" text="Complete a collector handover to generate a traceable record." />;
  return <section className="rounded-[30px] border border-[#d5ded0] bg-[#f9fbf7] p-4 shadow-sm sm:p-6"><div className="px-2 pb-5"><h3 className="text-xl font-black">Verified handover history</h3><p className="mt-1 text-xs text-[#718078]">Final weight, rate and payment state stay auditable.</p></div><div className="space-y-3">{lots.map((lot) => <article key={lot.id} className="grid gap-4 rounded-[24px] border border-[#dbe2d6] bg-white p-4 md:grid-cols-[1.2fr_0.7fr_0.7fr_auto] md:items-center"><div><div className="flex items-center gap-2"><ShieldCheck className="size-5 text-[#347249]" /><p className="font-black">{lot.handoverCode ?? lot.id}</p></div><p className="mt-1 text-xs text-[#6d7b73]">{materials[lot.material].label} • {formatDate(lot.completedAt)}</p></div><InfoCell label="Final quantity" value={`${lot.finalWeight ?? lot.weight} kg`} /><InfoCell label="Settlement" value={money((lot.finalWeight ?? lot.weight) * (lot.finalRate ?? lot.lockedRate ?? 0))} /><Button variant="outline" className="rounded-xl" onClick={() => onReceipt(lot)}>Collector receipt <ArrowRight /></Button></article>)}</div></section>;
}
