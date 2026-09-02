"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, BatteryCharging, Boxes, Camera, CheckCircle2, CircleDollarSign, Clock3,
  Factory, FileCheck2, IndianRupee, Leaf, LockKeyhole, MapPin, Mic2, PackageCheck, Plus, RefreshCw,
  Scale, ShieldAlert, ShieldCheck, Sparkles, Star, Truck, UploadCloud, UsersRound, WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CollectorView, Language, Lot, MaterialKey, formatDate, materials, money, recyclerDirectory,
  statusLabel, translations,
} from "./kabadi-data";
import { FaqPage, HelpFeedback, LivePriceChart } from "./collector-extras";
import { Field, InfoCell, MetricCard, QrProof, ReceiptCell, StatusPill } from "./kabadi-ui";
import { RatingStars } from "./rating-stars";

type CollectorProps = {
  view: CollectorView;
  setView: (view: CollectorView) => void;
  language: Language;
  lots: Lot[];
  activeLot: Lot;
  paidTotal: number;
  pendingTotal: number;
  offlineMode: boolean;
  onAdd: (lot: Lot) => void;
  onUpdate: (lot: Lot) => void;
  onSelectLot: (id: string) => void;
  onBanner: (message: string) => void;
  onSpeak: (text: string) => void;
  onRecyclerDemo: () => void;
};

export function CollectorWorkspace(props: CollectorProps) {
  if (props.view === "create") return <CreateLot offlineMode={props.offlineMode} onCreated={props.onAdd} />;
  if (props.view === "matches") return <RecyclerMatches lot={props.activeLot} offlineMode={props.offlineMode} onUpdate={props.onUpdate} onBanner={props.onBanner} onOpenLedger={() => props.setView("ledger")} onRecyclerDemo={props.onRecyclerDemo} />;
  if (props.view === "ledger") return <EarningsLedger lots={props.lots} paidTotal={props.paidTotal} pendingTotal={props.pendingTotal} onSelectLot={props.onSelectLot} onUpdate={props.onUpdate} onBanner={props.onBanner} />;
  if (props.view === "safety") return <SafetyGuidance onSpeak={props.onSpeak} />;
  if (props.view === "market") return <LivePriceChart onSpeak={props.onSpeak} />;
  if (props.view === "help") return <HelpFeedback onBanner={props.onBanner} />;
  if (props.view === "faq") return <FaqPage />;
  return <CollectorHome {...props} />;
}

