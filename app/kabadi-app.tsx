"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  AlertTriangle, AudioLines, BarChart3, Boxes, Camera, CheckCircle2,
  FileCheck2, Headphones, Languages, Landmark, Leaf, LockKeyhole,
  LogOut, MapPin, Mic2, PackageCheck, Recycle, RefreshCw, Scale, ShieldCheck,
  Sparkles, Star, Truck, UploadCloud, UserRound, UsersRound, WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PWAInstallButton } from "./pwa-install";
import { RatingStars } from "./rating-stars";
import { RoleLogin, LoginRequest } from "./role-login";
import { Language, Lot, MaterialKey, Role, formatDate, materials, money, voiceLocales } from "./kabadi-data";
import { useTranslation } from "react-i18next";
import { changeLanguage, supportedLanguages } from "@/i18n/config";

type Session = LoginRequest & { id: string; verified: boolean };
type RecyclerProfile = { id: string; name: string; serviceArea: string; authorizationId?: string; verified: boolean };
type Price = { material: MaterialKey; low: number; high: number; source: string; updatedAt: string };
type Cluster = { cluster_id: string; material: MaterialKey; location: string; lot_count: number; total_weight: number };
type SupportRecord = { id: string; kind: string; rating?: number; message: string; status: string; created_at: string };
type Snapshot = {
  lots: Lot[]; recyclers: RecyclerProfile[]; prices: Price[]; priceHistory: Record<string, unknown>[];
  clusters: Cluster[]; support: SupportRecord[];
  metrics: { total_lots?: number; total_kg?: number; completed?: number; clustered?: number };
};
type View = "home" | "create" | "lots" | "market" | "safety" | "help" | "handover" | "history" | "command";

const blankSnapshot: Snapshot = { lots: [], recyclers: [], prices: [], priceHistory: [], clusters: [], support: [], metrics: {} };

function getMaterialLabel(key: MaterialKey, t: (k: string) => string): string {
  const transKey = `material_${key}`;
  const translated = t(transKey);
  return translated && translated !== transKey ? translated : materials[key]?.label || key;
}

