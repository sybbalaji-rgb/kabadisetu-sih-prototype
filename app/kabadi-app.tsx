"use client";

import { useEffect, useState } from "react";
import {
  Factory, Languages, Recycle, RefreshCw, RotateCcw, UserRound, Wifi, WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollectorWorkspace } from "./collector-app";
import { RecyclerDashboard } from "./recycler-dashboard";
import { GlobalVoiceAssistant } from "./voice-assistant";
import {
  CollectorView, Language, Lot, RecyclerView, Role, navItems, seedLots, translations, voiceLocales,
} from "./kabadi-data";

export function KabadiApp() {
  const [role, setRole] = useState<Role>("collector");
  const [language, setLanguage] = useState<Language>("en");
  const [collectorView, setCollectorView] = useState<CollectorView>("home");
  const [recyclerView, setRecyclerView] = useState<RecyclerView>("lots");
  const [offlineMode, setOfflineMode] = useState(false);
  const [lots, setLots] = useState<Lot[]>(seedLots);
  const [hydrated, setHydrated] = useState(false);
  const [activeLotId, setActiveLotId] = useState("LOT-2381");
  const [banner, setBanner] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("kabadisetu-demo-v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { lots: Lot[]; language: Language };
        if (parsed.lots?.length) setLots(parsed.lots);
        if (parsed.language) setLanguage(parsed.language);
      } catch {
        window.localStorage.removeItem("kabadisetu-demo-v1");
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("kabadisetu-demo-v1", JSON.stringify({ lots, language }));
  }, [lots, language, hydrated]);

  useEffect(() => {
    if (!banner) return;
    const timer = window.setTimeout(() => setBanner(""), 3200);
    return () => window.clearTimeout(timer);
  }, [banner]);

  const tr = translations[language];
  const activeLot = lots.find((lot) => lot.id === activeLotId) ?? lots.find((lot) => lot.status !== "completed") ?? lots[0];
  const paidTotal = lots.reduce((sum, lot) => lot.status === "completed" && lot.paymentStatus === "paid" ? sum + (lot.finalWeight ?? lot.weight) * (lot.finalRate ?? lot.lockedRate ?? 0) : sum, 0);
  const pendingTotal = lots.reduce((sum, lot) => lot.status === "completed" && lot.paymentStatus !== "paid" ? sum + (lot.finalWeight ?? lot.weight) * (lot.finalRate ?? lot.lockedRate ?? 0) : sum, 0);

  const resetDemo = () => {
    setLots(seedLots); setActiveLotId("LOT-2381"); setCollectorView("home"); setRecyclerView("lots");
    setRole("collector"); setOfflineMode(false); setBanner("Demo data reset successfully");
  };

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return setBanner("Voice guidance is not supported in this browser");
    window.speechSynthesis.cancel();
    const message = new SpeechSynthesisUtterance(text);
    message.lang = voiceLocales[language];
    message.rate = 0.9;
    window.speechSynthesis.speak(message);
  };

  const syncPendingLots = () => {
    if (offlineMode) return setBanner("Turn off offline demo mode before syncing");
    setLots((current) => current.map((lot) => lot.syncStatus === "pending" ? { ...lot, syncStatus: "synced", status: lot.status === "offline" ? "available" : lot.status } : lot));
    setBanner("Pending lots synced with the platform");
  };

  const updateLot = (updated: Lot) => {
    setLots((current) => current.map((lot) => lot.id === updated.id ? updated : lot));
    setActiveLotId(updated.id);
  };

  const addLot = (lot: Lot) => {
    setLots((current) => [lot, ...current]); setActiveLotId(lot.id);
    setCollectorView(lot.status === "offline" ? "home" : "matches");
    setBanner(lot.status === "offline" ? "Lot saved offline — sync when connected" : "Digital lot created successfully");
  };

  return (
    <main className="min-h-screen bg-[#edf1e8] text-[#17312a]">
      <header className="sticky top-0 z-40 border-b border-[#d8dfd2] bg-[#f8faf5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#173d30] text-[#e9ff9d] shadow-sm"><Recycle className="size-6" /></div>
            <div className="min-w-0"><div className="flex items-center gap-2"><h1 className="truncate text-lg font-black tracking-[-0.02em]">KabadiSetu</h1><span className="hidden rounded-full bg-[#e8f2b7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#425600] sm:inline">SIH Prototype</span></div><p className="hidden text-xs text-[#617069] sm:block">Transparent value. Verified recycling.</p></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Tabs value={role} onValueChange={(value) => setRole(value as Role)}><TabsList className="h-10 bg-[#e4e9df] p-1"><TabsTrigger value="collector" className="px-3"><UserRound /><span className="hidden sm:inline">Collector</span></TabsTrigger><TabsTrigger value="recycler" className="px-3"><Factory /><span className="hidden sm:inline">Recycler</span></TabsTrigger></TabsList></Tabs>
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}><SelectTrigger className="h-10 w-[118px] border-[#cbd5c5] bg-white sm:w-[150px]"><Languages className="size-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="hi">हिन्दी</SelectItem><SelectItem value="mr">मराठी</SelectItem><SelectItem value="ta">தமிழ்</SelectItem><SelectItem value="te">తెలుగు</SelectItem><SelectItem value="kn">ಕನ್ನಡ</SelectItem><SelectItem value="ml">മലയാളം</SelectItem><SelectItem value="bn">বাংলা</SelectItem><SelectItem value="gu">ગુજરાતી</SelectItem><SelectItem value="pa">ਪੰਜਾਬੀ</SelectItem><SelectItem value="or">ଓଡ଼ିଆ</SelectItem><SelectItem value="as">অসমীয়া</SelectItem></SelectContent></Select>
            <Button variant="outline" size="icon" className="hidden border-[#cbd5c5] bg-white sm:inline-flex" onClick={resetDemo} aria-label="Reset demo"><RotateCcw /></Button>
          </div>
        </div>
      </header>

      {banner && <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-[#173d30] px-5 py-3 text-sm font-semibold text-white shadow-xl" role="status">{banner}</div>}

      {role === "collector" ? (
        <div className="mx-auto flex max-w-[1500px] gap-6 px-4 pb-28 pt-5 sm:px-6 lg:pb-8">
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-24 space-y-4">
              <nav className="rounded-[28px] border border-[#d6ded1] bg-[#f9fbf7] p-3 shadow-sm">
                <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#78877f]">Collector app</p>
                {navItems.map(({ key, icon: Icon, translation }) => <Button key={key} variant="ghost" className={`mb-1 h-11 w-full justify-start rounded-xl px-3 ${collectorView === key ? "bg-[#173d30] text-white hover:bg-[#173d30] hover:text-white" : "text-[#506159]"}`} onClick={() => setCollectorView(key)}><Icon /> {tr[translation]}</Button>)}
              </nav>
              <div className="rounded-[28px] bg-[#173d30] p-5 text-white shadow-sm">
                <div className="mb-4 flex items-start justify-between"><div className="grid size-10 place-items-center rounded-xl bg-white/10 text-[#e9ff9d]">{offlineMode ? <WifiOff /> : <Wifi />}</div><Switch checked={offlineMode} onCheckedChange={setOfflineMode} aria-label="Toggle offline demo" /></div>
                <p className="font-bold">{offlineMode ? "Offline demo on" : "Connected"}</p><p className="mt-1 text-xs leading-5 text-white/65">{offlineMode ? "New lots stay safely on this device." : "Prices and recycler offers are current demo data."}</p>
                {lots.some((lot) => lot.syncStatus === "pending") && <Button size="sm" className="mt-4 w-full bg-[#e9ff9d] text-[#173d30] hover:bg-[#dff28b]" onClick={syncPendingLots}><RefreshCw /> Sync now</Button>}
              </div>
            </div>
          </aside>
          <section className="min-w-0 flex-1">
            {offlineMode && <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"><WifiOff className="size-4 shrink-0" /> Offline demo: lot creation works; live offers need a later sync.</div>}
            <CollectorWorkspace view={collectorView} setView={setCollectorView} language={language} lots={lots} activeLot={activeLot} paidTotal={paidTotal} pendingTotal={pendingTotal} offlineMode={offlineMode} onAdd={addLot} onUpdate={updateLot} onSelectLot={setActiveLotId} onBanner={setBanner} onSpeak={speak} onRecyclerDemo={() => { setRole("recycler"); setRecyclerView("handover"); }} />
          </section>
          <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-[#d6ded1] bg-[#f9fbf7]/95 p-2 shadow-[0_10px_35px_rgba(23,61,48,0.18)] backdrop-blur lg:hidden">
            {navItems.map(({ key, icon: Icon, translation }) => <Button key={key} variant="ghost" size="sm" className={`h-12 min-w-14 flex-col gap-1 rounded-xl px-2 text-[10px] ${collectorView === key ? "bg-[#173d30] text-white hover:bg-[#173d30] hover:text-white" : "text-[#617069]"}`} onClick={() => setCollectorView(key)}><Icon className="size-4" /> {tr[translation]}</Button>)}
          </nav>
        </div>
      ) : (
        <RecyclerDashboard lots={lots} view={recyclerView} setView={setRecyclerView} onUpdate={updateLot} onBanner={setBanner} onCollectorReceipt={(lot) => { setActiveLotId(lot.id); setRole("collector"); setCollectorView("ledger"); }} />
      )}

      <GlobalVoiceAssistant
        language={language}
        role={role}
        collectorView={collectorView}
        recyclerView={recyclerView}
        speak={speak}
        onRole={setRole}
        onCollectorView={setCollectorView}
        onRecyclerView={setRecyclerView}
        onBanner={setBanner}
      />
    </main>
  );
}
