"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CircleHelp, Headphones, HelpCircle, MessageSquareText, Send, Star, TrendingUp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MaterialKey, materials, money } from "./kabadi-data";
import { RatingStars } from "./rating-stars";

type Candle = { open: number; high: number; low: number; close: number };

const seeds: Record<MaterialKey, number> = { cables: 88, batteries: 51, pcb: 248, panels: 34, motors: 70, plastics: 18 };

function createCandles(base: number) {
  return Array.from({ length: 20 }, (_, index) => {
    const wave = Math.sin(index * 0.72) * base * 0.035;
    const open = base + wave + ((index % 4) - 1.5) * base * 0.008;
    const close = open + (index % 3 === 0 ? -1 : 1) * base * (0.008 + (index % 5) * 0.002);
    return { open, close, high: Math.max(open, close) + base * 0.018, low: Math.min(open, close) - base * 0.016 };
  });
}

export function LivePriceChart({ onSpeak }: { onSpeak: (text: string) => void }) {
  const [material, setMaterial] = useState<MaterialKey>("cables");
  const [candles, setCandles] = useState<Record<MaterialKey, Candle[]>>(() => Object.fromEntries(Object.entries(seeds).map(([key, base]) => [key, createCandles(base)])) as Record<MaterialKey, Candle[]>);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCandles((current) => {
        const existing = current[material];
        const last = existing[existing.length - 1];
        const move = (Math.random() - 0.48) * seeds[material] * 0.018;
        const close = Math.max(1, last.close + move);
        const next = { open: last.close, close, high: Math.max(last.close, close) + seeds[material] * 0.012, low: Math.min(last.close, close) - seeds[material] * 0.012 };
        return { ...current, [material]: [...existing.slice(1), next] };
      });
    }, 4000);
    return () => window.clearInterval(timer);
  }, [material]);

  const data = candles[material];
  const current = data[data.length - 1].close;
  const previous = data[data.length - 2].close;
  const change = ((current - previous) / previous) * 100;
  const high = Math.max(...data.map((item) => item.high));
  const low = Math.min(...data.map((item) => item.low));
  const min = low - (high - low) * 0.08;
  const max = high + (high - low) * 0.08;
  const y = (value: number) => 310 - ((value - min) / (max - min)) * 260;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#708078]"><TrendingUp className="size-4" /> Live Prices</div><h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">Live scrap price trend</h2><p className="mt-2 text-sm text-[#68766f]">Illustrative prototype rates — not a commodity exchange feed.</p></div>
        <div className="flex gap-2"><Select value={material} onValueChange={(value) => setMaterial(value as MaterialKey)}><SelectTrigger className="h-11 w-52 rounded-xl border-[#cbd5c5] bg-white"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(materials).map(([key, value]) => <SelectItem key={key} value={key}>{value.label}</SelectItem>)}</SelectContent></Select><Button variant="outline" size="icon" className="size-11 border-[#cbd5c5] bg-white" onClick={() => onSpeak(`${materials[material].label}. Current demo price ${Math.round(current)} rupees per kilogram.`)} aria-label="Listen to price trend"><Headphones /></Button></div>
      </div>

      <section className="overflow-hidden rounded-[30px] border border-[#cad6c5] bg-[#102d25] text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-7">
          <div><div className="flex items-center gap-2"><span className="relative flex size-3"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[#b9f34b] opacity-60" /><span className="relative inline-flex size-3 rounded-full bg-[#b9f34b]" /></span><span className="text-xs font-bold uppercase tracking-[0.16em] text-[#dff98a]">Demo live trend</span></div><h3 className="mt-2 text-2xl font-black">{materials[material].label}</h3></div>
          <div className="text-right"><p className="text-3xl font-black">{money(Math.round(current))}<span className="text-sm text-white/55"> / kg</span></p><p className={`mt-1 text-sm font-bold ${change >= 0 ? "text-[#b9f34b]" : "text-[#ff8e7e]"}`}>{change >= 0 ? "+" : ""}{change.toFixed(2)}% last update</p></div>
        </div>

        <div className="overflow-x-auto px-3 py-4 sm:px-6">
          <svg viewBox="0 0 900 350" className="min-w-[720px]" role="img" aria-label="Candlestick scrap price chart">
            {[0, 1, 2, 3, 4].map((line) => { const lineY = 35 + line * 65; const value = max - (line / 4) * (max - min); return <g key={line}><line x1="48" x2="850" y1={lineY} y2={lineY} stroke="rgba(255,255,255,0.11)" strokeDasharray="5 7" /><text x="858" y={lineY + 5} fill="rgba(255,255,255,0.55)" fontSize="15">₹{Math.round(value)}</text></g>; })}
            {data.map((candle, index) => { const x = 65 + index * 39; const up = candle.close >= candle.open; const color = up ? "#b9f34b" : "#ff7f6e"; const bodyTop = y(Math.max(candle.open, candle.close)); const bodyHeight = Math.max(4, Math.abs(y(candle.open) - y(candle.close))); return <g key={index}><line x1={x} x2={x} y1={y(candle.high)} y2={y(candle.low)} stroke={color} strokeWidth="2" /><rect x={x - 8} y={bodyTop} width="16" height={bodyHeight} rx="2" fill={color} /></g>; })}
            <line x1="48" x2="850" y1={y(current)} y2={y(current)} stroke="#ffffff" strokeDasharray="3 5" opacity="0.35" />
          </svg>
        </div>
        <div className="grid grid-cols-3 border-t border-white/10 text-center"><PriceStat label="Current" value={`${money(Math.round(current))}/kg`} /><PriceStat label="Session high" value={`${money(Math.round(high))}/kg`} /><PriceStat label="Session low" value={`${money(Math.round(low))}/kg`} /></div>
      </section>
    </div>
  );
}