function CollectorHome({ language, lots, activeLot, paidTotal, pendingTotal, setView, onSelectLot, onSpeak }: CollectorProps) {
  const tr = translations[language];
  const scheduled = lots.find((lot) => lot.status === "scheduled");
  const continueLot = () => {
    onSelectLot(activeLot.id);
    setView(activeLot.status === "available" || activeLot.status === "offline" ? "matches" : "ledger");
  };
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[32px] bg-[#173d30] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-9">
        <div className="absolute -right-16 -top-20 size-64 rounded-full border-[42px] border-[#e9ff9d]/10" />
        <div className="relative max-w-3xl">
          <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#e9ff9d]"><Leaf className="size-4" /> Collector workspace</div>
          <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">{tr.welcome}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">{tr.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" className="h-12 rounded-xl bg-[#e9ff9d] px-5 font-bold text-[#173d30] hover:bg-[#dff28b]" onClick={() => setView("create")}><Camera /> {tr.newLot} <ArrowRight /></Button>
            <Button size="lg" variant="outline" className="h-12 rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white" onClick={() => onSpeak(tr.subtitle)}><Mic2 /> Listen</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard icon={CircleDollarSign} label={tr.earnings} value={money(paidTotal)} detail="Across verified handovers" tone="lime" />
        <MetricCard icon={WalletCards} label={tr.pending} value={money(pendingTotal)} detail={pendingTotal ? "Follow up required" : "No outstanding dues"} tone="white" />
        <MetricCard icon={Truck} label={tr.pickup} value={scheduled ? formatDate(scheduled.pickupDate) : "Not scheduled"} detail={scheduled ? materials[scheduled.material].label : "Create or match a lot"} tone="white" />
      </section>

      <section className="rounded-[28px] border border-[#d5ded0] bg-[#f9fbf7] p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-[#708078]">Tap a picture</p><h3 className="mt-1 text-2xl font-black">What do you want to do?</h3></div><Button variant="outline" className="h-12 rounded-xl border-[#c7d2c1] bg-white text-base" onClick={() => onSpeak("Take a photo. Check the fair price. Choose a recycler and get pickup.")}><Mic2 /> Hear these steps</Button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <SimpleAction number="1" icon={Camera} title="Take a photo" text="Show your scrap" onClick={() => setView("create")} />
          <SimpleAction number="2" icon={IndianRupee} title="Check fair price" text="See today’s range" onClick={() => setView("market")} />
          <SimpleAction number="3" icon={Truck} title="Choose pickup" text="Find a recycler" onClick={() => setView("matches")} />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[28px] border border-[#d7dfd2] bg-[#f9fbf7] p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#798880]">Current collection</p><h3 className="mt-1 text-xl font-black">{activeLot.id}</h3></div><StatusPill status={activeLot.status} /></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3"><InfoCell label="Material" value={materials[activeLot.material].label} /><InfoCell label="Approx. weight" value={`${activeLot.weight} kg`} /><InfoCell label="Estimated value" value={`${money(activeLot.estimatedMin)}–${money(activeLot.estimatedMax)}`} /></div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#dce3d8] pt-4"><div className="flex items-center gap-2 text-sm text-[#68766f]"><MapPin className="size-4" /> {activeLot.location}</div><Button className="rounded-xl bg-[#173d30]" onClick={continueLot}>Continue lot <ArrowRight /></Button></div>
        </div>
        <div className="rounded-[28px] border border-[#e5cc77] bg-[#fff8dc] p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between"><div className="grid size-11 place-items-center rounded-2xl bg-[#f5c94c] text-[#4c3900]"><UsersRound /></div><span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold text-[#6d5200]">Nearby opportunity</span></div>
          <h3 className="mt-5 text-xl font-black">Cluster pickup can save ₹54</h3><p className="mt-2 text-sm leading-6 text-[#715f2b]">Two verified lots near Bhosari can be combined with yours for a recycler pickup.</p>
          <div className="mt-5 flex items-center gap-3 text-sm font-semibold text-[#4c3d12]"><span>6 kg yours</span><Plus className="size-3" /><span>13 kg nearby</span><ArrowRight className="size-3" /><span>19 kg pickup</span></div>
        </div>
      </section>
      <DemoNote />
    </div>
  );
}

function CreateLot({ offlineMode, onCreated }: { offlineMode: boolean; onCreated: (lot: Lot) => void }) {
  const [imageName, setImageName] = useState("");
  const [material, setMaterial] = useState<MaterialKey>("cables");
  const [weight, setWeight] = useState("10");
  const [condition, setCondition] = useState("Sorted");
  const [location, setLocation] = useState("Bhosari, Pune");
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const numericWeight = Math.max(0, Number(weight) || 0);
  const multiplier = condition === "Sorted" ? 1 : condition === "Mixed" ? 0.9 : 0.8;
  const estimate = useMemo(() => {
    const [low, high] = materials[material].range;
    return { perKgLow: Math.round(low * multiplier), perKgHigh: Math.round(high * multiplier), totalLow: Math.round(low * multiplier * numericWeight), totalHigh: Math.round(high * multiplier * numericWeight) };
  }, [material, multiplier, numericWeight]);

  const runScan = (fileName = "demo-copper-cables.jpg") => {
    setImageName(fileName); setScanning(true); setScanComplete(false);
    window.setTimeout(() => {
      const name = fileName.toLowerCase();
      const suggestion: MaterialKey = name.includes("battery") ? "batteries" : name.includes("pcb") || name.includes("board") ? "pcb" : "cables";
      setMaterial(suggestion); setScanning(false); setScanComplete(true);
    }, 650);
  };
  const create = () => onCreated({
    id: `LOT-${String(Date.now()).slice(-4)}`, material, weight: numericWeight, condition, location,
    createdAt: new Date().toISOString(), estimatedMin: estimate.totalLow, estimatedMax: estimate.totalHigh,
    status: offlineMode ? "offline" : "available", syncStatus: offlineMode ? "pending" : "synced",
    imageName: imageName || "demo-copper-cables.jpg", aiConfidence: material === "cables" ? 87 : material === "batteries" ? 84 : 82,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#708078]">New digital lot</p><h2 className="mt-1 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Capture once. Compare clearly.</h2></div><StepPill step={step} /></div>
      {step === 1 ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[30px] border border-[#d5ded0] bg-[#f9fbf7] p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-[#e8f2b7] text-[#3d5700]"><Camera /></div><div><h3 className="font-black">Photograph the material</h3><p className="text-xs text-[#718078]">AI suggests; you always confirm.</p></div></div>
            <label className="mt-5 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#b9c8b3] bg-[#edf2e9] p-6 text-center transition hover:border-[#5f7b68]" htmlFor="waste-photo">
              {scanning ? <><RefreshCw className="size-9 animate-spin text-[#42604e]" /><p className="mt-3 font-bold">Analyzing image…</p></> : imageName ? <><CheckCircle2 className="size-10 text-[#2e7a4b]" /><p className="mt-3 font-bold">{imageName}</p><p className="mt-1 text-xs text-[#718078]">Tap to replace photo</p></> : <><UploadCloud className="size-10 text-[#42604e]" /><p className="mt-3 font-bold">Upload e-waste photo</p><p className="mt-1 text-xs text-[#718078]">JPG or PNG • clear single-lot image</p></>}
            </label>
            <Input id="waste-photo" className="sr-only" type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && runScan(event.target.files[0].name)} />
            <Button variant="outline" className="mt-3 w-full rounded-xl border-[#c7d2c1] bg-white" onClick={() => runScan()}><Sparkles /> Use demo cable photo</Button>
            {scanComplete && <div className="mt-4 rounded-2xl border border-[#cddd9c] bg-[#f3fad8] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#60752c]">AI-assisted suggestion</p><p className="mt-1 font-black">{materials[material].label}</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#315b3f]">{material === "cables" ? 87 : 84}% confidence</span></div><p className="mt-3 text-xs leading-5 text-[#657247]">Demo classifier output. Collector must confirm or change the category before pricing.</p></div>}
          </section>
          <section className="rounded-[30px] border border-[#d5ded0] bg-[#f9fbf7] p-5 shadow-sm sm:p-7">
            <h3 className="text-xl font-black">Lot details</h3>
            <div className="mt-5 space-y-4">
              <Field label="Material category"><Select value={material} onValueChange={(value) => setMaterial(value as MaterialKey)}><SelectTrigger className="h-12 w-full rounded-xl border-[#cbd5c5] bg-white"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(materials).map(([key, value]) => <SelectItem key={key} value={key}>{value.label}</SelectItem>)}</SelectContent></Select></Field>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Approximate weight"><div className="relative"><Input value={weight} onChange={(event) => setWeight(event.target.value)} type="number" min="0.1" step="0.1" className="h-12 rounded-xl border-[#cbd5c5] bg-white pr-12" /><span className="absolute right-4 top-3.5 text-sm font-semibold text-[#6a786f]">kg</span></div></Field><Field label="Condition"><Select value={condition} onValueChange={setCondition}><SelectTrigger className="h-12 w-full rounded-xl border-[#cbd5c5] bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Sorted">Sorted</SelectItem><SelectItem value="Mixed">Mixed</SelectItem><SelectItem value="Damaged">Damaged / contaminated</SelectItem></SelectContent></Select></Field></div>
              <Field label="Collection area"><div className="relative"><MapPin className="absolute left-4 top-3.5 size-4 text-[#6f7d75]" /><Input value={location} onChange={(event) => setLocation(event.target.value)} className="h-12 rounded-xl border-[#cbd5c5] bg-white pl-11" /></div></Field>
            </div>
            <div className="mt-6 rounded-2xl bg-[#edf2e9] p-4 text-xs leading-5 text-[#617068]"><Scale className="mb-2 size-5 text-[#3e5d49]" /> Weight is approximate. Recycler scale weight becomes final after both parties confirm.</div>
            <Button size="lg" className="mt-5 h-12 w-full rounded-xl bg-[#173d30]" disabled={!imageName || numericWeight <= 0 || !location.trim()} onClick={() => setStep(2)}>Review price estimate <ArrowRight /></Button>
          </section>
        </div>
      ) : (
        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[30px] bg-[#173d30] p-6 text-white shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e9ff9d]">Estimated reference price</p><h3 className="mt-3 text-4xl font-black tracking-[-0.05em]">{money(estimate.perKgLow)}–{money(estimate.perKgHigh)}<span className="text-lg text-white/60"> / kg</span></h3></div><div className="grid size-12 place-items-center rounded-2xl bg-white/10 text-[#e9ff9d]"><IndianRupee /></div></div>
            <div className="mt-8 rounded-[24px] bg-white/10 p-5"><p className="text-sm text-white/65">Estimated lot value</p><p className="mt-1 text-3xl font-black">{money(estimate.totalLow)}–{money(estimate.totalHigh)}</p><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-white/55">Material</p><p className="font-bold">{materials[material].label}</p></div><div><p className="text-white/55">Approx. weight</p><p className="font-bold">{numericWeight} kg</p></div></div></div>
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200/20 bg-amber-100/10 p-4 text-xs leading-5 text-amber-50"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#ffd75e]" /> Reference range uses illustrative demo rates. Final offer depends on inspection, purity and measured weight.</div>
          </div>
          <div className="rounded-[30px] border border-[#d5ded0] bg-[#f9fbf7] p-6 shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#718078]">Before publishing</p><h3 className="mt-2 text-2xl font-black">Collector confirmation</h3><div className="mt-6 space-y-3"><CheckRow text="Material category can be manually corrected" /><CheckRow text="Price shown is a range, not a guarantee" /><CheckRow text="Final scale weight requires dual confirmation" /><CheckRow text={offlineMode ? "Lot will be saved on this device until sync" : "Lot will be visible to verified demo recyclers"} /></div><div className="mt-7 flex gap-3"><Button variant="outline" className="h-12 flex-1 rounded-xl border-[#c7d2c1]" onClick={() => setStep(1)}>Back</Button><Button className="h-12 flex-[1.6] rounded-xl bg-[#173d30]" onClick={create}>{offlineMode ? "Save offline" : "Find recyclers"}<ArrowRight /></Button></div></div>
        </section>
      )}
    </div>
  );
}

function StepPill({ step }: { step: 1 | 2 }) {
  return <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#5c6b63] shadow-sm"><span className={`grid size-6 place-items-center rounded-full ${step === 1 ? "bg-[#173d30] text-white" : "bg-[#dfe7db]"}`}>1</span>Capture<span className="h-px w-5 bg-[#c7d0c3]" /><span className={`grid size-6 place-items-center rounded-full ${step === 2 ? "bg-[#173d30] text-white" : "bg-[#dfe7db]"}`}>2</span>Review</div>;
}

function CheckRow({ text }: { text: string }) {
  return <div className="flex items-center gap-3 rounded-2xl bg-[#edf2e9] px-4 py-3 text-sm font-semibold"><CheckCircle2 className="size-5 shrink-0 text-[#347249]" />{text}</div>;
}

function RecyclerMatches({ lot, offlineMode, onUpdate, onBanner, onOpenLedger, onRecyclerDemo }: { lot: Lot; offlineMode: boolean; onUpdate: (lot: Lot) => void; onBanner: (message: string) => void; onOpenLedger: () => void; onRecyclerDemo: () => void }) {
  const [lockSuccess, setLockSuccess] = useState(Boolean(lot.fairLockId));
  const midRate = Math.round(((lot.estimatedMin + lot.estimatedMax) / 2) / Math.max(lot.weight, 1));
  const matches = recyclerDirectory.map((recycler) => ({ ...recycler, rate: midRate + recycler.rateOffset, net: Math.round((midRate + recycler.rateOffset) * lot.weight - recycler.transport), eligible: lot.weight >= recycler.minimum })).sort((a, b) => b.net - a.net);
  const selected = recyclerDirectory.find((recycler) => recycler.id === lot.selectedRecyclerId);
  const joinCluster = () => { onUpdate({ ...lot, clusterJoined: true }); onBanner("Joined Bhosari cluster — pickup threshold reached"); };
  const lockOffer = (recycler: (typeof matches)[number]) => {
    if (offlineMode || lot.syncStatus === "pending") return onBanner("Sync this lot before opening live recycler offers");
    const validUntil = new Date(Date.now() + 86400000).toISOString();
    onUpdate({ ...lot, selectedRecyclerId: recycler.id, lockedRate: recycler.rate, fairLockId: `FL-${String(Date.now()).slice(-4)}`, validUntil, status: "locked" });
    setLockSuccess(true); onBanner(`${recycler.name} offer locked for 24 hours`);
  };
  const schedule = () => { const date = new Date(Date.now() + 86400000); date.setHours(10, 30, 0, 0); onUpdate({ ...lot, status: "scheduled", pickupDate: date.toISOString() }); onBanner("Pickup scheduled — recycler dashboard updated"); };
  if (lot.status === "completed") return <div className="rounded-[30px] border border-[#d5ded0] bg-[#f9fbf7] p-8 text-center shadow-sm"><PackageCheck className="mx-auto size-12 text-[#347249]" /><h2 className="mt-4 text-2xl font-black">This lot is already completed</h2><p className="mt-2 text-sm text-[#68766f]">Open the earnings ledger to view its verified handover receipt.</p><Button className="mt-5 rounded-xl bg-[#173d30]" onClick={onOpenLedger}>Open receipt</Button></div>;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#708078]">Verified recycler matching</p><h2 className="mt-1 text-3xl font-black tracking-[-0.04em]">Compare by net earning</h2><p className="mt-2 text-sm text-[#68776f]">{lot.id} • {materials[lot.material].label} • {lot.weight} kg</p></div><div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm"><p className="text-xs text-[#718078]">Reference range</p><p className="font-black">{money(lot.estimatedMin)}–{money(lot.estimatedMax)}</p></div></div>
      {lot.weight < 12 && !lot.clusterJoined && <section className="flex flex-col gap-5 rounded-[28px] border border-[#e3c459] bg-[#fff8d9] p-5 shadow-sm md:flex-row md:items-center md:justify-between sm:p-6"><div className="flex gap-4"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f2c84b] text-[#4f3c00]"><UsersRound /></div><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">Cluster pickup available</h3><span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold uppercase text-[#6f5500]">Unique feature</span></div><p className="mt-1 text-sm leading-6 text-[#6f5d26]">Combine your {lot.weight} kg with 13 kg from nearby collectors. Unlock pickup and avoid ₹54 transport cost.</p></div></div><Button className="h-11 shrink-0 rounded-xl bg-[#4f3c00] text-white hover:bg-[#3c2d00]" onClick={joinCluster}>Join cluster <ArrowRight /></Button></section>}
      {lot.clusterJoined && <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"><CheckCircle2 className="size-5" /> Cluster confirmed: 19 kg combined pickup threshold reached.</div>}
      <section className="grid gap-4 xl:grid-cols-3">{matches.map((recycler, index) => <article key={recycler.id} className={`relative rounded-[28px] border bg-[#f9fbf7] p-5 shadow-sm ${index === 0 ? "border-[#82a35d] ring-2 ring-[#b9d784]/40" : "border-[#d5ded0]"}`}><div className="flex items-start justify-between gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-[#e5eddf] text-[#365343]"><Factory /></div><span className="rounded-full bg-[#e8f2b7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#425900]">{recycler.badge}</span></div><h3 className="mt-5 text-lg font-black">{recycler.name}</h3><div className="mt-2 flex flex-wrap items-center gap-3"><span className="flex items-center gap-1 text-sm font-black text-[#8a6500]"><Star className="size-5 fill-[#f5c542] text-[#c98e00]" /> {recycler.rating}</span><span className="text-sm text-[#6d7b73]">{recycler.reviews} collector ratings</span></div><div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#39704b]"><ShieldCheck className="size-4" /> Verified until {recycler.verifiedTill}</div><div className="mt-5 grid grid-cols-2 gap-3"><InfoCell label="Offer" value={`${money(recycler.rate)}/kg`} /><InfoCell label="Distance" value={`${recycler.distance} km`} /></div><div className="mt-3 grid grid-cols-2 gap-3"><InfoCell label="Pickup" value={recycler.pickup ? "Available" : "Self-delivery"} /><InfoCell label="Minimum" value={`${recycler.minimum} kg`} /></div><div className="mt-5 rounded-2xl bg-[#173d30] p-4 text-white"><p className="text-xs text-white/60">Estimated net earning</p><p className="mt-1 text-2xl font-black">{money(recycler.net)}</p><p className="mt-1 text-[11px] text-white/55">Offer − estimated transport cost</p></div>{!recycler.eligible && !lot.clusterJoined && <p className="mt-3 text-xs font-semibold text-amber-800">Join a cluster to meet the {recycler.minimum} kg minimum.</p>}<Button className="mt-4 h-11 w-full rounded-xl bg-[#173d30]" disabled={Boolean(lot.fairLockId) || (!recycler.eligible && !lot.clusterJoined)} onClick={() => lockOffer(recycler)}><LockKeyhole /> {lot.fairLockId ? "Offer already locked" : "Lock this offer"}</Button></article>)}</section>
      {lockSuccess && lot.fairLockId && <section className="overflow-hidden rounded-[30px] border border-[#c99d2c] bg-[#fff8db] shadow-sm"><div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center sm:p-8"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#4e3b00] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">FairLock active</span><span className="text-xs font-semibold text-[#756019]">{lot.fairLockId}</span></div><h3 className="mt-4 text-2xl font-black">₹{lot.lockedRate}/kg protected for 24 hours</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f5d27]">{selected?.name ?? "Selected recycler"} must record a reason, evidence note and collector approval before changing this rate.</p><div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-[#4d411e]"><span className="flex items-center gap-2"><Clock3 className="size-4" /> Valid until {formatDate(lot.validUntil)}</span><span className="flex items-center gap-2"><FileCheck2 className="size-4" /> Digital commitment recorded</span></div></div><div className="flex flex-col gap-2"><Button size="lg" className="h-12 rounded-xl bg-[#173d30]" onClick={schedule} disabled={lot.status === "scheduled"}>{lot.status === "scheduled" ? "Pickup scheduled" : "Schedule pickup"}<Truck /></Button><Button variant="outline" className="h-11 rounded-xl border-[#bfa54e] bg-white/60" onClick={onRecyclerDemo}>Open recycler demo <ArrowRight /></Button></div></div></section>}
      <DemoNote />
    </div>
  );
}

function EarningsLedger({ lots, paidTotal, pendingTotal, onSelectLot, onUpdate, onBanner }: { lots: Lot[]; paidTotal: number; pendingTotal: number; onSelectLot: (id: string) => void; onUpdate: (lot: Lot) => void; onBanner: (message: string) => void }) {
  const [selectedId, setSelectedId] = useState(lots[0]?.id ?? "");
  const selected = lots.find((lot) => lot.id === selectedId) ?? lots[0];
  const select = (id: string) => { setSelectedId(id); onSelectLot(id); };
  return <div className="space-y-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#708078]">Collector earnings ledger</p><h2 className="mt-1 text-3xl font-black tracking-[-0.04em]">Every handover, one clear record</h2></div><section className="grid gap-4 sm:grid-cols-3"><MetricCard icon={CircleDollarSign} label="Paid earnings" value={money(paidTotal)} detail="Verified completed payments" tone="lime" /><MetricCard icon={Clock3} label="Pending dues" value={money(pendingTotal)} detail="Manual follow-up visible" tone="white" /><MetricCard icon={PackageCheck} label="Formal handovers" value={String(lots.filter((lot) => lot.status === "completed").length)} detail="Traceable transactions" tone="white" /></section><section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]"><div className="rounded-[28px] border border-[#d5ded0] bg-[#f9fbf7] p-4 shadow-sm"><p className="px-2 pb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#78877f]">Transactions</p><div className="space-y-2">{lots.map((lot) => <Button key={lot.id} variant="ghost" className={`h-auto w-full justify-between rounded-2xl p-4 text-left ${selected?.id === lot.id ? "bg-[#173d30] text-white hover:bg-[#173d30] hover:text-white" : "bg-[#edf2e9]"}`} onClick={() => select(lot.id)}><span><span className="block font-black">{lot.id} · {materials[lot.material].label}</span><span className={`mt-1 block text-xs ${selected?.id === lot.id ? "text-white/60" : "text-[#6e7c74]"}`}>{lot.weight} kg · {statusLabel[lot.status]}</span></span><ArrowRight /></Button>)}</div></div>{selected && <ReceiptPanel key={selected.id} lot={selected} onUpdate={onUpdate} onBanner={onBanner} />}</section></div>;
}

function ReceiptPanel({ lot, onUpdate, onBanner }: { lot: Lot; onUpdate: (lot: Lot) => void; onBanner: (message: string) => void }) {
  const [rating, setRating] = useState(lot.recyclerRating ?? 0);
  const [review, setReview] = useState(lot.recyclerReview ?? "");
  const recycler = recyclerDirectory.find((item) => item.id === lot.selectedRecyclerId);
  if (lot.status !== "completed") return <div className="rounded-[28px] border border-[#d5ded0] bg-[#f9fbf7] p-6 shadow-sm sm:p-8"><div className="flex items-start justify-between"><div className="grid size-12 place-items-center rounded-2xl bg-[#fff0b9] text-[#634c00]"><Clock3 /></div><StatusPill status={lot.status} /></div><h3 className="mt-5 text-2xl font-black">Handover not completed yet</h3><p className="mt-2 text-sm leading-6 text-[#68766f]">{lot.fairLockId ? `${lot.fairLockId} protects the ₹${lot.lockedRate}/kg offer until ${formatDate(lot.validUntil)}.` : "Match this lot with a verified recycler to create a FairLock commitment."}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><InfoCell label="Recycler" value={recycler?.name ?? "Not selected"} /><InfoCell label="Pickup" value={formatDate(lot.pickupDate)} /></div></div>;
  const amount = (lot.finalWeight ?? lot.weight) * (lot.finalRate ?? lot.lockedRate ?? 0);
  const saveRating = () => {
    if (!rating) return onBanner("Choose stars before saving your recycler rating");
    onUpdate({ ...lot, recyclerRating: rating, recyclerReview: review.trim() });
    onBanner("Recycler rating saved successfully");
  };
  return <div className="rounded-[28px] bg-[#173d30] p-6 text-white shadow-sm sm:p-8"><div className="flex flex-col justify-between gap-6 sm:flex-row"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#e9ff9d]"><ShieldCheck className="size-4" /> Verified handover receipt</div><h3 className="mt-3 text-3xl font-black">{money(amount)}</h3><p className="mt-1 text-sm text-white/60">{lot.paymentStatus === "paid" ? "Payment confirmed" : "Payment pending confirmation"}</p></div><QrProof /></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><ReceiptCell label="Reference" value={lot.handoverCode ?? lot.id} /><ReceiptCell label="Recycler" value={recycler?.name ?? "Verified recycler"} /><ReceiptCell label="Completed" value={formatDate(lot.completedAt)} /><ReceiptCell label="Final weight" value={`${lot.finalWeight ?? lot.weight} kg`} /><ReceiptCell label="Final rate" value={`${money(lot.finalRate ?? lot.lockedRate ?? 0)}/kg`} /><ReceiptCell label="FairLock" value={lot.fairLockId ?? "Not used"} /></div><div className="mt-5 rounded-2xl bg-white/10 p-4 text-xs leading-5 text-white/65">Prototype QR-style proof contains the transaction reference. Production version would sign and validate each handover.</div><section className="mt-5 rounded-2xl bg-white p-5 text-[#17312a]"><div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-[#fff2b8] text-[#a46f00]"><Star className="fill-[#f5c542]" /></div><div><h4 className="text-lg font-black">Rate your recycler</h4><p className="text-sm font-bold">{recycler?.name ?? "Verified recycler"}</p><p className="mt-1 text-sm text-[#68766f]">How was your experience with this recycler?</p></div></div><div className="mt-3"><RatingStars value={rating} onChange={setRating} label="Rate your recycler" /></div><Input value={review} onChange={(event) => setReview(event.target.value)} placeholder="Say what went well or what should improve" className="mt-3 h-12 rounded-xl border-[#cbd5c5] bg-white" /><Button className="mt-3 h-12 w-full rounded-xl bg-[#173d30] text-base" onClick={saveRating}><Star /> Save recycler rating</Button></section></div>;
}

function SimpleAction({ number, icon: Icon, title, text, onClick }: { number: string; icon: typeof Camera; title: string; text: string; onClick: () => void }) {
  return <Button variant="outline" className="h-auto min-h-36 justify-start gap-4 rounded-2xl border-[#cbd5c5] bg-white p-5 text-left hover:bg-[#f3f8df]" onClick={onClick}><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#173d30] text-[#e9ff9d]"><Icon className="size-7" /></span><span><span className="block text-xs font-black text-[#7b897f]">STEP {number}</span><span className="mt-1 block text-lg font-black">{title}</span><span className="mt-1 block text-sm font-medium text-[#6d7b73]">{text}</span></span></Button>;
}

function SafetyGuidance({ onSpeak }: { onSpeak: (text: string) => void }) {
  const guidance = [
    { icon: BatteryCharging, title: "Isolate damaged batteries", text: "Keep them dry, shaded and separate from metal scrap." },
    { icon: ShieldAlert, title: "Never burn cables", text: "Burning insulation releases toxic fumes and destroys traceability." },
    { icon: Boxes, title: "Separate fragile panels", text: "Store LCD and CRT glass upright in a marked container." },
    { icon: ShieldCheck, title: "Use basic protection", text: "Wear gloves and closed footwear while sorting e-waste." },
  ];
  return <div className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#708078]">Pictorial safety guidance</p><h2 className="mt-1 text-3xl font-black tracking-[-0.04em]">Sort safely. Never process informally.</h2></div><Button variant="outline" className="rounded-xl border-[#c7d2c1] bg-white" onClick={() => onSpeak("Safety first. Do not burn cables, break batteries, or dismantle screens without protective equipment.")}><Mic2 /> Play voice guidance</Button></div><section className="grid gap-4 sm:grid-cols-2">{guidance.map(({ icon: Icon, title, text }, index) => <article key={title} className={`rounded-[28px] border p-6 shadow-sm ${index === 0 ? "border-[#e1c04b] bg-[#fff6d2]" : "border-[#d5ded0] bg-[#f9fbf7]"}`}><div className="grid size-12 place-items-center rounded-2xl bg-[#173d30] text-[#e9ff9d]"><Icon /></div><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-[#68766f]">{text}</p><Button variant="ghost" className="mt-4 px-0 text-[#315943]" onClick={() => onSpeak(`${title}. ${text}`)}><Mic2 /> Listen to this tip</Button></article>)}</section></div>;
}

function DemoNote() {
  return <div className="rounded-2xl border border-[#d7dfd2] bg-white/60 px-4 py-3 text-xs leading-5 text-[#69776f]">Prototype note: prices, recyclers and transactions shown here are realistic demo data—not live market or authorization records.</div>;
}
