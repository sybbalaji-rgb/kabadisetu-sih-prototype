"use client";

import { FormEvent, useEffect, useState } from "react";
import { Factory, Headphones, Languages, Landmark, Recycle, ShieldCheck, UserRound, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Language, Role, voiceLocales } from "./kabadi-data";
import { createClient } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import { changeLanguage, supportedLanguages } from "@/i18n/config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type LoginRequest = { role: Role; displayName: string; contact: string; authorizationId?: string; serviceArea?: string };

export function RoleLogin({
  language,
  onLanguage,
  onLogin,
}: {
  language: Language;
  onLanguage: (language: Language) => void;
  onLogin: (session: LoginRequest) => void;
}) {
  const { t, i18n } = useTranslation();
  const [role, setRole] = useState<Role>("collector");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [authorizationId, setAuthorizationId] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [otpState, setOtpState] = useState<"idle" | "sending" | "sent" | "verifying">("idle");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval: number;
    if (otpState === "sent" && timer > 0) {
      interval = window.setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpState, timer]);

  const handleLanguageChange = (newLang: string) => {
    onLanguage(newLang as Language);
    void changeLanguage(newLang);
  };

  const resetForm = () => {
    setName("");
    setContact("");
    setAuthorizationId("");
    setServiceArea("");
    setError("");
    setSuccessMsg("");
    setOtpState("idle");
    setOtp("");
    setSimulatedOtp("");
  };

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const message = new SpeechSynthesisUtterance(
      role === "collector"
        ? `${t("collector_workspace")}. ${t("collector_name")}, ${t("indian_mobile")}, ${t("collection_area_label")}.`
        : role === "recycler"
          ? `${t("recycler_workspace")}. ${t("recycler_org")}, ${t("service_area_label")}, ${t("auth_id")}.`
          : `${t("command_center")}. ${t("access_code")}.`,
    );
    message.lang = voiceLocales[language] || "en-IN";
    message.rate = 0.9;
    window.speechSynthesis.speak(message);
  };

  const [simulatedOtp, setSimulatedOtp] = useState("");

  const sendOtp = async () => {
    if (!name.trim() || contact.length !== 10) return setError(t("err_valid_mobile"));
    if (!serviceArea.trim()) return setError(t("err_service_area"));

    setError("");
    setSuccessMsg("");
    setOtpState("sending");

    if (supabaseUrl === "https://placeholder.supabase.co") {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const testCode = "123456";
      setSimulatedOtp(testCode);
      setOtpState("sent");
      setTimer(30);
      setSuccessMsg(t("otp_prototype_test"));
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${contact}`,
      });
      if (error) throw error;
      setOtpState("sent");
      setTimer(30);
      setSuccessMsg(t("otp_sent_success"));
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to send OTP.");
      setOtpState("idle");
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return setError(t("err_enter_6_digit"));
    setError("");
    setSuccessMsg("");
    setOtpState("verifying");

    if (supabaseUrl === "https://placeholder.supabase.co") {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (timer <= 0) {
        setError(t("err_otp_expired"));
        setOtpState("sent");
        return;
      }
      if (otp !== simulatedOtp && otp !== "123456") {
        setError(t("err_incorrect_otp"));
        setOtpState("sent");
        return;
      }
      onLogin({ role: "collector", displayName: name.trim(), contact: `+91${contact}`, serviceArea: serviceArea.trim() });
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+91${contact}`,
        token: otp,
        type: "sms",
      });
      if (error) throw error;
      onLogin({ role: "collector", displayName: name.trim(), contact: `+91${contact}`, serviceArea: serviceArea.trim() });
    } catch (err: unknown) {
      if ((err as Error).message?.toLowerCase().includes("expired")) {
        setError(t("err_otp_expired"));
      } else {
        setError(t("err_incorrect_otp"));
      }
      setOtpState("sent");
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMsg("");
    if (role === "collector") {
      if (otpState === "idle" || otpState === "sending") {
        void sendOtp();
      } else {
        void verifyOtp();
      }
      return;
    }

    if (!name.trim() || !contact.trim()) return setError(t("err_enter_required"));
    if (!authorizationId.trim()) return setError(role === "recycler" ? t("err_recycler_auth") : t("err_command_code"));
    if (role !== "authority" && !serviceArea.trim()) return setError(t("err_service_area"));
    onLogin({ role, displayName: name.trim(), contact: contact.trim(), authorizationId: authorizationId.trim() || undefined, serviceArea: serviceArea.trim() || undefined });
  };

  const demoCollector = () => onLogin({ role: "collector", displayName: "Ravi Kumar", contact: "9876543210", serviceArea: "Bhosari, Pune" });
  const demoRecycler = () => onLogin({ role: "recycler", displayName: "GreenCycle E-Waste Recycling", contact: "demo@greencycle.in", authorizationId: "REC-DEMO-2026", serviceArea: "Chennai, Tamil Nadu" });
  const demoAuthority = () => onLogin({ role: "authority", displayName: "JNARDDC Monitoring Team", contact: "demo@jnarddc.gov.in", authorizationId: "JNARDDC2026" });

  return (
    <main className="min-h-screen bg-[#edf1e8] px-4 py-5 text-[#17312a] sm:px-6 sm:py-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-[#173d30] text-[#e9ff9d]"><Recycle /></div>
          <div><h1 className="text-lg font-black">{t("app_name")}</h1><p className="text-xs text-[#65736c]">{t("network_subtitle")}</p></div>
        </div>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger data-no-translate className="h-11 w-11 border-[#cbd5c5] bg-white sm:w-[145px]" aria-label="Choose language"><Languages className="size-4" /><span className="hidden sm:inline"><SelectValue /></span></SelectTrigger>
          <SelectContent data-no-translate>{supportedLanguages.map((item) => <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <section className="mx-auto mt-8 grid max-w-6xl overflow-hidden rounded-[34px] border border-[#d1dccb] bg-[#f9fbf7] shadow-[0_24px_80px_rgba(23,61,48,0.13)] lg:grid-cols-[0.86fr_1.14fr]">
        <div className="relative overflow-hidden bg-[#173d30] p-7 text-white sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            <div className="absolute -right-24 -top-20 size-64 rounded-full border-[38px] border-white/5" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e9ff9d]">{t("ewaste_platform")}</p>
              <h2 className="mt-4 max-w-lg text-4xl font-black leading-[1.05] tracking-[-0.05em] sm:text-5xl">{t("one_bridge_title")}</h2>
              <p className="mt-5 max-w-md text-base leading-7 text-white/70">{t("one_bridge_desc")}</p>
              <div className="mt-8 space-y-3 text-sm">
                <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3"><ShieldCheck className="size-5 text-[#e9ff9d]" /> {t("fairlock_feature")}</div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3"><Headphones className="size-5 text-[#e9ff9d]" /> {t("voice_feature")}</div>
              </div>
            </div>
          </div>
          
          <div className="relative mt-12 rounded-[24px] bg-[#112d23] p-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#e9ff9d] mb-2">{t("try_demo_account")}</h3>
            <p className="text-xs text-white/60 mb-5">{t("demo_desc")}</p>
            <div className="space-y-3">
              <button onClick={demoCollector} type="button" className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left transition hover:bg-white/15">
                <div className="flex items-center gap-3"><span className="text-lg">👤</span><span className="text-sm font-bold">{t("demo_as_collector")}</span></div>
                <ArrowRight className="size-4 opacity-50" />
              </button>
              <button onClick={demoRecycler} type="button" className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left transition hover:bg-white/15">
                <div className="flex items-center gap-3"><span className="text-lg">♻️</span><span className="text-sm font-bold">{t("demo_as_recycler")}</span></div>
                <ArrowRight className="size-4 opacity-50" />
              </button>
              <button onClick={demoAuthority} type="button" className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left transition hover:bg-white/15">
                <div className="flex items-center gap-3"><span className="text-lg">🏛️</span><span className="text-sm font-bold">{t("demo_as_jnarddc")}</span></div>
                <ArrowRight className="size-4 opacity-50" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-9 lg:p-12">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6f7e76]">{t("choose_workspace")}</p><h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">{t("sign_in_continue")}</h2></div>
            <Button type="button" variant="outline" size="sm" className="border-[#cbd5c5] bg-white" onClick={speak}><Headphones /> {t("listen")}</Button>
          </div>

          <Tabs value={role} onValueChange={(value) => { setRole(value as Role); resetForm(); }} className="mt-7">
            <TabsList className="grid h-auto w-full grid-cols-3 gap-2 bg-[#e4e9df] p-1.5">
              <TabsTrigger value="collector" className="h-14 rounded-xl"><UserRound /> {t("collector")}</TabsTrigger>
              <TabsTrigger value="recycler" className="h-14 rounded-xl"><Factory /> {t("recycler")}</TabsTrigger>
              <TabsTrigger value="authority" className="h-14 rounded-xl"><Landmark /> {t("authority")}</TabsTrigger>
            </TabsList>

            <form onSubmit={submit} className="mt-6">
              <TabsContent value="collector" className="space-y-4">
                {otpState === "idle" || otpState === "sending" ? (
                  <>
                    <LoginField label={t("collector_name")}>
                      <Input value={name} onChange={(event) => setName(event.target.value)} placeholder={t("collector_name_placeholder")} className="h-12 rounded-xl border-[#cbd5c5] bg-white" />
                    </LoginField>
                    <LoginField label={t("indian_mobile")}>
                      <div className="flex gap-2">
                        <div className="flex h-12 items-center justify-center rounded-xl border border-[#cbd5c5] bg-[#f0f4ed] px-3 font-semibold text-[#465b51]">+91</div>
                        <Input value={contact} onChange={(event) => setContact(event.target.value.replace(/\D/g, ""))} inputMode="tel" placeholder={t("mobile_placeholder")} maxLength={10} className="h-12 flex-1 rounded-xl border-[#cbd5c5] bg-white" />
                      </div>
                    </LoginField>
                    <LoginField label={t("collection_area_label")}>
                      <Input value={serviceArea} onChange={(event) => setServiceArea(event.target.value)} placeholder={t("collection_area_placeholder")} className="h-12 rounded-xl border-[#cbd5c5] bg-white" />
                    </LoginField>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <h3 className="mb-6 text-lg font-black">{t("enter_otp")}</h3>
                    <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    
                    <div className="mt-8 text-center text-sm">
                      <p className="text-[#65736c]">{t("didnt_receive_otp")}</p>
                      {timer > 0 ? (
                        <p className="mt-1 font-semibold text-[#173d30]">{t("resend_otp")} (00:{timer.toString().padStart(2, "0")})</p>
                      ) : (
                        <button type="button" onClick={sendOtp} className="mt-1 font-bold text-[#456d13] hover:underline">{t("resend_otp")}</button>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="recycler" className="space-y-4">
                <LoginField label={t("recycler_org")}><Input value={name} onChange={(event) => setName(event.target.value)} placeholder={t("recycler_org_placeholder")} className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></LoginField>
                <LoginField label={t("official_contact")}><Input value={contact} onChange={(event) => setContact(event.target.value)} placeholder={t("official_contact_placeholder")} className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></LoginField>
                <LoginField label={t("auth_id")}><Input value={authorizationId} onChange={(event) => setAuthorizationId(event.target.value)} placeholder={t("auth_id_placeholder")} className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></LoginField>
                <LoginField label={t("service_area_label")}><Input value={serviceArea} onChange={(event) => setServiceArea(event.target.value)} placeholder={t("service_area_placeholder")} className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></LoginField>
              </TabsContent>
              <TabsContent value="authority" className="space-y-4">
                <LoginField label={t("officer_name")}><Input value={name} onChange={(event) => setName(event.target.value)} placeholder={t("officer_name_placeholder")} className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></LoginField>
                <LoginField label={t("official_email")}><Input value={contact} onChange={(event) => setContact(event.target.value)} placeholder={t("official_email_placeholder")} className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></LoginField>
                <LoginField label={t("access_code")}><Input value={authorizationId} onChange={(event) => setAuthorizationId(event.target.value)} type="password" placeholder={t("access_code_placeholder")} className="h-12 rounded-xl border-[#cbd5c5] bg-white" /></LoginField>
              </TabsContent>

              {successMsg && <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700" role="alert">{successMsg}</p>}
              {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
              
              <Button type="submit" disabled={otpState === "sending" || otpState === "verifying"} size="lg" className="mt-6 h-12 w-full rounded-xl bg-[#173d30]">
                {otpState === "sending" || otpState === "verifying" ? <Loader2 className="mr-2 animate-spin" /> : null}
                {role === "collector" && (otpState === "idle" || otpState === "sending") 
                  ? t("send_otp") 
                  : role === "collector" 
                    ? t("verify_otp") 
                    : `${t("continue_to")} ${role === "recycler" ? t("recycler_workspace") : t("command_center")}`}
              </Button>
              <p className="mt-4 text-xs leading-5 text-[#718078]">{t("workspace_data_note")}</p>
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