async function requestApi(body: Record<string, unknown>) {
  const result = await fetch("/api/platform", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  let data: Record<string, unknown> = {};
  try {
    data = (await result.json()) as Record<string, unknown>;
  } catch {
    throw new Error("Unable to connect to the platform server. Please try again.");
  }
  if (!result.ok) throw new Error(String(data.error ?? "Request failed"));
  return data;
}

export function KabadiApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [view, setView] = useState<View>("home");
  const [data, setData] = useState<Snapshot>(blankSnapshot);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("kabadisetu-account-v2");
    const savedLanguage = (window.localStorage.getItem("language") || window.localStorage.getItem("kabadisetu-language")) as Language | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
      void changeLanguage(savedLanguage);
    }
    if (saved) try { setSession(JSON.parse(saved) as Session); } catch { window.localStorage.removeItem("kabadisetu-account-v2"); }
    setHydrated(true);
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    void changeLanguage(newLang);
  };

  useEffect(() => { if (!banner) return; const timer = window.setTimeout(() => setBanner(""), 4500); return () => clearTimeout(timer); }, [banner]);

  const refresh = useCallback(async (quiet = false) => {
    if (!session || !navigator.onLine) return;
    if (!quiet) setLoading(true);
    try {
      const response = await fetch(`/api/platform?profileId=${encodeURIComponent(session.id)}`, { cache: "no-store" });
      let payload: Snapshot & { error?: string; profile?: Session };
      try {
        payload = (await response.json()) as Snapshot & { error?: string; profile?: Session };
      } catch {
        if (!quiet) setBanner("Connecting to platform...");
        return;
      }
      if (!response.ok) {
        if (payload.error?.includes("Account not found")) {
          window.localStorage.removeItem("kabadisetu-account-v2");
          setSession(null);
          setBanner("Session updated. Please choose your workspace to continue.");
          return;
        }
        throw new Error(payload.error ?? "Unable to sync");
      }
      setData(payload);
      if (payload.profile) {
        const next = { ...session, ...payload.profile };
        setSession(next); window.localStorage.setItem("kabadisetu-account-v2", JSON.stringify(next));
      }
    } catch (error) {
      if (!quiet) {
        const msg = error instanceof Error ? error.message : "Unable to sync";
        if (msg.includes("<!DOCTYPE") || msg.includes("Unexpected token")) {
          setBanner("Synchronizing with platform...");
        } else {
          setBanner(msg);
        }
      }
    }
    finally { if (!quiet) setLoading(false); }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    void refresh();
    const timer = window.setInterval(() => void refresh(true), 20000);
    const online = () => void refresh();
    window.addEventListener("online", online);
    return () => { clearInterval(timer); window.removeEventListener("online", online); };
  }, [session?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (details: LoginRequest) => {
    setLoading(true);
    try {
      const payload = await requestApi({ action: "register", ...details });
      const profile = payload.profile as Session;
      const next = { ...details, ...profile };
      setSession(next); window.localStorage.setItem("kabadisetu-account-v2", JSON.stringify(next));
      setView(details.role === "authority" ? "command" : "home");
    } catch (error) { setBanner(error instanceof Error ? error.message : "Sign in failed"); }
    finally { setLoading(false); }
  };

  const act = async (action: string, values: Record<string, unknown> = {}) => {
    if (!session) throw new Error("Sign in again");
    setLoading(true);
    try {
      const result = await requestApi({ action, profileId: session.id, ...values });
      await refresh(true);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      setBanner(message); throw error;
    } finally { setLoading(false); }
  };

  const logout = () => { window.localStorage.removeItem("kabadisetu-account-v2"); setSession(null); setData(blankSnapshot); setView("home"); };
  const speak = () => {
    if (!("speechSynthesis" in window)) return setBanner("Voice guidance is not supported on this browser");
    speechSynthesis.cancel();
    const text = document.querySelector("[data-screen]")?.textContent?.replace(/\s+/g, " ").slice(0, 1800) || "KabadiSetu";
    const utterance = new SpeechSynthesisUtterance(text); utterance.lang = voiceLocales[language] || "en-IN"; utterance.rate = 0.9; speechSynthesis.speak(utterance);
  };

  if (!hydrated) return <main className="grid min-h-screen place-items-center bg-[#edf1e8]"><Recycle className="size-10 animate-pulse text-[#173d30]" /></main>;

  return <>
    {banner && <div className="fixed left-1/2 top-20 z-[70] w-max max-w-[90vw] -translate-x-1/2 rounded-full bg-[#173d30] px-5 py-3 text-center text-sm font-bold text-white shadow-xl" role="status">{banner}</div>}
    {!session ? <RoleLogin language={language} onLanguage={handleLanguageChange} onLogin={(details) => void login(details)} /> :
      <main className="min-h-screen bg-[#edf1e8] pb-24 text-[#17312a] lg:pb-8">
        <Header session={session} language={language} onLanguage={handleLanguageChange} onRefresh={() => void refresh()} onLogout={logout} loading={loading} />
        <div className="mx-auto flex max-w-[1500px] gap-5 px-4 py-5 sm:px-6">
          <Navigation role={session.role} view={view} onView={setView} />
          <section className="min-w-0 flex-1" data-screen>
            {session.role === "collector" && <CollectorArea session={session} view={view} data={data} act={act} onView={setView} onBanner={setBanner} />}
            {session.role === "recycler" && <RecyclerArea session={session} view={view} data={data} act={act} onView={setView} />}
            {session.role === "authority" && <AuthorityArea data={data} act={act} />}
          </section>
        </div>
        <MobileNavigation role={session.role} view={view} onView={setView} />
        <VoiceDock language={language} role={session.role} onView={setView} onSpeak={speak} onBanner={setBanner} />
      </main>}
    {loading && <div className="fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-[#dce5d7]"><div className="h-full w-1/2 animate-pulse bg-[#8ab436]" /></div>}
  </>;
}

function Header({ session, language, onLanguage, onRefresh, onLogout, loading }: { session: Session; language: Language; onLanguage: (value: Language) => void; onRefresh: () => void; onLogout: () => void; loading: boolean }) {
  const { t } = useTranslation();
  return <header className="sticky top-0 z-40 border-b border-[#d6ded1] bg-[#f8faf5]/95 backdrop-blur"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-6"><div className="flex min-w-0 items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#173d30] text-[#e9ff9d]"><Recycle /></span><div className="hidden sm:block"><h1 className="font-black">{t("app_name")}</h1><p className="text-xs text-[#6b7971]">{t("network_subtitle")}</p></div></div><div className="flex items-center gap-2"><div className="hidden rounded-xl bg-[#e4e9df] px-3 py-2 text-sm font-bold md:block">{session.displayName} · <span className="capitalize">{t(session.role)}</span></div><Select value={language} onValueChange={(value) => onLanguage(value as Language)}><SelectTrigger data-no-translate className="h-10 w-11 border-[#cbd5c5] bg-white sm:w-[145px]" aria-label={t("language")}><Languages /><span className="hidden sm:inline"><SelectValue /></span></SelectTrigger><SelectContent data-no-translate>{supportedLanguages.map((option) => <SelectItem value={option.code} key={option.code}>{option.label}</SelectItem>)}</SelectContent></Select><PWAInstallButton /><Button variant="outline" size="icon" className="border-[#cbd5c5] bg-white" disabled={loading} onClick={onRefresh} aria-label={t("refresh")}><RefreshCw className={loading ? "animate-spin" : ""} /></Button><Button variant="outline" size="icon" className="border-[#cbd5c5] bg-white" onClick={onLogout} aria-label={t("logout")}><LogOut /></Button></div></div></header>;
}

function Navigation({ role, view, onView }: { role: Role; view: View; onView: (value: View) => void }) {
  const { t } = useTranslation();
  const navItems: { view: View; label: string; icon: typeof Recycle }[] = role === "collector" ? [
    { view: "home", label: t("home"), icon: UserRound },
    { view: "create", label: t("ai_scanner"), icon: Camera },
    { view: "lots", label: t("my_lots"), icon: Boxes },
    { view: "market", label: t("fair_prices"), icon: BarChart3 },
    { view: "safety", label: t("safety"), icon: ShieldCheck },
    { view: "help", label: t("help_faq"), icon: Headphones },
  ] : role === "recycler" ? [
    { view: "home", label: t("open_lots"), icon: Boxes },
    { view: "handover", label: t("handovers"), icon: Truck },
    { view: "history", label: t("passports"), icon: FileCheck2 },
    { view: "help", label: t("help_faq"), icon: Headphones },
  ] : [
    { view: "command", label: t("command_center"), icon: Landmark }
  ];

  return <aside className="hidden w-60 shrink-0 lg:block"><nav className="sticky top-24 rounded-[28px] border border-[#d6ded1] bg-[#f9fbf7] p-3 shadow-sm"><p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#78877f]">{role === "authority" ? "JNARDDC" : role === "collector" ? t("collector_workspace") : t("recycler_workspace")}</p>{navItems.map(({ view: item, label, icon: Icon }) => <Button key={item} variant="ghost" className={`mb-1 h-12 w-full justify-start rounded-xl ${view === item ? "bg-[#173d30] text-white hover:bg-[#173d30] hover:text-white" : "text-[#52635b]"}`} onClick={() => onView(item)}><Icon />{label}</Button>)}</nav></aside>;
}

function MobileNavigation({ role, view, onView }: { role: Role; view: View; onView: (value: View) => void }) {
  const { t } = useTranslation();
  const navItems: { view: View; label: string; icon: typeof Recycle }[] = role === "collector" ? [
    { view: "home", label: t("home"), icon: UserRound },
    { view: "create", label: t("ai_scanner"), icon: Camera },
    { view: "lots", label: t("my_lots"), icon: Boxes },
    { view: "market", label: t("fair_prices"), icon: BarChart3 },
    { view: "safety", label: t("safety"), icon: ShieldCheck },
    { view: "help", label: t("help_faq"), icon: Headphones },
  ] : role === "recycler" ? [
    { view: "home", label: t("open_lots"), icon: Boxes },
    { view: "handover", label: t("handovers"), icon: Truck },
    { view: "history", label: t("passports"), icon: FileCheck2 },
    { view: "help", label: t("help_faq"), icon: Headphones },
  ] : [
    { view: "command", label: t("command_center"), icon: Landmark }
  ];

  return <nav className="fixed inset-x-3 bottom-3 z-40 flex overflow-x-auto rounded-2xl border border-[#d6ded1] bg-[#f9fbf7]/95 p-2 shadow-xl backdrop-blur lg:hidden">{navItems.map(({ view: item, label, icon: Icon }) => <Button key={item} variant="ghost" className={`h-14 min-w-24 shrink-0 flex-col gap-1 rounded-xl text-xs ${view === item ? "bg-[#173d30] text-white" : "text-[#617069]"}`} onClick={() => onView(item)}><Icon />{label}</Button>)}</nav>;
}

function CollectorArea({ session, view, data, act, onView, onBanner }: { session: Session; view: View; data: Snapshot; act: (action: string, values?: Record<string, unknown>) => Promise<Record<string, unknown>>; onView: (view: View) => void; onBanner: (message: string) => void }) {
  const { t } = useTranslation();
  if (view === "create") return <CreateLot session={session} prices={data.prices} act={act} onDone={() => onView("lots")} onBanner={onBanner} />;
  if (view === "lots") return <CollectorLots lots={data.lots} recyclers={data.recyclers} clusters={data.clusters} act={act} />;
  if (view === "market") return <PriceBoard prices={data.prices} history={data.priceHistory} />;
  if (view === "safety") return <Safety />;
  if (view === "help") return <Help profileId={session.id} act={act} />;
  const completed = data.lots.filter((lot) => lot.status === "completed");
  const earnings = completed.reduce((sum, lot) => sum + (lot.finalWeight ?? 0) * (lot.finalRate ?? 0), 0);
  return <div className="space-y-5"><section className="relative overflow-hidden rounded-[34px] bg-[#173d30] p-7 text-white sm:p-10"><div className="absolute -right-16 -top-20 size-64 rounded-full border-[42px] border-[#e9ff9d]/10" /><div className="relative"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e9ff9d]"><Leaf /> {t("collector_workspace")}</div><h2 className="mt-4 text-4xl font-black sm:text-5xl">{t("welcome")}, {session.displayName}</h2><p className="mt-3 max-w-2xl text-white/70">{t("collector_desc")}</p><Button size="lg" className="mt-6 h-12 rounded-xl bg-[#e9ff9d] text-[#173d30] hover:bg-[#dff28b]" onClick={() => onView("create")}><Camera /> {t("scan_new_scrap")}</Button></div></section><div className="grid gap-4 sm:grid-cols-3"><Metric icon={WalletCards} label={t("verified_earnings")} value={money(earnings)} /><Metric icon={Boxes} label={t("total_lots")} value={String(data.lots.length)} /><Metric icon={Truck} label={t("active_pickups")} value={String(data.lots.filter((lot) => lot.status === "scheduled").length)} /></div><section className="grid gap-4 lg:grid-cols-5"><Feature icon={Camera} title={t("ai_scanner_title")} text={t("ai_scanner_desc")} /><Feature icon={LockKeyhole} title={t("fairlock_title")} text={t("fairlock_desc")} /><Feature icon={UsersRound} title={t("cluster_title")} text={t("cluster_desc")} /><Feature icon={FileCheck2} title={t("passport_title")} text={t("passport_desc")} /><Feature icon={Landmark} title={t("oversight_title")} text={t("oversight_desc")} /></section>{data.lots.length === 0 && <Empty title={t("no_lots_title")} text={t("no_lots_desc")} />}</div>;
}

function CreateLot({ session, prices, act, onDone, onBanner }: { session: Session; prices: Price[]; act: (action: string, values?: Record<string, unknown>) => Promise<Record<string, unknown>>; onDone: () => void; onBanner: (message: string) => void }) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [material, setMaterial] = useState<MaterialKey | "">("");
  const [condition, setCondition] = useState("Sorted");
  const [weight, setWeight] = useState("");
  const [location, setLocation] = useState(session.serviceArea || "");
  const [scanning, setScanning] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [identifiedObject, setIdentifiedObject] = useState("");
  const [suggestedCategory, setSuggestedCategory] = useState("");
  const [detectedComponents, setDetectedComponents] = useState<string[]>([]);
  const [suggestedWeight, setSuggestedWeight] = useState<number | null>(null);
  const [imageKey, setImageKey] = useState("");

  const price = material ? prices.find((item) => item.material === material) : null;
  const factor = condition === "Sorted" ? 1 : condition === "Mixed" ? 0.9 : 0.8;
  const amount = Number(weight) || 0;

  const scan = async (selected: File) => {
    setFile(selected);
    setScanning(true);
    setExplanation("");
    setIdentifiedObject("");
    setSuggestedCategory("");
    setDetectedComponents([]);
    setSuggestedWeight(null);

    const form = new FormData();
    form.append("image", selected);

    try {
      const result = await fetch("/api/scan", { method: "POST", body: form });
      const payload = (await result.json()) as {
        object?: string;
        category?: string;
        material?: MaterialKey;
        confidence?: number;
        condition?: string;
        components?: string[];
        suggestedWeight?: number;
        explanation?: string;
        safetyTip?: string;
        imageKey?: string;
        error?: string;
      };

      if (payload.imageKey) setImageKey(payload.imageKey);

      if (!result.ok) {
        console.error("[KabadiApp:AI-Scanner] API returned error status:", result.status, payload);
        throw new Error(payload.error || "Scanner failed");
      }

      if (payload.object) setIdentifiedObject(payload.object);
      if (payload.category) setSuggestedCategory(payload.category);
      if (Array.isArray(payload.components)) setDetectedComponents(payload.components);
      if (payload.material) setMaterial(payload.material);
      if (payload.condition) setCondition(payload.condition);
      if (payload.suggestedWeight != null && (!weight || weight === "0")) {
        setWeight(String(payload.suggestedWeight));
        setSuggestedWeight(payload.suggestedWeight);
      }
      setConfidence(payload.confidence || 0);
      setExplanation(
        `${payload.explanation || "Material category detected."} ${payload.safetyTip || ""}`.trim()
      );
      onBanner(t("scan_complete_banner"));
    } catch (error) {
      console.error("[KabadiApp:AI-Scanner] Image scan error:", error);
      setConfidence(0);
      setIdentifiedObject("");
      setSuggestedCategory("");
      setDetectedComponents([]);
      setExplanation("Unable to analyze this image. Please try again or select the category manually.");
    } finally {
      setScanning(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!material) {
      return onBanner("Please scan or select a material category first");
    }
    if (!file || !amount || !location.trim()) {
      return onBanner("Add a photo, weight and collection area");
    }
    await act("createLot", {
      material,
      condition,
      weight: amount,
      location,
      imageName: file.name,
      imageKey,
      aiConfidence: confidence,
    });
    onBanner(t("lot_published_banner"));
    onDone();
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#708078]">{t("ai_scanner_title")}</p>
        <h2 className="mt-2 text-3xl font-black">{t("scanner_heading")}</h2>
      </div>
      <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-[30px] border border-[#d5ded0] bg-[#f9fbf7] p-6 shadow-sm">
          <label
            htmlFor="scrap-photo"
            className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#afc0aa] bg-[#edf2e9] p-6 text-center"
          >
            {scanning ? (
              <>
                <RefreshCw className="size-10 animate-spin" />
                <p className="mt-3 font-black">{t("scanner_analyzing")}</p>
              </>
            ) : file ? (
              <>
                <CheckCircle2 className="size-11 text-[#33734b]" />
                <p className="mt-3 font-black">{file.name}</p>
                <p className="mt-1 text-xs text-[#6c7a72]">{t("tap_to_replace")}</p>
              </>
            ) : (
              <>
                <UploadCloud className="size-11" />
                <p className="mt-3 font-black">{t("scanner_upload")}</p>
                <p className="mt-1 text-xs text-[#6c7a72]">{t("scanner_upload_sub")}</p>
              </>
            )}
          </label>
          <Input
            id="scrap-photo"
            className="sr-only"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => event.target.files?.[0] && void scan(event.target.files[0])}
          />

          {explanation && (
            <div
              className={`mt-4 rounded-2xl p-4 text-sm leading-6 ${
                confidence > 0 ? "border border-[#cde0a6] bg-[#f2f9e4]" : "border border-amber-300 bg-amber-50"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-[#2f6a40]" />
                  <strong className="text-base font-black text-[#173d30]">
                    {identifiedObject || (confidence && material ? `AI: ${getMaterialLabel(material, t)}` : "Scanner notice")}
                  </strong>
                </div>
                {confidence > 0 && (
                  <span className="rounded-full bg-[#173d30] px-3 py-0.5 text-xs font-black text-[#e9ff9d]">
                    {confidence}% confidence
                  </span>
                )}
              </div>

              {suggestedCategory && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-bold text-[#355342]">
                  <span className="uppercase tracking-wider text-[#698273]">Category:</span>
                  <span className="rounded-md border border-[#cbe1a9] bg-white px-2 py-0.5 font-black text-[#1c4735]">
                    {suggestedCategory}
                  </span>
                  {material && (
                    <span className="text-[11px] font-medium text-[#657a6e]">
                      (Mapped to: {getMaterialLabel(material, t)})
                    </span>
                  )}
                </div>
              )}

              {detectedComponents.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#698273]">Detected Materials & Components</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {detectedComponents.map((comp, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-lg border border-[#cce0cb] bg-white px-2.5 py-1 text-xs font-semibold text-[#204432] shadow-2xs"
                      >
                        • {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {suggestedWeight != null && (
                <p className="mt-2.5 text-xs font-semibold text-[#3b5746]">
                  Suggested Approx. Weight: <span className="font-black text-[#173d30]">{suggestedWeight} kg</span>
                </p>
              )}

              <p className="mt-2.5 text-xs leading-5 text-[#597163] border-t border-[#dce8d5] pt-2">
                {explanation}
              </p>
            </div>
          )}
        </section>

        <section className="rounded-[30px] border border-[#d5ded0] bg-[#f9fbf7] p-6 shadow-sm">
          <h3 className="text-xl font-black">{t("confirm_details")}</h3>
          <div className="mt-5 space-y-4">
            <Field label={t("material_category")}>
              <Select value={material} onValueChange={(value) => setMaterial(value as MaterialKey)}>
                <SelectTrigger className="h-12 w-full bg-white">
                  <SelectValue placeholder="Select material category…" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(materials).map(([key]) => (
                    <SelectItem value={key} key={key}>
                      {getMaterialLabel(key as MaterialKey, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("approx_weight")}>
                <Input
                  type="number"
                  min="0.05"
                  step="0.05"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  placeholder="kg"
                  className="h-12 bg-white"
                />
              </Field>
              <Field label={t("condition")}>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="h-12 w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sorted">{t("condition_sorted")}</SelectItem>
                    <SelectItem value="Mixed">{t("condition_mixed")}</SelectItem>
                    <SelectItem value="Damaged">{t("condition_damaged")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label={t("collection_area")}>
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="h-12 bg-white"
              />
            </Field>
          </div>

          <div className="mt-5 rounded-2xl bg-[#173d30] p-5 text-white">
            <p className="text-xs text-white/60">{t("current_reference_range")}</p>
            <p className="mt-2 text-2xl font-black">
              {material && price
                ? `${money(price.low * factor)}–${money(price.high * factor)} / kg`
                : material
                ? "Loading…"
                : "Select a category to view prices"}
            </p>
            <p className="mt-2 text-xs text-white/60">
              {t("estimated_lot_value")}:{" "}
              {material && price ? `${money(price.low * factor * amount)}–${money(price.high * factor * amount)}` : "—"}
            </p>
          </div>

          <Button
            size="lg"
            className="mt-5 h-12 w-full bg-[#173d30]"
            disabled={!file || scanning || amount <= 0 || !material}
          >
            {t("publish_lot")}
          </Button>
        </section>
      </form>
    </div>
  );
}

function CollectorLots({ lots, recyclers, clusters, act }: { lots: Lot[]; recyclers: RecyclerProfile[]; clusters: Cluster[]; act: (action: string, values?: Record<string, unknown>) => Promise<Record<string, unknown>> }) {
  const { t } = useTranslation();
  if (!lots.length) return <Empty title={t("no_lots_title")} text={t("no_lots_desc")} />;
  return <div className="space-y-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#708078]">{t("connected_records")}</p><h2 className="mt-2 text-3xl font-black">{t("my_lots")}</h2></div>{lots.map((lot) => { const recycler = recyclers.find((item) => item.id === lot.selectedRecyclerId); const cluster = clusters.find((item) => item.cluster_id === lot.clusterId); return <article key={lot.id} className="rounded-[28px] border border-[#d5ded0] bg-[#f9fbf7] p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-[#e8f2b7] text-xl">{materials[lot.material].icon}</span><div><h3 className="text-xl font-black">{getMaterialLabel(lot.material, t)}</h3><p className="mt-1 text-xs text-[#6c7972]">{lot.id} · {lot.weight} kg · {lot.location}</p></div></div><Status value={lot.status} /></div><div className="mt-5 grid gap-3 sm:grid-cols-4"><Info label={t("reference_value")} value={`${money(lot.estimatedMin)}–${money(lot.estimatedMax)}`} /><Info label={t("recycler")} value={recycler?.name ?? t("waiting_for_offer")} /><Info label={t("fairlock_title")} value={lot.fairLockId ?? t("not_active")} /><Info label={t("pickup")} value={formatDate(lot.pickupDate)} /></div>{lot.status === "available" && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#fff4c9] p-4"><div><p className="font-black">{t("smart_cluster_pickup")}</p><p className="mt-1 text-xs text-[#6e602d]">{cluster ? `${cluster.lot_count} lots · ${cluster.total_weight} kg combined` : t("cluster_join_desc")}</p></div><Button className="bg-[#725600]" disabled={Boolean(lot.clusterJoined)} onClick={() => void act("joinCluster", { lotId: lot.id })}><UsersRound />{lot.clusterJoined ? t("joined_cluster") : t("join_cluster")}</Button></div>}{lot.status === "locked" && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#edf6ca] p-4"><div><p className="font-black"><LockKeyhole className="mr-2 inline size-4" />{t("offer_protected_at")} {money(lot.lockedRate ?? 0)}/kg</p><p className="mt-1 text-xs">{t("valid_until")} {formatDate(lot.validUntil)}. {t("confirm_pickup_continue")}</p></div><Button className="bg-[#173d30]" onClick={() => { const date = new Date(Date.now() + 86400000); date.setHours(10, 30, 0, 0); void act("schedulePickup", { lotId: lot.id, pickupDate: date.toISOString() }); }}><Truck />{t("schedule_tomorrow")}</Button></div>}{lot.status === "completed" && <CompletedLot lot={lot} act={act} />}</article>; })}</div>;
}

function CompletedLot({ lot, act }: { lot: Lot; act: (action: string, values?: Record<string, unknown>) => Promise<Record<string, unknown>> }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(lot.recyclerRating || 0); const [review, setReview] = useState(lot.recyclerReview || "");
  return <div className="mt-4 grid gap-4 rounded-2xl bg-[#173d30] p-5 text-white lg:grid-cols-[1fr_auto]"><div><p className="text-xs font-bold uppercase tracking-wider text-[#e9ff9d]">{t("digital_passport")}</p><p className="mt-2 text-2xl font-black">{lot.passportId}</p><p className="mt-1 text-xs text-white/60">{t("final_label")}: {lot.finalWeight} kg × {money(lot.finalRate || 0)}/kg · {lot.paymentStatus}</p><div className="mt-4 flex flex-wrap gap-3">{lot.passportId && <a className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#e9ff9d] px-4 font-bold text-[#173d30]" href={`/passport/${lot.passportId}`} target="_blank" rel="noreferrer"><FileCheck2 />{t("open_public_passport")}</a>}<RatingStars value={rating} onChange={setRating} label={t("rate_recycler")} /></div>{rating > 0 && <div className="mt-3 flex gap-2"><Input value={review} onChange={(event) => setReview(event.target.value)} placeholder={t("recycler_experience")} className="h-11 max-w-md border-white/20 bg-white text-[#17312a]" /><Button variant="outline" className="border-white/25 bg-white/10 text-white" onClick={() => void act("rateRecycler", { lotId: lot.id, rating, review })}><Star />{t("save")}</Button></div>}</div><PackageCheck className="size-12 text-[#e9ff9d]" /></div>;
}

function PriceBoard({ prices, history }: { prices: Price[]; history: Record<string, unknown>[] }) {
  const { t } = useTranslation();
  return <div className="space-y-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#708078]">{t("reference_price_subtitle")}</p><h2 className="mt-2 text-3xl font-black">{t("fair_price_board")}</h2><p className="mt-2 text-sm text-[#66756d]">{t("price_board_note")}</p></div><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{prices.map((price) => <article key={price.material} className="rounded-[26px] border border-[#d5ded0] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-2xl">{materials[price.material].icon}</span><span className="rounded-full bg-[#e8f2b7] px-3 py-1 text-xs font-bold">₹ / kg</span></div><h3 className="mt-4 font-black">{getMaterialLabel(price.material, t)}</h3><p className="mt-2 text-2xl font-black">{money(price.low)}–{money(price.high)}</p><p className="mt-3 text-xs leading-5 text-[#6c7972]">Source: {price.source}<br />Updated {formatDate(price.updatedAt)}</p></article>)}</section>{history.length > 0 && <div className="rounded-[28px] bg-[#173d30] p-6 text-white"><p className="text-xs font-bold uppercase tracking-wider text-[#e9ff9d]">{t("audited_price_updates")}</p><div className="mt-4 flex gap-2 overflow-x-auto">{history.slice(0, 12).reverse().map((row) => <div key={String(row.id)} className="min-w-28 rounded-xl bg-white/10 p-3"><p className="text-xs capitalize text-white/60">{String(row.material)}</p><p className="mt-1 font-black">₹{String(row.high_rate)}</p></div>)}</div></div>}</div>;
}

function RecyclerArea({ session, view, data, act, onView }: { session: Session; view: View; data: Snapshot; act: (action: string, values?: Record<string, unknown>) => Promise<Record<string, unknown>>; onView: (view: View) => void }) {
  const { t } = useTranslation();
  if (view === "help") return <Help profileId={session.id} act={act} />;
  const open = data.lots.filter((lot) => lot.status === "available");
  const assigned = data.lots.filter((lot) => lot.selectedRecyclerId === session.id && lot.status !== "completed");
  const completed = data.lots.filter((lot) => lot.selectedRecyclerId === session.id && lot.status === "completed");
  const shown = view === "handover" ? assigned : view === "history" ? completed : open;
  return <div className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#708078]">{t("recycler_workspace")}</p><h2 className="mt-2 text-3xl font-black">{session.displayName}</h2><p className="mt-1 text-sm text-[#68766f]">{session.authorizationId} · {session.serviceArea}</p></div><span className={`rounded-full px-4 py-2 text-sm font-black ${session.verified ? "bg-[#dff2ab] text-[#31530b]" : "bg-amber-100 text-amber-900"}`}>{session.verified ? t("jnarddc_verified") : t("verification_pending")}</span></div>{!session.verified && <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm"><AlertTriangle className="shrink-0" /><div><p className="font-black">{t("review_pending_title")}</p><p className="mt-1 text-xs leading-5">{t("review_pending_desc")}</p></div></div>}<div className="grid gap-4 sm:grid-cols-3"><Metric icon={Boxes} label={t("open_network_lots")} value={String(open.length)} /><Metric icon={Truck} label={t("my_handovers")} value={String(assigned.length)} /><Metric icon={Scale} label={t("completed")} value={String(completed.length)} /></div>{shown.length === 0 ? <Empty title="Nothing in this queue" text={view === "home" ? "New collector lots will appear after sync." : "Records move here as the handover progresses."} /> : shown.map((lot) => view === "home" ? <OfferCard key={lot.id} lot={lot} verified={session.verified} act={act} onAccepted={() => onView("handover")} /> : view === "handover" ? <HandoverCard key={lot.id} lot={lot} act={act} /> : <article key={lot.id} className="rounded-[26px] border border-[#d5ded0] bg-white p-5"><div className="flex items-center justify-between"><div><p className="font-black">{lot.passportId}</p><p className="mt-1 text-xs text-[#68766f]">{getMaterialLabel(lot.material, t)} · {lot.finalWeight} kg · {formatDate(lot.completedAt)}</p></div>{lot.passportId && <a className="rounded-xl bg-[#173d30] px-4 py-3 text-sm font-bold text-white" href={`/passport/${lot.passportId}`} target="_blank" rel="noreferrer">{t("open_public_passport")}</a>}</div></article>)}</div>;
}

function OfferCard({ lot, verified, act, onAccepted }: { lot: Lot; verified: boolean; act: (action: string, values?: Record<string, unknown>) => Promise<Record<string, unknown>>; onAccepted: () => void }) {
  const { t } = useTranslation();
  const suggested = Math.round(((lot.estimatedMin + lot.estimatedMax) / 2) / lot.weight); const [rate, setRate] = useState(String(suggested));
  return <article className="rounded-[28px] border border-[#d5ded0] bg-white p-5 shadow-sm"><div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr_0.7fr_auto] md:items-center"><div><h3 className="text-lg font-black">{getMaterialLabel(lot.material, t)}</h3><p className="mt-1 text-xs text-[#68766f]">{lot.id} · <MapPin className="inline size-3" /> {lot.location}</p></div><Info label={t("approx_weight")} value={`${lot.weight} kg`} /><Info label={t("reference_value")} value={`${money(lot.estimatedMin)}–${money(lot.estimatedMax)}`} /><div className="flex gap-2"><Input className="h-11 w-28" type="number" value={rate} onChange={(event) => setRate(event.target.value)} aria-label={t("offer_rate_per_kg")} /><Button className="h-11 bg-[#173d30]" disabled={!verified || Number(rate) <= 0} onClick={async () => { await act("acceptLot", { lotId: lot.id, rate: Number(rate) }); onAccepted(); }}><LockKeyhole />{t("accept")}</Button></div></div></article>;
}

function HandoverCard({ lot, act }: { lot: Lot; act: (action: string, values?: Record<string, unknown>) => Promise<Record<string, unknown>> }) {
  const { t } = useTranslation();
  const [weight, setWeight] = useState(String(lot.weight)); const [rate, setRate] = useState(String(lot.lockedRate || "")); const [reason, setReason] = useState(""); const [approved, setApproved] = useState(false); const [payment, setPayment] = useState("paid");
  const changed = Number(rate) !== Number(lot.lockedRate) || Number(weight) !== Number(lot.weight);
  return <article className="grid gap-5 rounded-[28px] border border-[#d5ded0] bg-[#f9fbf7] p-6 shadow-sm xl:grid-cols-[1fr_0.75fr]"><div><div className="flex justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#708078]">{t("final_handover")} · {lot.id}</p><h3 className="mt-2 text-2xl font-black">{getMaterialLabel(lot.material, t)}</h3></div><Status value={lot.status} /></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label={t("final_scale_weight")}><Input type="number" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} className="h-12 bg-white" /></Field><Field label={t("final_rate_per_kg")}><Input type="number" value={rate} onChange={(event) => setRate(event.target.value)} className="h-12 bg-white" /></Field></div>{changed && <Field label={t("mandatory_variance_reason")}><Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder={t("variance_placeholder")} className="mt-4 h-12 bg-white" /></Field>}<div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label={t("payment_status")}><Select value={payment} onValueChange={setPayment}><SelectTrigger className="h-12 w-full bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="paid">{t("paid")}</SelectItem><SelectItem value="pending">{t("pending")}</SelectItem><SelectItem value="partial">{t("partial")}</SelectItem></SelectContent></Select></Field><div className="flex h-12 items-center justify-between self-end rounded-xl border border-[#cbd5c5] bg-white px-4"><span className="text-sm font-bold">{t("collector_approved")}</span><Switch checked={approved} onCheckedChange={setApproved} /></div></div><Button className="mt-5 h-12 w-full bg-[#173d30]" disabled={!approved || (changed && !reason.trim())} onClick={() => void act("completeHandover", { lotId: lot.id, finalWeight: Number(weight), finalRate: Number(rate), priceChangeReason: reason, collectorApproved: approved, paymentStatus: payment })}><PackageCheck />{t("complete_issue_passport")}</Button></div><div className="rounded-[24px] bg-[#173d30] p-6 text-white"><p className="text-xs font-bold uppercase tracking-wider text-[#e9ff9d]">{t("fairlock_settlement")}</p><p className="mt-3 text-4xl font-black">{money((Number(weight) || 0) * (Number(rate) || 0))}</p><div className="mt-5 space-y-3 text-sm"><InfoDark label={t("locked_rate")} value={`${money(lot.lockedRate || 0)}/kg`} /><InfoDark label={t("lock_id")} value={lot.fairLockId || "—"} /><InfoDark label={t("collector_estimate")} value={`${lot.weight} kg`} /></div></div></article>;
}

function AuthorityArea({ data, act }: { data: Snapshot; act: (action: string, values?: Record<string, unknown>) => Promise<Record<string, unknown>> }) {
  const { t } = useTranslation();
  return <div className="space-y-6"><section className="rounded-[34px] bg-[#173d30] p-7 text-white sm:p-9"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e9ff9d]"><Landmark /> {t("national_oversight")}</div><h2 className="mt-3 text-4xl font-black">{t("command_center")}</h2><p className="mt-2 max-w-2xl text-sm text-white/65">{t("command_center_desc")}</p></section><div className="grid gap-4 sm:grid-cols-4"><Metric icon={Boxes} label={t("total_lots")} value={String(data.metrics.total_lots || 0)} /><Metric icon={Scale} label={t("mapped_material")} value={`${Number(data.metrics.total_kg || 0).toFixed(1)} kg`} /><Metric icon={PackageCheck} label={t("completed")} value={String(data.metrics.completed || 0)} /><Metric icon={UsersRound} label={t("clustered_lots")} value={String(data.metrics.clustered || 0)} /></div><section className="rounded-[28px] border border-[#d5ded0] bg-white p-5 shadow-sm sm:p-6"><h3 className="text-xl font-black">{t("recycler_auth_control")}</h3><div className="mt-4 space-y-3">{data.recyclers.length ? data.recyclers.map((recycler) => <div key={recycler.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f0f4ed] p-4"><div><p className="font-black">{recycler.name}</p><p className="mt-1 text-xs text-[#68766f]">{recycler.authorizationId} · {recycler.serviceArea}</p></div><Button className={recycler.verified ? "bg-[#8d3227]" : "bg-[#173d30]"} onClick={() => void act("verifyRecycler", { recyclerId: recycler.id, verified: !recycler.verified })}>{recycler.verified ? t("suspend_verification") : t("verify_recycler")}</Button></div>) : <p className="text-sm text-[#68766f]">{t("no_recyclers_yet")}</p>}</div></section><section className="rounded-[28px] border border-[#d5ded0] bg-white p-5 shadow-sm sm:p-6"><h3 className="text-xl font-black">{t("fair_price_management")}</h3><p className="mt-1 text-xs text-[#68766f]">{t("price_audit_note")}</p><div className="mt-4 grid gap-3">{data.prices.map((price) => <PriceEditor key={price.material} price={price} act={act} />)}</div></section><section className="grid gap-5 xl:grid-cols-2"><div className="rounded-[28px] border border-[#d5ded0] bg-white p-5"><h3 className="font-black">{t("active_pickup_clusters")}</h3><div className="mt-4 space-y-3">{data.clusters.length ? data.clusters.map((cluster) => <div key={cluster.cluster_id} className="rounded-2xl bg-[#fff4c9] p-4"><p className="font-black">{cluster.cluster_id} · {getMaterialLabel(cluster.material, t)}</p><p className="mt-1 text-xs">{cluster.location} · {cluster.lot_count} lots · {cluster.total_weight} kg</p></div>) : <p className="text-sm text-[#68766f]">{t("no_active_clusters")}</p>}</div></div><div className="rounded-[28px] border border-[#d5ded0] bg-white p-5"><h3 className="font-black">{t("support_signals")}</h3><div className="mt-4 space-y-3">{data.support.length ? data.support.map((record) => <div key={record.id} className="rounded-2xl bg-[#f0f4ed] p-4"><p className="text-xs font-bold uppercase">{record.kind} · {record.rating ? `${record.rating}/5` : record.status}</p><p className="mt-2 text-sm">{record.message}</p></div>) : <p className="text-sm text-[#68766f]">{t("no_support_records")}</p>}</div></div></section></div>;
}

function PriceEditor({ price, act }: { price: Price; act: (action: string, values?: Record<string, unknown>) => Promise<Record<string, unknown>> }) {
  const { t } = useTranslation();
  const [low, setLow] = useState(String(price.low)); const [high, setHigh] = useState(String(price.high)); const [source, setSource] = useState(price.source);
  useEffect(() => { setLow(String(price.low)); setHigh(String(price.high)); setSource(price.source); }, [price.low, price.high, price.source]);
  return <div className="grid gap-3 rounded-2xl bg-[#f0f4ed] p-4 md:grid-cols-[1fr_110px_110px_1.3fr_auto] md:items-center"><p className="font-black">{getMaterialLabel(price.material, t)}</p><Input type="number" value={low} onChange={(event) => setLow(event.target.value)} aria-label="Low price" className="bg-white" /><Input type="number" value={high} onChange={(event) => setHigh(event.target.value)} aria-label="High price" className="bg-white" /><Input value={source} onChange={(event) => setSource(event.target.value)} aria-label="Price source" className="bg-white" /><Button className="bg-[#173d30]" onClick={() => void act("updatePrice", { material: price.material, low: Number(low), high: Number(high), source })}>{t("publish")}</Button></div>;
}

function Safety() {
  const { t } = useTranslation();
  const rows = [
    ["🔋", t("isolate_batteries_title"), t("isolate_batteries_desc")],
    ["🔥", t("never_burn_title"), t("never_burn_desc")],
    ["🧤", t("wear_protection_title"), t("wear_protection_desc")],
    ["🖥️", t("protect_panels_title"), t("protect_panels_desc")]
  ];
  return <div className="space-y-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#708078]">{t("safety_title")}</p><h2 className="mt-2 text-3xl font-black">{t("safety_subtitle")}</h2></div><div className="grid gap-4 sm:grid-cols-2">{rows.map(([icon, title, text]) => <article key={title} className="rounded-[28px] border border-[#d5ded0] bg-white p-6"><span className="text-4xl">{icon}</span><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-[#68766f]">{text}</p></article>)}</div></div>;
}

function Help({ profileId, act }: { profileId: string; act: (action: string, values?: Record<string, unknown>) => Promise<Record<string, unknown>> }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0); const [message, setMessage] = useState(""); const [kind, setKind] = useState("feedback");
  const submit = async (event: FormEvent) => { event.preventDefault(); await act("support", { kind, rating: rating || null, message, contact: profileId }); setMessage(""); setRating(0); };
  return <div className="mx-auto max-w-4xl space-y-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#708078]">{t("support_title")}</p><h2 className="mt-2 text-3xl font-black">{t("support_subtitle")}</h2></div><section className="rounded-[28px] border border-[#d5ded0] bg-white p-6"><form onSubmit={submit} className="space-y-4"><Field label={t("request_type")}><Select value={kind} onValueChange={setKind}><SelectTrigger className="h-12 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="feedback">{t("platform_feedback")}</SelectItem><SelectItem value="price">{t("price_fairlock_issue")}</SelectItem><SelectItem value="pickup">{t("pickup_help")}</SelectItem><SelectItem value="payment">{t("payment_query")}</SelectItem></SelectContent></Select></Field>{kind === "feedback" && <Field label={t("your_rating")}><RatingStars value={rating} onChange={setRating} /></Field>}<Field label={t("tell_us_happened")}><Textarea value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-32" placeholder={t("tell_us_placeholder")} /></Field><Button className="h-12 w-full bg-[#173d30]" disabled={!message.trim()}>{t("submit_support")}</Button></form></section><section className="rounded-[28px] border border-[#d5ded0] bg-[#f9fbf7] p-6"><h3 className="text-xl font-black">{t("faq_title")}</h3><div className="mt-4 space-y-4"><Faq q={t("faq_q1")} a={t("faq_a1")} /><Faq q={t("faq_q2")} a={t("faq_a2")} /><Faq q={t("faq_q3")} a={t("faq_a3")} /><Faq q={t("faq_q4")} a={t("faq_a4")} /></div></section></div>;
}

function VoiceDock({ language, role, onView, onSpeak, onBanner }: { language: Language; role: Role; onView: (view: View) => void; onSpeak: () => void; onBanner: (message: string) => void }) {
  const [listening, setListening] = useState(false);
  const listen = () => {
    const target = window as unknown as { SpeechRecognition?: new () => { lang: string; start(): void; onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null }; webkitSpeechRecognition?: new () => { lang: string; start(): void; onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null } };
    const Recognition = target.SpeechRecognition || target.webkitSpeechRecognition;
    if (!Recognition) return onBanner("Voice activation needs Chrome or a supported mobile browser");
    const recognition = new Recognition(); recognition.lang = voiceLocales[language] || "en-IN"; setListening(true);
    recognition.onend = () => setListening(false); recognition.onerror = () => { setListening(false); onBanner("Voice command was not captured"); };
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      const map: [string[], View][] = [
        [["scan", "photo", "create"], "create"],
        [["lot", "collection"], "lots"], [["price", "market"], "market"], [["safety"], "safety"],
        [["help", "faq"], "help"], [["handover", "pickup"], "handover"], [["history", "passport"], "history"],
      ];
      const found = map.find(([keys]) => keys.some((key) => text.includes(key)));
      if (found && role !== "authority") { onView(found[1]); onBanner(`Opened ${found[1]} by voice`); }
      else onBanner(`Heard “${text}”. Try scan, lots, price, safety, handover or passport.`);
    };
    recognition.start();
  };
  return <div className="fixed bottom-24 right-4 z-50 flex gap-2 lg:bottom-6"><Button size="icon-lg" className="size-14 rounded-full border-4 border-[#edf1e8] bg-[#42664e] shadow-xl" onClick={onSpeak} aria-label="Listen to this screen"><AudioLines /></Button><Button size="icon-lg" className={`size-14 rounded-full border-4 border-[#edf1e8] shadow-xl ${listening ? "bg-[#b33f31]" : "bg-[#173d30]"}`} onClick={listen} aria-label="Activate voice navigation"><Mic2 className={listening ? "animate-pulse" : ""} /></Button></div>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Recycle; label: string; value: string }) { return <div className="rounded-[24px] border border-[#d5ded0] bg-white p-5 shadow-sm"><Icon className="size-5 text-[#45664f]" /><p className="mt-4 text-xs font-bold text-[#718078]">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>; }
function Feature({ icon: Icon, title, text }: { icon: typeof Recycle; title: string; text: string }) { return <article className="rounded-[24px] border border-[#d5ded0] bg-[#f9fbf7] p-5"><Icon className="size-6 text-[#45664f]" /><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-xs leading-5 text-[#68766f]">{text}</p></article>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-bold text-[#465b51]">{label}</span>{children}</label>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-[#edf2e9] p-3"><p className="text-[11px] font-bold text-[#748279]">{label}</p><p className="mt-1 break-words text-sm font-black">{value}</p></div>; }
function InfoDark({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b border-white/10 pb-3"><span className="text-white/55">{label}</span><strong className="text-right">{value}</strong></div>; }
function Empty({ title, text }: { title: string; text: string }) { return <div className="rounded-[30px] border border-[#d5ded0] bg-white p-10 text-center"><Boxes className="mx-auto size-12 text-[#809087]" /><h3 className="mt-4 text-2xl font-black">{title}</h3><p className="mt-2 text-sm text-[#68766f]">{text}</p></div>; }
function Status({ value }: { value: string }) { return <span className="rounded-full bg-[#e8f2b7] px-3 py-1.5 text-xs font-black capitalize text-[#3e5804]">{value.replaceAll("_", " ")}</span>; }
function Faq({ q, a }: { q: string; a: string }) { return <details className="rounded-2xl bg-white p-4"><summary className="cursor-pointer font-black">{q}</summary><p className="mt-3 text-sm leading-6 text-[#68766f]">{a}</p></details>; }