function PriceStat({ label, value }: { label: string; value: string }) {
  return <div className="border-r border-white/10 px-3 py-4 last:border-r-0"><p className="text-xs text-white/50">{label}</p><p className="mt-1 font-black">{value}</p></div>;
}

export function HelpFeedback({ onBanner }: { onBanner: (message: string) => void }) {
  const [tab, setTab] = useState("query");
  const [contact, setContact] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [queryId, setQueryId] = useState("");
  const submitQuery = (event: FormEvent) => { event.preventDefault(); if (!contact.trim() || !type || !message.trim()) return onBanner("Complete all help query fields"); const id = `KQ-${String(Date.now()).slice(-6)}`; setQueryId(id); setMessage(""); onBanner(`Help query ${id} saved on this device`); };
  const submitFeedback = (event: FormEvent) => { event.preventDefault(); if (!rating || !message.trim()) return onBanner("Choose a rating and enter feedback"); setMessage(""); setRating(0); onBanner("Feedback saved successfully"); };
  return <div className="mx-auto max-w-4xl space-y-5"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#708078]"><HelpCircle className="size-4" /> Support</div><h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">Help & feedback</h2></div><section className="rounded-[30px] border border-[#d5ded0] bg-[#f9fbf7] p-5 shadow-sm sm:p-7"><Tabs value={tab} onValueChange={(value) => { setTab(value); setMessage(""); }}><TabsList className="grid h-12 w-full grid-cols-2 bg-[#e4e9df]"><TabsTrigger value="query"><MessageSquareText /> Help query</TabsTrigger><TabsTrigger value="feedback"><Star /> Feedback</TabsTrigger></TabsList><TabsContent value="query"><form onSubmit={submitQuery} className="mt-6 space-y-4"><ExtraField label="Mobile number or email"><Input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Contact for follow-up" className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></ExtraField><ExtraField label="Issue type"><Select value={type} onValueChange={setType}><SelectTrigger className="h-12 w-full rounded-xl border-[#cbd5c5] bg-white"><SelectValue placeholder="Select issue" /></SelectTrigger><SelectContent><SelectItem value="login">Account / login</SelectItem><SelectItem value="price">Price or offer</SelectItem><SelectItem value="pickup">Pickup / handover</SelectItem><SelectItem value="payment">Payment</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></ExtraField><ExtraField label="Your question"><Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe the issue clearly" className="min-h-32 rounded-xl border-[#cbd5c5] bg-white" /></ExtraField>{queryId && <div className="rounded-2xl border border-[#cfe08d] bg-[#f0f8cf] p-4 text-sm"><p className="font-black">Query ID: {queryId}</p><p className="mt-1 text-[#65736c]">Keep this ID for follow-up.</p></div>}<Button className="h-12 w-full rounded-xl bg-[#173d30]"><Send /> Submit query</Button></form></TabsContent><TabsContent value="feedback"><form onSubmit={submitFeedback} className="mt-6 space-y-5"><ExtraField label="Your rating"><RatingStars value={rating} onChange={setRating} label="Rate your KabadiSetu experience" /></ExtraField><ExtraField label="Your feedback"><Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What should we improve?" className="min-h-36 rounded-xl border-[#cbd5c5] bg-white" /></ExtraField><Button className="h-12 w-full rounded-xl bg-[#173d30]"><Send /> Submit feedback</Button></form></TabsContent></Tabs></section></div>;
}

export function FaqPage() {
  const rows = useMemo(() => [
    ["Is the displayed price guaranteed?", "No. The app shows an estimated fair range. Final price depends on condition, purity and verified scale weight."],
    ["Is this chart connected to a commodity exchange?", "No. The live-moving chart is an illustrative prototype trend for scrap materials. A production version needs a verified market-data source."],
    ["What works without internet?", "Cached screens and new lot creation work offline. Live prices, offers and recycler status need internet to sync."],
    ["What is FairLock?", "FairLock protects the accepted rate for a limited period. Any variance needs a recorded reason and collector approval."],
    ["How does Cluster Pickup help?", "It combines compatible nearby small lots to meet pickup minimums and reduce transport cost."],
    ["How are recyclers verified?", "Production onboarding will verify CPCB or State Pollution Control Board authorization and expiry details."],
  ], []);
  return <div className="mx-auto max-w-4xl space-y-5"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#708078]"><CircleHelp className="size-4" /> FAQ</div><h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">Frequently asked questions</h2></div><Accordion type="single" collapsible className="rounded-[30px] border border-[#d5ded0] bg-[#f9fbf7] px-5 shadow-sm sm:px-7">{rows.map(([question, answer], index) => <AccordionItem key={question} value={`faq-${index}`}><AccordionTrigger className="text-base font-black">{question}</AccordionTrigger><AccordionContent className="text-sm leading-6 text-[#66756d]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div>;
}

function ExtraField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-[#465b51]">{label}</span>{children}</label>;
}
