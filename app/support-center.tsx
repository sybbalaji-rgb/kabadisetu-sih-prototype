"use client";

import { FormEvent, useState } from "react";
import { BarChart3, CircleHelp, Headphones, HelpCircle, MessageSquareText, Send, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Role } from "./kabadi-data";

type SavedRecord = Record<string, string | number> & { submittedAt: string };

function saveRecord(key: string, record: SavedRecord) {
  const current = JSON.parse(window.localStorage.getItem(key) ?? "[]") as SavedRecord[];
  window.localStorage.setItem(key, JSON.stringify([record, ...current].slice(0, 20)));
}

export function SupportCenter({
  role,
  onBanner,
  onSpeak,
}: {
  role: Role;
  onBanner: (message: string) => void;
  onSpeak: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("census");
  const [district, setDistrict] = useState("");
  const [material, setMaterial] = useState("");
  const [monthlyVolume, setMonthlyVolume] = useState("");
  const [challenge, setChallenge] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [contact, setContact] = useState("");
  const [queryType, setQueryType] = useState("");
  const [query, setQuery] = useState("");
  const [queryId, setQueryId] = useState("");

  const submitCensus = (event: FormEvent) => {
    event.preventDefault();
    if (!district || !material || !monthlyVolume || !challenge) return onBanner("Complete all census fields before submitting");
    saveRecord("kabadisetu-census-v1", { role, district, material, monthlyVolume, challenge, submittedAt: new Date().toISOString() });
    setDistrict(""); setMaterial(""); setMonthlyVolume(""); setChallenge("");
    onBanner("Community census response saved on this device");
  };

  const submitFeedback = (event: FormEvent) => {
    event.preventDefault();
    if (!rating || !feedback.trim()) return onBanner("Choose a rating and add your feedback");
    saveRecord("kabadisetu-feedback-v1", { role, rating, feedback: feedback.trim(), submittedAt: new Date().toISOString() });
    setRating(0); setFeedback("");
    onBanner("Thank you — feedback saved successfully");
  };

  const submitQuery = (event: FormEvent) => {
    event.preventDefault();
    if (!contact.trim() || !queryType || !query.trim()) return onBanner("Complete all help-query fields before submitting");
    const id = `KQ-${String(Date.now()).slice(-6)}`;
    saveRecord("kabadisetu-queries-v1", { id, role, contact: contact.trim(), queryType, query: query.trim(), submittedAt: new Date().toISOString() });
    setQueryId(id); setQueryType(""); setQuery("");
    onBanner(`Help query ${id} saved successfully`);
  };

  const guidance: Record<string, string> = {
    census: "Community census helps us understand collector and recycler needs before a pilot.",
    feedback: "Rate this prototype and tell us which part should improve.",
    faq: "Frequently asked questions explain pricing, verification, offline use and FairLock.",
    help: "Submit a support query and keep the generated query ID for follow up.",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10 border-[#cbd5c5] bg-white px-3" aria-label="Open support center"><HelpCircle /><span className="hidden md:inline">Help</span></Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[28px] border-[#cbd5c5] bg-[#f9fbf7] p-0 sm:max-w-3xl">
        <DialogHeader className="bg-[#173d30] px-6 py-6 pr-14 text-left text-white">
          <div className="flex items-start justify-between gap-4">
            <div><DialogTitle className="text-2xl font-black">KabadiSetu Support Center</DialogTitle><DialogDescription className="mt-2 text-white/65">Census, feedback, common questions and help—all in one place.</DialogDescription></div>
            <Button type="button" size="sm" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={() => onSpeak(guidance[tab])}><Headphones /> Listen</Button>
          </div>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="gap-0">
          <div className="overflow-x-auto border-b border-[#d7dfd2] px-4 pt-4 sm:px-6">
            <TabsList variant="line" className="h-11 min-w-max gap-3">
              <TabsTrigger value="census"><BarChart3 /> Census</TabsTrigger>
              <TabsTrigger value="feedback"><Star /> Feedback</TabsTrigger>
              <TabsTrigger value="faq"><CircleHelp /> FAQ</TabsTrigger>
              <TabsTrigger value="help"><MessageSquareText /> Help / Query</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-5 sm:p-7">
            <TabsContent value="census">
              <SectionIntro title="Community needs census" text="This short survey helps plan languages, pickup areas and recycler capacity for the pilot." />
              <form onSubmit={submitCensus} className="mt-6 grid gap-4 sm:grid-cols-2">
                <SupportField label="District / service area"><Input value={district} onChange={(event) => setDistrict(event.target.value)} placeholder="Example: Coimbatore" className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></SupportField>
                <SupportField label="Main material"><Select value={material} onValueChange={setMaterial}><SelectTrigger className="h-12 w-full rounded-xl border-[#cbd5c5] bg-white"><SelectValue placeholder="Select material" /></SelectTrigger><SelectContent><SelectItem value="cables">Copper cables</SelectItem><SelectItem value="batteries">Batteries</SelectItem><SelectItem value="pcb">Circuit boards</SelectItem><SelectItem value="mixed">Mixed e-waste</SelectItem></SelectContent></Select></SupportField>
                <SupportField label="Approx. monthly quantity"><Select value={monthlyVolume} onValueChange={setMonthlyVolume}><SelectTrigger className="h-12 w-full rounded-xl border-[#cbd5c5] bg-white"><SelectValue placeholder="Select quantity" /></SelectTrigger><SelectContent><SelectItem value="under-25">Below 25 kg</SelectItem><SelectItem value="25-100">25–100 kg</SelectItem><SelectItem value="100-500">100–500 kg</SelectItem><SelectItem value="above-500">Above 500 kg</SelectItem></SelectContent></Select></SupportField>
                <SupportField label="Biggest challenge"><Select value={challenge} onValueChange={setChallenge}><SelectTrigger className="h-12 w-full rounded-xl border-[#cbd5c5] bg-white"><SelectValue placeholder="Select challenge" /></SelectTrigger><SelectContent><SelectItem value="price">Fair price</SelectItem><SelectItem value="recycler">Finding verified recyclers</SelectItem><SelectItem value="pickup">Pickup cost</SelectItem><SelectItem value="language">Language / digital access</SelectItem></SelectContent></Select></SupportField>
                <Button type="submit" className="h-12 rounded-xl bg-[#173d30] sm:col-span-2"><Send /> Submit census response</Button>
              </form>
            </TabsContent>

            <TabsContent value="feedback">
              <SectionIntro title="Share prototype feedback" text="Tell us what worked and what should change before field testing." />
              <form onSubmit={submitFeedback} className="mt-6 space-y-5">
                <SupportField label="Your rating"><div className="flex flex-wrap gap-2">{[1, 2, 3, 4, 5].map((value) => <Button key={value} type="button" variant={rating === value ? "default" : "outline"} className={`size-11 rounded-xl ${rating === value ? "bg-[#173d30]" : "border-[#cbd5c5] bg-white"}`} onClick={() => setRating(value)} aria-label={`${value} star rating`}>{value}</Button>)}</div></SupportField>
                <SupportField label="What should we improve?"><Textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Share a clear suggestion" className="min-h-32 rounded-xl border-[#cbd5c5] bg-white" /></SupportField>
                <Button type="submit" className="h-12 w-full rounded-xl bg-[#173d30]"><Send /> Submit feedback</Button>
              </form>
            </TabsContent>

            <TabsContent value="faq">
              <SectionIntro title="Frequently asked questions" text="Clear answers about how the prototype works." />
              <Accordion type="single" collapsible className="mt-5 rounded-2xl border border-[#d7dfd2] bg-white px-5">
                <Faq value="price" question="Is the displayed price guaranteed?">No. KabadiSetu shows an estimated fair range. The final amount depends on verified material condition and final scale weight.</Faq>
                <Faq value="verified" question="How are recyclers verified?">Production onboarding will check CPCB or State Pollution Control Board authorization and its expiry date. Current names are demo data.</Faq>
                <Faq value="offline" question="What works without internet?">The installed PWA can open cached screens and save a new lot offline. Live prices, offers and recycler status need internet to sync.</Faq>
                <Faq value="fairlock" question="What is FairLock?">After an offer is accepted, its rate is protected for a limited time. Any final variance needs a recorded reason and collector approval.</Faq>
                <Faq value="cluster" question="How does Cluster Pickup help?">Nearby compatible small lots can be combined to meet a recycler minimum and reduce pickup cost.</Faq>
              </Accordion>
            </TabsContent>

            <TabsContent value="help">
              <SectionIntro title="Raise a help query" text="Submit a demo support request and receive a query ID immediately." />
              <form onSubmit={submitQuery} className="mt-6 space-y-4">
                <SupportField label="Mobile number or email"><Input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="How should support contact you?" className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></SupportField>
                <SupportField label="Query type"><Select value={queryType} onValueChange={setQueryType}><SelectTrigger className="h-12 w-full rounded-xl border-[#cbd5c5] bg-white"><SelectValue placeholder="Select query type" /></SelectTrigger><SelectContent><SelectItem value="account">Account / login</SelectItem><SelectItem value="price">Price or offer</SelectItem><SelectItem value="pickup">Pickup / handover</SelectItem><SelectItem value="payment">Payment</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></SupportField>
                <SupportField label="Your query"><Textarea value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Describe the issue in simple words" className="min-h-28 rounded-xl border-[#cbd5c5] bg-white" /></SupportField>
                {queryId && <div className="rounded-2xl border border-[#cfe08d] bg-[#f0f8cf] p-4 text-sm"><p className="font-black">Query saved: {queryId}</p><p className="mt-1 text-[#5f6f65]">Keep this ID for follow-up. Demo records stay on this device.</p></div>}
                <Button type="submit" className="h-12 w-full rounded-xl bg-[#173d30]"><Send /> Submit help query</Button>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function SectionIntro({ title, text }: { title: string; text: string }) {
  return <div><h3 className="text-2xl font-black tracking-[-0.03em]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#68766f]">{text}</p></div>;
}

function SupportField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-[#465b51]">{label}</span>{children}</label>;
}

function Faq({ value, question, children }: { value: string; question: string; children: React.ReactNode }) {
  return <AccordionItem value={value}><AccordionTrigger className="text-base font-bold">{question}</AccordionTrigger><AccordionContent className="leading-6 text-[#65736c]">{children}</AccordionContent></AccordionItem>;
}
