"use client";

import { FormEvent, useState } from "react";
import { Factory, Headphones, Languages, Recycle, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Language, Role, voiceLocales } from "./kabadi-data";

type DemoSession = { role: Role; displayName: string };

const languages: { value: Language; label: string }[] = [
  { value: "en", label: "English" }, { value: "hi", label: "हिन्दी" },
  { value: "mr", label: "मराठी" }, { value: "ta", label: "தமிழ்" },
  { value: "te", label: "తెలుగు" }, { value: "kn", label: "ಕನ್ನಡ" },
  { value: "ml", label: "മലയാളം" }, { value: "bn", label: "বাংলা" },
  { value: "gu", label: "ગુજરાતી" }, { value: "pa", label: "ਪੰਜਾਬੀ" },
  { value: "or", label: "ଓଡ଼ିଆ" }, { value: "as", label: "অসমীয়া" },
];

export function RoleLogin({
  language,
  onLanguage,
  onLogin,
}: {
  language: Language;
  onLanguage: (language: Language) => void;
  onLogin: (session: DemoSession) => void;
}) {
  const [role, setRole] = useState<Role>("collector");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [authorizationId, setAuthorizationId] = useState("");
  const [error, setError] = useState("");

  const fillDemo = () => {
    setError("");
    if (role === "collector") {
      setName("Ravi");
      setContact("98765 43210");
      setAuthorizationId("");
    } else {
      setName("GreenLoop E-Waste");
      setContact("greenloop@example.com");
      setAuthorizationId("RECY-MH-2026-014");
    }
  };

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const message = new SpeechSynthesisUtterance(
      role === "collector"
        ? "Collector login selected. Enter your name and mobile number, or use the demo details."
        : "Recycler login selected. Enter the organisation details and authorization ID, or use the demo details.",
    );
    message.lang = voiceLocales[language];
    message.rate = 0.9;
    window.speechSynthesis.speak(message);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !contact.trim()) return setError("Please enter the required details.");
    if (role === "recycler" && !authorizationId.trim()) return setError("Recycler authorization ID is required.");
    onLogin({ role, displayName: name.trim() });
  };

  return (
    <main className="min-h-screen bg-[#edf1e8] px-4 py-5 text-[#17312a] sm:px-6 sm:py-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-[#173d30] text-[#e9ff9d]"><Recycle /></div>
          <div><h1 className="text-lg font-black">KabadiSetu</h1><p className="text-xs text-[#65736c]">Collector ↔ Authorized recycler</p></div>
        </div>
        <Select value={language} onValueChange={(value) => onLanguage(value as Language)}>
          <SelectTrigger data-no-translate className="h-11 w-11 border-[#cbd5c5] bg-white sm:w-[145px]" aria-label="Choose language"><Languages className="size-4" /><span className="hidden sm:inline"><SelectValue /></span></SelectTrigger>
          <SelectContent data-no-translate>{languages.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <section className="mx-auto mt-8 grid max-w-6xl overflow-hidden rounded-[34px] border border-[#d1dccb] bg-[#f9fbf7] shadow-[0_24px_80px_rgba(23,61,48,0.13)] lg:grid-cols-[0.86fr_1.14fr]">
        <div className="relative overflow-hidden bg-[#173d30] p-7 text-white sm:p-10 lg:p-12">
          <div className="absolute -right-24 -top-20 size-64 rounded-full border-[38px] border-white/5" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e9ff9d]">SIH working prototype</p>
            <h2 className="mt-4 max-w-lg text-4xl font-black leading-[1.05] tracking-[-0.05em] sm:text-5xl">One bridge. Two focused workspaces.</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/70">Collectors create and compare lots. Authorized recyclers accept, verify and complete traceable handovers.</p>
            <div className="mt-8 space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3"><ShieldCheck className="size-5 text-[#e9ff9d]" /> FairLock protects an accepted rate</div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3"><Headphones className="size-5 text-[#e9ff9d]" /> Voice guidance in 12 Indian languages</div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-9 lg:p-12">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6f7e76]">Choose your workspace</p><h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">Sign in to continue</h2></div>
            <Button type="button" variant="outline" size="sm" className="border-[#cbd5c5] bg-white" onClick={speak}><Headphones /> Listen</Button>
          </div>

          <Tabs value={role} onValueChange={(value) => { setRole(value as Role); setError(""); }} className="mt-7">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-[#e4e9df] p-1.5">
              <TabsTrigger value="collector" className="h-14 rounded-xl"><UserRound /> Collector</TabsTrigger>
              <TabsTrigger value="recycler" className="h-14 rounded-xl"><Factory /> Recycler</TabsTrigger>
            </TabsList>

            <form onSubmit={submit} className="mt-6">
              <TabsContent value="collector" className="space-y-4">
                <LoginField label="Collector name"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Example: Ravi" className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></LoginField>
                <LoginField label="Mobile number"><Input value={contact} onChange={(event) => setContact(event.target.value)} inputMode="tel" placeholder="10-digit mobile number" className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></LoginField>
              </TabsContent>
              <TabsContent value="recycler" className="space-y-4">
                <LoginField label="Recycler organisation"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Registered organisation name" className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></LoginField>
                <LoginField label="Official email or mobile"><Input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Contact used for verification" className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></LoginField>
                <LoginField label="Authorization ID"><Input value={authorizationId} onChange={(event) => setAuthorizationId(event.target.value)} placeholder="CPCB / SPCB authorization ID" className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></LoginField>
              </TabsContent>

              {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
              <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                <Button type="submit" size="lg" className="h-12 rounded-xl bg-[#173d30]">Continue as {role === "collector" ? "Collector" : "Recycler"}</Button>
                <Button type="button" size="lg" variant="outline" className="h-12 rounded-xl border-[#b8c8b3] bg-[#eef7d5]" onClick={fillDemo}>Use demo details</Button>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#718078]">Prototype sign-in only. No password or personal details are sent to a server.</p>
            </form>
          </Tabs>
        </div>
      </section>
    </main>
  );
}

function LoginField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-[#465b51]">{label}</span>{children}</label>;
}
