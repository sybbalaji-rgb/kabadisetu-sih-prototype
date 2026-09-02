"use client";

import { useEffect, useState } from "react";
import {
  Factory, Languages, LogOut, Recycle, RefreshCw, RotateCcw, UserRound, Wifi, WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CollectorWorkspace } from "./collector-app";
import { RecyclerDashboard } from "./recycler-dashboard";
import { GlobalVoiceAssistant } from "./voice-assistant";
import { PWAInstallButton } from "./pwa-install";
import { RoleLogin } from "./role-login";
import { LanguageRuntime } from "./language-runtime";
import {
  CollectorView, Language, Lot, RecyclerView, Role, navItems, seedLots, translations, voiceLocales,
} from "./kabadi-data";

export function KabadiApp() {
  const [role, setRole] = useState<Role>("collector");
  const [session, setSession] = useState<{ role: Role; displayName: string } | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [collectorView, setCollectorView] = useState<CollectorView>("home");
  const [recyclerView, setRecyclerView] = useState<RecyclerView>("lots");
  const [offlineMode, setOfflineMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
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
    const savedSession = window.localStorage.getItem("kabadisetu-session-v1");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession) as { role: Role; displayName: string };
        if ((parsed.role === "collector" || parsed.role === "recycler") && parsed.displayName) {
          setSession(parsed);
          setRole(parsed.role);
        }
      } catch {
        window.localStorage.removeItem("kabadisetu-session-v1");
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    const updateConnection = () => setIsOnline(window.navigator.onLine);
    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
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
  const effectiveOffline = offlineMode || !isOnline;
  const activeLot = lots.find((lot) => lot.id === activeLotId) ?? lots.find((lot) => lot.status !== "completed") ?? lots[0];
  const paidTotal = lots.reduce((sum, lot) => lot.status === "completed" && lot.paymentStatus === "paid" ? sum + (lot.finalWeight ?? lot.weight) * (lot.finalRate ?? lot.lockedRate ?? 0) : sum, 0);
  const pendingTotal = lots.reduce((sum, lot) => lot.status === "completed" && lot.paymentStatus !== "paid" ? sum + (lot.finalWeight ?? lot.weight) * (lot.finalRate ?? lot.lockedRate ?? 0) : sum, 0);

  const resetDemo = () => {
    setLots(seedLots); setActiveLotId("LOT-2381"); setCollectorView("home"); setRecyclerView("lots");
    setRole(session?.role ?? "collector"); setOfflineMode(false); setBanner("Demo data reset successfully");
  };

  const login = (nextSession: { role: Role; displayName: string }) => {
    window.localStorage.setItem("kabadisetu-session-v1", JSON.stringify(nextSession));
    setSession(nextSession);
    setRole(nextSession.role);
    setCollectorView("home");
    setRecyclerView("lots");
  };

  const logout = () => {
    window.localStorage.removeItem("kabadisetu-session-v1");
    setSession(null);
    setRole("collector");
    setBanner("");
  };

  const switchDemoRole = (nextRole: Role, displayName: string) => {
    const nextSession = { role: nextRole, displayName };
    window.localStorage.setItem("kabadisetu-session-v1", JSON.stringify(nextSession));
    setSession(nextSession);
    setRole(nextRole);
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
    if (effectiveOffline) return setBanner("Internet connection is required before syncing");
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

  if (!hydrated) {
    return <main className="grid min-h-screen place-items-center bg-[#edf1e8] text-[#17312a]"><div className="flex items-center gap-3 font-black"><Recycle className="animate-pulse" /> Loading KabadiSetu…</div></main>;
  }

  if (!session) return <><LanguageRuntime language={language} /><RoleLogin language={language} onLanguage={setLanguage} onLogin={login} /></>;

  return (
    <><LanguageRuntime language={language} /><main className="min-h-screen bg-[#edf1e8] text-[#17312a]">
      <header className="sticky top-0 z-40 border-b border-[#d8dfd2] bg-[#f8faf5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#173d30] text-[#e9ff9d] shadow-sm"><Recycle className="size-6" /></div>
            <div className="hidden min-w-0 sm:block"><div className="flex items-center gap-2"><h1 className="truncate text-lg font-black tracking-[-0.02em]">KabadiSetu</h1><span className="hidden rounded-full bg-[#e8f2b7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#425600] sm:inline">SIH Prototype</span></div><p className="hidden text-xs text-[#617069] sm:block">Transparent value. Verified recycling.</p></div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <div className="hidden h-10 items-center gap-2 rounded-xl bg-[#e4e9df] px-3 text-sm font-bold sm:flex">{role === "collector" ? <UserRound className="size-4" /> : <Factory className="size-4" />}<span className="max-w-32 truncate">{session.displayName}</span><span className="text-xs font-medium text-[#6a7871]">· {role}</span></div>
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}><SelectTrigger data-no-translate className="h-10 w-10 border-[#cbd5c5] bg-white sm:w-[150px]" aria-label="Choose language"><Languages className="size-4" /><span className="hidden sm:inline"><SelectValue /></span></SelectTrigger><SelectContent data-no-translate><SelectItem value="en">English</SelectItem><SelectItem value="hi">हिन्दी</SelectItem><SelectItem value="mr">मराठी</SelectItem><SelectItem value="ta">தமிழ்</SelectItem><SelectItem value="te">తెలుగు</SelectItem><SelectItem value="kn">ಕನ್ನಡ</SelectItem><SelectItem value="ml">മലയാളം</SelectItem><SelectItem value="bn">বাংলা</SelectItem><SelectItem value="gu">ગુજરાતી</SelectItem><SelectItem value="pa">ਪੰਜਾਬੀ</SelectItem><SelectItem value="or">ଓଡ଼ିଆ</SelectItem><SelectItem value="as">অসমীয়া</SelectItem></SelectContent></Select>
            <PWAInstallButton />
            <Button variant="outline" size="icon" className="hidden border-[#cbd5c5] bg-white sm:inline-flex" onClick={resetDemo} aria-label="Reset demo"><RotateCcw /></Button>
            <Button variant="outline" size="icon" className="border-[#cbd5c5] bg-white" onClick={logout} aria-label="Switch account"><LogOut /></Button>
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
                <div className="mb-4 flex items-start justify-between"><div className="grid size-10 place-items-center rounded-xl bg-white/10 text-[#e9ff9d]">{effectiveOffline ? <WifiOff /> : <Wifi />}</div><Switch checked={effectiveOffline} onCheckedChange={setOfflineMode} disabled={!isOnline} aria-label="Toggle offline demo" /></div>
                <p className="font-bold">{!isOnline ? "Offline — device mode" : offlineMode ? "Offline demo on" : "Connected"}</p><p className="mt-1 text-xs leading-5 text-white/65">{effectiveOffline ? "New lots stay safely on this device." : "Prices and recycler offers are current demo data."}</p>
                {lots.some((lot) => lot.syncStatus === "pending") && <Button size="sm" className="mt-4 w-full bg-[#e9ff9d] text-[#173d30] hover:bg-[#dff28b]" onClick={syncPendingLots}><RefreshCw /> Sync now</Button>}
              </div>
            </div>
          </aside>
          <section className="min-w-0 flex-1">
            {effectiveOffline && <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"><WifiOff className="size-4 shrink-0" /> {!isOnline ? "No internet: the installed app and lot creation work offline; live offers will sync later." : "Offline demo: lot creation works; live offers need a later sync."}</div>}
            <CollectorWorkspace view={collectorView} setView={setCollectorView} language={language} lots={lots} activeLot={activeLot} paidTotal={paidTotal} pendingTotal={pendingTotal} offlineMode={effectiveOffline} onAdd={addLot} onUpdate={updateLot} onSelectLot={setActiveLotId} onBanner={setBanner} onSpeak={speak} onRecyclerDemo={() => { switchDemoRole("recycler", "GreenLoop E-Waste"); setRecyclerView("handover"); }} />
          </section>
          <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-start overflow-x-auto rounded-2xl border border-[#d6ded1] bg-[#f9fbf7]/95 p-2 shadow-[0_10px_35px_rgba(23,61,48,0.18)] backdrop-blur lg:hidden">
            {navItems.map(({ key, icon: Icon, translation }) => <Button key={key} variant="ghost" size="sm" className={`h-14 min-w-20 shrink-0 flex-col gap-1 rounded-xl px-2 text-xs font-bold ${collectorView === key ? "bg-[#173d30] text-white hover:bg-[#173d30] hover:text-white" : "text-[#617069]"}`} onClick={() => setCollectorView(key)}><Icon className="size-5" /> {tr[translation]}</Button>)}
          </nav>
        </div>
      ) : (
        <RecyclerDashboard lots={lots} view={recyclerView} setView={setRecyclerView} onUpdate={updateLot} onBanner={setBanner} onCollectorReceipt={(lot) => { setActiveLotId(lot.id); switchDemoRole("collector", "Ravi"); setCollectorView("ledger"); }} />
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
    </main></>
  );
}
